import { apiClient } from "../lib/apiClient";
import type { PayrollOut } from "../lib/types";

export interface PayrollUpdatePayload {
  basic_salary: number;
  allowances?: number;
  deductions?: number;
  effective_date: string;
}

export function myPayroll() {
  return apiClient.get<PayrollOut>("/payroll/me").then((r) => r.data);
}

export function allPayroll() {
  return apiClient.get<PayrollOut[]>("/payroll").then((r) => r.data);
}

export function employeePayroll(employeeId: string) {
  return apiClient.get<PayrollOut>(`/payroll/${employeeId}`).then((r) => r.data);
}

export function updatePayroll(employeeId: string, payload: PayrollUpdatePayload) {
  return apiClient.put<PayrollOut>(`/payroll/${employeeId}`, payload).then((r) => r.data);
}
