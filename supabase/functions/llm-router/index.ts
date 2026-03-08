import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";
import { scanObject, sanitizeObject } from "../_shared/phi-scanner.ts";

/**
 * LLM Router Edge Function
 *
 * Multi-model LLM gateway with:
 *   1. Routes to Claude, OpenAI, Gemini, Grok, DeepSeek, Groq, Mistral, or Cohere based on request
 *   2. PHI scanning before external API calls
 *   3. Zone enforcement (clinical zone requires sanitization)
 *   4. Usage logging to api_usage_log
 *   5. Rate limiting via check_rate_limit
 */

interface LlmRequest {
  model: string;           // 'claude' | 'openai' | 'gemini' | 'grok' | 'deepseek' | 'groq' | 'mistral' | 'cohere'
  messages: Array<{ role: string; content: string }>;
  agentId: string;
  zone: "clinical" | "operations" | "external";
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  tools?: Array<Record<string, unknown>>;
}

interface LlmResponse {
  content: string;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
  toolCalls?: Array<{ name: string; arguments: Record<string, unknown> }>;
}

// ── Cost per 1M tokens (approximate, as of 2026) ───────────────────────

const COST_TABLE: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-20250514": { input: 3.0, output: 15.0 },
  "claude-haiku-4-20250414": { input: 0.80, output: 4.0 },
  "gpt-4o": { input: 2.50, output: 10.0 },
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
  "gemini-2.0-flash": { input: 0.10, output: 0.40 },
  "grok-3": { input: 3.0, output: 15.0 },
  "grok-3-mini": { input: 0.30, output: 0.50 },
  "deepseek-chat": { input: 0.14, output: 0.28 },
  "llama-3.3-70b-versatile": { input: 0.59, output: 0.79 },
  "mistral-large-latest": { input: 2.0, output: 6.0 },
  "command-r-plus": { input: 2.50, output: 10.0 },
};

function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const rates = COST_TABLE[model] ?? { input: 3.0, output: 15.0 };
  return (inputTokens * rates.input + outputTokens * rates.output) / 1_000_000;
}

// ── Model resolution ─────────────────────────────────────────────────

function resolveModel(shortName: string): { provider: string; model: string } {
  switch (shortName) {
    case "claude":
      return { provider: "anthropic", model: "claude-sonnet-4-20250514" };
    case "claude-haiku":
      return { provider: "anthropic", model: "claude-haiku-4-20250414" };
    case "openai":
      return { provider: "openai", model: "gpt-4o" };
    case "openai-mini":
      return { provider: "openai", model: "gpt-4o-mini" };
    case "gemini":
      return { provider: "google", model: "gemini-2.0-flash" };
    case "grok":
      return { provider: "xai", model: "grok-3" };
    case "grok-mini":
      return { provider: "xai", model: "grok-3-mini" };
    case "deepseek":
      return { provider: "deepseek", model: "deepseek-chat" };
    case "groq":
      return { provider: "groq", model: "llama-3.3-70b-versatile" };
    case "mistral":
      return { provider: "mistral", model: "mistral-large-latest" };
    case "cohere":
      return { provider: "cohere", model: "command-r-plus" };
    default:
      return { provider: "anthropic", model: "claude-sonnet-4-20250514" };
  }
}

// ── Provider API calls ───────────────────────────────────────────────

