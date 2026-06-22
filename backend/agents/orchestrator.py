import os
from typing import Literal, TypedDict

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from pydantic import BaseModel, Field

load_dotenv()

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


_classifier = None


def _get_classifier():
    global _classifier
    if _classifier is None:
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, api_key=os.getenv("OPENAI_API_KEY"))
        _classifier = llm.with_structured_output(Classification)
    return _classifier


def classify_node(state: OrchestratorState) -> dict:
    result = _get_classifier().invoke(
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
