from fastapi import APIRouter
from pydantic import BaseModel

from agents.travel_agent import run_travel_agent

router = APIRouter()


class TravelPlanRequest(BaseModel):
    user_id: str
    destination: str
    duration_days: int
    budget: float
    currency: str
    travel_style: str
    interests: list[str]


class TravelPlanResponse(BaseModel):
    budget_breakdown: dict
    itinerary: list[dict]


@router.post("/travel/plan", response_model=TravelPlanResponse)
def plan_trip(payload: TravelPlanRequest):
    result = run_travel_agent(
        destination=payload.destination,
        duration_days=payload.duration_days,
        budget=payload.budget,
        currency=payload.currency,
        travel_style=payload.travel_style,
        interests=payload.interests,
    )
    return TravelPlanResponse(**result)
