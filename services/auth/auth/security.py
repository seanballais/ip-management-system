from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from .config import settings


def hash_password(password: str) -> str:
    pass_bytes: bytes = password.encode('utf-8')
    salt: bytes = bcrypt.gensalt()
    hashed_password: bytes = bcrypt.hashpw(pass_bytes, salt)

    return hashed_password.decode('utf-8')


def verify_password(raw_password: str, hashed_password: str) -> bool:
    raw_pass_bytes: bytes = raw_password.encode('utf-8')
    hashed_pass_bytes: bytes = hashed_password.encode('utf-8')

    return bcrypt.checkpw(raw_pass_bytes, hashed_pass_bytes)


def create_access_token(data: dict) -> str:
    ttl: int = settings.access_token_minutes_ttl
    expires_delta: timedelta = timedelta(minutes=ttl)
    return create_jwt_token(data, expires_delta)


def create_refresh_token(data: dict) -> str:
    ttl: int = settings.refresh_token_minutes_ttl
    expires_delta: timedelta = timedelta(minutes=ttl)
    return create_jwt_token(data, expires_delta)


# Taken from: https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/#handle-jwt-tokens
def create_jwt_token(data: dict, expires_delta: timedelta | None = None) -> str:
    encoded_data = data.copy()
    if expires_delta:
        expire: datetime = datetime.now(timezone.utc) + expires_delta
    else:
        expire: datetime = datetime.now(timezone.utc) + timedelta(minutes=15)

    encoded_data.update({'exp': expire})

    encoded_jwt = jwt.encode(encoded_data,
                             settings.jwt_token_secret,
                             algorithm='HS256')

    return encoded_jwt
