import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from agents.lifestyle_agent import run_lifestyle_agent
from agents.memory_agent import run_memory_agent
from agents.orchestrator import run_orchestrator
from agents.travel_agent import extract_trip_params, run_travel_agent
from database import get_db
from models import Interaction
from services.buying_service import handle_buying_query
from services.user_service import resolve_user

router = APIRouter()


class ChatRequest(BaseModel):
    user_id: str
    message: str


class ChatResponse(BaseModel):
    agent: str
    reasoning: str
    response: str
    data: dict


def _handle_travel(message: str) -> tuple[str, dict]:
    params = extract_trip_params(message)
    result = run_travel_agent(
        destination=params.destination,
        duration_days=params.duration_days,
        budget=params.budget,
        currency=params.currency,
        travel_style=params.travel_style,
        interests=params.interests,
    )
    response = (
        f"Here's a {params.duration_days}-day {params.destination} plan, "
        f"budgeted at {params.budget:.0f} {params.currency}."
    )
    return response, result


def _handle_lifestyle(db: Session, user_id: uuid.UUID, message: str) -> tuple[str, dict]:
    result = run_lifestyle_agent(db, user_id, message)
    return result["recommendation"], result


def _handle_buying(db: Session, user_id: uuid.UUID, message: str) -> tuple[str, dict]:
    result = handle_buying_query(db, user_id, message)
    recommendation = result["recommendation"]
    response = f"{recommendation.get('product', '')} — {recommendation.get('verdict', '')}".strip(" —")
    return response, result


def _handle_memory(db: Session, user_id: uuid.UUID, message: str) -> tuple[str, dict]:
    result = run_memory_agent(db, user_id, message)
    return result["summary"], result


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    user = resolve_user(db, payload.user_id)
    classification = run_orchestrator(payload.message)
    agent = classification["agent"]
    reasoning = classification["reasoning"]

    if agent == "travel":
        response, data = _handle_travel(payload.message)
    elif agent == "lifestyle":
        response, data = _handle_lifestyle(db, user.id, payload.message)
    elif agent == "buying":
        response, data = _handle_buying(db, user.id, payload.message)
    elif agent == "memory":
        response, data = _handle_memory(db, user.id, payload.message)
    else:
        response, data = f"Routing your request to the {agent} agent.", {}

    interaction = Interaction(
        user_id=user.id,
        agent=agent,
        role="user",
        content=payload.message,
    )
    db.add(interaction)
    db.commit()

    return ChatResponse(agent=agent, reasoning=reasoning, response=response, data=data)
