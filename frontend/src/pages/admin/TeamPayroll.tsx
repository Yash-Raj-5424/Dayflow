import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Wallet, Pencil, PlusCircle } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageSkeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../context/useToast";
import { apiErrorMessage } from "../../lib/apiClient";
import { formatCurrency, formatDate } from "../../lib/format";
import * as payrollApi from "../../api/payroll";
import * as employeeApi from "../../api/employees";
import type { EmployeeListItem, PayrollOut } from "../../lib/types";

interface Row {
  employee: EmployeeListItem;
  payroll: PayrollOut | null;
}

const emptyForm = { basic_salary: "", allowances: "0", deductions: "0", effective_date: "" };

export default function TeamPayroll() {
  const toast = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [employees, payrolls] = await Promise.all([employeeApi.listEmployees(), payrollApi.allPayroll()]);
      const payrollByEmployee = new Map(payrolls.map((p) => [p.employee_id, p]));
      setRows(employees.map((employee) => ({ employee, payroll: payrollByEmployee.get(employee.user_id) ?? null })));
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

  const totalMonthly = useMemo(
    () => rows.reduce((sum, r) => sum + (r.payroll ? parseFloat(r.payroll.net_salary) : 0), 0),
    [rows],
  );

  function openEdit(row: Row) {
    setEditing(row);
    setForm(
      row.payroll
        ? {
            basic_salary: row.payroll.basic_salary,
            allowances: row.payroll.allowances,
            deductions: row.payroll.deductions,
            effective_date: row.payroll.effective_date,
          }
        : { ...emptyForm, effective_date: new Date().toLocaleDateString("en-CA") },
    );
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await payrollApi.updatePayroll(editing.employee.user_id, {
        basic_salary: parseFloat(form.basic_salary),
        allowances: parseFloat(form.allowances || "0"),
        deductions: parseFloat(form.deductions || "0"),
        effective_date: form.effective_date,
      });
      toast.success("Payroll updated.");
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 font-display text-3xl font-semibold text-ink">Team payroll</h1>
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold text-ink">Team payroll</h1>
        <span className="text-sm text-faint">{formatCurrency(totalMonthly)} / month total</span>
      </div>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={<Wallet className="h-5 w-5" />} title="No employees yet" />
        ) : (
          <div className="flex flex-col divide-y divide-border/60">
            {rows.map((row) => (
              <div key={row.employee.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-ink">
                    {row.employee.first_name || row.employee.last_name
                      ? `${row.employee.first_name} ${row.employee.last_name}`.trim()
                      : row.employee.user.employee_id}
                  </p>
                  <p className="text-xs text-faint">
                    {row.payroll ? (
                      <>
                        {formatCurrency(row.payroll.net_salary)} net · effective {formatDate(row.payroll.effective_date)}
                      </>
                    ) : (
                      "Not configured"
                    )}
                  </p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
                  {row.payroll ? <Pencil className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                  {row.payroll ? "Edit" : "Set up"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.payroll ? "Update salary structure" : "Set up salary structure"}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            label="Basic salary"
            type="number"
            min={0}
            step="0.01"
            value={form.basic_salary}
            onChange={(e) => setForm((f) => ({ ...f, basic_salary: e.target.value }))}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Allowances"
              type="number"
              min={0}
              step="0.01"
              value={form.allowances}
              onChange={(e) => setForm((f) => ({ ...f, allowances: e.target.value }))}
            />
            <Input
              label="Deductions"
              type="number"
              min={0}
              step="0.01"
              value={form.deductions}
              onChange={(e) => setForm((f) => ({ ...f, deductions: e.target.value }))}
            />
          </div>
          <Input
            label="Effective date"
            type="date"
            value={form.effective_date}
            onChange={(e) => setForm((f) => ({ ...f, effective_date: e.target.value }))}
            required
          />
          <Button type="submit" isLoading={saving} className="w-full">
            Save salary structure
          </Button>
        </form>
      </Modal>
    </div>
  );
}
