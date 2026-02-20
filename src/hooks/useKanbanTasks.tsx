import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { isPast, parseISO } from "date-fns";
import { containsPhi, redactPhi, sanitizeInput } from "@/lib/security";

// ── Types ──────────────────────────────────────────────────────────────────
export type KanbanColumn = "backlog" | "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "high" | "medium" | "low";
export type TaskZone = "clinical" | "operations" | "external";
export type RecurrencePattern = "daily" | "weekly" | "monthly" | null;
export type DateFilter = "all" | "overdue" | "today" | "this_week" | "saved" | "archived" | "recurring";

export interface TaskComment {
  id: string;
  task_id: string;
  author: string;
  content: string;
  avatar_color: string;
  created_at: string;
}

export interface KanbanTask {
  id: string;
  user_id: string;
  title: string;
  description: string;
  agent_id: string;
  priority: TaskPriority;
  zone: TaskZone;
  column_id: KanbanColumn;
  due_date: string | null;
  is_recurring: boolean;
  recurrence_pattern: RecurrencePattern;
  is_saved: boolean;
  is_archived: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
  comments: TaskComment[];
}

export type KanbanTaskInput = Omit<KanbanTask, "id" | "user_id" | "created_at" | "updated_at" | "comments">;

// ── Hook ───────────────────────────────────────────────────────────────────
export function useKanbanTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [loading, setLoading] = useState(true);
  const notifiedOverdueIds = useRef<Set<string>>(new Set());

  // ── Load tasks + comments ──────────────────────────────────────────────
  const loadTasks = useCallback(async () => {
    if (!user) return;
    try {
      // First fetch user's tasks
      const tasksRes = await supabase
        .from("kanban_tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (tasksRes.error) throw tasksRes.error;

      const taskData = (tasksRes.data ?? []) as Omit<KanbanTask, "comments">[];
      const taskIds = taskData.map((t) => t.id);

      // Only fetch comments for this user's tasks (scoped query)
      let commentData: TaskComment[] = [];
      if (taskIds.length > 0) {
        const commentsRes = await supabase
          .from("task_comments")
          .select("*")
          .in("task_id", taskIds)
          .order("created_at", { ascending: true });

        if (commentsRes.error) throw commentsRes.error;
        commentData = (commentsRes.data ?? []) as TaskComment[];
      }

      const merged: KanbanTask[] = taskData.map((t) => ({
        ...t,
        comments: commentData.filter((c) => c.task_id === t.id),
      }));

      setTasks(merged);
    } catch (err) {
      console.error("loadTasks error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // ── Realtime subscription ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("kanban_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "kanban_tasks" }, () => loadTasks())
      .on("postgres_changes", { event: "*", schema: "public", table: "task_comments" }, () => loadTasks())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, loadTasks]);

  // ── Overdue notification (fires once per overdue task per session) ────────
  useEffect(() => {
    if (loading || tasks.length === 0) return;
    const now = new Date();
    const overdueTasks = tasks.filter(
      (t) =>
        !t.is_archived &&
        t.column_id !== "done" &&
        t.due_date &&
        isPast(parseISO(t.due_date)) &&
        !notifiedOverdueIds.current.has(t.id)
    );

    if (overdueTasks.length === 0) return;

    overdueTasks.forEach((t) => notifiedOverdueIds.current.add(t.id));

    toast({
      title: `⚠️ ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""}`,
      description:
        overdueTasks.length === 1
          ? `"${overdueTasks[0].title}" is past its due date.`
          : `${overdueTasks.map((t) => `"${t.title}"`).join(", ")} are past their due dates.`,
      variant: "destructive",
    } as Parameters<typeof toast>[0]);
  }, [loading, tasks]);

  // ── Update last seen ─────────────────────────────────────────────────────
  const touchLastSeen = useCallback(async (taskId: string) => {
    if (!user) return;
    await supabase
      .from("kanban_tasks")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", taskId)
      .eq("user_id", user.id);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, last_seen_at: new Date().toISOString() } : t
      )
    );
  }, [user]);

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const createTask = useCallback(async (input: Partial<KanbanTaskInput>) => {
    if (!user || !input.title?.trim()) return;

    // Sanitize inputs and check for PHI leakage
    const title = sanitizeInput(input.title.trim());
    const description = sanitizeInput(input.description?.trim() ?? "");

    // Warn if PHI is detected in task content
    if (containsPhi(title) || containsPhi(description)) {
      toast({
        title: "PHI Detected",
        description: "Potential patient data was detected and redacted. Avoid including PHI in task titles.",
        variant: "destructive",
      } as Parameters<typeof toast>[0]);
    }

    const row = {
      user_id: user.id,
      title: containsPhi(title) ? redactPhi(title) : title,
      description: containsPhi(description) ? redactPhi(description) : description,
      agent_id: input.agent_id ?? "1",
      priority: input.priority ?? "medium",
      zone: input.zone ?? "clinical",
      column_id: input.column_id ?? "backlog",
      due_date: input.due_date ?? null,
      is_recurring: input.is_recurring ?? false,
      recurrence_pattern: input.recurrence_pattern ?? null,
      is_saved: input.is_saved ?? false,
      is_archived: input.is_archived ?? false,
      last_seen_at: null,
    };
    const { data, error } = await supabase.from("kanban_tasks").insert(row).select().single();
    if (error) { toast({ title: "Error creating task", description: error.message, variant: "destructive" } as Parameters<typeof toast>[0]); return; }
    setTasks((prev) => [{ ...(data as Omit<KanbanTask, "comments">), comments: [] }, ...prev]);
  }, [user]);

  const updateTask = useCallback(async (id: string, changes: Partial<KanbanTaskInput>) => {
    if (!user) return;
    const { error } = await supabase.from("kanban_tasks").update(changes).eq("id", id).eq("user_id", user.id);
    if (error) { toast({ title: "Error updating task", description: error.message, variant: "destructive" } as Parameters<typeof toast>[0]); return; }
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));
  }, [user]);

  const deleteTask = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("kanban_tasks").delete().eq("id", id).eq("user_id", user.id);
    if (error) { toast({ title: "Error deleting task", description: error.message, variant: "destructive" } as Parameters<typeof toast>[0]); return; }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, [user]);

  const moveTask = useCallback(async (id: string, column_id: KanbanColumn) => {
    await updateTask(id, { column_id });
  }, [updateTask]);

  const addComment = useCallback(async (taskId: string, content: string, authorName = "You") => {
    if (!user || !content.trim()) return;

    // Sanitize and redact PHI from comments
    let safeContent = sanitizeInput(content.trim());
    if (containsPhi(safeContent)) {
      safeContent = redactPhi(safeContent);
    }

    const row = {
      task_id: taskId,
      user_id: user.id,
      author: sanitizeInput(authorName),
      content: safeContent,
      avatar_color: "bg-cyan-500/20 text-cyan-400",
    };
    const { data, error } = await supabase.from("task_comments").insert(row).select().single();
    if (error) { toast({ title: "Error adding comment", description: error.message, variant: "destructive" } as Parameters<typeof toast>[0]); return; }
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, comments: [...t.comments, data as TaskComment] } : t
      )
    );
  }, [user]);

  // ── Computed overdue count ────────────────────────────────────────────────
  const overdueCount = tasks.filter(
    (t) => !t.is_archived && t.column_id !== "done" && t.due_date && isPast(parseISO(t.due_date))
  ).length;

  return { tasks, setTasks, loading, createTask, updateTask, deleteTask, moveTask, addComment, touchLastSeen, overdueCount };
}
