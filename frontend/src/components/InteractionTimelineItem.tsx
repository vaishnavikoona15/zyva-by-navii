import { getAgentColor } from "@/lib/agents";
import { formatRelativeTime } from "@/lib/time";
import type { RecentInteraction } from "@/lib/types";

export default function InteractionTimelineItem({
  interaction,
  isLast,
}: {
  interaction: RecentInteraction;
  isLast?: boolean;
}) {
  const color = getAgentColor(interaction.agent);
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${color.dot}`} />
        {!isLast && <span className="mt-1 w-px flex-1 bg-white/5" />}
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${color.badge}`}
          >
            {interaction.agent}
          </span>
          <span className="text-[11px] text-zinc-500">{formatRelativeTime(interaction.created_at)}</span>
        </div>
        <p className="mt-1 text-xs text-zinc-300">{interaction.content}</p>
      </div>
    </div>
  );
}
