from datetime import datetime, timedelta, timezone

import jwt
from sqlalchemy import Select
from sqlmodel import select, Session

from .config import settings
from .db import get_session
from .models import BlacklistedToken


SECRET_KEY: str = settings.jwt_token_secret
JWT_ALGORITHM: str = 'HS256'


def create_access_token(data: dict) -> str:
    return _create_auth_jwt_token(data,
                                  'access_token',
                                  settings.access_token_minutes_ttl)


def create_refresh_token(data: dict) -> str:
    return _create_auth_jwt_token(data,
                                  'refresh_token',
                                  settings.refresh_token_minutes_ttl)


def is_token_well_formed(token: str) -> bool:
    # Does not check if the token is still valid, however.
    try:
        # Just here to validate a token.
        jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        # No problem with this one. We won't need to blacklist the access
        # token then.
        pass
    except jwt.InvalidTokenError:
        return False

    return True


def is_access_token_valid(token: str, session: Session | None = None):
    if session is None:
        session = next(get_session())

    try:
        payload: dict = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return False
    except jwt.InvalidTokenError:
        return False

    if 'token_type' not in payload or payload['token_type'] != 'access_token':
        return False

    # Check if the token is not a blacklisted token.
    statement: Select = (
        select(BlacklistedToken).where(BlacklistedToken.token == token)
    )
    token_is_blacklisted: bool = bool(session.exec(statement).first())

    if token_is_blacklisted:
        return False

    return True


def create_jwt_token(data: dict,
                     token_type: str | None = None,
                     expires_delta: timedelta | None = None) -> str:
    # Taken from:
    #   https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/#handle-jwt-tokens
    payload: dict = {
        'data': data
    }

    if token_type:
        payload.update({'token_type': token_type})

    if expires_delta:
        expire: datetime = datetime.now(timezone.utc) + expires_delta
    else:
        expire: datetime = datetime.now(timezone.utc) + timedelta(minutes=15)

    payload.update({'exp': expire})

    encoded_jwt = jwt.encode(payload,
                             settings.jwt_token_secret,
                             algorithm=JWT_ALGORITHM)

    return encoded_jwt


def _create_auth_jwt_token(data: dict, token_type: str, ttl: int) -> str:
    # TTL is in minutes.
    token_data: dict = data.copy()
    expires_delta: timedelta = timedelta(minutes=ttl)

    return create_jwt_token(token_data, token_type, expires_delta)
