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
  primary:
    "text-white bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 bg-[length:180%_100%] bg-left hover:bg-right shadow-[0_0_24px_-6px_rgba(139,92,246,0.6)] transition-[background-position,box-shadow] duration-500",
  secondary:
    "text-ink glass hover:border-border-strong hover:bg-white/[0.06]",
  ghost: "text-muted hover:text-ink hover:bg-white/[0.05]",
  danger: "text-white bg-rose-500/90 hover:bg-rose-500 shadow-[0_0_20px_-8px_rgba(251,113,133,0.8)]",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-base px-6 py-3.5 gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, disabled, className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
