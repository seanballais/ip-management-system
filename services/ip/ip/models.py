from datetime import datetime, timezone
import typing

from sqlmodel import Field, JSON, Relationship, SQLModel, text


class IPAddress(SQLModel, table=True):
    id: typing.Optional[int] = Field(default=None, primary_key=True)
    created_on: datetime = Field(default=datetime.now(timezone.utc),
                                 nullable=False)
    ip_address: str = Field(index=True)
    label: str = Field(unique=True)
    comment: typing.Optional[str]
    recorder_id: typing.Optional[int]
    is_deleted: bool = Field(default=False)

    events: list['IPAddressEvent'] = Relationship(back_populates='ip_address')


class IPAddressEventType(SQLModel, table=True):
    id: typing.Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)

    events: list['IPAddressEvent'] = Relationship(back_populates='event_type')


class IPAddressEvent(SQLModel, table=True):
    id: typing.Optional[int] = Field(default=None, primary_key=True)
    # From:
    #  - https://github.com/fastapi/sqlmodel/issues/594#issuecomment-1672270907
    recorded_on: datetime = Field(
        nullable=False,
        sa_column_kwargs={'server_default': text('CURRENT_TIMESTAMP')})
    trigger_user_id: typing.Optional[int]
    ip_address_id: typing.Optional[int] = Field(default=None,
                                                foreign_key='ipaddress.id')
    event_type_id: typing.Optional[int] = Field(default=None,
                                                foreign_key='ipaddresseventtype.id')
    old_data: typing.Optional[str] = Field(default=None, sa_type=JSON)
    new_data: typing.Optional[str] = Field(default=None, sa_type=JSON)

    ip_address: typing.Optional[IPAddress] = Relationship(
        back_populates='events')
    event_type: typing.Optional[IPAddressEventType] = Relationship(
        back_populates='events')
