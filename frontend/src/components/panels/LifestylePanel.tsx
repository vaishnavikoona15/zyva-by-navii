"use client";

import { useEffect, useRef, useState } from "react";

import ChatMessage from "@/components/ChatMessage";
import InputBar from "@/components/InputBar";
import PreferenceBadge from "@/components/PreferenceBadge";
import TypingIndicator from "@/components/TypingIndicator";
import { useAgentChat } from "@/hooks/useAgentChat";
import { AGENT_TABS } from "@/lib/agents";
import type { LifestyleAskResponse } from "@/lib/types";

const STARTER = AGENT_TABS.find((t) => t.id === "lifestyle")?.starter ?? "";

export default function LifestylePanel({ userId }: { userId: string | null }) {
  const [input, setInput] = useState(STARTER);
  const { turns, send, loading, error } = useAgentChat<LifestyleAskResponse>("/lifestyle/ask", userId, (q) => ({
    user_id: userId,
    query: q,
  }));
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, loading]);

  function handleSubmit() {
    send(input);
    setInput("");
  }

  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-6">
        {turns.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-zinc-500">
            <p className="text-sm">Ask about food, fitness, or your daily routine.</p>
            <p className="text-xs">Zyva learns your preferences as you go.</p>
          </div>
        )}
        {turns.map((t, i) => {
          if (t.role === "user") return <ChatMessage key={i} role="user" content={t.content} />;
          const data = t.data;
          return (
            <ChatMessage key={i} role="assistant" agent="lifestyle" wide>
              <p>{data?.recommendation}</p>
              {!!data?.preferences_used.length && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {data.preferences_used.map((p) => (
                    <PreferenceBadge key={p.key} pref={p} />
                  ))}
                </div>
              )}
              {!!data?.new_preferences_learned.length && (
                <div className="mt-2">
                  <p className="text-[11px] uppercase tracking-wide text-zinc-500">Learned just now</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {data.new_preferences_learned.map((p) => (
                      <PreferenceBadge key={p.key} pref={p} highlight />
                    ))}
                  </div>
                </div>
              )}
            </ChatMessage>
          );
        })}
        {loading && <TypingIndicator />}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div ref={bottomRef} />
      </div>
      <InputBar value={input} onChange={setInput} onSubmit={handleSubmit} disabled={loading} />
    </>
  );
}
