import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "text-white bg-accent hover:bg-accent-hover shadow-xs",
  secondary: "text-ink bg-surface border border-border hover:bg-slate-50",
  ghost: "text-muted hover:text-ink hover:bg-slate-100",
  danger: "text-white bg-danger hover:bg-red-700 shadow-xs",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-[13px] h-8 px-3 gap-1.5",
  md: "text-sm h-9 px-3.5 gap-2",
  lg: "text-sm h-10 px-4 gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, disabled, className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
