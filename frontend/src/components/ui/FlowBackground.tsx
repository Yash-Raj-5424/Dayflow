export function FlowBackground({ variant = "full" }: { variant?: "full" | "subtle" }) {
  const blobOpacity = variant === "full" ? 1 : 0.75;
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-base">
      <div
        className="absolute -left-40 -top-40 h-[520px] w-[520px] animate-float-slow rounded-full blur-[110px]"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.35), transparent 70%)", opacity: blobOpacity }}
      />
      <div
        className="absolute -right-32 top-10 h-[480px] w-[480px] animate-float-slower rounded-full blur-[110px]"
        style={{ background: "radial-gradient(circle, rgba(236,72,153,0.28), transparent 70%)", opacity: blobOpacity }}
      />
      <div
        className="absolute bottom-[-200px] left-1/3 h-[560px] w-[560px] animate-float-slow rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.22), transparent 70%)", opacity: blobOpacity }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
