import type { EmployeeFormValues } from "./types";

export type FormErrors = Partial<Record<keyof EmployeeFormValues, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s-]{7,16}$/;
const POSTAL_RE = /^\d{4,10}$/;

function isValidDate(value: string): boolean {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

export function validateEmployeeForm(values: EmployeeFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.firstName.trim()) errors.firstName = "First name is required.";
  if (!values.lastName.trim()) errors.lastName = "Last name is required.";

  if (!values.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(values.email)) errors.email = "Enter a valid email address.";

  if (!values.phone.trim()) errors.phone = "Phone number is required.";
  else if (!PHONE_RE.test(values.phone)) errors.phone = "Enter a valid phone number.";

  if (!values.dateOfBirth) errors.dateOfBirth = "Date of birth is required.";
  else if (!isValidDate(values.dateOfBirth)) errors.dateOfBirth = "Enter a valid date.";
  else {
    const age = (Date.now() - new Date(values.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (age < 16) errors.dateOfBirth = "Employee must be at least 16 years old.";
  }

  if (!values.gender) errors.gender = "Select a gender.";

  if (!values.employeeCode.trim()) errors.employeeCode = "Employee ID is required.";
  if (!values.department) errors.department = "Select a department.";
  if (!values.designation.trim()) errors.designation = "Designation is required.";

  if (!values.joiningDate) errors.joiningDate = "Date of joining is required.";
  else if (!isValidDate(values.joiningDate)) errors.joiningDate = "Enter a valid date.";

  if (!values.address.trim()) errors.address = "Address is required.";
  if (!values.city.trim()) errors.city = "City is required.";
  if (!values.state.trim()) errors.state = "State is required.";

  if (!values.postalCode.trim()) errors.postalCode = "Postal code is required.";
  else if (!POSTAL_RE.test(values.postalCode.trim())) errors.postalCode = "Enter a valid postal code.";

  if (!values.emergencyContact.trim()) errors.emergencyContact = "Emergency contact is required.";
  else if (!PHONE_RE.test(values.emergencyContact)) errors.emergencyContact = "Enter a valid phone number.";

  return errors;
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}
