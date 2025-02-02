"""
This module provides ressources for getting project users from the 42 API.
"""

from typing import TYPE_CHECKING, Any, List, Self

from dateutil.parser import parse as parse_date

from fortytwo_client.json import register_serializer
from fortytwo_client.ressource import FortyTwoRessource, RessourceTemplate

if TYPE_CHECKING:
    from datetime import datetime


class FortyTwoUser:
    """
    This class provides a representation of a 42 project user.
    """

    def __init__(self: Self, data: Any) -> None:
        self.id:            int         = data['id']
        self.login:         str         = data['login']

        self.kind:          str         = data['kind']
        self.alumni:        bool        = data['alumni?']
        self.active:        bool        = data['active?']

        self.image:         dict        = {
            'large':                      data['image']['versions']['large'],
            'medium':                     data['image']['versions']['medium'],
            'small':                      data['image']['versions']['small'],
            'micro':                      data['image']['versions']['micro'],
        }

        self.created_at:    datetime    = parse_date(data['created_at'])
        self.updated_at:    datetime    = parse_date(data['updated_at'])


    def __repr__(self: Self) -> str:
        return f'<FortyTwoUser {self.name}>'

    def __str__(self: Self) -> str:
        return self.name

register_serializer(
    FortyTwoUser,
    lambda u: {
        "id":               u.id,
        "login":            u.login,

        "kind":             u.kind,
        "alumni":           u.alumni,
        "active":           u.active,

        "image":            u.image,

        "created_at":       u.created_at.isoformat(),
        "updated_at":       u.updated_at.isoformat(),
    }
)


class GetUsers(FortyTwoRessource[List[FortyTwoUser]]):
    """
    This class provides a ressource for getting all users.
    """

    method: str = 'GET'
    _url: str = '/users'

    @property
    def url(self: Self) -> str:
        return self.config.endpoint + self._url

    def parse_response(self: Self, response_data: Any) -> RessourceTemplate:
        return [
            FortyTwoUser(user) for user in response_data
        ]


class GetUserById(FortyTwoRessource[FortyTwoUser]):
    """
    This class provides a ressource for getting a user by its id.
    """

    method: str = 'GET'
    _url: str = '/users/%s'

    def __init__(self: Self, user_id: int) -> None:
        self.user_id = user_id

    @property
    def url(self: Self) -> str:
        return self.config.endpoint + self._url % self.user_id

    def parse_response(self: Self, response_data: Any) -> RessourceTemplate:
        return FortyTwoUser(response_data)
