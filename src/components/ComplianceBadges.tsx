import { Shield, Lock, FileCheck } from "lucide-react";

const badges = [
  {
    icon: Shield,
    label: "HIPAA",
    description: "Compliant",
  },
  {
    icon: FileCheck,
    label: "BAA",
    description: "Certified",
  },
  {
    icon: Lock,
    label: "PHI",
    description: "Protected",
  },
];

interface ComplianceBadgesProps {
  variant?: "inline" | "stacked";
}

const ComplianceBadges = ({ variant = "inline" }: ComplianceBadgesProps) => {
  if (variant === "stacked") {
    return (
      <div className="space-y-3">
        {badges.map((badge) => (
          <div
            key={badge.label}
            className="flex items-center gap-3 text-muted-foreground"
          >
            <badge.icon className="h-4 w-4 text-primary" />
            <span className="text-sm">
              <span className="font-semibold text-foreground">{badge.label}</span>{" "}
              {badge.description}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      {badges.map((badge) => (
        <div
          key={badge.label}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card/50"
        >
          <badge.icon className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">{badge.label}</span>
          <span className="text-xs text-muted-foreground">{badge.description}</span>
        </div>
      ))}
    </div>
  );
};

export default ComplianceBadges;
