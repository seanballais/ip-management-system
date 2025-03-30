# Based on: https://testdriven.io/blog/fastapi-docker-traefik/
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    db_scheme: str = Field(alias='DATABASE_SCHEME')
    db_host: str = Field(alias='DATABASE_HOST')
    db_port: int = Field(alias='DATABASE_PORT')
    db_name: str = Field(alias='DATABASE_NAME')
    db_user: str = Field(alias='DATABASE_USER')
    db_password: str = Field(alias='DATABASE_PASSWORD')


settings: Settings = Settings()
