from dataclasses import dataclass

FORTY_TWO_ENDPOINT:         str = 'https://api.intra.42.fr/v2'
RATE_LIMIT_PER_HOUR:        int = 1200
RATE_LIMIT_PER_SECOND:      int = 2
REQUEST_TIMEOUT:            int = 30

@dataclass
class FortyTwoConfig:
    """
    This class provides the configuration for the FortyTwoClient.
    """

    endpoint:               str = FORTY_TWO_ENDPOINT
    rate_limit_per_hour:    int = RATE_LIMIT_PER_HOUR
    rate_limit_per_second:  int = RATE_LIMIT_PER_SECOND
    request_timeout:        int = REQUEST_TIMEOUT
