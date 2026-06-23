"use client";

import { User } from "lucide-react";
import { AGENT_TABS, type AgentId, getAgentColor } from "@/lib/agents";

type SidebarProps = {
  activeTab: AgentId;
  onSelectTab: (id: AgentId) => void;
  userId: string | null;
};

export default function Sidebar({ activeTab, onSelectTab, userId }: SidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 bg-white/2 px-4 py-6 md:flex">
      <div className="flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white shadow-lg shadow-purple-500/20">
          Z
        </div>
        <span className="text-lg font-semibold text-white">Zyva</span>
      </div>

      <nav className="mt-10 flex flex-1 flex-col gap-1">
        {AGENT_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.id === activeTab;
          const color = getAgentColor(tab.id === "chat" ? undefined : tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                active ? "bg-white/6 text-white" : "text-zinc-400 hover:bg-white/3 hover:text-zinc-200"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                  active ? `${color.accent} ${color.badge}` : "border-white/10 bg-white/2"
                }`}
              >
                <Icon size={15} />
              </span>
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/2 px-3 py-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
          <User size={16} />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="truncate text-xs font-medium text-zinc-300">{userId ?? "Loading…"}</span>
          <span className="text-[11px] text-zinc-500">Free plan</span>
        </div>
      </div>
    </aside>
  );
}
