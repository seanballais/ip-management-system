import typing

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: typing.Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    password: str
    is_superuser: bool = Field(default=False)
