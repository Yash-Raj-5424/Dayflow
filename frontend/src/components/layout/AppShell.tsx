import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  UserRound,
  CalendarCheck,
  Plane,
  Wallet,
  Users,
  ClipboardCheck,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { Logo } from "../ui/Logo";
import { FlowBackground } from "../ui/FlowBackground";

const selfNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Profile", icon: UserRound },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/leave", label: "Leave", icon: Plane },
  { to: "/payroll", label: "Payroll", icon: Wallet },
];

const teamNav = [
  { to: "/team/employees", label: "Employees", icon: Users },
  { to: "/team/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/team/leaves", label: "Approvals", icon: ClipboardCheck },
  { to: "/team/payroll", label: "Payroll", icon: Wallet },
];

function NavSection({ title, items }: { title: string; items: typeof selfNav }) {
  return (
    <div>
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-faint">{title}</p>
      <div className="flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gradient-to-r from-violet-500/20 to-cyan-400/10 text-ink"
                  : "text-muted hover:bg-white/[0.04] hover:text-ink"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`h-4 w-4 ${isActive ? "text-violet-300" : "text-faint group-hover:text-muted"}`} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Burning the midnight oil";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Winding down";
}

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="relative min-h-screen">
      <FlowBackground variant="subtle" />
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-border p-5 md:flex">
          <div>
            <div className="mb-8 px-1">
              <Logo />
            </div>
            <div className="flex flex-col gap-6">
              <NavSection title="My Workspace" items={selfNav} />
              {user?.role === "admin" && <NavSection title="Team" items={teamNav} />}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {user?.role === "admin" && (
              <div className="flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-xs text-violet-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin access
              </div>
            )}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-white/[0.02] p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 font-display text-sm font-semibold text-white">
                {user?.employee_id?.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{user?.employee_id}</p>
                <p className="truncate text-xs text-faint">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                aria-label="Log out"
                className="text-faint transition-colors hover:text-rose-400"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-6 md:px-8 md:py-8">
          <div className="mb-6 flex items-center justify-between md:hidden">
            <Logo size={26} />
            <button onClick={logout} className="text-faint hover:text-rose-400">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          <p className="mb-1 text-sm text-faint">{greeting()}</p>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
