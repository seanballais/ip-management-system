from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


from .security import hash_password, verify_password

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

    hashed_password: str = hash_password(data.password1)
    is_password_correct: bool = verify_password(data.password1, hashed_password)

    print('Raw Password:', data.password1)
    print('Hashed Password:', hashed_password)
    print('Is password correct?', is_password_correct)

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
