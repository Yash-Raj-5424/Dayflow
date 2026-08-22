import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil, MoreHorizontal, Trash2, Mail, Phone, MapPin, UserX } from "lucide-react";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { EmployeeStatusBadge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { Tabs } from "../../../components/ui/Tabs";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import { PageSkeleton } from "../../../components/ui/Skeleton";
import { EmptyState } from "../../../components/ui/EmptyState";
import { useToast } from "../../../context/useToast";
import { formatDate, formatDateTime } from "../../../lib/format";
import { EMPLOYMENT_TYPE_LABELS, GENDER_LABELS } from "../types";
import type { Employee } from "../types";
import * as employeesApi from "../api";
import { DeleteEmployeeModal } from "../components/DeleteEmployeeModal";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value || "—"}</dd>
    </div>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h3 className="mb-1 text-[15px] font-semibold text-ink">{title}</h3>
      <dl className="divide-y divide-border">{children}</dl>
    </Card>
  );
}

const TAB_LIST = [
  { key: "overview", label: "Overview" },
  { key: "personal", label: "Personal" },
  { key: "employment", label: "Employment" },
  { key: "activity", label: "Activity" },
];

export default function EmployeeProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [manager, setManager] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState("overview");
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const emp = await employeesApi.getEmployee(id);
      setEmployee(emp);
      if (emp.managerId) {
        try {
          setManager(await employeesApi.getEmployee(emp.managerId));
        } catch {
          setManager(null);
        }
      } else {
        setManager(null);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(target: Employee) {
    await employeesApi.deleteEmployee(target.id);
    toast.success(`${target.firstName} ${target.lastName} was removed.`);
    navigate("/team/employees/all");
  }

  if (loading) {
    return <PageSkeleton />;
  }

  if (notFound || !employee) {
    return (
      <Card className="p-5">
        <EmptyState icon={<UserX className="h-5 w-5" />} title="Employee not found" description="This record may have been removed." />
      </Card>
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar name={fullName} size="lg" />
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">{fullName}</h1>
            <p className="mt-0.5 text-sm text-muted">
              {employee.designation} · {employee.department}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-faint">Employee ID: {employee.employeeCode}</span>
              <EmployeeStatusBadge status={employee.status} />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/team/employees/${employee.id}/edit`)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          <DropdownMenu
            label="More actions"
            trigger={(triggerProps) => (
              <button
                {...triggerProps}
                aria-label="More actions"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted transition-colors hover:bg-slate-50 hover:text-ink"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            )}
            items={[
              { label: "Delete employee", icon: <Trash2 className="h-4 w-4" />, onSelect: () => setDeleteTarget(employee), variant: "danger" },
            ]}
          />
        </div>
      </div>

      <Tabs tabs={TAB_LIST} active={tab} onChange={setTab} />

      <div className="mt-5">
        {tab === "overview" && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <DetailCard title="Contact">
              <div className="flex items-center gap-2.5 py-2.5 text-sm">
                <Mail className="h-3.5 w-3.5 shrink-0 text-faint" />
                <span className="truncate text-ink">{employee.email}</span>
              </div>
              <div className="flex items-center gap-2.5 py-2.5 text-sm">
                <Phone className="h-3.5 w-3.5 shrink-0 text-faint" />
                <span className="text-ink">{employee.phone}</span>
              </div>
              <div className="flex items-start gap-2.5 py-2.5 text-sm">
                <MapPin className="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-faint" />
                <span className="text-ink">
                  {employee.city}, {employee.state}
                </span>
              </div>
            </DetailCard>

            <DetailCard title="Employment">
              <DetailRow label="Department" value={employee.department} />
              <DetailRow label="Designation" value={employee.designation} />
              <DetailRow label="Manager" value={manager ? `${manager.firstName} ${manager.lastName}` : "No manager"} />
              <DetailRow label="Joining date" value={formatDate(employee.joiningDate)} />
              <DetailRow label="Employment type" value={EMPLOYMENT_TYPE_LABELS[employee.employmentType]} />
            </DetailCard>

            <Card className="p-5">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-ink">Activity</h3>
                <button onClick={() => setTab("activity")} className="text-xs font-medium text-accent hover:text-accent-hover">
                  View all
                </button>
              </div>
              <ul className="divide-y divide-border">
                {employee.activity.slice(0, 3).map((entry) => (
                  <li key={entry.id} className="py-2.5">
                    <p className="text-sm text-ink">{entry.text}</p>
                    <p className="mt-0.5 text-xs text-faint">{formatDateTime(entry.timestamp)}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {tab === "personal" && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DetailCard title="Personal details">
              <DetailRow label="Full name" value={fullName} />
              <DetailRow label="Date of birth" value={formatDate(employee.dateOfBirth)} />
              <DetailRow label="Gender" value={GENDER_LABELS[employee.gender]} />
              <DetailRow label="Email" value={employee.email} />
              <DetailRow label="Phone" value={employee.phone} />
            </DetailCard>
            <DetailCard title="Address">
              <DetailRow label="Address" value={employee.address} />
              <DetailRow label="City" value={employee.city} />
              <DetailRow label="State" value={employee.state} />
              <DetailRow label="Postal code" value={employee.postalCode} />
              <DetailRow label="Emergency contact" value={employee.emergencyContact} />
            </DetailCard>
          </div>
        )}

        {tab === "employment" && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DetailCard title="Role">
              <DetailRow label="Employee ID" value={employee.employeeCode} />
              <DetailRow label="Department" value={employee.department} />
              <DetailRow label="Designation" value={employee.designation} />
              <DetailRow label="Manager" value={manager ? `${manager.firstName} ${manager.lastName}` : "No manager"} />
            </DetailCard>
            <DetailCard title="Status">
              <DetailRow label="Joining date" value={formatDate(employee.joiningDate)} />
              <DetailRow label="Employment type" value={EMPLOYMENT_TYPE_LABELS[employee.employmentType]} />
              <DetailRow label="Status" value={employee.status.replace("_", " ")} />
            </DetailCard>
          </div>
        )}

        {tab === "activity" && (
          <Card className="max-w-2xl p-5">
            <ol className="relative ml-1 border-l border-border pl-5">
              {employee.activity.map((entry) => (
                <li key={entry.id} className="pb-5 last:pb-0">
                  <span className="absolute -left-[3.5px] mt-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
                  <p className="text-sm text-ink">{entry.text}</p>
                  <p className="mt-0.5 text-xs text-faint">{formatDateTime(entry.timestamp)}</p>
                </li>
              ))}
            </ol>
          </Card>
        )}
      </div>

      <DeleteEmployeeModal employee={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
