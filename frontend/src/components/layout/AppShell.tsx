import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Plane,
  Wallet,
  BarChart3,
  Settings as SettingsIcon,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  UserRound,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { Logo } from "../ui/Logo";
import { Avatar } from "../ui/Avatar";
import { DropdownMenu } from "../ui/DropdownMenu";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
}

function useNavItems(): NavItem[] {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  return [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/team/employees", label: "Employees", icon: Users, adminOnly: true },
    { to: isAdmin ? "/team/attendance" : "/attendance", label: "Attendance", icon: CalendarCheck },
    { to: isAdmin ? "/team/leaves" : "/leave", label: "Leave", icon: Plane },
    { to: isAdmin ? "/team/payroll" : "/payroll", label: "Payroll", icon: Wallet },
    { to: "/reports", label: "Reports", icon: BarChart3 },
    { to: "/settings", label: "Settings", icon: SettingsIcon },
  ].filter((item) => !item.adminOnly || isAdmin);
}

function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={label}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
              isActive ? "bg-accent-subtle font-medium text-accent-hover" : "text-muted hover:bg-slate-50 hover:text-ink"
            }`
          }
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

const BREADCRUMB_RULES: { test: (path: string) => boolean; crumbs: string[] }[] = [
  { test: (p) => p === "/dashboard", crumbs: ["Dashboard"] },
  { test: (p) => p === "/profile", crumbs: ["Profile"] },
  { test: (p) => p === "/attendance" || p === "/team/attendance", crumbs: ["Attendance"] },
  { test: (p) => p === "/leave" || p === "/team/leaves", crumbs: ["Leave"] },
  { test: (p) => p === "/payroll" || p === "/team/payroll", crumbs: ["Payroll"] },
  { test: (p) => p === "/reports", crumbs: ["Reports"] },
  { test: (p) => p === "/settings", crumbs: ["Settings"] },
  { test: (p) => p === "/team/employees/all", crumbs: ["Employees", "All Employees"] },
  { test: (p) => p === "/team/employees/new", crumbs: ["Employees", "Add Employee"] },
  { test: (p) => /^\/team\/employees\/[^/]+\/edit$/.test(p), crumbs: ["Employees", "Edit Employee"] },
  { test: (p) => /^\/team\/employees\/[^/]+$/.test(p), crumbs: ["Employees", "Profile"] },
  { test: (p) => p === "/team/employees", crumbs: ["Employees"] },
];

function useBreadcrumb(): string[] {
  const { pathname } = useLocation();
  return BREADCRUMB_RULES.find((rule) => rule.test(pathname))?.crumbs ?? [];
}

function Breadcrumb() {
  const crumbs = useBreadcrumb();
  if (crumbs.length === 0) return <span />;
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      {crumbs.map((crumb, i) => (
        <span key={crumb} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-faint" />}
          <span className={i === crumbs.length - 1 ? "font-medium text-ink" : "text-muted"}>{crumb}</span>
        </span>
      ))}
    </nav>
  );
}

const notifications = [
  { id: 1, text: "Priya Sharma requested paid leave for Sep 1–3.", time: "2h ago" },
  { id: 2, text: "Arjun Mehta's profile is missing an emergency contact.", time: "1d ago" },
  { id: 3, text: "Monthly payroll run completes in 3 days.", time: "2d ago" },
];

function NotificationsMenu() {
  return (
    <DropdownMenu
      label="Notifications"
      align="end"
      trigger={(triggerProps) => (
        <button
          {...triggerProps}
          aria-label="Notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-slate-50 hover:text-ink"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
        </button>
      )}
      items={notifications.map((n) => ({
        label: n.text,
        onSelect: () => {},
      }))}
    />
  );
}

function ProfileMenu() {
  const { user, logout } = useAuth();
  return (
    <DropdownMenu
      label="Account menu"
      align="end"
      trigger={(triggerProps) => (
        <button {...triggerProps} className="flex items-center gap-2 rounded-md py-1 pl-1 pr-1.5 hover:bg-slate-50">
          <Avatar name={user?.employee_id ?? "?"} size="sm" />
          <ChevronDown className="h-3.5 w-3.5 text-faint" />
        </button>
      )}
      items={[
        { label: "View profile", icon: <UserRound className="h-4 w-4" />, onSelect: () => (window.location.href = "/profile") },
        { label: "Settings", icon: <SettingsIcon className="h-4 w-4" />, onSelect: () => (window.location.href = "/settings") },
        { label: "Log out", icon: <LogOut className="h-4 w-4" />, onSelect: logout, variant: "danger" },
      ]}
    />
  );
}

export function AppShell() {
  const navItems = useNavItems();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
          <div className="flex h-14 items-center border-b border-border px-4">
            <Logo />
          </div>
          <button className="mx-4 mt-3 mb-1 flex items-center justify-between rounded-md border border-border px-2.5 py-1.5 text-left text-xs text-muted transition-colors hover:bg-slate-50">
            <span className="truncate font-medium text-ink">Acme Technologies</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-faint" />
          </button>
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <NavList items={navItems} />
          </div>
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setMobileNavOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface shadow-md">
              <div className="flex h-14 items-center justify-between border-b border-border px-4">
                <Logo />
                <button
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close menu"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-slate-50"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-3">
                <NavList items={navItems} onNavigate={() => setMobileNavOpen(false)} />
              </div>
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface px-4 sm:px-6">
            <button
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-slate-50 md:hidden"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>

            <div className="hidden md:block">
              <Breadcrumb />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
                <input
                  type="search"
                  placeholder="Search employees…"
                  aria-label="Search"
                  className="h-8 w-56 rounded-md border border-border bg-bg pl-8 pr-3 text-sm text-ink placeholder:text-faint outline-none transition-colors focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent/15"
                />
              </div>
              <NotificationsMenu />
              <div className="mx-1 h-5 w-px bg-border" />
              <ProfileMenu />
            </div>
          </header>

          <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
