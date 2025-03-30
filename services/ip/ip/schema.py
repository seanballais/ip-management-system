import typing

from pydantic import BaseModel


class AddNewIPAddressData(BaseModel):
    ip_address: str
    label: str
    comment: typing.Optional[str] = None
    recorder_id: int
