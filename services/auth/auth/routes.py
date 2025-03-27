from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router: APIRouter = APIRouter()


class Registration(BaseModel):
    username: str
    password1: str
    password2: str


@router.put('/register')
async def register(data: Registration):
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

    return {
        'data': {
            'user': {
                'id': 'TBD ID',
                'username': data.username,
                'is_superuser': 'TBD superuser'
            },
            'authorization': {
                'access_token': '<access_token>',
                'refresh_token': '<refresh_token>'
            }
        }
    }
