import type { WebSource } from "@/lib/types";

function getSourceLabel(url: string): string {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");
    if (hostname === "reddit.com") {
      const match = parsed.pathname.match(/^\/r\/([^/]+)/);
      if (match) return `r/${match[1]}`;
    }
    return hostname;
  } catch {
    return url;
  }
}

export default function WebSources({
  sources,
  resultsAnalyzed,
}: {
  sources: WebSource[];
  resultsAnalyzed: number;
}) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
        Based on {resultsAnalyzed} web sources
      </p>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((source, i) => (
          <a
            key={i}
            href={source.link}
            target="_blank"
            rel="noopener noreferrer"
            title={source.title}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/3 px-2 py-1 text-[11px] text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/6 hover:text-white"
          >
            {getSourceLabel(source.link)}
          </a>
        ))}
      </div>
    </div>
  );
}
