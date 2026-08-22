import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Users, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageSkeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../context/useToast";
import { apiErrorMessage } from "../../lib/apiClient";
import { initials } from "../../lib/format";
import * as employeeApi from "../../api/employees";
import type { EmployeeAdminUpdate } from "../../api/employees";
import type { EmployeeListItem } from "../../lib/types";

export default function Employees() {
  const toast = useToast();
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EmployeeListItem | null>(null);
  const [form, setForm] = useState<EmployeeAdminUpdate>({});
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setEmployees(await employeeApi.listEmployees());
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

  function openEdit(emp: EmployeeListItem) {
    setEditing(emp);
    setForm({ first_name: emp.first_name, last_name: emp.last_name, job_title: emp.job_title ?? "", department: emp.department ?? "" });
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await employeeApi.updateEmployee(editing.user_id, form);
      toast.success("Employee updated.");
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(emp: EmployeeListItem) {
    if (!confirm(`Remove ${emp.first_name || emp.user.employee_id}? This cannot be undone.`)) return;
    try {
      await employeeApi.deleteEmployee(emp.user_id);
      toast.success("Employee removed.");
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 font-display text-3xl font-semibold text-ink">Employees</h1>
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink">Employees</h1>
        <span className="text-sm text-faint">{employees.length} total</span>
      </div>

      <Card className="!p-0 overflow-hidden">
        {employees.length === 0 ? (
          <EmptyState icon={<Users className="h-5 w-5" />} title="No employees yet" />
        ) : (
          <div className="flex flex-col divide-y divide-border/60">
            {employees.map((emp) => (
              <div key={emp.id} className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 font-display text-sm font-semibold text-white">
                  {initials(emp.first_name, emp.last_name) || emp.user.employee_id.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate font-medium text-ink">
                    {emp.first_name || emp.last_name ? `${emp.first_name} ${emp.last_name}`.trim() : emp.user.employee_id}
                    {emp.user.role === "admin" && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-violet-300" />}
                  </p>
                  <p className="truncate text-xs text-faint">
                    {emp.job_title || "No title"} · {emp.department || "No department"} · {emp.user.email}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    onClick={() => openEdit(emp)}
                    className="rounded-lg p-2 text-faint transition-colors hover:bg-white/[0.06] hover:text-ink"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(emp)}
                    className="rounded-lg p-2 text-faint transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit employee">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              value={form.first_name ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
            />
            <Input
              label="Last name"
              value={form.last_name ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
            />
          </div>
          <Input
            label="Job title"
            value={form.job_title ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, job_title: e.target.value }))}
          />
          <Input
            label="Department"
            value={form.department ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
          />
          <Button type="submit" isLoading={saving} className="w-full">
            Save changes
          </Button>
        </form>
      </Modal>
    </div>
  );
}
