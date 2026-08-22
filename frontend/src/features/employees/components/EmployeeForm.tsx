import { useState } from "react";
import type { FormEvent } from "react";
import { Camera } from "lucide-react";
import { Input, Select, Textarea } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Avatar } from "../../../components/ui/Avatar";
import { useToast } from "../../../context/useToast";
import { DEPARTMENTS, EMPLOYMENT_TYPE_LABELS, GENDER_LABELS } from "../types";
import type { Employee, EmployeeFormValues } from "../types";
import { validateEmployeeForm, hasErrors } from "../validation";
import type { FormErrors } from "../validation";
import { DuplicateEmployeeCodeError } from "../api";

interface EmployeeFormProps {
  initialValues: EmployeeFormValues;
  managers: Employee[];
  onSubmit: (values: EmployeeFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  currentEmployeeId?: string;
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      <p className="mt-0.5 text-sm text-muted">{description}</p>
    </div>
  );
}

export function EmployeeForm({ initialValues, managers, onSubmit, onCancel, submitLabel, currentEmployeeId }: EmployeeFormProps) {
  const toast = useToast();
  const [values, setValues] = useState<EmployeeFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof EmployeeFormValues>(key: K, value: EmployeeFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextErrors = validateEmployeeForm(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      const firstField = Object.keys(nextErrors)[0];
      document.getElementById(firstField)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      if (err instanceof DuplicateEmployeeCodeError) {
        setErrors((prev) => ({ ...prev, employeeCode: err.message }));
        document.getElementById("employeeCode")?.focus();
      } else {
        setFormError("Something went wrong while saving. Please try again.");
      }
      setSubmitting(false);
    }
  }

  const eligibleManagers = managers.filter((m) => m.id !== currentEmployeeId);

  return (
    <form onSubmit={handleSubmit} noValidate>
      {formError && (
        <div role="alert" className="mb-5 rounded-md border border-danger-border bg-danger-subtle px-3.5 py-2.5 text-sm text-danger">
          {formError}
        </div>
      )}

      <section>
        <SectionHeading title="Personal Information" description="Basic identity and contact details." />
        <div className="mb-5 flex items-center gap-4">
          <Avatar name={`${values.firstName} ${values.lastName}`.trim() || "New Employee"} size="lg" />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => toast.info("Photo upload isn't available in this demo.")}
          >
            <Camera className="h-3.5 w-3.5" /> Upload photo
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="firstName"
            label="First name"
            required
            value={values.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            error={errors.firstName}
          />
          <Input
            id="lastName"
            label="Last name"
            required
            value={values.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            error={errors.lastName}
          />
          <Input
            id="email"
            type="email"
            label="Email"
            required
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            error={errors.email}
          />
          <Input
            id="phone"
            type="tel"
            label="Phone"
            required
            placeholder="+91 90000 00000"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            error={errors.phone}
          />
          <Input
            id="dateOfBirth"
            type="date"
            label="Date of birth"
            required
            value={values.dateOfBirth}
            onChange={(e) => set("dateOfBirth", e.target.value)}
            error={errors.dateOfBirth}
          />
          <Select
            id="gender"
            label="Gender"
            required
            value={values.gender}
            onChange={(e) => set("gender", e.target.value as EmployeeFormValues["gender"])}
            error={errors.gender}
          >
            {Object.entries(GENDER_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <SectionHeading title="Employment Details" description="Role, reporting line, and employment status." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="employeeCode"
            label="Employee ID"
            required
            placeholder="EMP035"
            value={values.employeeCode}
            onChange={(e) => set("employeeCode", e.target.value)}
            error={errors.employeeCode}
          />
          <Select
            id="department"
            label="Department"
            required
            value={values.department}
            onChange={(e) => set("department", e.target.value as EmployeeFormValues["department"])}
            error={errors.department}
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
          <Input
            id="designation"
            label="Designation"
            required
            placeholder="e.g. Backend Developer"
            value={values.designation}
            onChange={(e) => set("designation", e.target.value)}
            error={errors.designation}
          />
          <Input
            id="joiningDate"
            type="date"
            label="Date of joining"
            required
            value={values.joiningDate}
            onChange={(e) => set("joiningDate", e.target.value)}
            error={errors.joiningDate}
          />
          <Select
            id="employmentType"
            label="Employment type"
            required
            value={values.employmentType}
            onChange={(e) => set("employmentType", e.target.value as EmployeeFormValues["employmentType"])}
          >
            {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            id="managerId"
            label="Manager"
            value={values.managerId ?? ""}
            onChange={(e) => set("managerId", e.target.value || null)}
            hint="Optional"
          >
            <option value="">No manager</option>
            {eligibleManagers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName} · {m.designation}
              </option>
            ))}
          </Select>
          <Select
            id="status"
            label="Employee status"
            required
            value={values.status}
            onChange={(e) => set("status", e.target.value as EmployeeFormValues["status"])}
          >
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <SectionHeading title="Contact Information" description="Address and emergency contact on file." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Textarea
              id="address"
              label="Address"
              required
              rows={2}
              value={values.address}
              onChange={(e) => set("address", e.target.value)}
              error={errors.address}
            />
          </div>
          <Input
            id="city"
            label="City"
            required
            value={values.city}
            onChange={(e) => set("city", e.target.value)}
            error={errors.city}
          />
          <Input
            id="state"
            label="State"
            required
            value={values.state}
            onChange={(e) => set("state", e.target.value)}
            error={errors.state}
          />
          <Input
            id="postalCode"
            label="Postal code"
            required
            value={values.postalCode}
            onChange={(e) => set("postalCode", e.target.value)}
            error={errors.postalCode}
          />
          <Input
            id="emergencyContact"
            type="tel"
            label="Emergency contact"
            required
            placeholder="+91 90000 00000"
            value={values.emergencyContact}
            onChange={(e) => set("emergencyContact", e.target.value)}
            error={errors.emergencyContact}
          />
        </div>
      </section>

      <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
