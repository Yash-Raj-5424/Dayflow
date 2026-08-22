import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Check, X } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageSkeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../context/useToast";
import { apiErrorMessage } from "../../lib/apiClient";
import { daysBetween, formatDate } from "../../lib/format";
import * as leaveApi from "../../api/leaves";
import * as employeeApi from "../../api/employees";
import type { EmployeeListItem, LeaveOut } from "../../lib/types";

export default function TeamLeaves() {
  const toast = useToast();
  const [leaves, setLeaves] = useState<LeaveOut[]>([]);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  async function load() {
    try {
      const [l, e] = await Promise.all([leaveApi.allLeaves(), employeeApi.listEmployees()]);
      setLeaves(l);
      setEmployees(e);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
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

  const visible = filter === "pending" ? leaves.filter((l) => l.status === "pending") : leaves;

  async function handleDecision(leaveId: string, decision: "approve" | "reject") {
    setBusyId(leaveId);
    try {
      if (decision === "approve") await leaveApi.approveLeave(leaveId);
      else await leaveApi.rejectLeave(leaveId);
      toast.success(`Leave request ${decision}d.`);
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 font-display text-3xl font-semibold text-ink">Leave approvals</h1>
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold text-ink">Leave approvals</h1>
        <div className="flex gap-1.5 rounded-xl border border-border bg-white/[0.02] p-1">
          {(["pending", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === f ? "bg-white/[0.08] text-ink" : "text-faint hover:text-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <Card className="!p-0 overflow-hidden">
        {visible.length === 0 ? (
          <EmptyState icon={<ClipboardCheck className="h-5 w-5" />} title="Nothing here" description="No leave requests match this filter." />
        ) : (
          <div className="flex flex-col divide-y divide-border/60">
            {visible.map((l) => (
              <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-medium text-ink">
                    {nameByUserId.get(l.employee_id) ?? l.employee_id.slice(0, 8)}{" "}
                    <span className="font-normal capitalize text-muted">· {l.leave_type} leave</span>
                  </p>
                  <p className="mt-0.5 text-sm text-faint">
                    {formatDate(l.start_date)} – {formatDate(l.end_date)} · {daysBetween(l.start_date, l.end_date)} day(s)
                  </p>
                  {l.remarks && <p className="mt-1 text-xs text-faint">"{l.remarks}"</p>}
                </div>
                <div className="flex items-center gap-2">
                  {l.status === "pending" ? (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        isLoading={busyId === l.id}
                        onClick={() => handleDecision(l.id, "reject")}
                      >
                        <X className="h-4 w-4" /> Reject
                      </Button>
                      <Button size="sm" isLoading={busyId === l.id} onClick={() => handleDecision(l.id, "approve")}>
                        <Check className="h-4 w-4" /> Approve
                      </Button>
                    </>
                  ) : (
                    <StatusBadge status={l.status} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
