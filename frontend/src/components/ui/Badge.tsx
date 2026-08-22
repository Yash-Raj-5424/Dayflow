type Tone = "violet" | "emerald" | "amber" | "rose" | "cyan" | "neutral";

const toneClasses: Record<Tone, string> = {
  violet: "bg-violet-500/15 text-violet-300 border-violet-400/30",
  emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  amber: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  rose: "bg-rose-500/15 text-rose-300 border-rose-400/30",
  cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30",
  neutral: "bg-white/[0.06] text-muted border-white/10",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

const statusTone: Record<string, Tone> = {
  present: "emerald",
  approved: "emerald",
  half_day: "amber",
  pending: "amber",
  absent: "rose",
  rejected: "rose",
  leave: "violet",
  paid: "violet",
  sick: "cyan",
  unpaid: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusTone[status] ?? "neutral"}>{status.replace("_", " ")}</Badge>;
}
