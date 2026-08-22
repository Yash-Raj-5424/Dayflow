import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, X, MoreHorizontal, Eye, Pencil, Trash2, Users, AlertCircle } from "lucide-react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Input";
import { Avatar } from "../../../components/ui/Avatar";
import { EmployeeStatusBadge } from "../../../components/ui/Badge";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import { Pagination } from "../../../components/ui/Pagination";
import { Skeleton } from "../../../components/ui/Skeleton";
import { EmptyState } from "../../../components/ui/EmptyState";
import { useToast } from "../../../context/useToast";
import { formatDate } from "../../../lib/format";
import { DEPARTMENTS, EMPLOYMENT_TYPE_LABELS } from "../types";
import type { Employee, EmployeeListParams, EmployeeStatus } from "../types";
import * as employeesApi from "../api";
import { DeleteEmployeeModal } from "../components/DeleteEmployeeModal";

const PAGE_SIZE = 8;

type SortOption = NonNullable<EmployeeListParams["sort"]>;

const SORT_LABELS: Record<SortOption, string> = {
  name_asc: "Name (A–Z)",
  name_desc: "Name (Z–A)",
  joining_desc: "Newest joined",
  joining_asc: "Oldest joined",
};

export default function EmployeeDirectory() {
  const navigate = useNavigate();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [department, setDepartment] = useState<string>("all");
  const [status, setStatus] = useState<EmployeeStatus | "all">("all");
  const [sort, setSort] = useState<SortOption>("name_asc");
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<{ items: Employee[]; total: number; pageCount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, department, status, sort]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await employeesApi.listEmployees({
        search: debouncedSearch,
        department: department as EmployeeListParams["department"],
        status,
        sort,
        page,
        pageSize: PAGE_SIZE,
      });
      setResult(res);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, department, status, sort, page]);

  useEffect(() => {
    load();
  }, [load]);

  const hasActiveFilters = debouncedSearch !== "" || department !== "all" || status !== "all";

  function clearFilters() {
    setSearch("");
    setDepartment("all");
    setStatus("all");
    setSort("name_asc");
  }

  async function handleDelete(employee: Employee) {
    await employeesApi.deleteEmployee(employee.id);
    toast.success(`${employee.firstName} ${employee.lastName} was removed.`);
    setDeleteTarget(null);
    load();
  }

  return (
    <div>
      <PageHeader
        title="All Employees"
        subtitle="Search and manage your organization's employees."
        action={
          <Button onClick={() => navigate("/team/employees/new")}>
            <Plus className="h-4 w-4" /> Add Employee
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or employee ID…"
            aria-label="Search employees"
            className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-faint outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
        </div>
        <Select
          aria-label="Filter by department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-auto min-w-[160px]"
        >
          <option value="all">All departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value as EmployeeStatus | "all")}
          className="w-auto min-w-[140px]"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="on_leave">On Leave</option>
          <option value="inactive">Inactive</option>
        </Select>
        <Select aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="w-auto min-w-[150px]">
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </div>

      <Card className="overflow-hidden">
        {error ? (
          <div className="p-5">
            <EmptyState
              icon={<AlertCircle className="h-5 w-5" />}
              title="Couldn't load employees"
              description="Something went wrong while fetching the directory."
            />
            <div className="flex justify-center">
              <Button variant="secondary" size="sm" onClick={load}>
                Retry
              </Button>
            </div>
          </div>
        ) : loading ? (
          <div className="divide-y divide-border">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="hidden h-3.5 w-24 sm:block" />
                <Skeleton className="hidden h-5 w-16 rounded-sm md:block" />
              </div>
            ))}
          </div>
        ) : result && result.items.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title={hasActiveFilters ? "No employees match your filters" : "No employees yet"}
              description={
                hasActiveFilters
                  ? "Try adjusting your search or filters."
                  : "Add your first employee to start building the directory."
              }
            />
            {hasActiveFilters && (
              <div className="flex justify-center">
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        ) : (
          result && (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-sunken text-left text-xs font-medium uppercase tracking-wide text-faint">
                      <th className="px-5 py-2.5">Employee</th>
                      <th className="px-4 py-2.5">Employee ID</th>
                      <th className="px-4 py-2.5">Department</th>
                      <th className="px-4 py-2.5">Designation</th>
                      <th className="px-4 py-2.5">Joining Date</th>
                      <th className="px-4 py-2.5">Employment Type</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((employee) => (
                      <tr key={employee.id} className="border-b border-border last:border-0 hover:bg-surface-sunken/60">
                        <td className="px-5 py-3">
                          <button
                            onClick={() => navigate(`/team/employees/${employee.id}`)}
                            className="flex items-center gap-3 text-left"
                          >
                            <Avatar name={`${employee.firstName} ${employee.lastName}`} size="sm" />
                            <span>
                              <span className="block font-medium text-ink">
                                {employee.firstName} {employee.lastName}
                              </span>
                              <span className="block text-xs text-faint">{employee.email}</span>
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-muted">{employee.employeeCode}</td>
                        <td className="px-4 py-3 text-muted">{employee.department}</td>
                        <td className="px-4 py-3 text-muted">{employee.designation}</td>
                        <td className="px-4 py-3 text-muted">{formatDate(employee.joiningDate)}</td>
                        <td className="px-4 py-3 text-muted">{EMPLOYMENT_TYPE_LABELS[employee.employmentType]}</td>
                        <td className="px-4 py-3">
                          <EmployeeStatusBadge status={employee.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu
                            label={`Actions for ${employee.firstName} ${employee.lastName}`}
                            trigger={(triggerProps) => (
                              <button
                                {...triggerProps}
                                aria-label="Row actions"
                                className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-slate-100 hover:text-ink"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            )}
                            items={[
                              { label: "View profile", icon: <Eye className="h-4 w-4" />, onSelect: () => navigate(`/team/employees/${employee.id}`) },
                              { label: "Edit", icon: <Pencil className="h-4 w-4" />, onSelect: () => navigate(`/team/employees/${employee.id}/edit`) },
                              { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onSelect: () => setDeleteTarget(employee), variant: "danger" },
                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="divide-y divide-border md:hidden">
                {result.items.map((employee) => (
                  <div key={employee.id} className="flex items-start gap-3 px-4 py-3.5">
                    <button onClick={() => navigate(`/team/employees/${employee.id}`)} className="flex flex-1 items-start gap-3 text-left">
                      <Avatar name={`${employee.firstName} ${employee.lastName}`} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="truncate text-xs text-faint">{employee.designation} · {employee.department}</p>
                        <div className="mt-1.5">
                          <EmployeeStatusBadge status={employee.status} />
                        </div>
                      </div>
                    </button>
                    <DropdownMenu
                      label={`Actions for ${employee.firstName} ${employee.lastName}`}
                      trigger={(triggerProps) => (
                        <button
                          {...triggerProps}
                          aria-label="Row actions"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted hover:bg-slate-100 hover:text-ink"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      )}
                      items={[
                        { label: "View profile", icon: <Eye className="h-4 w-4" />, onSelect: () => navigate(`/team/employees/${employee.id}`) },
                        { label: "Edit", icon: <Pencil className="h-4 w-4" />, onSelect: () => navigate(`/team/employees/${employee.id}/edit`) },
                        { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onSelect: () => setDeleteTarget(employee), variant: "danger" },
                      ]}
                    />
                  </div>
                ))}
              </div>

              <Pagination page={page} pageCount={result.pageCount} pageSize={PAGE_SIZE} totalItems={result.total} onPageChange={setPage} />
            </>
          )
        )}
      </Card>

      <DeleteEmployeeModal employee={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
