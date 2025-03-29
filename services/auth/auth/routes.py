from enum import Enum
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
import jwt
from sqlalchemy import Select
from sqlalchemy.engine import TupleResult
from sqlalchemy.exc import IntegrityError
from sqlalchemy.sql.elements import BinaryExpression
from sqlmodel import Session, select, or_

from . import models
from .db import get_session
from .models import create_user, get_user_dict
from .schema import (
    AccessTokenValidationData, AuditData, LoginData,
    LogoutData, TokenRefreshData, RegistrationData, UsersData
)
from .security import is_password_correct
from .tokens import (
    create_access_token,
    create_refresh_token,
    is_token_well_formed,
    validate_access_token,
    validate_refresh_token,
    InvalidAccessTokenError,
    InvalidRefreshTokenError
)


class RouteErrorCode(Enum):
    MISMATCHED_PASSWORDS = 'mismatched_passwords'
    UNAVAILABLE_USERNAME = 'unavailable_username'
    WRONG_CREDENTIALS = 'wrong_credentials'
    INVALID_ACCESS_TOKEN = 'invalid_access_token'
    INVALID_REFRESH_TOKEN = 'invalid_refresh_token'


class UserEventType(Enum):
    LOGIN = 'login'
    LOGOUT = 'logout'


router: APIRouter = APIRouter()


@router.put('/register')
async def register(data: RegistrationData,
                   session: Session = Depends(get_session)) -> dict:
    if data.password1 != data.password2:
        raise _get_error_details_exception(422,
                                           RouteErrorCode.MISMATCHED_PASSWORDS)

    try:
        user: models.User = create_user(data.username, data.password1, False,
                                        session)
    except IntegrityError:
        raise _get_error_details_exception(409,
                                           RouteErrorCode.UNAVAILABLE_USERNAME)

    # Create access and refresh tokens.
    user_data: dict = get_user_dict(user)
    user_tokens: dict = _get_user_tokens(user_data)

    return {
        'data': {
            'user': user_data,
            'authorization': user_tokens
        }
    }


@router.post('/login')
async def login(data: LoginData,
                session: Session = Depends(get_session)) -> dict:
    statement: Select = select(models.User).where(
        models.User.username == data.username)
    user: models.User = session.exec(statement).first()

    if user is None:
        raise _get_error_details_exception(404,
                                           RouteErrorCode.WRONG_CREDENTIALS)

    if is_password_correct(data.password, user.password):
        user_data: dict = get_user_dict(user)
        user_tokens: dict = _get_user_tokens(user_data)

        # Log it!
        _log_user_event(user, UserEventType.LOGIN, session)

        return {
            'data': {
                'user': user_data,
                'authorization': user_tokens
            }
        }
    else:
        raise _get_error_details_exception(404,
                                           RouteErrorCode.WRONG_CREDENTIALS)


@router.post('/logout')
async def logout(data: LogoutData,
                 session: Session = Depends(get_session)) -> dict:
    if is_token_well_formed(data.access_token):
        blacklist_access_token: bool = True
    else:
        raise _get_error_details_exception(401,
                                           RouteErrorCode.INVALID_ACCESS_TOKEN)

    if is_token_well_formed(data.refresh_token):
        blacklist_refresh_token: bool = True
    else:
        raise _get_error_details_exception(401,
                                           RouteErrorCode.INVALID_REFRESH_TOKEN)

    if blacklist_access_token:
        session.add(models.BlacklistedToken(token=data.access_token))

    if blacklist_refresh_token:
        session.add(models.BlacklistedToken(token=data.refresh_token))

    try:
        session.commit()
    except IntegrityError:
        # All good. We're not adding them to the blacklist since they're
        # already in it.
        session.rollback()

    # Log this!
    token_payload: dict = jwt.decode(data.access_token,
                                     options={'verify_signature': False})
    payload_data: dict = token_payload['data']
    user_id: int = payload_data['id']

    statement: Select = select(models.User).where(models.User.id == user_id)
    user: models.User = session.exec(statement).first()
    if user:
        _log_user_event(user, UserEventType.LOGOUT, session)

    return {
        'data': {
            'success': True
        }
    }


@router.get('/users')
async def users(data: UsersData,
                user_id: Annotated[list[int] | None, Query(alias='id')] = None,
                session: Session = Depends(get_session)) -> dict:
    try:
        validate_access_token(data.access_token, session)
    except InvalidAccessTokenError:
        raise _get_error_details_exception(401,
                                           RouteErrorCode.INVALID_ACCESS_TOKEN)

    or_expressions: list[BinaryExpression] = list(
        map(lambda id_: models.User.id == id_, user_id)
    )
    statement: Select = (
        select(models.User).where(or_(*or_expressions)).order_by(
            models.User.id)
    )
    results: TupleResult[models.User] = session.exec(statement)
    user_dicts: list[dict] = []
    for user in results:
        user_dicts.append(get_user_dict(user))

    return {
        'data': {
            'users': user_dicts
        }
    }


@router.post('/token/access/validate')
async def access_token_validate(data: AccessTokenValidationData,
                                session: Session = Depends(
                                    get_session)) -> dict:
    try:
        payload: dict = validate_access_token(data.access_token, session)
    except InvalidAccessTokenError:
        raise _get_error_details_exception(401,
                                           RouteErrorCode.INVALID_ACCESS_TOKEN)

    # A valid token will have a 'data' key in its payload.
    return {
        'data': payload['data']
    }


@router.get('/token/refresh')
async def token_refresh(data: TokenRefreshData,
                        session: Session = Depends(get_session)) -> dict:
    try:
        payload: dict = validate_refresh_token(data.refresh_token, session)
    except InvalidRefreshTokenError:
        raise _get_error_details_exception(401,
                                           RouteErrorCode.INVALID_REFRESH_TOKEN)

    tokens: dict = _get_user_tokens(payload['data'])

    # Let's blacklist the refresh token first.
    session.add(models.BlacklistedToken(token=data.refresh_token))

    try:
        session.commit()
    except IntegrityError:
        # All good. We're not adding the refresh token to the blacklist since
        # it's already blacklisted.
        session.rollback()

    return {
        'data': tokens
    }


@router.get('/audit-log')
async def audit(items_per_page: Annotated[int, Query()],
                page_number: Annotated[int, Query()],
                data: AuditData,
                session: Session = Depends(get_session)) -> dict:
    return {}


def _log_user_event(user: models.User, event_type: UserEventType,
                    session: Session = None):
    if session is None:
        session = next(get_session())

    statement: Select = select(models.UserEventType).where(
        models.UserEventType.name == event_type.value
    )
    user_event_type: models.UserEventType = session.exec(statement).first()
    if user_event_type:
        # We can do audit logging!
        user_event: models.UserEvent = models.UserEvent(user_id=user.id,
                                                        user_event_type_id=user_event_type.id)
        session.add(user_event)
        session.commit()
    else:
        # TODO: Update this to using a logging package.
        print('User event types are missing in the database. '
              'Please run the create-db.py to generate them.')


def _get_user_tokens(user_data: dict) -> dict:
    access_token: str = create_access_token(user_data)
    refresh_token: str = create_refresh_token(user_data)

    return {
        'access_token': access_token,
        'refresh_token': refresh_token
    }


def _get_error_details_exception(status_code: int,
                                 error_code: RouteErrorCode) -> HTTPException:
    return HTTPException(
        status_code=status_code,
        detail={
            'errors': [
                {
                    'code': error_code.value
                }
            ]
        }
    )
