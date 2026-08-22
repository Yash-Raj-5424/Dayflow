import { apiClient } from "../lib/apiClient";
import type { EmployeeListItem, EmployeeProfileOut } from "../lib/types";

export interface EmployeeSelfUpdate {
  phone?: string | null;
  address?: string | null;
  profile_picture?: string | null;
}

export interface EmployeeAdminUpdate extends EmployeeSelfUpdate {
  first_name?: string;
  last_name?: string;
  job_title?: string | null;
  department?: string | null;
  joining_date?: string | null;
}

export function getMyProfile() {
  return apiClient.get<EmployeeProfileOut>("/employees/me").then((r) => r.data);
}

export function updateMyProfile(payload: EmployeeSelfUpdate) {
  return apiClient.put<EmployeeProfileOut>("/employees/me", payload).then((r) => r.data);
}

export function listEmployees() {
  return apiClient.get<EmployeeListItem[]>("/employees").then((r) => r.data);
}

export function getEmployee(employeeId: string) {
  return apiClient.get<EmployeeProfileOut>(`/employees/${employeeId}`).then((r) => r.data);
}

export function updateEmployee(employeeId: string, payload: EmployeeAdminUpdate) {
  return apiClient.put<EmployeeProfileOut>(`/employees/${employeeId}`, payload).then((r) => r.data);
}

export function deleteEmployee(employeeId: string) {
  return apiClient.delete(`/employees/${employeeId}`);
}
