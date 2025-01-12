import logging
import time
from typing import Optional, Self, Type

from requests import Response
from requests.exceptions import HTTPError, RequestException

from fortytwo_client.config import FortyTwoConfig
from fortytwo_client.request import FortyTwoRequest
from fortytwo_client.request.authentication import (
    FortyTwoAuthentication,
    FortyTwoSecrets,
    FortyTwoTokens,
)
from fortytwo_client.request.param import FortyTwoParam
from fortytwo_client.request.strategy import (
    FortyTwoRequestStrategy,
    RequestOnce,
    StrategyTemplate,
)
from fortytwo_client.ressource import FortyTwoRessource, RessourceTemplate


class FortyTwoClient:
    """
    This class provides a client for the 42 School API.
    """

    config: FortyTwoConfig
    secrets: FortyTwoSecrets

    _tokens: Optional[FortyTwoTokens] = None
    _request: FortyTwoRequest[RessourceTemplate]

    _is_rate_limited: bool = False
    _request_time: float


    def __init__(
        self: Self,
        client_id: str,
        client_secret: str,
        config: Optional[FortyTwoConfig] = None
    ) -> None:
        self.config = config or FortyTwoConfig()
        self.secrets = FortyTwoSecrets(client_id, client_secret)


    def request(
        self: Self,
        ressource: FortyTwoRessource[RessourceTemplate],
        *params: FortyTwoParam,
        strategy: Type[FortyTwoRequestStrategy[
            RessourceTemplate, StrategyTemplate
        ]] = RequestOnce[RessourceTemplate]
    ) -> StrategyTemplate:
        """
        This function sends a request to the API and returns the response

        Args:
            ressource (FortyTwoRessource): The ressource to fetch.
            params (FortyTwoParam): The parameters for the request.
            strategy (FortyTwoRequestStrategy): The strategy to use for the request.

        Returns:
            U: The response from the API.
        """

        if self._tokens is None:
            self._tokens = FortyTwoAuthentication.get_tokens(self.secrets)

        self._request = FortyTwoRequest[RessourceTemplate](
            ressource.set_config(self.config),
            *params
        )

        return strategy[RessourceTemplate]().request(self._request, self._make_request)


    def _make_request(self: Self) -> Optional[RessourceTemplate]:
        self._request_time = time.perf_counter()

        try:
            response = self._request.request(self._tokens)
            self._request.rate_limit(
                self._request_time,
                self.config.rate_limit_per_second
            )

            self._is_rate_limited = False
            return response

        except HTTPError as e:
            self._request.rate_limit(
                self._request_time,
                self.config.rate_limit_per_second
            )
            return self._handle_http_exception(e.response)

        except RequestException as e:
            logging.error('Failed to fetch from the API: %s', {e})
            return self._make_request()


    def _handle_rate_limit(self: Self) -> Optional[RessourceTemplate]:
        if self._is_rate_limited:
            logging.error('Rate limit exceeded again, retrying in 5 minutes...')
            time.sleep(300)
        else:
            logging.warning('Rate limit exceeded, retrying.')
            time.sleep(1)

        self._is_rate_limited = True

        return self._make_request()


    def _handle_unauthorized(self: Self, response: Response) -> Optional[RessourceTemplate]:
        logging.info('Access token expired, fetching a new one.')

        self._tokens = FortyTwoAuthentication.get_tokens(
            self.secrets
        )

        return self._make_request()


    def _handle_http_exception(self: Self, response: Response) -> Optional[RessourceTemplate]:
        if response.status_code == 429:
            return self._handle_rate_limit()

        self._is_rate_limited = False

        logging.error('Failed to fetch from the API (%s): %s.', response.status_code, response.reason)

        if response.status_code == 401:
            return self._handle_unauthorized(response)

        return None
