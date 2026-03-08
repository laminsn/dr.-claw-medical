/**
 * McpsManager — Admin CRUD for platform_mcps.
 * Table view + create/edit dialog + connection test.
 */

import { useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, Wifi } from "lucide-react";
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
  usePlatformMcps,
  useCreateMcp,
  useUpdateMcp,
  useDeleteMcp,
  useTestMcpConnection,
  type PlatformMcp,
  type PlatformMcpInsert,
  type McpType,
} from "@/hooks/usePlatformMcps";

// ── Empty form state ─────────────────────────────────────────────────

const emptyForm: PlatformMcpInsert = {
  name: "",
  slug: "",
  description: "",
  type: "http",
  config: {},
  is_active: true,
};

// ── Component ────────────────────────────────────────────────────────

export default function McpsManager() {
  const { data: mcps = [], isLoading } = usePlatformMcps();
  const createMcp = useCreateMcp();
  const updateMcp = useUpdateMcp();
  const deleteMcp = useDeleteMcp();
  const testConnection = useTestMcpConnection();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlatformMcpInsert>(emptyForm);
  const [configJson, setConfigJson] = useState("{}");

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setConfigJson("{}");
    setDialogOpen(true);
  };

  const openEdit = (mcp: PlatformMcp) => {
    setEditingId(mcp.id);
    setForm({
      name: mcp.name,
      slug: mcp.slug,
      description: mcp.description,
      type: mcp.type,
      config: mcp.config,
      is_active: mcp.is_active,
    });
    setConfigJson(JSON.stringify(mcp.config, null, 2));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    let parsedConfig: Record<string, unknown>;
    try {
      parsedConfig = JSON.parse(configJson);
    } catch {
      toast({ title: "Invalid JSON in config", variant: "destructive" });
      return;
    }

    const payload = { ...form, config: parsedConfig };

    try {
      if (editingId) {
        await updateMcp.mutateAsync({ id: editingId, ...payload });
        toast({ title: "MCP updated" });
      } else {
        await createMcp.mutateAsync(payload);
        toast({ title: "MCP created" });
      }
      setDialogOpen(false);
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMcp.mutateAsync(id);
      toast({ title: "MCP deleted" });
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    }
  };

  const handleTest = async (mcp: PlatformMcp) => {
    const result = await testConnection.mutateAsync(mcp);
    toast({
      title: result.ok ? "Connection OK" : "Connection Failed",
      description: result.message,
      variant: result.ok ? "default" : "destructive",
    });
  };

  const updateField = <K extends keyof PlatformMcpInsert>(
    key: K,
    value: PlatformMcpInsert[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading MCPs...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{mcps.length} MCPs configured</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Add MCP
        </Button>
      </div>

      <div className="rounded-lg border border-white/[0.06] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mcps.map((mcp) => (
              <TableRow key={mcp.id}>
                <TableCell className="font-medium">{mcp.name}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{mcp.slug}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[9px]">{mcp.type}</Badge>
                </TableCell>
                <TableCell>
                  {mcp.is_active
                    ? <CheckCircle2 className="h-4 w-4 text-green-400" />
                    : <XCircle className="h-4 w-4 text-muted-foreground" />
                  }
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleTest(mcp)} title="Test connection">
                      <Wifi className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(mcp)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(mcp.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {mcps.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No MCPs configured yet. Click "Add MCP" to create one.
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
            <DialogTitle>{editingId ? "Edit MCP" : "Create MCP"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Supabase Functions" />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => updateField("slug", e.target.value)} placeholder="supabase-fn" />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Input value={form.description ?? ""} onChange={(e) => updateField("description", e.target.value)} placeholder="Brief description" />
            </div>

            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => updateField("type", v as McpType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="http">HTTP</SelectItem>
                  <SelectItem value="command">Command</SelectItem>
                  <SelectItem value="supabase_fn">Supabase Function</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Config (JSON)</Label>
              <Textarea
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                placeholder='{ "url": "https://..." }'
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
              {editingId ? "Save Changes" : "Create MCP"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
