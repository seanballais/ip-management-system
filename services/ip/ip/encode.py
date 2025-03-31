from .models import IPAddress


def get_ip_address_dict(ip_address: IPAddress) -> dict:
    return {
        'id': ip_address.id,
        'created_on': ip_address.created_on,
        'ip_address': ip_address.ip_address,
        'label': ip_address.label,
        'comment': ip_address.comment,
        'recorder_id': ip_address.recorder_id
    }
