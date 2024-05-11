"""
Fetches projects from the 42 API and saves them to FILENAME.
"""

import os
import json
import logging

from dotenv import load_dotenv

from api import fetch_from_api


PROJECT_ID_START    = 0
PROJECT_ID_END      = 3000
DIRECTORY           = 'data'
PROJECTS_ENDPOINT   = 'https://api.intra.42.fr/v2/projects'

def process_project(project_data: dict) -> dict:
    """
    Processes the project data and returns a dictionary.
    """

    project = {
        'id':                   project_data['id'],
        'created_at':           project_data['created_at'],
        'updated_at':           project_data['updated_at'],
        'name':                 project_data['name'],
        'slug':                 project_data['slug'],
        'experience':           project_data['difficulty'],
        'exam':                 project_data['exam'],
        'parent': project_data['parent'] and {
            'id':               project_data['parent']['id'],
            'name':             project_data['parent']['name'],
            'slug':             project_data['parent']['slug']
        },
    }

    cursus = {
        cursus_data['id']: {
            'meta': {
                'id':               cursus_data['id'],
                'created_at':       cursus_data['created_at'],
                'kind':             cursus_data['kind'],
                'name':             cursus_data['name'],
                'slug':             cursus_data['slug'],
            },
            'projects': {
                project['id']: project
            }
        } for cursus_data in project_data['cursus']
    }

    return cursus


def save_cursus(cursus: dict) -> None:
    """
    Saves the cursus to a JSON file.
    """

    for _, (cursus_id, projects) in enumerate(cursus.items()):

        filename = os.path.join(DIRECTORY, f"cursus_{cursus_id}.json")
        os.makedirs(os.path.dirname(filename), exist_ok=True)

        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(projects, f, indent=2)
        except IOError as e:
            logging.error('Failed to save project(s) to %s: %s.', filename, e)

        logging.info('Saved %s project(s) to %s.', len(projects) - 1, filename)


def main() -> None:
    """
    Fetches projects from the 42 API and saves them to DIRECTORY.
    """

    logging.basicConfig(
        level=logging.INFO,
        format='[%(asctime)s] \033[1m%(levelname)s\033[0m %(message)s',
        datefmt='%H:%M:%S'
    )

    load_dotenv('.env.local')

    cursus = {}
    fetch_data = fetch_from_api()

    for i in range(PROJECT_ID_START, PROJECT_ID_END):

        logging.info('Fetching project #%s.', i)
        project_data = fetch_data(f'{PROJECTS_ENDPOINT}/{i}')

        if project_data is None:
            continue

        logging.info('Fetched project #%s: %s.', project_data["id"], project_data["slug"])
        logging.debug('%s', project_data)

        project_cursus = process_project(project_data)

        for cursus_id, cursus_data in project_cursus.items():
            if cursus_id in cursus:
                cursus[cursus_id]['projects'] |= cursus_data['projects']
            else:
                cursus[cursus_id] = cursus_data

    save_cursus(cursus)


if __name__ == '__main__':
    main()
