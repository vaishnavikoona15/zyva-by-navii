from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from agents.orchestrator import run_orchestrator
from database import get_db
from models import Interaction
from services.user_service import resolve_user

router = APIRouter()


class ChatRequest(BaseModel):
    user_id: str
    message: str


class ChatResponse(BaseModel):
    agent: str
    reasoning: str
    response: str


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    user = resolve_user(db, payload.user_id)
    result = run_orchestrator(payload.message)
    response_text = f"Routing your request to the {result['agent']} agent."

    interaction = Interaction(
        user_id=user.id,
        agent=result["agent"],
        role="user",
        content=payload.message,
    )
    db.add(interaction)
    db.commit()

    return ChatResponse(agent=result["agent"], reasoning=result["reasoning"], response=response_text)
