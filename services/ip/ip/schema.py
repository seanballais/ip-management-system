import typing

from pydantic import BaseModel


class AddNewIPAddressData(BaseModel):
    ip_address: str
    label: str
    comment: typing.Optional[str] = None
    recorder_id: int


class UpdateNewIPAddressData(BaseModel):
    ip_address: typing.Optional[str] = None
    label: typing.Optional[str] = None
    comment: typing.Optional[str] = None
    updater_id: int
