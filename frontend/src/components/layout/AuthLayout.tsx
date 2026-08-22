import type { ReactNode } from "react";
import { Logo } from "../ui/Logo";

const pillars = [
  { label: "Attendance", value: "98%", desc: "on-time check-ins" },
  { label: "Leave cycle", value: "< 1 day", desc: "average approval time" },
  { label: "Payroll", value: "100%", desc: "on-schedule payouts" },
];

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto grid min-h-screen max-w-[1300px] grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        <div className="hidden flex-col justify-between border-r border-border p-12 lg:flex">
          <Logo size={30} />

          <div className="max-w-md">
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink">
              Every workday, in one flow.
            </h1>
            <p className="mt-3 text-sm text-muted">
              Onboarding, attendance, leave, and payroll — one system instead of five spreadsheets.
            </p>
          </div>

          <div className="flex gap-8 border-t border-border pt-6">
            {pillars.map((p) => (
              <div key={p.label}>
                <p className="font-display text-lg font-semibold text-ink">{p.value}</p>
                <p className="text-xs text-faint">
                  {p.label} · {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 shadow-sm">
            <div className="mb-6 lg:hidden">
              <Logo />
            </div>
            <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
            <p className="mt-1 mb-6 text-sm text-muted">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
