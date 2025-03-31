from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
import jwt

router: APIRouter = APIRouter()


@router.put('/register')
async def register() -> dict:
    return {}
