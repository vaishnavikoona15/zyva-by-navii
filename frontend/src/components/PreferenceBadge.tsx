import type { PreferenceItem } from "@/lib/types";

type PreferenceBadgeProps = {
  pref: PreferenceItem;
  highlight?: boolean;
};

export default function PreferenceBadge({ pref, highlight }: PreferenceBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${
        highlight
          ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
          : "border-white/10 bg-white/3 text-zinc-300"
      }`}
    >
      <span className="font-medium">{pref.key.replace(/_/g, " ")}:</span> {String(pref.value)}
    </span>
  );
}
