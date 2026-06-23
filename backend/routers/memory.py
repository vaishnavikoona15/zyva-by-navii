from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from agents.memory_agent import run_memory_agent
from database import get_db
from services.user_service import resolve_user

router = APIRouter()


class MemoryRecallRequest(BaseModel):
    user_id: str
    query: str


class MemoryRecallResponse(BaseModel):
    summary: str
    preferences_by_agent: dict
    interaction_count: int
    confidence_snapshot: dict


@router.post("/memory/recall", response_model=MemoryRecallResponse)
def recall(payload: MemoryRecallRequest, db: Session = Depends(get_db)):
    user = resolve_user(db, payload.user_id)
    result = run_memory_agent(db, user.id, payload.query)
    return MemoryRecallResponse(**result)
