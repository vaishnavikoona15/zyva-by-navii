"use client";

import { useEffect, useRef, useState } from "react";

import ChatMessage from "@/components/ChatMessage";
import InputBar from "@/components/InputBar";
import ProductCard from "@/components/ProductCard";
import TypingIndicator from "@/components/TypingIndicator";
import { useAgentChat } from "@/hooks/useAgentChat";
import { AGENT_TABS } from "@/lib/agents";
import type { BuyingRecommendResponse } from "@/lib/types";

const STARTER = AGENT_TABS.find((t) => t.id === "buying")?.starter ?? "";

export default function BuyingPanel({ userId }: { userId: string | null }) {
  const [input, setInput] = useState(STARTER);
  const { turns, send, loading, error } = useAgentChat<BuyingRecommendResponse>("/buying/recommend", userId, (q) => ({
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
            <p className="text-sm">Tell Zyva what you want to buy and your budget.</p>
            <p className="text-xs">It researches and picks exactly one product for you.</p>
          </div>
        )}
        {turns.map((t, i) =>
          t.role === "user" ? (
            <ChatMessage key={i} role="user" content={t.content} />
          ) : (
            <ChatMessage key={i} role="assistant" agent="buying" wide>
              {t.data && <ProductCard recommendation={t.data.recommendation} />}
            </ChatMessage>
          ),
        )}
        {loading && <TypingIndicator />}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div ref={bottomRef} />
      </div>
      <InputBar value={input} onChange={setInput} onSubmit={handleSubmit} disabled={loading} />
    </>
  );
}
