import uuid
from typing import Any

from sqlalchemy.orm import Session

from models import UserPreference


def save_preference(
    db: Session, user_id: uuid.UUID, agent: str, key: str, value: Any, confidence: float = 1.0
) -> UserPreference:
    pref = (
        db.query(UserPreference)
        .filter_by(user_id=user_id, agent=agent, key=key)
        .first()
    )
    if pref:
        pref.value = value
        pref.confidence = confidence
    else:
        pref = UserPreference(user_id=user_id, agent=agent, key=key, value=value, confidence=confidence)
        db.add(pref)
    db.commit()
    db.refresh(pref)
    return pref


def get_preferences(db: Session, user_id: uuid.UUID, agent: str) -> list[UserPreference]:
    return db.query(UserPreference).filter_by(user_id=user_id, agent=agent).all()
