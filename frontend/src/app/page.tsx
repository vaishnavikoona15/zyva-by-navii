"use client";

import { useEffect, useRef, useState } from "react";

import ChatMessage from "@/components/ChatMessage";
import InputBar from "@/components/InputBar";
import Sidebar from "@/components/Sidebar";
import TypingIndicator from "@/components/TypingIndicator";
import { AGENT_TABS, type AgentId } from "@/lib/agents";

type Message = { role: "user" | "assistant"; content: string; agent?: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getUserId(): string {
  const key = "zyva_user_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `guest-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AgentId>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserId(getUserId());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleSelectTab(id: AgentId) {
    setActiveTab(id);
    const tab = AGENT_TABS.find((t) => t.id === id);
    if (tab) setInput(tab.starter);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || !userId || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, message: text }),
      });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response, agent: data.agent }]);
    } catch {
      setError(`Couldn't reach the Zyva backend at ${API_URL}.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#080810] text-zinc-100">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]" />

      <Sidebar activeTab={activeTab} onSelectTab={handleSelectTab} userId={userId} />

      <main className="relative z-10 flex flex-1 flex-col px-6 py-6 md:px-10">
        <header className="mb-6 flex items-baseline gap-3">
          <h1 className="text-2xl font-bold text-white">Zyva</h1>
          <p className="text-sm text-zinc-500">AI that knows you</p>
        </header>

        <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/2 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-6">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-zinc-500">
                <p className="text-sm">Ask about travel, food, shopping, or anything else.</p>
                <p className="text-xs">Zyva routes it to the right agent automatically.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <ChatMessage key={i} role={m.role} content={m.content} agent={m.agent} />
            ))}
            {loading && <TypingIndicator />}
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div ref={bottomRef} />
          </div>

          <InputBar value={input} onChange={setInput} onSubmit={sendMessage} disabled={loading} />
        </div>
      </main>
    </div>
  );
}
