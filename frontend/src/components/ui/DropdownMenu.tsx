import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export interface DropdownMenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  variant?: "default" | "danger";
}

interface DropdownMenuProps {
  trigger: (props: { onClick: () => void; "aria-expanded": boolean; "aria-haspopup": true }) => ReactNode;
  items: DropdownMenuItem[];
  align?: "start" | "end";
  label: string;
}

export function DropdownMenu({ trigger, items, align = "end", label }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      {trigger({ onClick: () => setOpen((v) => !v), "aria-expanded": open, "aria-haspopup": true })}
      {open && (
        <div
          role="menu"
          aria-label={label}
          className={`absolute z-40 mt-1.5 min-w-[176px] rounded-md border border-border bg-surface py-1 shadow-md ${
            align === "end" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                item.variant === "danger" ? "text-danger hover:bg-danger-subtle" : "text-ink hover:bg-slate-50"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
