import { apiClient } from "../lib/apiClient";
import type { TokenResponse, UserOut, UserRole } from "../lib/types";

export interface RegisterPayload {
  employee_id: string;
  email: string;
  password: string;
  role: UserRole;
}

export function register(payload: RegisterPayload) {
  return apiClient.post<UserOut>("/auth/register", payload).then((r) => r.data);
}

export function verifyEmail(token: string) {
  return apiClient.post<UserOut>("/auth/verify-email", { token }).then((r) => r.data);
}

export function login(email: string, password: string) {
  return apiClient.post<TokenResponse>("/auth/login", { email, password }).then((r) => r.data);
}

export function me() {
  return apiClient.get<UserOut>("/auth/me").then((r) => r.data);
}
