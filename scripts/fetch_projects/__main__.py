"""
Fetches projects from the 42 API and saves them to FILENAME.
"""

import json
import logging

from dotenv import load_dotenv

from api import fetch_from_api


PROJECT_ID_START = 0
PROJECT_ID_END   = 10000
FILENAME         = 'projects.json'

def main() -> None:
    """
    Fetches projects from the 42 API and saves them to FILENAME.
    """

    logging.basicConfig(
        level=logging.INFO,
        format='[%(asctime)s] \033[1m%(levelname)s\033[0m %(message)s',
        datefmt='%H:%M:%S'
    )

    load_dotenv('.env.local')

    projects = []
    fetch_data = fetch_from_api()

    for i in range(PROJECT_ID_START, PROJECT_ID_END):

        logging.info('Fetching project #%s.', i)
        project = fetch_data(f'https://api.intra.42.fr/v2/projects/{i}')

        if project is None:
            continue

        logging.info('Fetched project #%s: %s.', project["id"], project["name"])
        logging.debug('%s', project)

        projects.append({
            'id':                   project['id'],
            'created_at':           project['created_at'],
            'updated_at':           project['updated_at'],
            'name':                 project['name'],
            'slug':                 project['slug'],
            'experience':           project['difficulty'],
            'exam':                 project['exam'],
            'parent': project['parent'] and {
                'id':               project['parent']['id'],
                'name':             project['parent']['name'],
                'slug':             project['parent']['slug']
            },
            'cursus': [
                {
                    'id':           cursus['id'],
                    'created_at':   cursus['created_at'],
                    'kind':         cursus['kind'],
                    'name':         cursus['name'],
                    'slug':         cursus['slug'],
                } for cursus in project['cursus']
            ],
            'campus': [
                {
                    'id':           campus['id'],
                    'name':         campus['name'],
                } for campus in project['campus']
            ],
        })

    logging.info('Fetched %s projects.', len(projects))

    with open('FILENAME', 'w', encoding='utf-8') as f:
        json.dump(projects, f, indent=2)

    logging.info('Projects saved to %s.', FILENAME)


if __name__ == '__main__':
    main()
