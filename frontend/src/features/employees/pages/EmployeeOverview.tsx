import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowUpRight } from "lucide-react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Avatar } from "../../../components/ui/Avatar";
import { EmployeeStatusBadge } from "../../../components/ui/Badge";
import { PageSkeleton } from "../../../components/ui/Skeleton";
import { formatDate, formatDateTime } from "../../../lib/format";
import * as employeesApi from "../api";
import type { Employee } from "../types";
import type { DepartmentCount, EmployeeStats } from "../api";

function MetricTile({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-faint">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-semibold text-ink">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </Card>
  );
}

export default function EmployeeOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [departments, setDepartments] = useState<DepartmentCount[]>([]);
  const [recent, setRecent] = useState<Employee[]>([]);
  const [activity, setActivity] = useState<Awaited<ReturnType<typeof employeesApi.getRecentActivity>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      employeesApi.getEmployeeStats(),
      employeesApi.getDepartmentDistribution(),
      employeesApi.getRecentlyAdded(5),
      employeesApi.getRecentActivity(6),
    ]).then(([s, d, r, a]) => {
      setStats(s);
      setDepartments(d);
      setRecent(r);
      setActivity(a);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return (
      <div>
        <PageHeader title="Employees" subtitle="Manage your people, teams, and employee information." />
        <PageSkeleton />
      </div>
    );
  }

  const maxDeptCount = Math.max(...departments.map((d) => d.count), 1);

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle="Manage your people, teams, and employee information."
        action={
          <Button onClick={() => navigate("/team/employees/new")}>
            <Plus className="h-4 w-4" /> Add Employee
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile label="Total Employees" value={stats.total} hint="Across all departments" />
        <MetricTile label="Active" value={stats.active} hint="Currently working" />
        <MetricTile label="On Leave" value={stats.onLeave} hint="Away this period" />
        <MetricTile label="New This Month" value={stats.newThisMonth} hint="Joined recently" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <h2 className="mb-4 text-[15px] font-semibold text-ink">Workforce Overview</h2>
          <ul className="space-y-3">
            {departments.map((d) => (
              <li key={d.department}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-ink">{d.department}</span>
                  <span className="text-muted">
                    {d.count} · {Math.round((d.count / stats.total) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(d.count / maxDeptCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-[15px] font-semibold text-ink">Recently Added</h2>
            <button
              onClick={() => navigate("/team/employees/all")}
              className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <ul className="divide-y divide-border">
            {recent.map((employee) => (
              <li key={employee.id}>
                <button
                  onClick={() => navigate(`/team/employees/${employee.id}`)}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-surface-sunken/60"
                >
                  <Avatar name={`${employee.firstName} ${employee.lastName}`} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {employee.firstName} {employee.lastName}
                      <span className="ml-2 text-xs font-normal text-faint">{employee.employeeCode}</span>
                    </p>
                    <p className="truncate text-xs text-muted">
                      {employee.designation} · {employee.department}
                    </p>
                  </div>
                  <span className="hidden shrink-0 text-xs text-faint sm:block">{formatDate(employee.joiningDate)}</span>
                  <EmployeeStatusBadge status={employee.status} />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <h2 className="mb-3 text-[15px] font-semibold text-ink">Recent Employee Activity</h2>
        <ul className="divide-y divide-border">
          {activity.map((entry, i) => (
            <li key={i} className="flex items-start justify-between gap-4 py-2.5 text-sm">
              <p className="text-ink">
                <span className="font-medium">
                  {entry.employee.firstName} {entry.employee.lastName}
                </span>{" "}
                <span className="text-muted">— {entry.text.charAt(0).toLowerCase() + entry.text.slice(1)}</span>
              </p>
              <span className="shrink-0 text-xs text-faint">{formatDateTime(entry.timestamp)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
