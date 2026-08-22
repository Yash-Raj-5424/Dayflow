import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { LogIn, LogOut, Plane, Wallet, Users, ClipboardCheck, ArrowUpRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { FlowRing } from "../components/ui/FlowRing";
import { StatusBadge } from "../components/ui/Badge";
import { PageSkeleton } from "../components/ui/Skeleton";
import { apiErrorMessage } from "../lib/apiClient";
import { formatCurrency, formatTime } from "../lib/format";
import * as attendanceApi from "../api/attendance";
import * as leaveApi from "../api/leaves";
import * as payrollApi from "../api/payroll";
import * as employeeApi from "../api/employees";
import type { AttendanceOut, EmployeeProfileOut, LeaveOut, PayrollOut } from "../lib/types";

function todayIso(): string {
  return new Date().toLocaleDateString("en-CA");
}

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<EmployeeProfileOut | null>(null);
  const [weekly, setWeekly] = useState<AttendanceOut[]>([]);
  const [leaves, setLeaves] = useState<LeaveOut[]>([]);
  const [payroll, setPayroll] = useState<PayrollOut | null>(null);
  const [headcount, setHeadcount] = useState<number | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<number | null>(null);
  const [isCheckingInOut, setIsCheckingInOut] = useState(false);

  const isAdmin = user?.role === "admin";

  const load = useCallback(async () => {
    const [profileR, weeklyR, leavesR, payrollR] = await Promise.allSettled([
      employeeApi.getMyProfile(),
      attendanceApi.myWeeklyAttendance(),
      leaveApi.myLeaves(),
      payrollApi.myPayroll(),
    ]);
    if (profileR.status === "fulfilled") setProfile(profileR.value);
    if (weeklyR.status === "fulfilled") setWeekly(weeklyR.value);
    if (leavesR.status === "fulfilled") setLeaves(leavesR.value);
    if (payrollR.status === "fulfilled") setPayroll(payrollR.value);

    if (isAdmin) {
      const [empR, allLeavesR] = await Promise.allSettled([employeeApi.listEmployees(), leaveApi.allLeaves()]);
      if (empR.status === "fulfilled") setHeadcount(empR.value.length);
      if (allLeavesR.status === "fulfilled") {
        setPendingApprovals(allLeavesR.value.filter((l) => l.status === "pending").length);
      }
    }
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const today = weekly.find((a) => a.date === todayIso());
  const presentDays = weekly.filter((a) => a.status === "present" || a.status === "half_day").length;
  const pendingLeaves = leaves.filter((l) => l.status === "pending").length;

  async function handleCheckIn() {
    setIsCheckingInOut(true);
    try {
      await attendanceApi.checkIn();
      toast.success("Checked in. Have a great day!");
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setIsCheckingInOut(false);
    }
  }

  async function handleCheckOut() {
    setIsCheckingInOut(true);
    try {
      await attendanceApi.checkOut();
      toast.success("Checked out. See you tomorrow!");
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setIsCheckingInOut(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 font-display text-3xl font-semibold text-ink">Dashboard</h1>
        <PageSkeleton />
      </div>
    );
  }

  const displayName = profile?.first_name ? `${profile.first_name}` : user?.employee_id;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Hey {displayName} <span className="inline-block animate-[float_3s_ease-in-out_infinite]">👋</span>
        </h1>
        {isAdmin && (
          <span className="flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
            <Sparkles className="h-3.5 w-3.5" /> Admin view
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 flex flex-col justify-between overflow-hidden sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-faint">Today's status</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
              {today?.check_in && !today?.check_out && "You're checked in"}
              {today?.check_in && today?.check_out && "Day complete"}
              {!today?.check_in && "Not checked in yet"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {today?.check_in ? `In at ${formatTime(today.check_in)}` : "Kick off your day below"}
              {today?.check_out ? ` · Out at ${formatTime(today.check_out)}` : ""}
            </p>
            <div className="mt-5 flex gap-3">
              <Button
                onClick={handleCheckIn}
                isLoading={isCheckingInOut}
                disabled={!!today?.check_in}
                size="sm"
              >
                <LogIn className="h-4 w-4" /> Check in
              </Button>
              <Button
                onClick={handleCheckOut}
                isLoading={isCheckingInOut}
                disabled={!today?.check_in || !!today?.check_out}
                variant="secondary"
                size="sm"
              >
                <LogOut className="h-4 w-4" /> Check out
              </Button>
            </div>
          </div>
          <FlowRing
            progress={presentDays / 5}
            value={`${presentDays}/5`}
            label="days this week"
            size={128}
            gradientId="ring-week"
          />
        </Card>

        <Card delay={0.05}>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-faint">Leave</p>
            <Plane className="h-4 w-4 text-faint" />
          </div>
          <p className="font-display text-2xl font-semibold text-ink">{pendingLeaves} pending</p>
          <p className="mt-1 text-xs text-faint">{leaves.length} total requests</p>
          <Link to="/leave" className="mt-4 flex items-center gap-1 text-xs font-medium text-violet-300 hover:text-violet-200">
            Apply for leave <ArrowUpRight className="h-3 w-3" />
          </Link>
        </Card>

        <Card delay={0.1}>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-faint">Net salary</p>
            <Wallet className="h-4 w-4 text-faint" />
          </div>
          {payroll ? (
            <>
              <p className="font-display text-2xl font-semibold text-ink">{formatCurrency(payroll.net_salary)}</p>
              <p className="mt-1 text-xs text-faint">per month</p>
            </>
          ) : (
            <p className="text-sm text-faint">Not configured yet</p>
          )}
          <Link to="/payroll" className="mt-4 flex items-center gap-1 text-xs font-medium text-violet-300 hover:text-violet-200">
            View breakdown <ArrowUpRight className="h-3 w-3" />
          </Link>
        </Card>

        <Card delay={0.15}>
          <p className="mb-3 text-sm text-faint">Recent leave requests</p>
          {leaves.length === 0 ? (
            <p className="text-sm text-faint">No requests yet.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {leaves.slice(0, 3).map((l) => (
                <div key={l.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted capitalize">{l.leave_type} leave</span>
                  <StatusBadge status={l.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {isAdmin && (
          <>
            <Card delay={0.2}>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-faint">Headcount</p>
                <Users className="h-4 w-4 text-faint" />
              </div>
              <p className="font-display text-2xl font-semibold text-ink">{headcount ?? "—"}</p>
              <Link
                to="/team/employees"
                className="mt-4 flex items-center gap-1 text-xs font-medium text-violet-300 hover:text-violet-200"
              >
                Manage team <ArrowUpRight className="h-3 w-3" />
              </Link>
            </Card>
            <Card delay={0.25}>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-faint">Awaiting your review</p>
                <ClipboardCheck className="h-4 w-4 text-faint" />
              </div>
              <p className="font-display text-2xl font-semibold text-ink">{pendingApprovals ?? "—"}</p>
              <Link
                to="/team/leaves"
                className="mt-4 flex items-center gap-1 text-xs font-medium text-violet-300 hover:text-violet-200"
              >
                Review approvals <ArrowUpRight className="h-3 w-3" />
              </Link>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
