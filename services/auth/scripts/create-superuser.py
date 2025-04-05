from pathlib import Path
from getpass import getpass
import sys

from sqlalchemy import Select
from sqlmodel import select

src_path: Path = Path(__file__).parent.parent
sys.path.append(str(src_path))

from auth.db import get_session
from auth.models import User, create_user


def main():
    print('Superuser Creation Tool')
    print('WARNING: Make sure that you have run scripts/create-db.py first.')
    username = input('Username:')
    password = getpass()

    print(f'⚒️ Creating user (@{username}...')
    create_user(username, password, True)
    print('🎉 Done!')


if __name__ == '__main__':
    main()
