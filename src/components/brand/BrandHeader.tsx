export function BrandHeader({
  variant = "hero",
}: {
  variant?: "hero" | "compact";
}) {
  return (
    <div className={variant === "hero" ? "text-center space-y-3" : "space-y-1"}>
      <div className="flex items-center justify-center gap-3">
        <span className="text-4xl font-extrabold tracking-tight">
          <span className="text-blue-400">Admin</span>{" "}
          <span className="text-amber-400">ESA</span>
        </span>
        <span className="text-sm text-gray-400">
          <span className="text-white/80">Carai Agency</span>{" "}
          <span className="text-white/40">|</span>{" "}
          <span className="text-white/60">Caribbean AI Agency</span>
        </span>
      </div>

      {variant === "hero" && (
        <>
          <p className="text-lg text-white/70">
            Where Caribbean spirit meets intelligent design.
          </p>
        </>
      )}
    </div>
  );
}
