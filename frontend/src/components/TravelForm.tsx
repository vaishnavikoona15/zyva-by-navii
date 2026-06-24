"use client";

import { Send } from "lucide-react";

export type TravelFormValues = {
  destination: string;
  durationDays: string;
  budget: string;
  travelStyle: string;
  interests: string[];
};

const TRAVEL_STYLES = ["backpacker", "budget", "mid-range", "luxury"];
const INTERESTS = ["food", "nightlife", "beach", "culture", "nature", "shopping", "photography"];

type TravelFormProps = {
  values: TravelFormValues;
  onChange: (values: TravelFormValues) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export default function TravelForm({ values, onChange, onSubmit, disabled }: TravelFormProps) {
  function toggleInterest(interest: string) {
    const set = new Set(values.interests);
    if (set.has(interest)) {
      set.delete(interest);
    } else {
      set.add(interest);
    }
    onChange({ ...values, interests: Array.from(set) });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-3 border-t border-white/5 px-5 py-4"
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <input
          value={values.destination}
          onChange={(e) => onChange({ ...values, destination: e.target.value })}
          placeholder="Destination"
          className="col-span-2 rounded-full border border-white/10 bg-white/3 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white/20 sm:col-span-1"
        />
        <input
          type="number"
          min={1}
          value={values.durationDays}
          onChange={(e) => onChange({ ...values, durationDays: e.target.value })}
          placeholder="Days"
          className="rounded-full border border-white/10 bg-white/3 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white/20"
        />
        <input
          type="number"
          min={0}
          value={values.budget}
          onChange={(e) => onChange({ ...values, budget: e.target.value })}
          placeholder="Budget (₹)"
          className="rounded-full border border-white/10 bg-white/3 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white/20"
        />
        <select
          value={values.travelStyle}
          onChange={(e) => onChange({ ...values, travelStyle: e.target.value })}
          className="rounded-full border border-white/10 bg-white/3 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-white/20"
        >
          {TRAVEL_STYLES.map((style) => (
            <option key={style} value={style} className="bg-[#0c0c16] text-zinc-100">
              {style}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {INTERESTS.map((interest) => {
          const active = values.interests.includes(interest);
          return (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                active
                  ? "border-transparent bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md shadow-blue-500/30"
                  : "border-white/10 bg-white/2 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
              }`}
            >
              {interest}
            </button>
          );
        })}
        <button
          type="submit"
          disabled={disabled || !values.destination.trim() || !values.budget}
          className="ml-auto flex items-center gap-1.5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-1.5 text-xs font-medium text-white shadow-lg shadow-purple-500/20 transition-transform disabled:opacity-40 enabled:hover:scale-105"
        >
          <Send size={13} /> Plan trip
        </button>
      </div>
    </form>
  );
}
