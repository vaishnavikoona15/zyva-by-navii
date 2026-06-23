import uuid
from collections import defaultdict
from typing import TypedDict

from langgraph.graph import END, START, StateGraph
from sqlalchemy.orm import Session

from models import Interaction
from services.llm import get_chat_model
from services.preference_service import get_all_preferences


class MemoryState(TypedDict):
    query: str
    summary: str
    preferences_by_agent: dict
    interaction_count: int
    confidence_snapshot: dict


def run_memory_agent(db: Session, user_id: uuid.UUID, query: str) -> dict:
    def recall_node(state: MemoryState) -> dict:
        preferences = get_all_preferences(db, user_id)
        interactions = (
            db.query(Interaction)
            .filter_by(user_id=user_id)
            .order_by(Interaction.created_at.desc())
            .limit(10)
            .all()
        )

        preferences_by_agent: dict[str, dict] = defaultdict(dict)
        confidences_by_agent: dict[str, list] = defaultdict(list)
        for p in preferences:
            preferences_by_agent[p.agent][p.key] = p.value
            confidences_by_agent[p.agent].append(p.confidence)

        confidence_snapshot = {
            agent: round(sum(values) / len(values), 2) for agent, values in confidences_by_agent.items()
        }

        if preferences or interactions:
            preferences_text = (
                "\n".join(
                    f"- [{agent}] {key}: {value}"
                    for agent, prefs in preferences_by_agent.items()
                    for key, value in prefs.items()
                )
                or "None yet."
            )
            interactions_text = (
                "\n".join(f"- [{i.agent}] {i.content}" for i in reversed(interactions)) or "None yet."
            )
            prompt = (
                "You are Zyva's memory agent. Synthesize what you know about this user into a "
                "coherent, conversational summary in response to their question.\n\n"
                f"User's question: {state['query']}\n\n"
                f"Known preferences:\n{preferences_text}\n\n"
                f"Recent interactions:\n{interactions_text}"
            )
            summary = get_chat_model().invoke([("human", prompt)]).content
        else:
            summary = (
                "I don't know much about you yet — we haven't had any interactions or saved "
                "preferences. The more you chat with Zyva, the more personalized this gets."
            )

        return {
            "summary": summary,
            "preferences_by_agent": dict(preferences_by_agent),
            "interaction_count": len(interactions),
            "confidence_snapshot": confidence_snapshot,
        }

    graph = StateGraph(MemoryState)
    graph.add_node("recall_node", recall_node)
    graph.add_edge(START, "recall_node")
    graph.add_edge("recall_node", END)
    compiled = graph.compile()

    result = compiled.invoke(
        {
            "query": query,
            "summary": "",
            "preferences_by_agent": {},
            "interaction_count": 0,
            "confidence_snapshot": {},
        }
    )
    return {
        "summary": result["summary"],
        "preferences_by_agent": result["preferences_by_agent"],
        "interaction_count": result["interaction_count"],
        "confidence_snapshot": result["confidence_snapshot"],
    }
