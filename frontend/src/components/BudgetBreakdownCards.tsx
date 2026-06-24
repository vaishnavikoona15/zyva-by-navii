import type { BudgetBreakdown } from "@/lib/types";

const CATEGORY_LABELS: Record<string, string> = {
  accommodation: "Accommodation",
  food: "Food",
  transport: "Transport",
  activities: "Activities",
  miscellaneous: "Misc",
};

export default function BudgetBreakdownCards({ breakdown }: { breakdown: BudgetBreakdown }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {Object.entries(breakdown.allocation).map(([key, value]) => (
          <div key={key} className="rounded-xl border border-white/5 bg-white/3 px-3 py-2.5 text-center">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">{CATEGORY_LABELS[key] ?? key}</p>
            <p className="mt-1 text-sm font-semibold text-white">₹{Math.round(value).toLocaleString()}</p>
          </div>
        ))}
      </div>
      {(breakdown.tips.length > 0 || breakdown.warnings.length > 0 || breakdown.alternatives.length > 0) && (
        <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
          {breakdown.tips.length > 0 && (
            <div className="rounded-xl border border-white/5 bg-white/2 p-3">
              <p className="mb-1 font-semibold text-emerald-300">Tips</p>
              <ul className="space-y-1 text-zinc-400">
                {breakdown.tips.map((t, i) => (
                  <li key={i}>• {t}</li>
                ))}
              </ul>
            </div>
          )}
          {breakdown.warnings.length > 0 && (
            <div className="rounded-xl border border-white/5 bg-white/2 p-3">
              <p className="mb-1 font-semibold text-amber-300">Watch out</p>
              <ul className="space-y-1 text-zinc-400">
                {breakdown.warnings.map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>
          )}
          {breakdown.alternatives.length > 0 && (
            <div className="rounded-xl border border-white/5 bg-white/2 p-3">
              <p className="mb-1 font-semibold text-blue-300">Alternatives</p>
              <ul className="space-y-1 text-zinc-400">
                {breakdown.alternatives.map((a, i) => (
                  <li key={i}>• {a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
