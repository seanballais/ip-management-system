from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from .db import get_session
from .models import User, create_user, get_user_dict
from .security import (
    create_access_token,
    create_refresh_token,
    is_password_correct
)

router: APIRouter = APIRouter()


class RegistrationData(BaseModel):
    username: str
    password1: str
    password2: str


class LoginData(BaseModel):
    username: str
    password: str


@router.put('/register')
async def register(data: RegistrationData, session: Session=Depends(get_session)):
    if data.password1 != data.password2:
        raise _get_error_details_exception(422, 'mismatched_passwords')

    try:
        user: User = create_user(data.username, data.password1, False, session)
    except IntegrityError:
        raise _get_error_details_exception(409, 'unavailable_username')

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
async def login(data: LoginData, session: Session = Depends(get_session)):
    statement = select(User).where(User.username == data.username)
    user = session.exec(statement).first()

    if user is None:
        raise _get_error_details_exception(404, 'wrong_credentials')

    if is_password_correct(data.password, user.password):
        user_data: dict = get_user_dict(user)
        user_tokens: dict = _get_user_tokens(user_data)

        return {
            'data': {
                'user': user_data,
                'authorization': user_tokens
            }
        }
    else:
        raise _get_error_details_exception(404, 'wrong_credentials')


def _get_user_tokens(user_data: dict) -> dict:
    access_token: str = create_access_token(user_data)
    refresh_token: str = create_refresh_token(user_data)

    return {
        'access_token': access_token,
        'refresh_token': refresh_token
    }


def _get_error_details_exception(status_code: int, error_code: str) -> HTTPException:
    return HTTPException(
        status_code=status_code,
        detail={
            'errors': [
                {
                    'code': error_code
                }
            ]
        }
    )
