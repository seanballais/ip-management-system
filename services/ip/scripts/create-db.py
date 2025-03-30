from pathlib import Path
import sys

from sqlalchemy import Select
from sqlmodel import select

src_path: Path = Path(__file__).parent.parent
sys.path.append(str(src_path))

from ip import db
from ip.db import get_session
from ip.models import IPAddress, IPAddressEventType, IPAddressEvent


def main():
    db.create_db_and_tables()

    # Pre-populate the user event type table.
    event_types: list[str] = [
        'ip_address_added',
        'ip_address_modified_ip',
        'ip_address_modified_ip_label',
        'ip_address_modified_ip_comment',
        'ip_address_modified_ip_label_comment',
        'ip_address_modified_label',
        'ip_address_modified_label_comment',
        'ip_address_modified_comment',
        'ip_address_deleted'
    ]
    for event_type in event_types:
        with next(get_session()) as session:
            # Check first if the user event types are already in the database.
            statement: Select = (
                select(IPAddressEventType).where(
                    IPAddressEventType.name == event_type)
            )
            event_exists: bool = bool(session.exec(statement).first())
            if not event_exists:
                session.add(IPAddressEventType(name=event_type))

            session.commit()


if __name__ == '__main__':
    main()
