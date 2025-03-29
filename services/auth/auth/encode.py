from .models import User


def get_user_dict(user: User) -> dict:
    return {
        'id': user.id,
        'username': user.username,
        'is_superuser': user.is_superuser
    }
