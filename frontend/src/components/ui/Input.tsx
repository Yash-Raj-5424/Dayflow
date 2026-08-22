import { forwardRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

const fieldBase =
  "w-full rounded-md border bg-surface px-3 h-9 text-sm text-ink placeholder:text-faint outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15";

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FieldWrapperProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, required, className = "", id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div>
        {label && (
          <label className="mb-1.5 block text-[13px] font-medium text-ink" htmlFor={inputId}>
            {label}
            {required && <span className="text-danger"> *</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">{icon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={`${fieldBase} ${icon ? "pl-9" : ""} ${
              error ? "border-danger focus:border-danger focus:ring-danger/15" : "border-border"
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-xs text-danger">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-faint">
            {hint}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldWrapperProps {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, required, className = "", id, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div>
        {label && (
          <label className="mb-1.5 block text-[13px] font-medium text-ink" htmlFor={selectId}>
            {label}
            {required && <span className="text-danger"> *</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            className={`${fieldBase} appearance-none pr-9 ${
              error ? "border-danger focus:border-danger focus:ring-danger/15" : "border-border"
            } ${className}`}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
        </div>
        {error && (
          <p role="alert" className="mt-1.5 text-xs text-danger">
            {error}
          </p>
        )}
        {hint && !error && <p className="mt-1.5 text-xs text-faint">{hint}</p>}
      </div>
    );
  },
);
Select.displayName = "Select";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldWrapperProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, required, className = "", id, ...props }, ref) => {
    const textareaId = id ?? props.name;
    return (
      <div>
        {label && (
          <label className="mb-1.5 block text-[13px] font-medium text-ink" htmlFor={textareaId}>
            {label}
            {required && <span className="text-danger"> *</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={!!error}
          className={`${fieldBase} h-auto min-h-[80px] py-2 ${
            error ? "border-danger focus:border-danger focus:ring-danger/15" : "border-border"
          } ${className}`}
          {...props}
        />
        {error && (
          <p role="alert" className="mt-1.5 text-xs text-danger">
            {error}
          </p>
        )}
        {hint && !error && <p className="mt-1.5 text-xs text-faint">{hint}</p>}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
