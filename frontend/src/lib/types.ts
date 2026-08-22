export type UserRole = "employee" | "admin";

export interface UserOut {
  id: string;
  employee_id: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
}

export interface EmployeeProfileOut {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  profile_picture: string | null;
  job_title: string | null;
  department: string | null;
  joining_date: string | null;
  documents: string[];
  created_at: string;
  updated_at: string;
  user: UserOut;
}

export interface EmployeeListItem {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  department: string | null;
  user: UserOut;
}

export type AttendanceStatus = "present" | "absent" | "half_day" | "leave";

export interface AttendanceOut {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus;
}

export type LeaveType = "paid" | "sick" | "unpaid";
export type LeaveStatus = "pending" | "approved" | "rejected";

export interface LeaveOut {
  id: string;
  employee_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  remarks: string | null;
  status: LeaveStatus;
  admin_comment: string | null;
  created_at: string;
}

export interface PayrollOut {
  id: string;
  employee_id: string;
  basic_salary: string;
  allowances: string;
  deductions: string;
  net_salary: string;
  effective_date: string;
  updated_at: string;
}

export interface ApiErrorBody {
  detail?: string | { msg: string }[];
}
