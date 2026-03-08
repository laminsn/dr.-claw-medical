/**
 * HooksManager — Admin CRUD for platform_hooks.
 * Table view + create/edit dialog + active toggle.
 */

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  usePlatformHooks,
  useCreateHook,
  useUpdateHook,
  useDeleteHook,
  useToggleHookActive,
  type PlatformHook,
  type PlatformHookInsert,
  type HookEventType,
  type HookHandlerType,
} from "@/hooks/usePlatformHooks";

// ── Constants ────────────────────────────────────────────────────────

const EVENT_TYPES: HookEventType[] = [
  "pre_task",
  "post_task",
  "pre_llm_call",
  "post_llm_call",
  "on_phi_detected",
];

const HANDLER_TYPES: HookHandlerType[] = [
  "edge_function",
  "n8n_workflow",
  "webhook",
];

const EVENT_LABELS: Record<HookEventType, string> = {
  pre_task: "Pre-Task",
  post_task: "Post-Task",
  pre_llm_call: "Pre-LLM Call",
  post_llm_call: "Post-LLM Call",
  on_phi_detected: "On PHI Detected",
};

const HANDLER_LABELS: Record<HookHandlerType, string> = {
  edge_function: "Edge Function",
  n8n_workflow: "n8n Workflow",
  webhook: "Webhook",
};

// ── Empty form state ─────────────────────────────────────────────────

const emptyForm: PlatformHookInsert = {
  name: "",
  slug: "",
  event_type: "pre_task",
  handler_type: "webhook",
  handler_config: {},
  is_active: true,
  priority: 100,
};

// ── Component ────────────────────────────────────────────────────────

export default function HooksManager() {
  const { data: hooks = [], isLoading } = usePlatformHooks();
  const createHook = useCreateHook();
  const updateHook = useUpdateHook();
  const deleteHook = useDeleteHook();
  const toggleActive = useToggleHookActive();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlatformHookInsert>(emptyForm);
  const [configJson, setConfigJson] = useState("{}");

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setConfigJson("{}");
    setDialogOpen(true);
  };

  const openEdit = (hook: PlatformHook) => {
    setEditingId(hook.id);
    setForm({
      name: hook.name,
      slug: hook.slug,
      event_type: hook.event_type,
      handler_type: hook.handler_type,
      handler_config: hook.handler_config,
      is_active: hook.is_active,
      priority: hook.priority,
    });
    setConfigJson(JSON.stringify(hook.handler_config, null, 2));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    let parsedConfig: Record<string, unknown>;
    try {
      parsedConfig = JSON.parse(configJson);
    } catch {
      toast({ title: "Invalid JSON in handler config", variant: "destructive" });
      return;
    }

    const payload = { ...form, handler_config: parsedConfig };

    try {
      if (editingId) {
        await updateHook.mutateAsync({ id: editingId, ...payload });
        toast({ title: "Hook updated" });
      } else {
        await createHook.mutateAsync(payload);
        toast({ title: "Hook created" });
      }
      setDialogOpen(false);
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHook.mutateAsync(id);
      toast({ title: "Hook deleted" });
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await toggleActive.mutateAsync({ id, is_active: !currentActive });
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    }
  };

  const updateField = <K extends keyof PlatformHookInsert>(
    key: K,
    value: PlatformHookInsert[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading hooks...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{hooks.length} hooks configured</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Add Hook
        </Button>
      </div>

      <div className="rounded-lg border border-white/[0.06] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Handler</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hooks.map((hook) => (
              <TableRow key={hook.id}>
                <TableCell className="font-medium">{hook.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[9px]">{EVENT_LABELS[hook.event_type]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[9px]">{HANDLER_LABELS[hook.handler_type]}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{hook.priority}</TableCell>
                <TableCell>
                  <Switch
                    checked={hook.is_active}
                    onCheckedChange={() => handleToggle(hook.id, hook.is_active)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(hook)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(hook.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {hooks.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No hooks configured yet. Click "Add Hook" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Create / Edit Dialog ──────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Hook" : "Create Hook"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="PHI Alert" />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => updateField("slug", e.target.value)} placeholder="phi-alert" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Event Type</Label>
                <Select value={form.event_type} onValueChange={(v) => updateField("event_type", v as HookEventType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((et) => (
                      <SelectItem key={et} value={et}>{EVENT_LABELS[et]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Handler Type</Label>
                <Select value={form.handler_type} onValueChange={(v) => updateField("handler_type", v as HookHandlerType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HANDLER_TYPES.map((ht) => (
                      <SelectItem key={ht} value={ht}>{HANDLER_LABELS[ht]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Priority (lower = runs first)</Label>
              <Input
                type="number"
                value={form.priority}
                onChange={(e) => updateField("priority", parseInt(e.target.value, 10) || 100)}
              />
            </div>

            <div>
              <Label>Handler Config (JSON)</Label>
              <Textarea
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                placeholder='{ "url": "https://...", "method": "POST" }'
                className="min-h-[120px] font-mono text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => updateField("is_active", v)} />
              <Label>Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.slug}>
              {editingId ? "Save Changes" : "Create Hook"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
