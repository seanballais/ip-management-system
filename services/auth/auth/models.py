import typing

from sqlmodel import Field, SQLModel, Session

from .db import get_session
from .security import hash_password


class User(SQLModel, table=True):
    id: typing.Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    password: str
    is_superuser: bool = Field(default=False)


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


def get_user_dict(user: User) -> dict:
    return {
        'id': user.id,
        'username': user.username,
        'is_superuser': user.is_superuser
    }
