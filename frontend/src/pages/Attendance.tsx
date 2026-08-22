import { useEffect, useState, useCallback } from "react";
import { LogIn, LogOut, CalendarClock } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { PageSkeleton } from "../components/ui/Skeleton";
import { useToast } from "../context/useToast";
import { apiErrorMessage } from "../lib/apiClient";
import { formatDate, formatTime } from "../lib/format";
import * as attendanceApi from "../api/attendance";
import type { AttendanceOut } from "../lib/types";

function todayIso(): string {
  return new Date().toLocaleDateString("en-CA");
}

export default function Attendance() {
  const toast = useToast();
  const [records, setRecords] = useState<AttendanceOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await attendanceApi.myAttendance();
      setRecords(data);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const today = records.find((r) => r.date === todayIso());

  async function handleCheckIn() {
    setBusy(true);
    try {
      await attendanceApi.checkIn();
      toast.success("Checked in.");
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckOut() {
    setBusy(true);
    try {
      await attendanceApi.checkOut();
      toast.success("Checked out.");
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 font-display text-3xl font-semibold text-ink">Attendance</h1>
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold text-ink">Attendance</h1>
        <div className="flex gap-3">
          <Button onClick={handleCheckIn} isLoading={busy} disabled={!!today?.check_in} size="sm">
            <LogIn className="h-4 w-4" /> Check in
          </Button>
          <Button
            onClick={handleCheckOut}
            isLoading={busy}
            disabled={!today?.check_in || !!today?.check_out}
            variant="secondary"
            size="sm"
          >
            <LogOut className="h-4 w-4" /> Check out
          </Button>
        </div>
      </div>

      <Card className="!p-0 overflow-hidden">
        {records.length === 0 ? (
          <EmptyState
            icon={<CalendarClock className="h-5 w-5" />}
            title="No attendance recorded yet"
            description="Check in above to start your history."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-faint">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Check in</th>
                  <th className="px-5 py-3 font-medium">Check out</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-slate-900/[0.02]">
                    <td className="px-5 py-3.5 text-ink">{formatDate(r.date)}</td>
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
