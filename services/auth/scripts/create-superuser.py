from pathlib import Path
from getpass import getpass
import sys

from sqlalchemy import Select
from sqlmodel import select

src_path: Path = Path(__file__).parent.parent
sys.path.append(str(src_path))

from auth.constants import MINIMUM_PASSWORD_LENGTH
from auth.db import get_session
from auth.models import User, create_user


def main():
    print('Superuser Creation Tool')
    print('WARNING: Make sure that you have run scripts/create-db.py first.')
    with next(get_session()) as session:
        username: str = input('Username: ')

        statement: Select = (select(User).where(User.username == username))
        user_exists: bool = bool(session.exec(statement).first())
        if user_exists:
            print(f'❌ User with a username that you entered already exists. '
                  'Please re-run the script and try again.')
            return -1

        password: str = getpass()
        if len(password) < MINIMUM_PASSWORD_LENGTH:
            print(f'❌ Password length is less than {MINIMUM_PASSWORD_LENGTH}. '
                  'Please re-run the script and try again.')
            return -1

        confirm_password: str = getpass()

        if password == confirm_password:
            print(f'⚒️ Creating user (@{username})...')
            create_user(username, password, True, session)
            print('🎉 Done!')
        else:
            print('❌ The passwords you entered do not match. '
                  'Please re-run the script and try again.')


if __name__ == '__main__':
    main()
