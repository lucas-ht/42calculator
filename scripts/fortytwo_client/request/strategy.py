"""
This module provides classes for request strategies.
"""

from typing import Callable, Generic, List, Optional, Self, TypeVar

from fortytwo_client.request import FortyTwoRequest
from fortytwo_client.ressource import RessourceTemplate

StrategyTemplate = TypeVar('StrategyTemplate')


class FortyTwoRequestStrategy(
    Generic[RessourceTemplate, StrategyTemplate]
):
    """
    This class provides a base for request strategies.
    """

    def request(
        self: Self,
        request: FortyTwoRequest,
        make_request: Callable[[], Optional[RessourceTemplate]]
    ) -> StrategyTemplate:
        """
        This function wraps the request function.

        Args:
            request (Callable[[], Optional[T]]): The request function.

        Returns:
            U: The response from the request.
        """

        raise NotImplementedError


class RequestOnce(
    FortyTwoRequestStrategy[RessourceTemplate, Optional[RessourceTemplate]]
):
    """
    This class provides a request strategy that only requests once.
    """

    def request(
        self: Self,
        request: FortyTwoRequest,
        make_request: Callable[[], Optional[RessourceTemplate]]
    ) -> StrategyTemplate:
        return make_request()


class RequestMultiple(
    FortyTwoRequestStrategy[RessourceTemplate, List[Optional[RessourceTemplate]]]
):
    """
    This class provides a request strategy that requests multiple times.
    """

    def request(
        self: Self,
        request: FortyTwoRequest,
        make_request: Callable[[], Optional[RessourceTemplate]]
    ) -> StrategyTemplate:
        return [make_request() for _ in range(10)]
