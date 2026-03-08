/**
 * Org Chart Packs — Deployable agent hierarchies with parent-child relationships.
 */

import type { AgentTemplate } from "./agentTemplates";
import { hospiceCareTemplates, HOSPICE_DEPARTMENTS } from "./hospiceCareTemplates";

// ── Types ─────────────────────────────────────────────────────────────

export interface HierarchyNode {
  templateId: string;
  name: string;
  level: string;
  children: HierarchyNode[];
}

export interface OrgChartPack {
  id: string;
  name: string;
  description: string;
  icon: string;
  agentIds: string[];
  hierarchy: HierarchyNode[];
  totalAgents: number;
  departments: string[];
  recommended: boolean;
}

// ── Build hierarchy tree from flat templates ───────────────────────────

function buildHierarchy(templates: AgentTemplate[]): HierarchyNode[] {
  const byId = new Map(templates.map((t) => [t.id, t]));
  const childrenMap = new Map<string, AgentTemplate[]>();

  for (const t of templates) {
    const parentId = t.parentTemplateId ?? "__root__";
    const existing = childrenMap.get(parentId) ?? [];
    childrenMap.set(parentId, [...existing, t]);
  }

  function buildNode(template: AgentTemplate): HierarchyNode {
    const children = (childrenMap.get(template.id) ?? []).map(buildNode);
    return {
      templateId: template.id,
      name: template.name,
      level: template.level ?? "worker",
      children,
    };
  }

  // Find roots (no parent or parent not in set)
  const roots = templates.filter(
    (t) => !t.parentTemplateId || !byId.has(t.parentTemplateId)
  );

  return roots.map(buildNode);
}

// ── Packs ─────────────────────────────────────────────────────────────

export const ORG_CHART_PACKS: OrgChartPack[] = [
  {
    id: "hospice-care-team",
    name: "Hospice Care Team",
    description:
      "Full 39-agent hospice operation — CEO + 6 directors + 32 specialists across marketing, clinical, admissions, staffing, CX, and compliance. Modeled after a real hospice care organization.",
    icon: "Heart",
    agentIds: hospiceCareTemplates.map((t) => t.id),
    hierarchy: buildHierarchy(hospiceCareTemplates),
    totalAgents: hospiceCareTemplates.length,
    departments: [...HOSPICE_DEPARTMENTS],
    recommended: true,
  },
];
