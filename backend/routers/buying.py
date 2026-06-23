from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from services.buying_service import handle_buying_query
from services.user_service import resolve_user

router = APIRouter()


class BuyingRecommendRequest(BaseModel):
    user_id: str
    query: str


class BuyingRecommendResponse(BaseModel):
    research: dict
    recommendation: dict


@router.post("/buying/recommend", response_model=BuyingRecommendResponse)
def recommend(payload: BuyingRecommendRequest, db: Session = Depends(get_db)):
    user = resolve_user(db, payload.user_id)
    result = handle_buying_query(db, user.id, payload.query)
    return BuyingRecommendResponse(**result)
