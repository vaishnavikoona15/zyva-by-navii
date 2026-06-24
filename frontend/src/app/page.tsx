"use client";

import { useEffect, useState } from "react";

import BuyingPanel from "@/components/panels/BuyingPanel";
import ChatPanel from "@/components/panels/ChatPanel";
import LifestylePanel from "@/components/panels/LifestylePanel";
import MemoryPanel from "@/components/panels/MemoryPanel";
import TravelPanel from "@/components/panels/TravelPanel";
import Sidebar from "@/components/Sidebar";
import { type AgentId } from "@/lib/agents";

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

  useEffect(() => {
    // Deferred to an effect (not a lazy useState initializer) so the first client render
    // matches the server-rendered "Loading…" state and avoids a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserId(getUserId());
  }, []);

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#080810] text-zinc-100">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]" />

      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} userId={userId} />

      <main className="relative z-10 flex flex-1 flex-col px-6 py-6 md:px-10">
        <header className="mb-6 flex items-baseline gap-3">
          <h1 className="text-2xl font-bold text-white">Zyva</h1>
          <p className="text-sm text-zinc-500">AI that knows you</p>
        </header>

        <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/2 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className={activeTab === "chat" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
            <ChatPanel userId={userId} />
          </div>
          <div className={activeTab === "travel" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
            <TravelPanel userId={userId} />
          </div>
          <div className={activeTab === "lifestyle" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
            <LifestylePanel userId={userId} />
          </div>
          <div className={activeTab === "buying" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
            <BuyingPanel userId={userId} />
          </div>
          <div className={activeTab === "memory" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
            <MemoryPanel userId={userId} isActive={activeTab === "memory"} />
          </div>
        </div>
      </main>
    </div>
  );
}
