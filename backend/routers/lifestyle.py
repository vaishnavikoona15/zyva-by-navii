from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from agents.lifestyle_agent import run_lifestyle_agent
from database import get_db
from services.user_service import resolve_user

router = APIRouter()


class LifestyleAskRequest(BaseModel):
    user_id: str
    query: str


class LifestyleAskResponse(BaseModel):
    recommendation: str
    preferences_used: list[dict]
    new_preferences_learned: list[dict]


@router.post("/lifestyle/ask", response_model=LifestyleAskResponse)
def ask_lifestyle(payload: LifestyleAskRequest, db: Session = Depends(get_db)):
    user = resolve_user(db, payload.user_id)
    result = run_lifestyle_agent(db, user.id, payload.query)
    return LifestyleAskResponse(**result)
