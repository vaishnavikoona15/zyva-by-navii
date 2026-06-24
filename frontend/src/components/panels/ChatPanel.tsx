"use client";

import { useEffect, useRef, useState } from "react";

import ChatMessage from "@/components/ChatMessage";
import InputBar from "@/components/InputBar";
import TypingIndicator from "@/components/TypingIndicator";
import { useAgentChat } from "@/hooks/useAgentChat";
import type { ChatResponse } from "@/lib/types";

export default function ChatPanel({ userId }: { userId: string | null }) {
  const [input, setInput] = useState("");
  const { turns, send, loading, error } = useAgentChat<ChatResponse>("/chat", userId, (q) => ({
    user_id: userId,
    message: q,
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
            <p className="text-sm">Ask about travel, food, shopping, or anything else.</p>
            <p className="text-xs">Zyva routes it to the right agent automatically.</p>
          </div>
        )}
        {turns.map((t, i) =>
          t.role === "user" ? (
            <ChatMessage key={i} role="user" content={t.content} />
          ) : (
            <ChatMessage key={i} role="assistant" content={String(t.data?.response ?? "")} agent={t.data?.agent as string} />
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
