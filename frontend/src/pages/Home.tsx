import { Link } from "react-router-dom";
import { Users, CalendarCheck, Plane, Wallet, ArrowRight } from "lucide-react";
import { Logo } from "../components/ui/Logo";
import { Button } from "../components/ui/Button";

const FEATURES = [
  {
    icon: Users,
    title: "Employee management",
    description: "A single directory for every employee — profiles, departments, designations, and reporting lines.",
  },
  {
    icon: CalendarCheck,
    title: "Attendance",
    description: "Simple daily check-in and check-out, with a clear weekly view for employees and HR alike.",
  },
  {
    icon: Plane,
    title: "Leave",
    description: "Employees apply for leave in seconds; HR approves or rejects with a comment, all in one place.",
  },
  {
    icon: Wallet,
    title: "Payroll",
    description: "Transparent salary structures — employees see their breakdown, HR manages it centrally.",
  },
];

const PILLARS = [
  { value: "98%", label: "Attendance", desc: "on-time check-ins" },
  { value: "< 1 day", label: "Leave cycle", desc: "average approval time" },
  { value: "100%", label: "Payroll", desc: "on-schedule payouts" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              Every workday, in one flow.
            </h1>
            <p className="mt-4 text-base text-muted sm:text-lg">
              Dayflow brings employee records, attendance, leave, and payroll into one calm system — so HR spends
              less time on spreadsheets and more time on people.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/register">
                <Button size="lg">
                  Get started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">
                  Log in
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-14 flex flex-wrap gap-10 border-t border-border pt-8">
            {PILLARS.map((p) => (
              <div key={p.label}>
                <p className="font-display text-2xl font-semibold text-ink">{p.value}</p>
                <p className="text-sm text-faint">
                  {p.label} · {p.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="font-display text-2xl font-semibold text-ink">Everything HR needs, nothing it doesn't</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Four core modules, built to work together instead of living in separate tools.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div key={title}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-subtle text-accent">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="mt-3 text-[15px] font-semibold text-ink">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded-lg border border-border bg-surface p-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Ready to bring HR into one place?</h2>
              <p className="mt-1 text-sm text-muted">Create an account and get your team set up in minutes.</p>
            </div>
            <Link to="/register" className="shrink-0">
              <Button size="lg">
                Get started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-faint sm:px-6">© {new Date().getFullYear()} Dayflow.</div>
      </footer>
    </div>
  );
}
