from typing import Optional, Self


class FortyTwoClientException(Exception):
    """
    Base class for exceptions in the FortyTwoClient.
    """

    def __init__(self: Self, message: str="An error occurred in the FortyTwoClient.", error_code: Optional[int]=None) -> None:
        self.error_code = error_code
        super().__init__(message)


class FortyTwoAuthException(FortyTwoClientException):
    """
    Exception raised for authentication errors.
    """

    def __init__(self: Self, message: str="An error occurred when authenticating.", error_code: Optional[int]=None) -> None:
        super().__init__(message, error_code)


class FortyTwoRequestException(FortyTwoClientException):
    """
    Exception raised for request errors.
    """

    def __init__(self: Self, message: str="An error occurred in the FortyTwoClient request.", error_code: Optional[int]=None) -> None:
        super().__init__(message, error_code)

