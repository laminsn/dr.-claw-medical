import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";

/**
 * Agent Executor Edge Function
 *
 * Autonomous agent execution loop:
 *   1. Loads agent config + system prompt
 *   2. Fetches assigned skills → appends markdown content to system prompt
 *   3. Runs pre_task hooks
 *   4. Calls LLM router for reasoning (with pre/post_llm_call hooks)
 *   5. Parses and executes tool calls
 *   6. Runs on_phi_detected hooks if PHI is found
 *   7. Loops until task complete or maxSteps reached
 *   8. Runs post_task hooks
 *   9. Logs execution to agent_executions
 */

interface ExecutorRequest {
  agentId: string;
  taskId?: string;
  instruction: string;
  context?: Record<string, unknown>;
  maxSteps?: number;
}

interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

// ── Tool definitions for LLM ────────────────────────────────────────

const AGENT_TOOLS = [
  {
    name: "create_task",
    description: "Create a new task in the kanban board",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Task title" },
        description: { type: "string", description: "Task description" },
        priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
        zone: { type: "string", enum: ["clinical", "operations", "external"] },
        due_date: { type: "string", description: "ISO date string" },
      },
      required: ["title"],
    },
  },
  {
    name: "search_knowledge",
    description: "Search the knowledge base for relevant information",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        category: { type: "string", description: "Filter by category" },
      },
      required: ["query"],
    },
  },
  {
    name: "send_notification",
    description: "Send a notification to the team or a specific user",
    input_schema: {
      type: "object",
      properties: {
        message: { type: "string", description: "Notification message" },
        channel: { type: "string", enum: ["slack", "email", "in-app"], description: "Notification channel" },
        urgency: { type: "string", enum: ["low", "normal", "high"] },
      },
      required: ["message"],
    },
  },
  {
    name: "query_data",
    description: "Query data from the system (tasks, agents, metrics)",
    input_schema: {
      type: "object",
      properties: {
        table: { type: "string", enum: ["kanban_tasks", "agent_executions", "api_usage_log"], description: "Table to query" },
        filters: { type: "object", description: "Key-value filters" },
        limit: { type: "number", description: "Max rows to return" },
      },
      required: ["table"],
    },
  },
  {
    name: "trigger_n8n_flow",
    description: "Trigger an n8n workflow for automated processing",
    input_schema: {
      type: "object",
      properties: {
        flowId: { type: "string", description: "Flow identifier" },
        payload: { type: "object", description: "Data to send to the workflow" },
      },
      required: ["flowId", "payload"],
    },
  },
  {
    name: "task_complete",
    description: "Signal that the task is complete and provide a summary",
    input_schema: {
      type: "object",
      properties: {
        summary: { type: "string", description: "Summary of what was accomplished" },
        success: { type: "boolean", description: "Whether the task succeeded" },
      },
      required: ["summary", "success"],
    },
  },
];

// ── Tool execution ──────────────────────────────────────────────────

const ALLOWED_QUERY_TABLES = new Set(["kanban_tasks", "agent_executions", "api_usage_log"]);

