# Based on: https://testdriven.io/blog/fastapi-docker-traefik/
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings


BASE_URL: Path = Path(__file__).parent.parent


class Settings(BaseSettings):
    db_name: str = Field(alias='DATABASE_NAME')
    db_user: str = Field(alias='DATABASE_USER')
    db_password: str = Field(alias='DATABASE_PASSWORD')

settings: Settings = Settings()
