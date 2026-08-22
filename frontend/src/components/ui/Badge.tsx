type Tone = "accent" | "success" | "warning" | "danger" | "neutral";

const toneClasses: Record<Tone, string> = {
  accent: "bg-accent-subtle text-accent-hover border-accent-border",
  success: "bg-success-subtle text-success border-success-border",
  warning: "bg-warning-subtle text-warning border-warning-border",
  danger: "bg-danger-subtle text-danger border-danger-border",
  neutral: "bg-neutral-subtle text-muted border-neutral-border",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium capitalize ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

export type EmployeeStatus = "active" | "inactive" | "on_leave";

const employeeStatusConfig: Record<EmployeeStatus, { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "success" },
  inactive: { label: "Inactive", tone: "neutral" },
  on_leave: { label: "On Leave", tone: "warning" },
};

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  const config = employeeStatusConfig[status];
  return <Badge tone={config.tone}>{config.label}</Badge>;
}

const genericStatusTone: Record<string, Tone> = {
  present: "success",
  approved: "success",
  half_day: "warning",
  pending: "warning",
  absent: "danger",
  rejected: "danger",
  leave: "accent",
  paid: "accent",
  sick: "neutral",
  unpaid: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={genericStatusTone[status] ?? "neutral"}>{status.replace("_", " ")}</Badge>;
}
