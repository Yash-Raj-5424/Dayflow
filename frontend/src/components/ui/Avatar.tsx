const PALETTE = ["#2563eb", "#0891b2", "#7c3aed", "#c2410c", "#0d9488", "#4338ca"];

function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

const sizeClasses = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-xs",
  lg: "h-16 w-16 text-lg",
};

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: keyof typeof sizeClasses;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-medium text-white ${sizeClasses[size]}`}
      style={{ backgroundColor: colorFor(name || "?") }}
      aria-hidden="true"
    >
      {initials || "?"}
    </div>
  );
}
