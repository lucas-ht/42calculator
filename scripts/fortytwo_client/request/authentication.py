import logging
from dataclasses import dataclass

import requests

from fortytwo_client.exceptions import FortyTwoAuthException


@dataclass
class FortyTwoSecrets:
    """
    This class provides a container for 42 API secrets.
    """

    client_id: str
    client_secret: str


@dataclass
class FortyTwoTokens:
    """
    This class provides a container for 42 API tokens.
    """

    access_token: str


class FortyTwoAuthentication:
    """
    This class handles authentication with the 42 API.
    """

    @staticmethod
    def get_tokens(secrets: FortyTwoSecrets) -> FortyTwoTokens:
        """
        Fetches an access token from the 42 API.

        Args:
            secrets (FortyTwoSecrets): The 42 API secrets.

        Returns:
            FortyTwoTokens: The access and refresh tokens.

        Raises:
            FortyTwoAuthException: An error occurred when authenticating.
        """

        data = {
            'grant_type':    'client_credentials',
            'client_id':     secrets.client_id,
            'client_secret': secrets.client_secret
        }

        try:
            logging.debug('Fetching access token.')

            response = requests.post(
                url='https://api.intra.42.fr/oauth/token',
                data=data,
                timeout=10
            )
            response.raise_for_status()

            response_json = response.json()

            tokens = FortyTwoTokens(
                access_token=response_json['access_token'],
            )

            return tokens

        except requests.exceptions.HTTPError as e:
            raise FortyTwoAuthException from e