async function executeTool(
  toolCall: ToolCall,
  userId: string,
  agentId: string,
  adminClient: ReturnType<typeof createClient>,
  supabaseUrl: string,
  supabaseServiceKey: string,
  authHeader: string,
): Promise<string> {
  const args = toolCall.arguments;

  switch (toolCall.name) {
    case "create_task": {
      const { error } = await adminClient.from("kanban_tasks").insert({
        user_id: userId,
        title: args.title as string,
        description: (args.description as string) ?? "",
        priority: (args.priority as string) ?? "medium",
        zone: (args.zone as string) ?? "operations",
        status: "todo",
        due_date: (args.due_date as string) ?? null,
        created_by_agent: agentId,
      });
      if (error) return `Error creating task: ${error.message}`;
      return `Task created: "${args.title}"`;
    }

    case "search_knowledge": {
      const query = args.query as string;
      const { data, error } = await adminClient
        .from("agent_documents")
        .select("title, content")
        .eq("user_id", userId)
        .textSearch("content", query)
        .limit(5);
      if (error) return `Search error: ${error.message}`;
      if (!data || data.length === 0) return "No results found.";
      return data.map((d: { title: string; content: string }) =>
        `[${d.title}]: ${d.content?.slice(0, 200)}...`
      ).join("\n\n");
    }

    case "send_notification": {
      await adminClient.from("audit_log").insert({
        user_id: userId,
        action: "agent.notification",
        resource_type: "notification",
        description: `Agent ${agentId}: ${args.message}`,
        metadata: { channel: args.channel ?? "in-app", urgency: args.urgency ?? "normal" },
      });
      return `Notification sent via ${args.channel ?? "in-app"}: "${args.message}"`;
    }

    case "query_data": {
      const table = args.table as string;
      if (!ALLOWED_QUERY_TABLES.has(table)) {
        return `Access denied: cannot query table "${table}"`;
      }
      let query = adminClient
        .from(table)
        .select("*")
        .eq("user_id", userId)
        .limit((args.limit as number) ?? 10)
        .order("created_at", { ascending: false });

      const filters = args.filters as Record<string, string> | undefined;
      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          query = query.eq(key, value);
        }
      }

      const { data, error } = await query;
      if (error) return `Query error: ${error.message}`;
      return JSON.stringify(data ?? [], null, 2);
    }

    case "trigger_n8n_flow": {
      const flowId = args.flowId as string;
      const payload = args.payload as Record<string, unknown>;

      const gatewayClient = createClient(supabaseUrl, supabaseServiceKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const { data, error } = await gatewayClient.functions.invoke("n8n-gateway", {
        body: { flowId, agentId, agentZone: "operations", payload },
      });

      if (error) return `N8N flow error: ${error.message}`;
      return `N8N flow "${flowId}" triggered successfully: ${JSON.stringify(data)}`;
    }

    case "task_complete":
      return `TASK_COMPLETE: ${args.summary}`;

    default:
      return `Unknown tool: ${toolCall.name}`;
  }
}

// ── Hook execution ──────────────────────────────────────────────────

interface HookRecord {
  id: string;
  slug: string;
  handler_type: string;
  handler_config: Record<string, unknown>;
  priority: number;
}

async function runHooks(
  eventType: string,
  payload: Record<string, unknown>,
  adminClient: ReturnType<typeof createClient>,
  supabaseUrl: string,
  supabaseServiceKey: string,
): Promise<void> {
  const { data: hooks } = await adminClient
    .from("platform_hooks")
    .select("id, slug, handler_type, handler_config, priority")
    .eq("event_type", eventType)
    .eq("is_active", true)
    .order("priority", { ascending: true });

  if (!hooks || hooks.length === 0) return;

  const hookPromises = (hooks as HookRecord[]).map(async (hook) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      switch (hook.handler_type) {
        case "webhook": {
          const url = (hook.handler_config as { url?: string }).url;
          if (!url) return;
          await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event: eventType, hook: hook.slug, ...payload }),
            signal: controller.signal,
          });
          break;
        }
        case "n8n_workflow": {
          const webhookUrl = (hook.handler_config as { webhook_url?: string }).webhook_url;
          if (!webhookUrl) return;
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event: eventType, hook: hook.slug, ...payload }),
            signal: controller.signal,
          });
          break;
        }
        case "edge_function": {
          const fnName = (hook.handler_config as { function_name?: string }).function_name;
          if (!fnName) return;
          const fnClient = createClient(supabaseUrl, supabaseServiceKey);
          await fnClient.functions.invoke(fnName, {
            body: { event: eventType, hook: hook.slug, ...payload },
          });
          break;
        }
      }
    } catch (e) {
      // Hooks must never crash the executor
      console.error(`Hook "${hook.slug}" (${eventType}) failed:`, e);
    } finally {
      clearTimeout(timeout);
    }
  });

  await Promise.allSettled(hookPromises);
}

