"use client";

import { Send } from "lucide-react";

type InputBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export default function InputBar({ value, onChange, onSubmit, disabled }: InputBarProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex items-center gap-3 border-t border-white/5 px-5 py-4"
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ask Zyva anything…"
        className="flex-1 rounded-full border border-white/10 bg-white/3 px-4 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white/20"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/20 transition-transform disabled:opacity-40 enabled:hover:scale-105"
      >
        <Send size={16} />
      </button>
    </form>
  );
}
