import type { BuyingRecommendation } from "@/lib/types";

export default function ProductCard({ recommendation }: { recommendation: BuyingRecommendation }) {
  return (
    <div className="space-y-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/3 p-3 shadow-[0_0_24px_-8px_rgba(16,185,129,0.45)]">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">{recommendation.product}</h3>
        <span className="shrink-0 rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-300 ring-1 ring-orange-500/30">
          {recommendation.price}
        </span>
      </div>
      <p className="text-xs text-zinc-400">{recommendation.why_you}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-400">Pros</p>
          <ul className="space-y-1 text-xs text-zinc-300">
            {recommendation.pros.map((p, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-emerald-400">+</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-red-400">Cons</p>
          <ul className="space-y-1 text-xs text-zinc-300">
            {recommendation.cons.map((c, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-red-400">−</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="rounded-xl border border-white/5 bg-white/2 px-3 py-2 text-xs text-zinc-300">
        <span className="font-semibold text-white">Verdict: </span>
        {recommendation.verdict}
      </p>
    </div>
  );
}
