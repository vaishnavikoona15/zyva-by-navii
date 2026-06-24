"use client";

import { useEffect, useState } from "react";

export default function ConfidenceBar({ value, colorClass }: { value: number; colorClass: string }) {
  const target = Math.max(0, Math.min(1, value)) * 100;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className={`h-full rounded-full ${colorClass} transition-[width] duration-700 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
