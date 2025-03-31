from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response
import jwt
import requests

from .schema import (RegistrationData, LoginData, LogoutData, UsersData,
                     AccessTokenValidationData, TokenRefreshData, AuditData,
                     AddNewIPAddressData, UpdateIPAddressData,
                     DeleteIPAddressData)

router: APIRouter = APIRouter()

AUTH_SERVICE_URL: str = 'http://auth:8080'
IP_SERVICE_URL: str = 'http://ip:8080'


@router.put('/register')
async def register(data: RegistrationData, response: Response) -> dict:
    url: str = f'{AUTH_SERVICE_URL}/register'

    request_data: dict = {
        'username': data.username,
        'password1': data.password1,
        'password2': data.password2
    }

    resp: requests.Response = requests.put(url, json=request_data)
    response.status_code = resp.status_code

    return resp.json()


@router.post('/login')
async def login(data: LoginData, response: Response) -> dict:
    url: str = f'{AUTH_SERVICE_URL}/login'

    request_data: dict = {
        'username': data.username,
        'password': data.password
    }

    resp: requests.Response = requests.post(url, json=request_data)
    response.status_code = resp.status_code

    return resp.json()


@router.post('/logout')
async def logout(data: LogoutData, response: Response) -> dict:
    url: str = f'{AUTH_SERVICE_URL}/logout'

    request_data: dict = {
        'access_token': data.access_token,
        'refresh_token': data.refresh_token
    }

    resp: requests.Response = requests.post(url, json=request_data)
    response.status_code = resp.status_code

    return resp.json()


@router.get('/users')
async def users(data: UsersData,
                user_ids: Annotated[
                    list[int] | None, Query(alias='id')] = None,
                response: Response) -> dict:
    url: str = f'{AUTH_SERVICE_URL}/users'

    request_data: dict = {
        'access_token': data.access_token
    }
    query_params: dict = {}
    if user_ids:
        query_params['id'] = user_ids

    resp: requests.Response = requests.get(url, json=request_data,
                                           params=query_params)
    response.status_code = resp.status_code

    return resp.json()


@router.post('/token/access/validate')
async def access_token_validate(data: AccessTokenValidationData,
                                response: Response) -> dict:
    url: str = f'{AUTH_SERVICE_URL}/token/access/validate'

    request_data: dict = {
        'access_token': data.access_token
    }

    resp: requests.Response = requests.post(url, json=request_data)
    response.status_code = resp.status_code

    return resp.json()


@router.get('/token/refresh')
async def token_refresh(data: TokenRefreshData, response: Response) -> dict:
    url: str = f'{AUTH_SERVICE_URL}/token/refresh'

    request_data: dict = {
        'refresh_token': data.refresh_token
    }

    resp: requests.Response = requests.get(url, json=request_data)
    response.status_code = resp.status_code

    return resp.json()


@router.post('/ips')
async def new_ip_address(data: AddNewIPAddressData,
                         response: Response) -> dict:
    # Authenticate the access token first.
    auth_url: str = f'{AUTH_SERVICE_URL}/token/access/validate'

    auth_request_data: dict = {
        'access_token': data.access_token
    }

    auth_resp: Response = requests.post(auth_url, json=auth_request_data)
    user_data: Optional[dict] = None
    auth_resp_json: dict = auth_resp.json()
    if 200 <= auth_resp.status_code <= 299:
        user_data = auth_resp_json['data']
    else:
        raise HTTPException(auth_resp.status_code,
                            detail=auth_resp_json['detail'])

    #

    return auth_resp.json()
