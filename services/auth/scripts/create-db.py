import os
from pathlib import Path
import sys


src_path: Path = Path(__file__).parent.parent
sys.path.append(str(src_path))


from auth import db
from auth.models import User


def main():
    db.create_db_and_tables()


if __name__ == '__main__':
    main()
