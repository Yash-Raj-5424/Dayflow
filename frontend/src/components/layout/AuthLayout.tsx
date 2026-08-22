import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { FlowBackground } from "../ui/FlowBackground";
import { Logo } from "../ui/Logo";
import { FlowRing } from "../ui/FlowRing";

const pillars = [
  { label: "Attendance", value: "98%", desc: "on-time check-ins" },
  { label: "Leave cycle", value: "< 1 day", desc: "average approval time" },
  { label: "Payroll", value: "100%", desc: "on-schedule payouts" },
];

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="relative min-h-screen">
      <FlowBackground />
      <div className="mx-auto grid min-h-screen max-w-[1300px] grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
          <Logo size={36} />

          <div className="max-w-md">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink"
            >
              Every workday,
              <br />
              <span className="text-gradient">in one flow.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 text-muted"
            >
              Onboarding, attendance, leave, and payroll — one calm system instead of five spreadsheets.
            </motion.p>
          </div>

          <div className="flex items-center gap-8">
            <FlowRing progress={0.82} size={110} strokeWidth={8} value="Live" label="demo data" />
            <div className="flex flex-col gap-4">
              {pillars.map((p, i) => (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                >
                  <p className="font-display text-lg font-semibold text-ink">{p.value}</p>
                  <p className="text-xs text-faint">
                    {p.label} · {p.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="glass-strong w-full max-w-sm rounded-3xl p-8"
          >
            <div className="mb-6 lg:hidden">
              <Logo />
            </div>
            <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
            <p className="mt-1 mb-6 text-sm text-muted">{subtitle}</p>
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