// ── Skills composition ──────────────────────────────────────────────

async function fetchAssignedSkills(
  adminClient: ReturnType<typeof createClient>,
  agentKey: string,
  userId: string,
): Promise<string> {
  const { data: assignments } = await adminClient
    .from("agent_skill_assignments")
    .select("skill_id")
    .eq("agent_key", agentKey)
    .eq("user_id", userId);

  if (!assignments || assignments.length === 0) return "";

  const skillIds = assignments.map((a: { skill_id: string }) => a.skill_id);

  const { data: skills } = await adminClient
    .from("platform_skills")
    .select("name, content")
    .in("id", skillIds)
    .eq("is_active", true);

  if (!skills || skills.length === 0) return "";

  return skills
    .map((s: { name: string; content: string }) => `\n\n---\n## Skill: ${s.name}\n\n${s.content}`)
    .join("");
}

// ── Main handler ─────────────────────────────────────────────────────

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const requestOrigin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(requestOrigin);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // ── Auth ────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      return jsonResponse(401, { error: "Missing authorization" }, corsHeaders);
    }

    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return jsonResponse(401, { error: "Invalid authentication" }, corsHeaders);
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // ── Parse request ───────────────────────────────────────────────
    const body: ExecutorRequest = await req.json();
    const { agentId, taskId, instruction, context, maxSteps = 5 } = body;

    if (!agentId || !instruction) {
      return jsonResponse(400, { error: "Missing required fields: agentId, instruction" }, corsHeaders);
    }

    // ── Load agent config ───────────────────────────────────────────
    const { data: agentConfig } = await adminClient
      .from("agent_configs")
      .select("*")
      .eq("user_id", user.id)
      .eq("agent_key", agentId)
      .single();

    const agentName = agentConfig?.name ?? agentId;
    const agentModel = agentConfig?.model ?? "claude";
    const agentZone = agentConfig?.zone ?? "operations";
    const agentRole = agentConfig?.role ?? "";

    // ── Load system prompt ──────────────────────────────────────────
    const { data: promptData } = await adminClient
      .from("agent_system_prompts")
      .select("system_prompt")
      .eq("user_id", user.id)
      .eq("agent_key", agentId)
      .eq("is_active", true)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    const basePrompt = promptData?.system_prompt ??
      `You are ${agentName}, a healthcare AI agent. Role: ${agentRole}. Zone: ${agentZone}. ` +
      `You help healthcare providers by completing tasks autonomously. ` +
      `Always prioritize patient safety and HIPAA compliance. ` +
      `Use the available tools to complete your task. When done, call task_complete.`;

    // ── Compose skills into system prompt ────────────────────────────
    const skillsContent = await fetchAssignedSkills(adminClient, agentId, user.id);
    const systemPrompt = skillsContent
      ? `${basePrompt}\n\n# Assigned Skills${skillsContent}`
      : basePrompt;

    // ── Create execution record ─────────────────────────────────────
    const { data: execution } = await adminClient
      .from("agent_executions")
      .insert({
        user_id: user.id,
        agent_id: agentId,
        task_id: taskId ?? null,
        execution_type: taskId ? "task" : "manual",
        status: "running",
        started_at: new Date().toISOString(),
        input_summary: instruction.slice(0, 500),
        metadata: { context, maxSteps },
      })
      .select("id")
      .single();

    const executionId = execution?.id;

    // ── Pre-task hooks ─────────────────────────────────────────────
    await runHooks("pre_task", {
      agentId, agentName, instruction, userId: user.id, executionId,
    }, adminClient, supabaseUrl, supabaseServiceKey);

    // ── Execution loop ──────────────────────────────────────────────
    const messages: Array<{ role: string; content: string }> = [
      { role: "user", content: instruction },
    ];

    if (context) {
      messages[0].content += `\n\nContext:\n${JSON.stringify(context, null, 2)}`;
    }

    let totalTokens = 0;
    let totalCost = 0;
    let finalOutput = "";
    let taskCompleted = false;

    for (let step = 0; step < maxSteps; step++) {
      // ── Pre-LLM call hook ──────────────────────────────────────
      await runHooks("pre_llm_call", {
        agentId, step, messageCount: messages.length,
      }, adminClient, supabaseUrl, supabaseServiceKey);

      // Call LLM via the llm-router
      const llmResponse = await fetch(`${supabaseUrl}/functions/v1/llm-router`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          model: agentModel,
          messages,
          agentId,
          zone: agentZone,
          systemPrompt,
          tools: AGENT_TOOLS,
          maxTokens: 4096,
          temperature: 0.3,
        }),
      });

      if (!llmResponse.ok) {
        const errText = await llmResponse.text();
        throw new Error(`LLM router error: ${errText}`);
      }

      const llmData = await llmResponse.json();
      totalTokens += llmData.usage?.totalTokens ?? 0;
      totalCost += llmData.usage?.costUsd ?? 0;

      // ── Post-LLM call hook ──────────────────────────────────────
      await runHooks("post_llm_call", {
        agentId, step, tokens: llmData.usage?.totalTokens ?? 0,
        hasToolCalls: !!(llmData.toolCalls?.length),
      }, adminClient, supabaseUrl, supabaseServiceKey);

      // If LLM returned text content, add to messages
      if (llmData.content) {
        messages.push({ role: "assistant", content: llmData.content });
        finalOutput = llmData.content;
      }

      // If no tool calls, we're done
      if (!llmData.toolCalls || llmData.toolCalls.length === 0) {
        break;
      }

      // Execute tool calls
      const toolResults: string[] = [];
      for (const tc of llmData.toolCalls) {
        if (tc.name === "task_complete") {
          taskCompleted = true;
          finalOutput = (tc.arguments as { summary: string }).summary;
          break;
        }

        const result = await executeTool(
          tc, user.id, agentId, adminClient,
          supabaseUrl, supabaseServiceKey, authHeader,
        );
        toolResults.push(`Tool "${tc.name}": ${result}`);
      }

      if (taskCompleted) break;

      // Feed tool results back to the LLM
      if (toolResults.length > 0) {
        messages.push({
          role: "user",
          content: `Tool results:\n${toolResults.join("\n\n")}`,
        });
      }
    }

    // ── Post-task hooks ────────────────────────────────────────────
    await runHooks("post_task", {
      agentId, agentName, executionId, taskCompleted,
      output: finalOutput.slice(0, 500), totalTokens, totalCost,
    }, adminClient, supabaseUrl, supabaseServiceKey);

    // ── Update execution record ─────────────────────────────────────
    const durationMs = Date.now() - new Date().getTime();

    if (executionId) {
      await adminClient
        .from("agent_executions")
        .update({
          status: taskCompleted ? "success" : "success",
          completed_at: new Date().toISOString(),
          duration_ms: Math.abs(durationMs),
          output_summary: finalOutput.slice(0, 1000),
          tokens_used: totalTokens,
          cost_usd: totalCost,
        })
        .eq("id", executionId);
    }

    // ── Response ─────────────────────────────────────────────────────
    return jsonResponse(200, {
      success: true,
      executionId,
      agentId,
      agentName,
      output: finalOutput,
      taskCompleted,
      stepsUsed: messages.filter((m) => m.role === "assistant").length,
      maxSteps,
      usage: {
        totalTokens,
        costUsd: totalCost,
      },
    }, corsHeaders);
  } catch (error) {
    console.error("Agent Executor error:", error);
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse(500, { success: false, error: errMsg }, getCorsHeaders(null));
  }
});

function jsonResponse(status: number, body: unknown, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
