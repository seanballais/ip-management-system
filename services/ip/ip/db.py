import typing

from sqlmodel import create_engine, Session, SQLModel

from .config import settings

DATABASE_URL: str = f'{settings.db_scheme}://{settings.db_user}:{settings.db_password}@{settings.db_host}:{settings.db_port}/{settings.db_name}'
engine = create_engine(DATABASE_URL)


def get_session() -> typing.Generator[Session, Session, None]:
    with Session(engine) as session:
        yield session


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
