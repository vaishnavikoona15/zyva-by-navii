import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
};

export default function EmptyState({ icon: Icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-zinc-500">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-white/2">
        <Icon size={28} className="text-zinc-600" />
      </div>
      <div>
        <p className="text-sm">{title}</p>
        <p className="text-xs">{subtitle}</p>
      </div>
    </div>
  );
}
