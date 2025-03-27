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
