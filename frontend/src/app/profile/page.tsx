"use client";

import { RotateCcw, User } from "lucide-react";
import { useEffect, useState } from "react";

import InteractionTimelineItem from "@/components/InteractionTimelineItem";
import PreferenceCard from "@/components/PreferenceCard";
import Sidebar from "@/components/Sidebar";
import TypingIndicator from "@/components/TypingIndicator";
import { getAgentColor } from "@/lib/agents";
import { API_URL, postJSON } from "@/lib/api";
import type { MemoryRecallResponse } from "@/lib/types";

const SECTIONS = [
  { id: "travel", label: "Travel" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "buying", label: "Buying" },
];

function getUserId(): string {
  const key = "zyva_user_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `guest-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [data, setData] = useState<MemoryRecallResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    // Deferred to an effect (not a lazy useState initializer) so the first client render
    // matches the server-rendered "Loading…" state and avoids a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserId(getUserId());
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    // Standard fetch-on-mount pattern: flip loading/error synchronously before the
    // async call starts, resolve real state in the .then()/.catch() callbacks below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    postJSON<MemoryRecallResponse>("/memory/recall", { user_id: userId, query: "What do you know about me?" })
      .then((res) => {
        if (!cancelled) setData(res);
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
  }, [userId]);

  function handleReset() {
    setResetMessage("Preferences reset (UI only — not yet wired to the backend).");
    setTimeout(() => setResetMessage(null), 3500);
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#080810] text-zinc-100">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]" />

      <Sidebar userId={userId} />

      <main className="relative z-10 flex flex-1 flex-col px-6 py-6 md:px-10">
        <header className="mb-6 flex items-baseline gap-3">
          <h1 className="text-2xl font-bold text-white">Zyva</h1>
          <p className="text-sm text-zinc-500">AI that knows you</p>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/2 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {loading && <TypingIndicator />}
            {error && <p className="text-sm text-red-400">{error}</p>}
            {data && (
              <div className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/2 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{userId}</p>
                      <p className="text-xs text-zinc-500">
                        {data.interaction_count} interactions remembered (last 10)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {resetMessage && <p className="animate-fade-in text-xs text-emerald-300">{resetMessage}</p>}
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/3 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-white/6"
                    >
                      <RotateCcw size={13} /> Reset Preferences
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="mb-3 text-sm font-semibold text-white">Preference graph</h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {SECTIONS.map((section) => {
                      const prefs = data.preferences_by_agent[section.id] ?? {};
                      const confidences = data.preference_confidence?.[section.id] ?? {};
                      const color = getAgentColor(section.id);
                      const entries = Object.entries(prefs);
                      return (
                        <div key={section.id} className="space-y-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${color.badge}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
                            {section.label}
                          </span>
                          {entries.length === 0 ? (
                            <p className="rounded-xl border border-white/5 bg-white/2 p-3 text-xs text-zinc-500">
                              No {section.label.toLowerCase()} preferences learned yet.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {entries.map(([key, value]) => (
                                <PreferenceCard
                                  key={key}
                                  keyName={key}
                                  value={value}
                                  confidence={confidences[key] ?? 0}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h2 className="mb-3 text-sm font-semibold text-white">Interaction history</h2>
                  {data.recent_interactions.length === 0 ? (
                    <p className="text-xs text-zinc-500">No interactions yet.</p>
                  ) : (
                    <div>
                      {data.recent_interactions.map((interaction, i) => (
                        <InteractionTimelineItem
                          key={i}
                          interaction={interaction}
                          isLast={i === data.recent_interactions.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
