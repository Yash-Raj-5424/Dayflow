import { forwardRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FieldWrapperProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = "", id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <label className="block" htmlFor={inputId}>
        {label && <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-xl border bg-white/[0.03] px-4 py-2.5 text-sm text-ink placeholder:text-faint outline-none transition-colors focus:border-violet-400/60 focus:bg-white/[0.05] ${
              icon ? "pl-10" : ""
            } ${error ? "border-rose-400/60" : "border-border"} ${className}`}
            {...props}
          />
        </div>
        {error && <span className="mt-1.5 block text-xs text-rose-400">{error}</span>}
        {hint && !error && <span className="mt-1.5 block text-xs text-faint">{hint}</span>}
      </label>
    );
  },
);
Input.displayName = "Input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldWrapperProps {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className = "", id, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <label className="block" htmlFor={selectId}>
        {label && <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>}
        <select
          ref={ref}
          id={selectId}
          className={`w-full appearance-none rounded-xl border bg-white/[0.03] px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-violet-400/60 focus:bg-white/[0.05] ${
            error ? "border-rose-400/60" : "border-border"
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <span className="mt-1.5 block text-xs text-rose-400">{error}</span>}
        {hint && !error && <span className="mt-1.5 block text-xs text-faint">{hint}</span>}
      </label>
    );
  },
);
Select.displayName = "Select";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldWrapperProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const textareaId = id ?? props.name;
    return (
      <label className="block" htmlFor={textareaId}>
        {label && <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>}
        <textarea
          ref={ref}
          id={textareaId}
          className={`w-full rounded-xl border bg-white/[0.03] px-4 py-2.5 text-sm text-ink placeholder:text-faint outline-none transition-colors focus:border-violet-400/60 focus:bg-white/[0.05] ${
            error ? "border-rose-400/60" : "border-border"
          } ${className}`}
          {...props}
        />
        {error && <span className="mt-1.5 block text-xs text-rose-400">{error}</span>}
        {hint && !error && <span className="mt-1.5 block text-xs text-faint">{hint}</span>}
      </label>
    );
  },
);
Textarea.displayName = "Textarea";
