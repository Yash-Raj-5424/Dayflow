import { apiClient } from "../lib/apiClient";
import type { AttendanceOut } from "../lib/types";

export function checkIn() {
  return apiClient.post<AttendanceOut>("/attendance/check-in").then((r) => r.data);
}

export function checkOut() {
  return apiClient.post<AttendanceOut>("/attendance/check-out").then((r) => r.data);
}

export function myAttendance() {
  return apiClient.get<AttendanceOut[]>("/attendance/me").then((r) => r.data);
}

export function myWeeklyAttendance() {
  return apiClient.get<AttendanceOut[]>("/attendance/me/weekly").then((r) => r.data);
}

export function allAttendance() {
  return apiClient.get<AttendanceOut[]>("/attendance/all").then((r) => r.data);
}

export function employeeAttendance(employeeId: string) {
  return apiClient.get<AttendanceOut[]>(`/attendance/${employeeId}`).then((r) => r.data);
}
