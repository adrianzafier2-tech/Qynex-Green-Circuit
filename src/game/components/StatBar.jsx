import React, { useEffect, useState } from "react";

export default function StatBar({ label, value, icon, color = "#FF9B33", max = 100, animate = true }) {
  const [display, setDisplay] = useState(animate ? 0 : value);
  const target = Math.max(0, Math.min(max, value));

  useEffect(() => {
    if (!animate) { setDisplay(target); return; }
    let raf;
    const start = display;
    const startT = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - startT) / 600);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(start + (target - start) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line
  }, [target]);

  const pct = (display / max) * 100;
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono text-xs sm:text-sm font-bold text-white flex items-center gap-1">
          <span>{icon}</span> {label}
        </span>
        <span className="font-mono text-sm font-bold" style={{ color }}>{Math.round(display)}</span>
      </div>
      <div className="h-4 sm:h-5 bg-black/50 border-2 border-white/30 rounded-sm overflow-hidden relative">
        <div className="h-full relative" style={{ width: `${pct}%`, background: color }}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
        <div className="absolute inset-0 flex">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex-1 border-r border-black/30 last:border-0" />
          ))}
        </div>
      </div>
    </div>
  );
}