import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from agents.orchestrator import run_orchestrator
from database import get_db
from models import Interaction, User

router = APIRouter()

# Lets external callers use arbitrary string user_ids (e.g. "test-user-1")
# while users.id stays a UUID, by deterministically deriving the UUID from the string.
ZYVA_USER_NAMESPACE = uuid.UUID("a14e0b3a-9c3a-4f0a-8a9e-9a6f6e6a6b6c")


class ChatRequest(BaseModel):
    user_id: str
    message: str


class ChatResponse(BaseModel):
    agent: str
    reasoning: str
    response: str


def _resolve_user(db: Session, external_id: str) -> User:
    user_id = uuid.uuid5(ZYVA_USER_NAMESPACE, external_id)
    user = db.get(User, user_id)
    if user is None:
        user = User(id=user_id, email=f"{external_id}@placeholder.zyva")
        db.add(user)
        db.commit()
    return user


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    user = _resolve_user(db, payload.user_id)
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
