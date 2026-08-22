import { useEffect, useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageSkeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../context/useToast";
import { apiErrorMessage } from "../../lib/apiClient";
import { formatDate, formatTime } from "../../lib/format";
import * as attendanceApi from "../../api/attendance";
import * as employeeApi from "../../api/employees";
import type { AttendanceOut, EmployeeListItem } from "../../lib/types";

export default function TeamAttendance() {
  const toast = useToast();
  const [records, setRecords] = useState<AttendanceOut[]>([]);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([attendanceApi.allAttendance(), employeeApi.listEmployees()])
      .then(([att, emps]) => {
        setRecords(att);
        setEmployees(emps);
      })
      .catch((err) => toast.error(apiErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nameByUserId = useMemo(() => {
    const map = new Map<string, string>();
    employees.forEach((e) => {
      const name = e.first_name || e.last_name ? `${e.first_name} ${e.last_name}`.trim() : e.user.employee_id;
      map.set(e.user_id, name);
    });
    return map;
  }, [employees]);

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 font-display text-3xl font-semibold text-ink">Team attendance</h1>
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-semibold text-ink">Team attendance</h1>
      <Card className="!p-0 overflow-hidden">
        {records.length === 0 ? (
          <EmptyState icon={<CalendarClock className="h-5 w-5" />} title="No attendance recorded yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-faint">
                  <th className="px-5 py-3 font-medium">Employee</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Check in</th>
                  <th className="px-5 py-3 font-medium">Check out</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5 text-ink">{nameByUserId.get(r.employee_id) ?? r.employee_id.slice(0, 8)}</td>
                    <td className="px-5 py-3.5 text-muted">{formatDate(r.date)}</td>
                    <td className="px-5 py-3.5 text-muted">{formatTime(r.check_in)}</td>
                    <td className="px-5 py-3.5 text-muted">{formatTime(r.check_out)}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
