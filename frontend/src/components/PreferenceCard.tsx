"use client";

import { useEffect, useState } from "react";

import { getConfidenceColor } from "@/lib/confidence";

type PreferenceCardProps = {
  keyName: string;
  value: unknown;
  confidence: number;
};

export default function PreferenceCard({ keyName, value, confidence }: PreferenceCardProps) {
  const target = Math.max(0, Math.min(1, confidence)) * 100;
  const [width, setWidth] = useState(0);
  const color = getConfidenceColor(confidence);

  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  return (
    <div className="rounded-xl border border-white/5 bg-white/2 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-zinc-200 capitalize">{keyName.replace(/_/g, " ")}</span>
        <span className={`text-[11px] font-medium ${color.text}`}>{Math.round(target)}%</span>
      </div>
      <p className="mt-1 text-sm text-white">{String(value)}</p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${color.bar} transition-[width] duration-700 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
