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
    jwt_token_secret: str = Field(alias='JWT_TOKEN_SECRET')
    access_token_minutes_ttl: int = Field(alias='ACCESS_TOKEN_MINUTES_TTL')
    refresh_token_minutes_ttl: int = Field(alias='REFRESH_TOKEN_MINUTES_TTL')


settings: Settings = Settings()
