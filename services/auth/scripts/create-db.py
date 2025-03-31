from pathlib import Path
import sys

from sqlalchemy import Select
from sqlmodel import select

src_path: Path = Path(__file__).parent.parent
sys.path.append(str(src_path))

from auth import db
from auth.db import get_session
from auth.models import User, UserEvent, UserEventType, BlacklistedToken


def main():
    db.create_db_and_tables()

    # Pre-populate the user event type table.
    user_event_types: list[str] = ['login', 'logout', 'register']
    for event_type in user_event_types:
        with next(get_session()) as session:
            # Check first if the user event types are already in the database.
            statement: Select = (
                select(UserEventType).where(UserEventType.name == event_type)
            )
            event_exists: bool = bool(session.exec(statement).first())
            if not event_exists:
                session.add(UserEventType(name=event_type))

            session.commit()


if __name__ == '__main__':
    main()
