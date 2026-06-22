from typing import Literal, TypedDict

from langgraph.graph import END, START, StateGraph
from pydantic import BaseModel, Field

from services.llm import get_chat_model

AgentType = Literal["travel", "lifestyle", "buying", "communication", "memory"]

SYSTEM_PROMPT = """You are the orchestrator for Zyva, a multi-agent personal AI concierge.
Classify the user's message into exactly one of these agents:
- travel: trip planning, flights, hotels, itineraries
- lifestyle: food, fitness, daily routines, entertainment, general recommendations
- buying: shopping, product research, purchases, price comparisons
- communication: drafting messages, emails, replies, scheduling communication
- memory: questions about past preferences, recall, or what the system knows about the user

Respond with the agent name and a short reasoning for the classification."""


class Classification(BaseModel):
    agent: AgentType = Field(description="The single best-fit agent for this message")
    reasoning: str = Field(description="A short explanation for why this agent was chosen")


class OrchestratorState(TypedDict):
    message: str
    agent: str
    reasoning: str


def classify_node(state: OrchestratorState) -> dict:
    classifier = get_chat_model().with_structured_output(Classification)
    result = classifier.invoke(
        [
            ("system", SYSTEM_PROMPT),
            ("human", state["message"]),
        ]
    )
    return {"agent": result.agent, "reasoning": result.reasoning}


graph = StateGraph(OrchestratorState)
graph.add_node("classify", classify_node)
graph.add_edge(START, "classify")
graph.add_edge("classify", END)
orchestrator_graph = graph.compile()


def run_orchestrator(message: str) -> dict:
    result = orchestrator_graph.invoke({"message": message, "agent": "", "reasoning": ""})
    return {"agent": result["agent"], "reasoning": result["reasoning"]}
