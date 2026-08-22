import type { EmployeeStatus } from "../../components/ui/Badge";

export type { EmployeeStatus };

export type EmploymentType = "full_time" | "part_time" | "contract" | "intern";
export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export const DEPARTMENTS = ["Engineering", "Product", "Design", "Human Resources", "Finance", "Sales"] as const;
export type Department = (typeof DEPARTMENTS)[number];

export interface ActivityEntry {
  id: string;
  text: string;
  timestamp: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;

  department: Department;
  designation: string;
  joiningDate: string;
  employmentType: EmploymentType;
  managerId: string | null;
  status: EmployeeStatus;

  address: string;
  city: string;
  state: string;
  postalCode: string;
  emergencyContact: string;

  createdAt: string;
  updatedAt: string;
  activity: ActivityEntry[];
}

export interface EmployeeListParams {
  search?: string;
  department?: Department | "all";
  status?: EmployeeStatus | "all";
  sort?: "name_asc" | "name_desc" | "joining_desc" | "joining_asc";
  page?: number;
  pageSize?: number;
}

export interface EmployeeListResult {
  items: Employee[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface EmployeeFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;

  employeeCode: string;
  department: Department | "";
  designation: string;
  joiningDate: string;
  employmentType: EmploymentType;
  managerId: string | null;
  status: EmployeeStatus;

  address: string;
  city: string;
  state: string;
  postalCode: string;
  emergencyContact: string;
}

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  intern: "Intern",
};

export const GENDER_LABELS: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
};
