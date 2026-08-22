import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Card } from "../../../components/ui/Card";
import { PageSkeleton } from "../../../components/ui/Skeleton";
import { EmptyState } from "../../../components/ui/EmptyState";
import { UserX } from "lucide-react";
import { useToast } from "../../../context/useToast";
import { EmployeeForm } from "../components/EmployeeForm";
import * as employeesApi from "../api";
import { formatDateTime } from "../../../lib/format";
import type { Employee, EmployeeFormValues } from "../types";

function toFormValues(employee: Employee): EmployeeFormValues {
  return {
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phone: employee.phone,
    dateOfBirth: employee.dateOfBirth,
    gender: employee.gender,
    employeeCode: employee.employeeCode,
    department: employee.department,
    designation: employee.designation,
    joiningDate: employee.joiningDate,
    employmentType: employee.employmentType,
    managerId: employee.managerId,
    status: employee.status,
    address: employee.address,
    city: employee.city,
    state: employee.state,
    postalCode: employee.postalCode,
    emergencyContact: employee.emergencyContact,
  };
}

export default function EditEmployee() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([employeesApi.getEmployee(id), employeesApi.listManagers()])
      .then(([emp, mgrs]) => {
        setEmployee(emp);
        setManagers(mgrs);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(values: EmployeeFormValues) {
    if (!id) return;
    const updated = await employeesApi.updateEmployee(id, values);
    toast.success("Changes saved.");
    navigate(`/team/employees/${updated.id}`);
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Edit Employee" />
        <PageSkeleton />
      </div>
    );
  }

  if (notFound || !employee) {
    return (
      <div>
        <PageHeader title="Edit Employee" />
        <Card className="p-5">
          <EmptyState icon={<UserX className="h-5 w-5" />} title="Employee not found" description="This record may have been removed." />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Employee"
        subtitle={`Last updated ${formatDateTime(employee.updatedAt)}`}
      />
      <Card className="max-w-3xl p-6">
        <EmployeeForm
          initialValues={toFormValues(employee)}
          managers={managers}
          currentEmployeeId={employee.id}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/team/employees/${employee.id}`)}
          submitLabel="Save Changes"
        />
      </Card>
    </div>
  );
}
