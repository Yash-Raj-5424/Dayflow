import { useEffect, useState } from "react";
import { Wallet, TrendingUp, TrendingDown, CalendarDays } from "lucide-react";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageSkeleton } from "../components/ui/Skeleton";
import { useToast } from "../context/useToast";
import { apiErrorMessage } from "../lib/apiClient";
import { formatCurrency, formatDate } from "../lib/format";
import * as payrollApi from "../api/payroll";
import type { PayrollOut } from "../lib/types";

export default function Payroll() {
  const toast = useToast();
  const [payroll, setPayroll] = useState<PayrollOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [notConfigured, setNotConfigured] = useState(false);

  useEffect(() => {
    payrollApi
      .myPayroll()
      .then(setPayroll)
      .catch((err) => {
        if (err?.response?.status === 404) {
          setNotConfigured(true);
        } else {
          toast.error(apiErrorMessage(err));
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 font-display text-3xl font-semibold text-ink">Payroll</h1>
        <PageSkeleton />
      </div>
    );
  }

  if (notConfigured || !payroll) {
    return (
      <div>
        <h1 className="mb-6 font-display text-3xl font-semibold text-ink">Payroll</h1>
        <Card>
          <EmptyState
            icon={<Wallet className="h-5 w-5" />}
            title="Payroll not set up yet"
            description="HR hasn't configured your salary structure. Check back soon."
          />
        </Card>
      </div>
    );
  }

  const basic = parseFloat(payroll.basic_salary);
  const allowances = parseFloat(payroll.allowances);
  const deductions = parseFloat(payroll.deductions);
  const gross = basic + allowances;
  const allowancePct = gross > 0 ? (allowances / gross) * 100 : 0;

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-semibold text-ink">Payroll</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="text-sm text-faint">Net monthly salary</p>
          <p className="mt-1 font-display text-4xl font-semibold text-gradient">{formatCurrency(payroll.net_salary)}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-faint">
            <CalendarDays className="h-3.5 w-3.5" /> Effective from {formatDate(payroll.effective_date)}
          </p>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-xs text-faint">
              <span>Basic + allowances</span>
              <span>{formatCurrency(gross)}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                style={{ width: `${100 - allowancePct}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-muted">Basic {formatCurrency(basic)}</span>
              <span className="text-cyan-300">Allowances {formatCurrency(allowances)}</span>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card delay={0.05}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-faint">Allowances</p>
                <p className="font-display text-lg font-semibold text-ink">{formatCurrency(allowances)}</p>
              </div>
            </div>
          </Card>
          <Card delay={0.1}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-faint">Deductions</p>
                <p className="font-display text-lg font-semibold text-ink">{formatCurrency(deductions)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
