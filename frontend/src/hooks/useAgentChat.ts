"use client";

import { useState } from "react";

import { postJSON } from "@/lib/api";

export type AgentTurn<T> = { role: "user" | "assistant"; content: string; data?: T };

export function useAgentChat<T>(
  endpoint: string,
  userId: string | null,
  buildBody: (query: string) => Record<string, unknown>,
) {
  const [turns, setTurns] = useState<AgentTurn<T>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(query: string, displayText?: string) {
    const text = query.trim();
    if (!text || !userId || loading) return;

    setTurns((prev) => [...prev, { role: "user", content: displayText ?? text }]);
    setLoading(true);
    setError(null);

    try {
      const data = await postJSON<T>(endpoint, buildBody(text));
      setTurns((prev) => [...prev, { role: "assistant", content: "", data }]);
    } catch {
      setError("Couldn't reach the Zyva backend.");
    } finally {
      setLoading(false);
    }
  }

  return { turns, send, loading, error };
}
