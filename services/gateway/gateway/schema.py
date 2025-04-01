from typing import Optional

from pydantic import BaseModel


class RegistrationData(BaseModel):
    username: str
    password1: str
    password2: str


class LoginData(BaseModel):
    username: str
    password: str


class LogoutData(BaseModel):
    access_token: str
    refresh_token: str


class UsersData(BaseModel):
    access_token: str


class AccessTokenValidationData(BaseModel):
    access_token: str


class TokenRefreshData(BaseModel):
    refresh_token: str


class AuditData(BaseModel):
    access_token: str


class AddNewIPAddressData(BaseModel):
    ip_address: str
    label: str
    comment: Optional[str] = None
    access_token: str


class UpdateIPAddressData(BaseModel):
    ip_address: Optional[str] = None
    label: Optional[str] = None
    comment: Optional[str] = None
    access_token: str


class DeleteIPAddressData(BaseModel):
    deleter_id: int
