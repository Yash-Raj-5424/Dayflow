import { createContext } from "react";

export type ToastKind = "success" | "error" | "info";

export interface ToastContextValue {
  notify: (kind: ToastKind, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);
