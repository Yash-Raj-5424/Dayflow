import { apiClient } from "../lib/apiClient";
import type { LeaveOut, LeaveType } from "../lib/types";

export interface LeaveCreatePayload {
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  remarks?: string;
}

export function createLeave(payload: LeaveCreatePayload) {
  return apiClient.post<LeaveOut>("/leaves", payload).then((r) => r.data);
}

export function myLeaves() {
  return apiClient.get<LeaveOut[]>("/leaves/me").then((r) => r.data);
}

export function allLeaves() {
  return apiClient.get<LeaveOut[]>("/leaves").then((r) => r.data);
}

export function getLeave(leaveId: string) {
  return apiClient.get<LeaveOut>(`/leaves/${leaveId}`).then((r) => r.data);
}

export function approveLeave(leaveId: string, adminComment?: string) {
  return apiClient
    .put<LeaveOut>(`/leaves/${leaveId}/approve`, { admin_comment: adminComment })
    .then((r) => r.data);
}

export function rejectLeave(leaveId: string, adminComment?: string) {
  return apiClient
    .put<LeaveOut>(`/leaves/${leaveId}/reject`, { admin_comment: adminComment })
    .then((r) => r.data);
}
