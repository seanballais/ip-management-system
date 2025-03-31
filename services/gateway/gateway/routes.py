from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
import jwt
import requests
from requests import Response

from .schema import (RegistrationData, LoginData, LogoutData, UsersData,
                     AccessTokenValidationData, TokenRefreshData, AuditData)

router: APIRouter = APIRouter()

AUTH_SERVICE_URL: str = 'http://auth:8080'
IP_SERVICE_URL: str = 'http://ip:8080'


@router.put('/register')
async def register(data: RegistrationData) -> dict:
    url: str = f'{AUTH_SERVICE_URL}/register'

    request_data: dict = {
        'username': data.username,
        'password1': data.password1,
        'password2': data.password2
    }

    resp: Response = requests.put(url, json=request_data)

    return resp.json()


@router.post('/login')
async def login(data: LoginData) -> dict:
    url: str = f'{AUTH_SERVICE_URL}/login'

    request_data: dict = {
        'username': data.username,
        'password': data.password
    }

    resp: Response = requests.post(url, json=request_data)

    return resp.json()


@router.post('/logout')
async def logout(data: LogoutData) -> dict:
    url: str = f'{AUTH_SERVICE_URL}/logout'

    request_data: dict = {
        'access_token': data.access_token,
        'refresh_token': data.refresh_token
    }

    resp: Response = requests.post(url, json=request_data)

    return resp.json()
