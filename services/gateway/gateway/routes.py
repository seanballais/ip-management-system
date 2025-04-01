from enum import Enum
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response
import jwt
import requests

from .schema import (RegistrationData, LoginData, LogoutData, UsersData,
                     AccessTokenValidationData, TokenRefreshData, AuditData,
                     AddNewIPAddressData, UpdateIPAddressData,
                     DeleteIPAddressData)


class RouteErrorCode(Enum):
    NONEXISTENT_IP_ADDRESS: str = 'nonexistent_ip_address'
    FORBIDDEN_ACTION: str = 'forbidden_action'


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
                response: Response,
                user_ids: Annotated[
                    list[int] | None, Query(alias='id')] = None) -> dict:
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
    try:
        user_data: dict = _authenticate_access_token(data.access_token)
    except HTTPException:
        raise

    # Attempt to add a new IP address.
    ip_url: str = f'{IP_SERVICE_URL}/ips'

    ip_request_data: dict = {
        'ip_address': data.ip_address,
        'label': data.label,
        'comment': data.comment,
        'recorder_id': user_data['id']
    }

    ip_resp: requests.Response = requests.post(ip_url, json=ip_request_data)
    response.status_code = ip_resp.status_code

    return ip_resp.json()


@router.patch('/ips/{ip_address_id}')
async def update_ip_address(ip_address_id: int, data: UpdateIPAddressData,
                            response: Response) -> dict:
    # Authenticate the access token first.
    try:
        user_data: dict = _authenticate_access_token(data.access_token)
    except HTTPException:
        raise

    # Check if the user can edit the IP address.
    try:
        _check_action_validity(ip_address_id, user_data['id'],
                               user_data['is_superuser'])
    except HTTPException:
        raise

    # And then attempt to update the IP address.
    ip_url: str = f'{IP_SERVICE_URL}/ips/{ip_address_id}'

    ip_request_data: dict = {
        'ip_address': data.ip_address,
        'label': data.label,
        'comment': data.comment,
        'updater_id': user_data['id']
    }

    ip_resp: requests.Response = requests.patch(ip_url, json=ip_request_data)
    ip_resp_json: dict = ip_resp.json()
    if not (200 <= ip_resp.status_code <= 299):
        raise HTTPException(ip_resp.status_code,
                            detail=ip_resp_json['detail'])

    ip_resp_json['data']['ip']['recorder'] = user_data

    del ip_resp_json['data']['ip']['recorder_id']

    response.status_code = ip_resp.status_code

    return ip_resp_json


@router.delete('/ips/{ip_address_id}')
async def delete_ip_address(ip_address_id: int, data: DeleteIPAddressData,
                            response: Response) -> dict:
    # Authenticate the access token first.
    try:
        user_data: dict = _authenticate_access_token(data.access_token)
    except HTTPException:
        raise

    # Check if the user can edit the IP address.
    try:
        _check_action_validity(ip_address_id, user_data['id'],
                               user_data['is_superuser'])
    except HTTPException:
        raise

    url: str = f'{IP_SERVICE_URL}/ips/{ip_address_id}'
    request_data: dict = {
        'deleter_id': user_data['id']
    }

    resp: requests.Response = requests.delete(url, json=request_data)
    response.status_code = resp.status_code

    return resp.json()


def _check_action_validity(ip_address_id: int, user_id: int,
                           is_user_superuser: bool):
    ip_address_data: dict = _get_ip_address_data(ip_address_id)
    if ip_address_data is None:
        raise _get_error_details_exception(404,
                                           RouteErrorCode.NONEXISTENT_IP_ADDRESS)

    if ip_address_data['recorder_id'] != user_id and not is_user_superuser:
        raise _get_error_details_exception(403,
                                           RouteErrorCode.FORBIDDEN_ACTION)


def _authenticate_access_token(access_token: str) -> dict:
    auth_url: str = f'{AUTH_SERVICE_URL}/token/access/validate'

    auth_request_data: dict = {
        'access_token': access_token
    }

    auth_resp: requests.Response = requests.post(auth_url,
                                                 json=auth_request_data)
    auth_resp_json: dict = auth_resp.json()
    if 200 <= auth_resp.status_code <= 299:
        return auth_resp_json['data']
    else:
        raise HTTPException(auth_resp.status_code,
                            detail=auth_resp_json['detail'])


def _get_ip_address_data(ip_address_id: int) -> dict | None:
    url: str = f'{IP_SERVICE_URL}/ips'
    params: dict = {'id': ip_address_id}
    resp: requests.Response = requests.get(url, params=params)

    resp_json: dict = resp.json()
    resp_data: dict = resp_json['data']
    ips: list = resp_data['ips']
    if len(ips) > 0:
        return ips[0]
    else:
        return None


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
