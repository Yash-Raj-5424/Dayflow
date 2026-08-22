import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Plane, Send, MessageSquare } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Select, Textarea, Input } from "../components/ui/Input";
import { StatusBadge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { PageSkeleton } from "../components/ui/Skeleton";
import { useToast } from "../context/useToast";
import { apiErrorMessage } from "../lib/apiClient";
import { daysBetween, formatDate } from "../lib/format";
import * as leaveApi from "../api/leaves";
import type { LeaveOut, LeaveType } from "../lib/types";

export default function Leave() {
  const toast = useToast();
  const [leaves, setLeaves] = useState<LeaveOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [leaveType, setLeaveType] = useState<LeaveType>("paid");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [remarks, setRemarks] = useState("");

  async function load() {
    try {
      setLeaves(await leaveApi.myLeaves());
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await leaveApi.createLeave({ leave_type: leaveType, start_date: startDate, end_date: endDate, remarks });
      toast.success("Leave request submitted.");
      setStartDate("");
      setEndDate("");
      setRemarks("");
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 font-display text-3xl font-semibold text-ink">Leave</h1>
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-semibold text-ink">Leave</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <Plane className="h-4 w-4 text-violet-300" /> Apply for leave
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Select label="Type" value={leaveType} onChange={(e) => setLeaveType(e.target.value as LeaveType)}>
              <option value="paid">Paid</option>
              <option value="sick">Sick</option>
              <option value="unpaid">Unpaid</option>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <Input label="End" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
            <Textarea
              label="Remarks (optional)"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Reason for leave…"
            />
            <Button type="submit" isLoading={submitting} className="w-full">
              <Send className="h-4 w-4" /> Submit request
            </Button>
          </form>
        </Card>

        <Card delay={0.05} className="!p-0 overflow-hidden lg:col-span-2">
          {leaves.length === 0 ? (
            <EmptyState icon={<Plane className="h-5 w-5" />} title="No leave requests yet" />
          ) : (
            <div className="flex flex-col divide-y divide-border/60">
              {leaves.map((l) => (
                <div key={l.id} className="flex flex-col gap-2 p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize text-ink">{l.leave_type} leave</span>
                    <StatusBadge status={l.status} />
                  </div>
                  <p className="text-sm text-muted">
                    {formatDate(l.start_date)} – {formatDate(l.end_date)} · {daysBetween(l.start_date, l.end_date)} day(s)
                  </p>
                  {l.remarks && <p className="text-xs text-faint">"{l.remarks}"</p>}
                  {l.admin_comment && (
                    <p className="flex items-start gap-1.5 text-xs text-violet-300">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 translate-y-0.5" /> {l.admin_comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
