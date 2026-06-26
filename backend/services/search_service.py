import os
import time

import httpx
from dotenv import load_dotenv

load_dotenv()

SERPER_URL = "https://google.serper.dev/search"
CACHE_TTL_SECONDS = 3600

_cache: dict[str, tuple[float, dict]] = {}


def _serper_search(query: str) -> list[dict]:
    api_key = os.getenv("SERPER_API_KEY")
    if not api_key:
        return []
    try:
        resp = httpx.post(
            SERPER_URL,
            headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
            json={"q": query},
            timeout=10.0,
        )
        resp.raise_for_status()
        return resp.json().get("organic", [])
    except httpx.HTTPError:
        return []


def _dedupe(results: list[dict]) -> list[dict]:
    seen: set[str] = set()
    deduped = []
    for r in results:
        link = r.get("link")
        if not link or link in seen:
            continue
        seen.add(link)
        deduped.append(r)
    return deduped


def search_product(query: str) -> dict:
    cache_key = query.strip().lower()
    cached = _cache.get(cache_key)
    if cached and (time.time() - cached[0]) < CACHE_TTL_SECONDS:
        return cached[1]

    queries = [
        f"{query} reviews Reddit India site:reddit.com OR site:amazon.in",
        f"best {query} India 2024",
    ]

    raw_results: list[dict] = []
    for q in queries:
        raw_results.extend(_serper_search(q))

    results = _dedupe(raw_results)[:12]

    sources = [
        {"title": r.get("title", ""), "link": r.get("link", ""), "snippet": r.get("snippet", "")}
        for r in results
    ]

    insights = (
        "\n\n".join(f"- {s['title']}\n  {s['snippet']}" for s in sources if s["snippet"])
        or "No relevant web results found."
    )

    result = {"insights": insights, "sources": sources, "results_analyzed": len(sources)}
    _cache[cache_key] = (time.time(), result)
    return result
