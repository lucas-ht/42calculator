"""
This module contains the CustomRessource class.
"""

from typing import Any, Self

from fortytwo_client.ressource import FortyTwoRessource, RessourceTemplate


class CustomRessource(FortyTwoRessource[Any]):
    """
    This class provides a custom ressource for the 42 API.
    """

    _method: str
    _url: str

    def __init__(self: Self, method: str, url: str) -> None:
        self._method = method
        self._url = url

    @property
    def method(self: Self) -> str:
        return self._method

    @property
    def url(self: Self) -> str:
        return self.config.endpoint + self._url

    def parse_response(self: Self, response_data: Any) -> RessourceTemplate:
        return response_data
