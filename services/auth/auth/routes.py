from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from .db import get_session
from .models import User, create_user


router: APIRouter = APIRouter()


class Registration(BaseModel):
    username: str
    password1: str
    password2: str


@router.put('/register')
async def register(data: Registration, session: Session=Depends(get_session)):
    if data.password1 != data.password2:
        raise HTTPException(
            status_code=422,
            detail={
                'errors': [
                    {
                        'code': 'mismatched_passwords'
                    }
                ]
            }
        )

    try:
        user: User = create_user(data.username, data.password1, False, session)
    except IntegrityError:
        raise HTTPException(
            status_code=409,
            detail={
                'errors': [
                    {
                        'code': 'unavailable_username'
                    }
                ]
            }
        )

    return {
        'data': {
            'user': {
                'id': user.id,
                'username': user.username,
                'is_superuser': user.is_superuser
            },
            'authorization': {
                'access_token': '<access_token>',
                'refresh_token': '<refresh_token>'
            }
        }
    }
