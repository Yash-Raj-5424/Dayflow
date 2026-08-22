export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="logo-g" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8B5CF6" />
          <stop offset="0.55" stopColor="#EC4899" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" />
      <path
        d="M16 6a10 10 0 1 1 -7.07 17.07"
        stroke="url(#logo-g)"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="16" cy="6" r="2.1" fill="#22D3EE" />
    </svg>
  );
}

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="font-display text-lg font-semibold tracking-tight text-ink">
        Dayflow
      </span>
    </div>
  );
}
