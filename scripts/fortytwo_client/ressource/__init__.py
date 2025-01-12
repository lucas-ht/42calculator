"""
This module provides a base class for 42 API ressources.
"""

from typing import Any, Generic, Self, TypeVar

from fortytwo_client.config import FortyTwoConfig

RessourceTemplate = TypeVar('RessourceTemplate')

class FortyTwoRessource(Generic[RessourceTemplate]):
    """
    This class provides a base for 42 API ressources.
    """

    config: FortyTwoConfig

    @property
    def method(self: Self) -> str:
        """
        Returns the method to use for the request.
        """

        raise NotImplementedError


    @property
    def url(self: Self) -> str:
        """
        Returns the URL to use for the request.
        """

        raise NotImplementedError


    def parse_response(self: Self, response_data: Any) -> RessourceTemplate:
        """
        Parses the response from the API and returns the data.
        """

        raise NotImplementedError


    def set_config(self: Self, config: FortyTwoConfig) -> Self:
        """
        Sets the config for the ressource.
        """

        self.config = config
        return self
