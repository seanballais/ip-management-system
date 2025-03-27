import typing

from sqlmodel import Field, SQLModel, Session

from .db import get_session
from .security import hash_password


class User(SQLModel, table=True):
    id: typing.Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    password: str
    is_superuser: bool = Field(default=False)


def create_user(username: str,
                raw_password: str,
                is_superuser: bool,
                session: Session = next(get_session())) -> User:
    hashed_password: str = hash_password(raw_password)
    user: User = User(username=username,
                      password=hashed_password,
                      is_superuser=is_superuser)
    session.add(user)
    session.commit()

    return user
