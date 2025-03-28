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
