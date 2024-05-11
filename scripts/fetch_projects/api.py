"""
This module provides functions for interacting with the 42 School API.
This module uses the `requests` library to send HTTP requests.
"""

import os
import sys
import time
import typing
import logging

import requests


def fetch_from_api() -> typing.Callable[[typing.Optional[str]], dict | None]:
    """
    Returns a function that fetches data from an API.

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
        error = content.get('error')

        if not (message == 'The access token expired.' or error == 'The access token is invalid'):
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
        Fetches data from an API using the provided URL.

        This function sends a GET request to the API and returns the response
        as a JSON object.

        If an HTTP error occurs, the function will handle it.
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
