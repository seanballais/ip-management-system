from fastapi import APIRouter
from pydantic import BaseModel

router: APIRouter = APIRouter()


class Registration(BaseModel):
    username: str
    password1: str
    password2: str


@router.put('/register')
async def register(data: Registration):
    print(data)
    return {}
