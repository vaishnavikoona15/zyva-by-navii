import type { DayPlan } from "@/lib/types";

export default function ItineraryDay({ day }: { day: DayPlan }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold text-white">
          Day {day.day} — {day.theme}
        </h4>
        <span className="shrink-0 text-xs text-zinc-500">≈ ₹{Math.round(day.estimated_cost).toLocaleString()}</span>
      </div>
      <div className="space-y-2">
        {day.activities.map((a, i) => (
          <div key={i} className="flex gap-2 text-xs">
            <span className="w-16 shrink-0 text-zinc-500">{a.time}</span>
            <div>
              <p className="text-zinc-200">
                <span className="font-medium">{a.title}</span> — {a.description}
              </p>
              <p className="text-zinc-500">₹{Math.round(a.estimated_cost).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {day.meals.map((m, i) => (
          <span key={i} className="rounded-full border border-white/10 bg-white/3 px-2 py-0.5 text-[11px] text-zinc-400">
            {m}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-zinc-500">💡 {day.local_tip}</p>
    </div>
  );
}