async function callAnthropic(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string | undefined,
  maxTokens: number,
  temperature: number,
  tools?: Array<Record<string, unknown>>,
): Promise<LlmResponse> {
  const start = Date.now();

  const body: Record<string, unknown> = {
    model,
    max_tokens: maxTokens,
    temperature,
    messages,
  };
  if (systemPrompt) body.system = systemPrompt;
  if (tools && tools.length > 0) body.tools = tools;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Anthropic API error ${resp.status}: ${errText}`);
  }

  const data = await resp.json();
  const latencyMs = Date.now() - start;

  const textContent = data.content
    ?.filter((c: { type: string }) => c.type === "text")
    ?.map((c: { text: string }) => c.text)
    ?.join("") ?? "";

  const toolCalls = data.content
    ?.filter((c: { type: string }) => c.type === "tool_use")
    ?.map((c: { name: string; input: Record<string, unknown> }) => ({
      name: c.name,
      arguments: c.input,
    }));

  return {
    content: textContent,
    model,
    provider: "anthropic",
    inputTokens: data.usage?.input_tokens ?? 0,
    outputTokens: data.usage?.output_tokens ?? 0,
    costUsd: estimateCost(model, data.usage?.input_tokens ?? 0, data.usage?.output_tokens ?? 0),
    latencyMs,
    toolCalls: toolCalls?.length > 0 ? toolCalls : undefined,
  };
}

async function callOpenAICompatible(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string | undefined,
  maxTokens: number,
  temperature: number,
  provider: string,
  baseUrl = "https://api.openai.com/v1",
  tools?: Array<Record<string, unknown>>,
): Promise<LlmResponse> {
  const start = Date.now();

  const allMessages = systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...messages]
    : messages;

  const body: Record<string, unknown> = {
    model,
    max_tokens: maxTokens,
    temperature,
    messages: allMessages,
  };
  if (tools && tools.length > 0) {
    body.tools = tools.map((t) => ({ type: "function", function: t }));
  }

  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`${provider} API error ${resp.status}: ${errText}`);
  }

  const data = await resp.json();
  const latencyMs = Date.now() - start;
  const choice = data.choices?.[0];

  const toolCalls = choice?.message?.tool_calls?.map(
    (tc: { function: { name: string; arguments: string } }) => ({
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments),
    })
  );

  return {
    content: choice?.message?.content ?? "",
    model,
    provider,
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
    costUsd: estimateCost(model, data.usage?.prompt_tokens ?? 0, data.usage?.completion_tokens ?? 0),
    latencyMs,
    toolCalls: toolCalls?.length > 0 ? toolCalls : undefined,
  };
}

// Convenience wrapper for standard OpenAI
async function callOpenAI(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string | undefined,
  maxTokens: number,
  temperature: number,
  tools?: Array<Record<string, unknown>>,
): Promise<LlmResponse> {
  return callOpenAICompatible(apiKey, model, messages, systemPrompt, maxTokens, temperature, "openai", "https://api.openai.com/v1", tools);
}

async function callGoogle(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string | undefined,
  maxTokens: number,
  temperature: number,
): Promise<LlmResponse> {
  const start = Date.now();

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature,
    },
  };
  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Google AI API error ${resp.status}: ${errText}`);
  }

  const data = await resp.json();
  const latencyMs = Date.now() - start;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const usage = data.usageMetadata ?? {};

  return {
    content: text,
    model,
    provider: "google",
    inputTokens: usage.promptTokenCount ?? 0,
    outputTokens: usage.candidatesTokenCount ?? 0,
    costUsd: estimateCost(model, usage.promptTokenCount ?? 0, usage.candidatesTokenCount ?? 0),
    latencyMs,
  };
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
    const authHeader = req.headers.get("Authorization");
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

    // ── Rate limit ──────────────────────────────────────────────────
    const { data: allowed } = await adminClient.rpc("check_rate_limit", {
      _user_id: user.id,
      _action: "agent_invoke",
      _max_requests: 30,
      _window_minutes: 1,
    });

    if (allowed === false) {
      return jsonResponse(429, { error: "Rate limit exceeded for agent_invoke" }, corsHeaders);
    }

    // ── Parse request ───────────────────────────────────────────────
    const body: LlmRequest = await req.json();
    const {
      model: modelShortName,
      messages,
      agentId,
      zone,
      maxTokens = 4096,
      temperature = 0.7,
      systemPrompt,
      tools,
    } = body;

    if (!modelShortName || !messages || !agentId || !zone) {
      return jsonResponse(400, {
        error: "Missing required fields: model, messages, agentId, zone",
      }, corsHeaders);
    }

    // ── PHI protection for clinical zone ─────────────────────────────
    let processedMessages = messages;
    let phiDetected = false;

    if (zone === "clinical") {
      const allText = messages.map((m) => m.content).join(" ");
      const scan = scanObject({ text: allText });
      phiDetected = scan.containsPhi;

      if (phiDetected) {
        processedMessages = messages.map((m) => ({
          ...m,
          content: sanitizeObject({ text: m.content }).text as string,
        }));
      }
    }

    // ── Resolve model and get API key ────────────────────────────────
    const { provider, model } = resolveModel(modelShortName);

    const keyMap: Record<string, string> = {
      anthropic: "ANTHROPIC_API_KEY",
      openai: "OPENAI_API_KEY",
      google: "GOOGLE_AI_API_KEY",
      xai: "XAI_API_KEY",
      deepseek: "DEEPSEEK_API_KEY",
      groq: "GROQ_API_KEY",
      mistral: "MISTRAL_API_KEY",
      cohere: "COHERE_API_KEY",
    };

    const apiKey = Deno.env.get(keyMap[provider]);
    if (!apiKey) {
      return jsonResponse(503, {
        error: `API key not configured for provider: ${provider}. Set ${keyMap[provider]} in Supabase secrets.`,
      }, corsHeaders);
    }

    // ── Call provider ────────────────────────────────────────────────
    let result: LlmResponse;

    // Base URLs for OpenAI-compatible providers
    const PROVIDER_BASE_URLS: Record<string, string> = {
      openai: "https://api.openai.com/v1",
      xai: "https://api.x.ai/v1",
      deepseek: "https://api.deepseek.com/v1",
      groq: "https://api.groq.com/openai/v1",
      mistral: "https://api.mistral.ai/v1",
      cohere: "https://api.cohere.com/v2",
    };

    switch (provider) {
      case "anthropic":
        result = await callAnthropic(apiKey, model, processedMessages, systemPrompt, maxTokens, temperature, tools);
        break;
      case "openai":
      case "xai":
      case "deepseek":
      case "groq":
      case "mistral":
      case "cohere":
        result = await callOpenAICompatible(
          apiKey, model, processedMessages, systemPrompt, maxTokens, temperature,
          provider, PROVIDER_BASE_URLS[provider], tools,
        );
        break;
      case "google":
        result = await callGoogle(apiKey, model, processedMessages, systemPrompt, maxTokens, temperature);
        break;
      default:
        return jsonResponse(400, { error: `Unknown provider: ${provider}` }, corsHeaders);
    }

    // ── Log usage ────────────────────────────────────────────────────
    await adminClient.from("api_usage_log").insert({
      user_id: user.id,
      agent_id: agentId,
      model: result.model,
      provider: result.provider,
      action: "completion",
      input_tokens: result.inputTokens,
      output_tokens: result.outputTokens,
      cost_usd: result.costUsd,
      latency_ms: result.latencyMs,
      zone,
      status: "success",
      metadata: {
        phiDetected,
        phiSanitized: phiDetected && zone === "clinical",
        hasToolCalls: !!result.toolCalls,
      },
    }).catch((err: Error) => {
      console.error("Failed to log API usage:", err.message);
    });

    // ── Response ─────────────────────────────────────────────────────
    return jsonResponse(200, {
      success: true,
      content: result.content,
      model: result.model,
      provider: result.provider,
      usage: {
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        totalTokens: result.inputTokens + result.outputTokens,
        costUsd: result.costUsd,
      },
      latencyMs: result.latencyMs,
      toolCalls: result.toolCalls,
      phiSanitized: phiDetected && zone === "clinical",
    }, corsHeaders);
  } catch (error) {
    console.error("LLM Router error:", error);
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
