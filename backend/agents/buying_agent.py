from typing import TypedDict

from langgraph.graph import END, START, StateGraph
from pydantic import BaseModel, Field

from services.llm import get_chat_model


class ResearchResult(BaseModel):
    category: str = Field(description="The product category, e.g. 'air fryer'")
    budget: str = Field(description="The budget constraint extracted from the query, e.g. 'under ₹8000'")
    requirements: list[str] = Field(description="Key requirements extracted from the query")
    market_insights: list[str] = Field(
        description="What a consensus of 500+ verified buyer reviews would say about the top "
        "options in this category and budget"
    )


class RecommendationResult(BaseModel):
    product: str = Field(description="The single specific recommended product, including brand and model")
    price: str = Field(description="Approximate price of the recommended product")
    why_you: str = Field(description="Why this product matches this specific user's preferences and requirements")
    pros: list[str] = Field(description="Pros of this product")
    cons: list[str] = Field(description="Cons of this product")
    verdict: str = Field(description="A short final verdict")


class BuyingState(TypedDict):
    query: str
    preferences_text: str
    research: dict
    recommendation: dict


def research_node(state: BuyingState) -> dict:
    structured = get_chat_model().with_structured_output(ResearchResult)
    prompt = (
        "You are Zyva's buying agent. Analyze this shopping query and extract the product "
        "category, budget, and key requirements. Then summarize what a consensus of 500+ "
        "verified buyer reviews would say about the top options in this category and budget.\n\n"
        f"Query: {state['query']}"
    )
    result = structured.invoke([("human", prompt)])
    return {"research": result.model_dump()}


def recommend_node(state: BuyingState) -> dict:
    structured = get_chat_model().with_structured_output(RecommendationResult)
    prompt = (
        "You are Zyva's buying agent. Recommend exactly ONE specific product for the CURRENT "
        "request below. The research's category and budget are hard constraints — the "
        "recommended product MUST belong to that category and fit within that budget. Treat "
        "the user's longer-term preferences as a soft signal only (e.g. brand affinity to break "
        "ties) — ignore any preference that conflicts with the current category or budget.\n\n"
        f"Current research: {state['research']}\n"
        f"User's longer-term preferences (soft signal only): {state['preferences_text'] or 'None known yet.'}\n\n"
        "Give the product name (with brand and model), price, why it matches this specific "
        "user, pros, cons, and a short verdict."
    )
    result = structured.invoke([("human", prompt)])
    return {"recommendation": result.model_dump()}


graph = StateGraph(BuyingState)
graph.add_node("research_node", research_node)
graph.add_node("recommend_node", recommend_node)
graph.add_edge(START, "research_node")
graph.add_edge("research_node", "recommend_node")
graph.add_edge("recommend_node", END)
buying_graph = graph.compile()


def run_buying_agent(query: str, preferences: list[dict]) -> dict:
    preferences_text = "\n".join(f"- {p['key']}: {p['value']}" for p in preferences)
    result = buying_graph.invoke(
        {"query": query, "preferences_text": preferences_text, "research": {}, "recommendation": {}}
    )
    return {"research": result["research"], "recommendation": result["recommendation"]}
