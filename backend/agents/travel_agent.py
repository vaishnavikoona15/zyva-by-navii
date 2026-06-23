from typing import TypedDict

from langgraph.graph import END, START, StateGraph
from pydantic import BaseModel, Field

from services.llm import get_chat_model


class BudgetAllocation(BaseModel):
    accommodation: float = Field(description="Amount allocated to accommodation")
    food: float = Field(description="Amount allocated to food")
    transport: float = Field(description="Amount allocated to local transport")
    activities: float = Field(description="Amount allocated to activities/experiences")
    miscellaneous: float = Field(description="Amount allocated to miscellaneous/buffer spending")


class BudgetBreakdown(BaseModel):
    allocation: BudgetAllocation
    tips: list[str] = Field(description="Money-saving tips relevant to this trip")
    warnings: list[str] = Field(description="Budget risks or things that could blow the budget")
    alternatives: list[str] = Field(description="Cheaper alternative choices if the budget is tight")


class Activity(BaseModel):
    time: str = Field(description="Time of day, e.g. 'Morning' or '10:00 AM'")
    title: str = Field(description="Short activity name")
    description: str = Field(description="One or two sentence description")
    estimated_cost: float = Field(description="Estimated cost in the trip's currency")


class DayPlan(BaseModel):
    day: int
    theme: str = Field(description="Short theme for the day")
    meals: list[str] = Field(description="Meal suggestions for the day, e.g. breakfast/lunch/dinner spots")
    activities: list[Activity] = Field(max_length=3, description="At most 3 activities for the day")
    local_tip: str = Field(description="A local tip specific to this day's plan")
    estimated_cost: float = Field(description="Total estimated cost for the day")


class Itinerary(BaseModel):
    days: list[DayPlan]


class TripParams(BaseModel):
    destination: str = Field(description="The travel destination mentioned in the message")
    duration_days: int = Field(
        description="Trip duration in days; estimate a reasonable value (e.g. 3) if not mentioned"
    )
    budget: float = Field(
        description="Total trip budget as a number; estimate a reasonable mid-range budget for "
        "this destination and duration if not mentioned"
    )
    currency: str = Field(
        description="Currency code implied by the message, e.g. 'INR', 'USD'; default to 'USD' if unclear"
    )
    travel_style: str = Field(
        description="Travel style implied by the message, e.g. 'backpacker', 'luxury', 'family'; "
        "default to 'mid-range' if unclear"
    )
    interests: list[str] = Field(description="Interests or activities mentioned or implied by the message")


def extract_trip_params(message: str) -> TripParams:
    structured = get_chat_model().with_structured_output(TripParams)
    prompt = (
        "Extract structured trip-planning parameters from this message. Fill in reasonable "
        "defaults for anything not explicitly mentioned.\n\n"
        f"Message: {message}"
    )
    return structured.invoke([("human", prompt)])


class TravelState(TypedDict):
    destination: str
    duration_days: int
    budget: float
    currency: str
    travel_style: str
    interests: list[str]
    budget_breakdown: dict
    itinerary: list[dict]


def budget_node(state: TravelState) -> dict:
    structured = get_chat_model().with_structured_output(BudgetBreakdown)
    prompt = (
        f"Plan a budget breakdown for a {state['duration_days']}-day trip to {state['destination']}.\n"
        f"Total budget: {state['budget']} {state['currency']}.\n"
        f"Travel style: {state['travel_style']}.\n"
        f"Interests: {', '.join(state['interests'])}.\n\n"
        "Break the total budget down across accommodation, food, transport, activities, and "
        "miscellaneous so the parts sum to roughly the total budget. Give practical money-saving tips, "
        "warnings about overspend risk, and cheaper alternatives if the budget is tight."
    )
    result = structured.invoke([("human", prompt)])
    return {"budget_breakdown": result.model_dump()}


def itinerary_node(state: TravelState) -> dict:
    structured = get_chat_model().with_structured_output(Itinerary)
    prompt = (
        f"Create a day-by-day itinerary for a {state['duration_days']}-day trip to {state['destination']} "
        f"for a {state['travel_style']} traveler interested in {', '.join(state['interests'])}.\n"
        f"Currency: {state['currency']}.\n"
        f"Respect this budget breakdown: {state['budget_breakdown']}.\n\n"
        "For each day, include at most 3 activities, meal suggestions, a local tip, and an estimated "
        "total cost for the day. Keep daily spending consistent with the budget breakdown."
    )
    result = structured.invoke([("human", prompt)])
    return {"itinerary": [day.model_dump() for day in result.days]}


graph = StateGraph(TravelState)
graph.add_node("budget_node", budget_node)
graph.add_node("itinerary_node", itinerary_node)
graph.add_edge(START, "budget_node")
graph.add_edge("budget_node", "itinerary_node")
graph.add_edge("itinerary_node", END)
travel_graph = graph.compile()


def run_travel_agent(
    destination: str,
    duration_days: int,
    budget: float,
    currency: str,
    travel_style: str,
    interests: list[str],
) -> dict:
    result = travel_graph.invoke(
        {
            "destination": destination,
            "duration_days": duration_days,
            "budget": budget,
            "currency": currency,
            "travel_style": travel_style,
            "interests": interests,
            "budget_breakdown": {},
            "itinerary": [],
        }
    )
    return {"budget_breakdown": result["budget_breakdown"], "itinerary": result["itinerary"]}
