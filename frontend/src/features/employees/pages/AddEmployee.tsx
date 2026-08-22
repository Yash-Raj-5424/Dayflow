import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Card } from "../../../components/ui/Card";
import { useToast } from "../../../context/useToast";
import { EmployeeForm } from "../components/EmployeeForm";
import * as employeesApi from "../api";
import type { Employee, EmployeeFormValues } from "../types";

const EMPTY_VALUES: EmployeeFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "prefer_not_to_say",
  employeeCode: "",
  department: "",
  designation: "",
  joiningDate: new Date().toISOString().slice(0, 10),
  employmentType: "full_time",
  managerId: null,
  status: "active",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  emergencyContact: "",
};

export default function AddEmployee() {
  const navigate = useNavigate();
  const toast = useToast();
  const [managers, setManagers] = useState<Employee[]>([]);

  useEffect(() => {
    employeesApi.listManagers().then(setManagers);
  }, []);

  async function handleSubmit(values: EmployeeFormValues) {
    const created = await employeesApi.createEmployee(values);
    toast.success(`${created.firstName} ${created.lastName} was added to the directory.`);
    navigate(`/team/employees/${created.id}`);
  }

  return (
    <div>
      <PageHeader title="Add New Employee" subtitle="Add a new member to your organization." />
      <Card className="max-w-3xl p-6">
        <EmployeeForm
          initialValues={EMPTY_VALUES}
          managers={managers}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitLabel="Create Employee"
        />
      </Card>
    </div>
  );
}
