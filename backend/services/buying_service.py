import uuid

from sqlalchemy.orm import Session

from agents.buying_agent import run_buying_agent
from services.preference_service import get_preferences, save_preference


def handle_buying_query(db: Session, user_id: uuid.UUID, query: str) -> dict:
    existing = get_preferences(db, user_id, "buying")
    preferences = [{"key": p.key, "value": p.value, "confidence": p.confidence} for p in existing]

    result = run_buying_agent(query, preferences)
    research = result["research"]
    recommendation = result["recommendation"]

    if research.get("budget"):
        save_preference(db, user_id, "buying", "budget_range", research["budget"], confidence=0.8)
    if research.get("category"):
        save_preference(db, user_id, "buying", "category_interest", research["category"], confidence=0.7)
    product = recommendation.get("product")
    if product:
        save_preference(db, user_id, "buying", "preferred_brand", product.split(" ")[0], confidence=0.4)

    return {"research": research, "recommendation": recommendation}
