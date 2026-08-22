import type { ReactNode, MouseEventHandler } from "react";

interface CardProps {
  className?: string;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function Card({ className = "", children, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-border bg-surface ${className}`}
    >
      {children}
    </div>
  );
}
