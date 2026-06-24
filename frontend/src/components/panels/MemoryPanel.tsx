"use client";

import { useEffect, useState } from "react";

import ConfidenceBar from "@/components/ConfidenceBar";
import TypingIndicator from "@/components/TypingIndicator";
import { getAgentColor } from "@/lib/agents";
import { API_URL, postJSON } from "@/lib/api";
import type { MemoryRecallResponse } from "@/lib/types";

export default function MemoryPanel({ userId, isActive }: { userId: string | null; isActive: boolean }) {
  const [result, setResult] = useState<MemoryRecallResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive || !userId) return;
    let cancelled = false;
    // Standard fetch-on-mount pattern: flip loading/error synchronously before the
    // async call starts, resolve real state in the .then()/.catch() callbacks below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    postJSON<MemoryRecallResponse>("/memory/recall", { user_id: userId, query: "What do you know about me?" })
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch(() => {
        if (!cancelled) setError(`Couldn't reach the Zyva backend at ${API_URL}.`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isActive, userId]);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-6">
      {loading && <TypingIndicator />}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {result && (
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-zinc-200">{result.summary}</p>
          <p className="text-xs text-zinc-500">{result.interaction_count} recent interactions remembered</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(result.preferences_by_agent).map(([agent, prefs]) => {
              const color = getAgentColor(agent);
              const confidence = result.confidence_snapshot[agent] ?? 0;
              return (
                <div key={agent} className="rounded-2xl border border-white/5 bg-white/2 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${color.badge}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
                      {agent}
                    </span>
                    <span className="text-[11px] text-zinc-500">{Math.round(confidence * 100)}% confidence</span>
                  </div>
                  <ConfidenceBar value={confidence} colorClass={color.dot} />
                  <ul className="mt-3 space-y-1.5 text-xs text-zinc-300">
                    {Object.entries(prefs).map(([key, value]) => (
                      <li key={key} className="flex justify-between gap-2">
                        <span className="text-zinc-500">{key.replace(/_/g, " ")}</span>
                        <span className="text-right text-zinc-200">{String(value)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
