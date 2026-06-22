import uuid

from sqlalchemy.orm import Session

from models import User

# Lets external callers use arbitrary string user_ids (e.g. "test-user-1")
# while users.id stays a UUID, by deterministically deriving the UUID from the string.
ZYVA_USER_NAMESPACE = uuid.UUID("a14e0b3a-9c3a-4f0a-8a9e-9a6f6e6a6b6c")


def resolve_user(db: Session, external_id: str) -> User:
    user_id = uuid.uuid5(ZYVA_USER_NAMESPACE, external_id)
    user = db.get(User, user_id)
    if user is None:
        user = User(id=user_id, email=f"{external_id}@placeholder.zyva")
        db.add(user)
        db.commit()
    return user
