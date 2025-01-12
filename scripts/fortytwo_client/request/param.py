from typing import List, Self, Tuple


class FortyTwoParam:
    """
    This class provides a base for query parameters.
    """

    def to_query_param(self: Self) -> Tuple[str, str]:
        """
        Returns the query parameter string representation of the object.

        Returns:
            str: The query parameter string representation.
        """

        raise NotImplementedError


class Sort(FortyTwoParam):
    """
    This class provides a sort query parameter.
    """

    def __init__(self: Self, by: List[str]) -> None:
        self.by = by

    def to_query_param(self: Self) -> Tuple[str, str]:
        return ('sort', ','.join(self.by))


class Filter(FortyTwoParam):
    """
    This class provides a filter query parameter.
    """

    def __init__(self: Self, by: str, values: List[str]) -> None:
        self.by = by
        self.values = values

    def to_query_param(self: Self) -> Tuple[str, str]:
        return (f'filter[{self.by}]', ','.join(self.values))


class Range(FortyTwoParam):
    """
    This class provides a range query parameter.
    """

    def __init__(self: Self, by: str, values: List[str]) -> None:
        self.by = by
        self.values = values

    def to_query_param(self: Self) -> Tuple[str, str]:
        return (f'range[{self.by}]', ','.join(self.values))


class PageNumber(FortyTwoParam):
    """
    This class provides a range query parameter.
    """

    def __init__(self: Self, page_number: int) -> None:
        self.page_number = page_number

    def to_query_param(self: Self) -> Tuple[str, str]:
        return ('page[number]', str(self.page_number))


class PageSize(FortyTwoParam):
    """
    This class provides a range query parameter.
    """

    def __init__(self: Self, page_size: int) -> None:
        if page_size < 1 or page_size > 100:
            raise ValueError("Page size must be between 1 and 100.")

        self.page_size = page_size

    def to_query_param(self: Self) -> Tuple[str, str]:
        return ('page[size]', str(self.page_size))
