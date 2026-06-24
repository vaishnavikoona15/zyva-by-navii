import { Brain, MessageCircle, Plane, ShoppingBag, Sparkles, type LucideIcon } from "lucide-react";

export type AgentId = "chat" | "travel" | "lifestyle" | "buying" | "memory";

export type AgentTab = {
  id: AgentId;
  label: string;
  icon: LucideIcon;
  starter: string;
};

export const AGENT_TABS: AgentTab[] = [
  { id: "chat", label: "Chat", icon: MessageCircle, starter: "" },
  { id: "travel", label: "Travel", icon: Plane, starter: "Plan me a 3 day trip to Goa" },
  { id: "lifestyle", label: "Lifestyle", icon: Sparkles, starter: "What should I eat for dinner tonight?" },
  { id: "buying", label: "Buying", icon: ShoppingBag, starter: "Find me a good air fryer under ₹8000" },
  { id: "memory", label: "Memory", icon: Brain, starter: "What do you remember about my preferences?" },
];

type AgentColor = { badge: string; accent: string; dot: string; glow: string };

const AGENT_COLORS: Record<string, AgentColor> = {
  travel: {
    badge: "bg-blue-500/10 text-blue-300 ring-blue-500/30",
    accent: "border-blue-400",
    dot: "bg-blue-400",
    glow: "rgba(59,130,246,0.55)",
  },
  lifestyle: {
    badge: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
    accent: "border-emerald-400",
    dot: "bg-emerald-400",
    glow: "rgba(16,185,129,0.55)",
  },
  buying: {
    badge: "bg-orange-500/10 text-orange-300 ring-orange-500/30",
    accent: "border-orange-400",
    dot: "bg-orange-400",
    glow: "rgba(249,115,22,0.55)",
  },
  memory: {
    badge: "bg-purple-500/10 text-purple-300 ring-purple-500/30",
    accent: "border-purple-400",
    dot: "bg-purple-400",
    glow: "rgba(168,85,247,0.55)",
  },
};

const DEFAULT_AGENT_COLOR: AgentColor = {
  badge: "bg-zinc-500/10 text-zinc-300 ring-zinc-500/30",
  accent: "border-zinc-400",
  dot: "bg-zinc-400",
  glow: "rgba(129,140,248,0.5)",
};

export function getAgentColor(agent?: string): AgentColor {
  if (!agent) return DEFAULT_AGENT_COLOR;
  return AGENT_COLORS[agent] ?? DEFAULT_AGENT_COLOR;
}
