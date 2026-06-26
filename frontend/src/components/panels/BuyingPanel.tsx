"use client";

import { ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import ChatMessage from "@/components/ChatMessage";
import EmptyState from "@/components/EmptyState";
import InputBar from "@/components/InputBar";
import ProductCard from "@/components/ProductCard";
import TypingIndicator from "@/components/TypingIndicator";
import WebSources from "@/components/WebSources";
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
          <EmptyState
            icon={ShoppingBag}
            title="Tell Zyva what you want to buy and your budget."
            subtitle="It researches and picks exactly one product for you."
          />
        )}
        {turns.map((t, i) =>
          t.role === "user" ? (
            <ChatMessage key={i} role="user" content={t.content} />
          ) : (
            <ChatMessage key={i} role="assistant" agent="buying" wide>
              {t.data && (
                <>
                  <ProductCard recommendation={t.data.recommendation} />
                  <WebSources sources={t.data.sources} resultsAnalyzed={t.data.results_analyzed} />
                </>
              )}
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
