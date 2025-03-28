import bcrypt


def hash_password(password: str) -> str:
    pass_bytes: bytes = password.encode('utf-8')
    salt: bytes = bcrypt.gensalt()
    hashed_password: bytes = bcrypt.hashpw(pass_bytes, salt)

    return hashed_password.decode('utf-8')


def is_password_correct(raw_password: str, hashed_password: str) -> bool:
    raw_pass_bytes: bytes = raw_password.encode('utf-8')
    hashed_pass_bytes: bytes = hashed_password.encode('utf-8')

    return bcrypt.checkpw(raw_pass_bytes, hashed_pass_bytes)
