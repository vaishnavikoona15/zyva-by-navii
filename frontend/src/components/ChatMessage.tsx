import { getAgentColor } from "@/lib/agents";

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
  agent?: string;
};

export default function ChatMessage({ role, content, agent }: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-gradient-to-br from-blue-600 to-purple-600 px-4 py-2.5 text-sm text-white shadow-lg shadow-blue-500/10">
          {content}
        </div>
      </div>
    );
  }

  const color = getAgentColor(agent);
  return (
    <div className="flex justify-start">
      <div className="max-w-[75%] rounded-2xl rounded-bl-sm border border-white/5 bg-white/3 px-4 py-2.5 text-sm text-zinc-100 shadow-lg shadow-black/20">
        {agent && (
          <span
            className={`mb-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${color.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
            {agent}
          </span>
        )}
        <div>{content}</div>
      </div>
    </div>
  );
}
