/**
 * SkillsManager — Admin CRUD for platform_skills.
 * Table view + create/edit dialog.
 */

import { useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  usePlatformSkills,
  useCreateSkill,
  useUpdateSkill,
  useDeleteSkill,
  type PlatformSkill,
  type PlatformSkillInsert,
} from "@/hooks/usePlatformSkills";

// ── Empty form state ─────────────────────────────────────────────────

const emptyForm: PlatformSkillInsert = {
  name: "",
  slug: "",
  description: "",
  category: "",
  content: "",
  allowed_tools: [],
  tier: "core",
  is_active: true,
  metadata: null,
};

// ── Component ────────────────────────────────────────────────────────

export default function SkillsManager() {
  const { data: skills = [], isLoading } = usePlatformSkills();
  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlatformSkillInsert>(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (skill: PlatformSkill) => {
    setEditingId(skill.id);
    setForm({
      name: skill.name,
      slug: skill.slug,
      description: skill.description,
      category: skill.category,
      content: skill.content,
      allowed_tools: skill.allowed_tools,
      tier: skill.tier,
      is_active: skill.is_active,
      metadata: skill.metadata,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateSkill.mutateAsync({ id: editingId, ...form });
        toast({ title: "Skill updated" });
      } else {
        await createSkill.mutateAsync(form);
        toast({ title: "Skill created" });
      }
      setDialogOpen(false);
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSkill.mutateAsync(id);
      toast({ title: "Skill deleted" });
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    }
  };

  const updateField = <K extends keyof PlatformSkillInsert>(
    key: K,
    value: PlatformSkillInsert[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading skills...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{skills.length} skills configured</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Add Skill
        </Button>
      </div>

      <div className="rounded-lg border border-white/[0.06] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skills.map((skill) => (
              <TableRow key={skill.id}>
                <TableCell className="font-medium">{skill.name}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{skill.slug}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[9px]">{skill.category ?? "—"}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[9px]">{skill.tier ?? "core"}</Badge>
                </TableCell>
                <TableCell>
                  {skill.is_active
                    ? <CheckCircle2 className="h-4 w-4 text-green-400" />
                    : <XCircle className="h-4 w-4 text-muted-foreground" />
                  }
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(skill)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(skill.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {skills.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No skills configured yet. Click "Add Skill" to create one.
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
            <DialogTitle>{editingId ? "Edit Skill" : "Create Skill"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="PHI Guard" />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => updateField("slug", e.target.value)} placeholder="phi-guard" />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Input value={form.description ?? ""} onChange={(e) => updateField("description", e.target.value)} placeholder="Brief description" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Input value={form.category ?? ""} onChange={(e) => updateField("category", e.target.value)} placeholder="security" />
              </div>
              <div>
                <Label>Tier</Label>
                <Input value={form.tier ?? ""} onChange={(e) => updateField("tier", e.target.value)} placeholder="core" />
              </div>
            </div>

            <div>
              <Label>Content (Markdown)</Label>
              <Textarea
                value={form.content}
                onChange={(e) => updateField("content", e.target.value)}
                placeholder="Skill instructions in markdown..."
                className="min-h-[160px] font-mono text-xs"
              />
            </div>

            <div>
              <Label>Allowed Tools (comma-separated)</Label>
              <Input
                value={(form.allowed_tools ?? []).join(", ")}
                onChange={(e) => updateField("allowed_tools", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                placeholder="read, write, search"
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
              {editingId ? "Save Changes" : "Create Skill"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
