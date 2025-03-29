from datetime import datetime, timezone
import typing

from sqlmodel import Field, SQLModel, Session, Relationship

from .db import get_session
from .security import hash_password


class User(SQLModel, table=True):
    id: typing.Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    password: str
    is_superuser: bool = Field(default=False)

    user_events: list['UserEvent'] = Relationship(back_populates='user')


class UserEventType(SQLModel, table=True):
    id: typing.Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)

    user_events: list['UserEvent'] = Relationship(
        back_populates='user_event_type')


class UserEvent(SQLModel, table=True):
    id: typing.Optional[int] = Field(default=None, primary_key=True)
    recorded_on: datetime = Field(default=datetime.now(timezone.utc),
                                  nullable=False)

    user_id: int | None = Field(default=None, foreign_key='user.id')
    user_event_type_id: int | None = Field(default=None,
                                           foreign_key='usereventtype.id')

    user: User | None = Relationship(back_populates='user_events')
    user_event_type: UserEventType | None = Relationship(
        back_populates='user_events')


class BlacklistedToken(SQLModel, table=True):
    id: typing.Optional[int] = Field(default=None, primary_key=True)
    token: str = Field(index=True, unique=True)


def create_user(username: str,
                raw_password: str,
                is_superuser: bool,
                session: Session | None = None) -> User:
    if session is None:
        session: Session = next(get_session())

    hashed_password: str = hash_password(raw_password)
    user: User = User(username=username,
                      password=hashed_password,
                      is_superuser=is_superuser)
    session.add(user)
    session.commit()

    return user
