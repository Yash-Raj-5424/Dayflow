import type { ReactNode } from "react";

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-faint">
        {icon}
      </div>
      <p className="text-sm font-medium text-muted">{title}</p>
      {description && <p className="max-w-xs text-xs text-faint">{description}</p>}
    </div>
  );
}
