import time
from typing import Generic, List, Optional, Self, TypeVar

import requests

from fortytwo_client.request.authentication import FortyTwoTokens
from fortytwo_client.request.param import FortyTwoParam
from fortytwo_client.ressource import FortyTwoRessource

T = TypeVar('T')

class FortyTwoRequest(Generic[T]):
    ressource: FortyTwoRessource[T]
    params: List[FortyTwoParam] = []

    def __init__(self: Self, ressource: FortyTwoRessource, *params: FortyTwoParam) -> None:
        self.ressource = ressource
        self.params = list(params)


    def add_params(self: Self, *params: FortyTwoParam) -> None:
        """
        This function adds parameters to the request.

        Args:
            *params (FortyTwoParam): The parameters to add.
        """

        self.params.extend(params)


    def request(self: Self, tokens: FortyTwoTokens) -> Optional[T]:
        """
        This function sends a request to the API and returns the response.

        Args:
            tokens (FortyTwoTokens): The access and refresh tokens.

        Returns:
            Optional[T]: The response from the request.
        """

        headers = {
            'Authorization': f'Bearer {tokens.access_token}'
        }

        response = requests.request(
            method=self.ressource.method,
            url=self.ressource.url,
            headers=headers,
            params=[
                param.to_query_param() for param in self.params
            ],
            timeout=10
        )

        response.raise_for_status()

        return self.ressource.parse_response(response.json())


    @staticmethod
    def rate_limit(request_time: float, rate_limit: int) -> None:
        """
        This function ensures that the rate limit is respected.

        Args:
            request_time (float): The time at which the request was made.
            rate_limit (int): The number of requests allowed per second.
        """

        time_elapsed = time.perf_counter() - request_time
        sleep_duration = (1 / rate_limit) - time_elapsed

        if sleep_duration > 0:
            time.sleep(sleep_duration)
