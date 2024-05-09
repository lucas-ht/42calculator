"""
This module provides functions for interacting with the 42 School API.

It includes functions to fetch an access token,
and to fetch data from the API using the access token.

This module uses the `requests` library to send HTTP requests,
and the `dotenv` library to load environment variables.
"""

import os
import sys
import time
import typing
import logging

import requests


def fetch_from_api() -> typing.Callable[[typing.Optional[str]], dict | None]:
    """
    Returns a function that fetches data from an API using the provided access token.

    The returned function takes an optional URL as an argument.
    If a URL is provided, it fetches data from that URL.
    If no URL is provided, it fetches data from the URL stored in the `fetch_url` variable.

    The function handles rate limiting by the API by waiting and retrying the request.
    If the rate limit is exceeded again,
    it waits for 10 minutes before retrying. If any other HTTP error occurs,
    it logs the error and returns None.

    The function also ensures that requests are not made more frequently than every 0.5 seconds.

    Args:
        access_token (str): The access token to use for the API requests.

    Returns:
        Callable[[Optional[str]], dict | None]: A function that fetches data from the API.
    """

    access_token:    str | None = None
    fetch_url:       str | None = None

    is_rate_limited: bool = False
    request_time:    dict[float] = {
        'start':     0.0,
        'elapsed':   0.0
    }


    def _get_access_token() -> str:
        """
        Fetches an access token from the 42 School API.

        This function sends a POST request to the API's OAuth
        endpoint with client credentials loaded from environment variables.
        If the request is successful, it returns the access token from the response.

        If an HTTP error occurs during the request,
        the function logs the error and terminates the program.

        Returns:
            str: The access token for the API.

        Raises:
            SystemExit: If an HTTP error occurs during the request.
        """

        data = {
            "grant_type":    "client_credentials",
            "client_id":     os.environ.get("AUTH_42_SCHOOL_ID"),
            "client_secret": os.environ.get("AUTH_42_SCHOOL_SECRET")
        }

        try:
            logging.info('Fetching access token.')

            response = requests.post("https://api.intra.42.fr/oauth/token", data=data)
            response.raise_for_status()
            return response.json()["access_token"]

        except requests.exceptions.HTTPError as e:
            logging.error('Failed to fetch access token: %s', e)
            sys.exit(1)


    def _handle_rate_limit() -> dict | None:
        nonlocal is_rate_limited

        if is_rate_limited:
            logging.error('Rate limit exceeded again, retrying in 5 minutes...')
            time.sleep(300)
        else:
            logging.warning('Rate limit exceeded, retrying.')
            time.sleep(1)

        is_rate_limited = True

        return fetch_data()


    def _handle_unauthorized(response: requests.Response) -> None:
        content = response.json()
        message = content.get('message')

        if message != 'The access token expired.':
            return None

        logging.warning('Access token expired, fetching a new one.')

        nonlocal access_token
        access_token = _get_access_token()

        return fetch_data()


    def _handle_http_exception(response: requests.Response) -> dict | None:
        if response.status_code == 429:
            return _handle_rate_limit()

        nonlocal is_rate_limited
        is_rate_limited = False

        logging.error('Failed to fetch from the API: %s.', {response.reason})

        if response.status_code == 401:
            return _handle_unauthorized(response)

        return None


    def fetch_data(url: str | None = None) -> dict | None:
        """
        Fetches data from an API using the provided access token and URL.

        This function sends a GET request to the API and returns the response
        as a JSON object.
        If the request takes less than 0.5 seconds,

        the function will pause to ensure that requests
        are not made more frequently than every 0.5 seconds.

        If an HTTP error occurs, the function will handle it
        by calling the `handle_http_exception` function.
        If any other request exception occurs, it logs the error and returns None.

        Args:
            url (str | None): The URL to fetch data from.
                If None, uses the URL stored in the `fetch_url` variable.

        Returns:
            dict | None: The data fetched from the API as a JSON object,
                or None if an error occurred.
        """

        nonlocal fetch_url
        if url is not None:
            fetch_url = url

        nonlocal access_token
        if access_token is None:
            access_token = _get_access_token()

        nonlocal request_time
        request_time['start'] = time.time()

        try:
            headers = {
                "Authorization": f'Bearer {access_token}'
            }

            response = requests.get(fetch_url, headers=headers)

            request_time['elapsed'] = time.time() - request_time['start']
            if request_time['elapsed'] < 0.5:
                time.sleep(0.5 - request_time['elapsed'])

            response.raise_for_status()

            nonlocal is_rate_limited
            is_rate_limited = False

            return response.json()

        except requests.exceptions.HTTPError:
            return _handle_http_exception(response)

        except requests.exceptions.RequestException as e:
            logging.error('Failed to fetch from the API: %s', {e})
            return fetch_data()


    return fetch_data
