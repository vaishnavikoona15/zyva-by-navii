import uuid
from typing import TypedDict

from langgraph.graph import END, START, StateGraph
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from services.llm import get_chat_model
from services.preference_service import get_preferences, save_preference


class PreferenceQuestion(BaseModel):
    key: str = Field(description="Short snake_case key for this preference, e.g. 'cuisine_preference'")
    question: str = Field(description="A quick onboarding question to ask the user")
    inferred_answer: str = Field(
        description="A reasonable best-guess default value for this preference, "
        "to be confirmed or corrected by the user later"
    )


class OnboardingResult(BaseModel):
    questions: list[PreferenceQuestion] = Field(min_length=3, max_length=3)
    recommendation: str = Field(
        description="A helpful recommendation for the user's query based on the best-guess "
        "preferences, while inviting the user to confirm or correct the guesses"
    )


class PersonalizedResult(BaseModel):
    recommendation: str = Field(description="A recommendation personalized to the user's known preferences")


class LifestyleState(TypedDict):
    user_id: uuid.UUID
    query: str
    recommendation: str
    preferences_used: list[dict]
    new_preferences_learned: list[dict]


def run_lifestyle_agent(db: Session, user_id: uuid.UUID, query: str) -> dict:
    def respond_node(state: LifestyleState) -> dict:
        existing = get_preferences(db, state["user_id"], "lifestyle")

        if existing:
            preferences_text = "\n".join(f"- {p.key}: {p.value}" for p in existing)
            structured = get_chat_model().with_structured_output(PersonalizedResult)
            prompt = (
                "You are Zyva's lifestyle agent. Use the user's known preferences to answer their "
                "query with a specific, personalized recommendation.\n\n"
                f"Known preferences:\n{preferences_text}\n\n"
                f"User query: {state['query']}"
            )
            result = structured.invoke([("human", prompt)])
            return {
                "recommendation": result.recommendation,
                "preferences_used": [
                    {"key": p.key, "value": p.value, "confidence": p.confidence} for p in existing
                ],
                "new_preferences_learned": [],
            }

        structured = get_chat_model().with_structured_output(OnboardingResult)
        prompt = (
            "You are Zyva's lifestyle agent. This user has no saved lifestyle preferences yet.\n"
            f"User query: {state['query']}\n\n"
            "Come up with exactly 3 short onboarding questions that would help personalize future "
            "lifestyle recommendations, each with a reasonable best-guess default answer. Then give a "
            "helpful recommendation for the current query using those best-guess defaults, while "
            "inviting the user to confirm or correct the guesses."
        )
        result = structured.invoke([("human", prompt)])

        new_preferences = []
        for q in result.questions:
            pref = save_preference(db, state["user_id"], "lifestyle", q.key, q.inferred_answer, confidence=0.3)
            new_preferences.append({"key": pref.key, "value": pref.value, "confidence": pref.confidence})

        questions_text = "\n".join(f"- {q.question}" for q in result.questions)
        recommendation = (
            f"{result.recommendation}\n\nTo personalize this further, quickly confirm or correct:\n{questions_text}"
        )

        return {
            "recommendation": recommendation,
            "preferences_used": [],
            "new_preferences_learned": new_preferences,
        }

    graph = StateGraph(LifestyleState)
    graph.add_node("respond", respond_node)
    graph.add_edge(START, "respond")
    graph.add_edge("respond", END)
    compiled = graph.compile()

    result = compiled.invoke(
        {
            "user_id": user_id,
            "query": query,
            "recommendation": "",
            "preferences_used": [],
            "new_preferences_learned": [],
        }
    )
    return {
        "recommendation": result["recommendation"],
        "preferences_used": result["preferences_used"],
        "new_preferences_learned": result["new_preferences_learned"],
    }
