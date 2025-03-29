import json
import logging
import os
import sys

from dotenv import load_dotenv

from fortytwo_client import (
    FortyTwoClient,
    FortyTwoUser,
    GetUserById,
    default_serializer,
)


def main() -> None:
    logging.basicConfig(level=logging.INFO)

    load_dotenv('.env')

    ftc = FortyTwoClient(
        client_id=os.environ.get('AUTH_42_SCHOOL_ID'),
        client_secret=os.environ.get('AUTH_42_SCHOOL_SECRET')
    )

    if len(sys.argv) != 2:
        logging.error('Please provide the user id as an argument.')
        sys.exit(2)

    user_id: int
    try:
        user_id = int(sys.argv[1])
    except ValueError:
        logging.error('Invalid user id provided.')
        sys.exit(2)

    user: FortyTwoUser = ftc.request(GetUserById(user_id))
    if (user is None):
        logging.error('User not found.')
        sys.exit(1)

    print(json.dumps(user, default=default_serializer, indent=4))


if __name__ == '__main__':
    main()
