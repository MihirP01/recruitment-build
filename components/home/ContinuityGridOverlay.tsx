export default function ContinuityGridOverlay() {
  return (
    <div
      aria-hidden="true"
      className="home-grid-overlay pointer-events-none fixed inset-0 z-[1]"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgb(var(--grid-line-rgb) / 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--grid-line-rgb) / 0.08) 1px, transparent 1px)",
        backgroundSize: "44px 44px"
      }}
    />
  );
}
