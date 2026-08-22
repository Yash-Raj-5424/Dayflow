import axios, { type AxiosError } from "axios";
import type { ApiErrorBody } from "./types";

const TOKEN_KEY = "dayflow_token";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1",
});

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function apiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiErrorBody>;
  const detail = axiosError.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  if (axiosError.message === "Network Error") {
    return "Can't reach the server. Is the backend running?";
  }
  return "Something went wrong. Please try again.";
}
