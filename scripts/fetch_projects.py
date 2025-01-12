import json
import logging
import os
import pickle
from typing import List, Self

import numpy as np
from dotenv import load_dotenv

from fortytwo_client import (
    Filter,
    FortyTwoClient,
    FortyTwoProject,
    FortyTwoProjectUser,
    GetProjectsByCursus,
    GetProjectUsersByProject,
    PageNumber,
    PageSize,
    Range,
    default_serializer,
)
from fortytwo_client.json import register_serializer

DIRECTORY           = 'data'
CURSUS_ID           = 21


class FortyTwoProjectWithStats:
    def __init__(self: Self, project: FortyTwoProject, project_users: List[FortyTwoProjectUser]) -> None:
        self.project = project
        self.project_users = project_users

    def calculate_duration(self: Self) -> int:
        try:
            if not self.project_users:
                return 0

            durations = [
                pu.duration.total_seconds() for pu in self.project_users
            ]
            return int(np.mean(durations))

        except Exception as e:
            logging.error('Failed to calculate duration for project %s: %s.', self.project.name, e)
            return 0

register_serializer(
    FortyTwoProjectWithStats,
    lambda p: {
        "id":               p.project.id,

        "name":             p.project.name,
        "slug":             p.project.slug,

        "difficulty":       p.project.difficulty,
        "completions":      len(p.project_users),
        "duration":         p.calculate_duration(),

        "created_at":       p.project.created_at.isoformat(),
        "updated_at":       p.project.updated_at.isoformat(),

        "exam":             p.project.exam,
        "parent":           p.project.parent,
        "children":         p.project.children
    }
)


def get_projects(ftc: FortyTwoClient) -> List[FortyTwoProject]:
    projects: List[FortyTwoProject] = []

    for i in range(1, 1000):
        r = ftc.request(
            GetProjectsByCursus(CURSUS_ID),
            PageSize(100),
            PageNumber(i)
        )

        if not r:
            break

        projects.extend(r)

    return projects


def get_project_users(ftc: FortyTwoClient, project_id: int) -> List[FortyTwoProjectUser]:
    project_users: List[FortyTwoProjectUser] = []

    for i in range(1, 1000):
        r = ftc.request(
            GetProjectUsersByProject(project_id),
            Filter('status', ['finished']),
            Range('final_mark', ['100', '125']),
            PageSize(100),
            PageNumber(i)
        )

        if not r:
            break

        project_users.extend(r)

    return project_users


def main() -> None:
    logging.basicConfig(level=logging.INFO)

    load_dotenv('.env')

    ftc = FortyTwoClient(
        client_id=os.environ.get('AUTH_42_SCHOOL_ID'),
        client_secret=os.environ.get('AUTH_42_SCHOOL_SECRET')
    )

    logging.info('Fetching projects...')
    projects = get_projects(ftc)

    projects_with_stats = []

    # Resume fetched projects if the script was interrupted
    try:
        filename = os.path.join(DIRECTORY, f"projects_{CURSUS_ID}.pkl")
        if os.path.exists(filename):
            with open(filename, 'rb') as f:
                projects_with_stats = pickle.load(f)
    except IOError as e:
        logging.error('Failed to load projects from %s: %s.', filename, e)

    for project in projects:
        if any(p.project.id == project.id for p in projects_with_stats):
            logging.info(f'Project {project.name} already fetched, skipping...')
            continue

        logging.info(f'Fetching project users for project {project.name}...')
        project_users = get_project_users(ftc, project.id)
        projects_with_stats.append(
            FortyTwoProjectWithStats(project, project_users)
        )

        # Save projects to pickle file to resume fetching if the script is interrupted
        try:
            filename = os.path.join(DIRECTORY, f"projects_{CURSUS_ID}.pkl")
            os.makedirs(os.path.dirname(filename), exist_ok=True)

            with open(filename, 'wb') as f:
                pickle.dump(projects_with_stats, f)
        except IOError as e:
            logging.error('Failed to save projects to %s: %s.', filename, e)

    # The projects are not pre sorted, so we sort them by id
    projects_with_stats.sort(key=lambda p: p.project.id)

    try:
        filename = os.path.join(DIRECTORY, f"projects_{CURSUS_ID}.json")
        os.makedirs(os.path.dirname(filename), exist_ok=True)

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(projects_with_stats, f, indent=2, default=default_serializer)
    except IOError as e:
        logging.error('Failed to save projects to %s: %s.', filename, e)


if __name__ == '__main__':
    main()
