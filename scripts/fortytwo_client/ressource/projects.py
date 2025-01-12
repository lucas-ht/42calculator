"""
This module provides ressources for getting projects from the 42 API.
"""

from typing import TYPE_CHECKING, Any, List, Optional, Self

from dateutil.parser import parse as parse_date

from fortytwo_client.json import register_serializer
from fortytwo_client.ressource import FortyTwoRessource, RessourceTemplate

if TYPE_CHECKING:
    from datetime import datetime


class FortyTwoProject:
    """
    This class provides a representation of a 42 project.
    """

    def __init__(self: Self, data: Any) -> None:
        self.id:            int             = data['id']

        self.name:          str             = data['name']
        self.slug:          str             = data['slug']

        self.difficulty:    int             = data['difficulty']

        self.created_at:    datetime        = parse_date(data['created_at'])
        self.updated_at:    datetime        = parse_date(data['updated_at'])

        self.exam:          bool            = data['exam']
        self.parent:        Optional[Any]   = data['parent']
        self.children:      List[Any]       = data['children']


    def __repr__(self: Self) -> str:
        return f'<FortyTwoProject {self.name}>'

    def __str__(self: Self) -> str:
        return self.name

register_serializer(
    FortyTwoProject,
    lambda p: {
        "id":               p.id,

        "name":             p.name,
        "slug":             p.slug,

        "difficulty":       p.difficulty,

        "created_at":       p.created_at.isoformat(),
        "updated_at":       p.updated_at.isoformat(),

        "exam":             p.exam,
        "parent":           p.parent,
        "children":         p.children
    }
)

class GetProjects(FortyTwoRessource[List[FortyTwoProject]]):
    """
    This class provides a ressource for getting all projects.
    """

    method: str = 'GET'
    _url: str = '/projects'

    @property
    def url(self: Self) -> str:
        return self.config.endpoint + self._url

    def parse_response(self: Self, response_data: Any) -> RessourceTemplate:
        return [
            FortyTwoProject(project) for project in response_data
        ]


class GetProjectsById(FortyTwoRessource[FortyTwoProject]):
    """
    This class provides a ressource for getting a project by its ID.
    """

    method: str = 'GET'
    _url: str = '/projects/%s'

    def __init__(self: Self, project_id: int) -> None:
        self.project_id = project_id

    @property
    def url(self: Self) -> str:
        return self.config.endpoint + self._url % self.project_id

    def parse_response(self: Self, response_data: Any) -> RessourceTemplate:
        return FortyTwoProject(response_data)


class GetProjectsByCursus(FortyTwoRessource[List[FortyTwoProject]]):
    """
    This class provides a ressource for getting all projects for a cursus.
    """

    method: str = 'GET'
    _url: str = '/cursus/%s/projects'

    def __init__(self: Self, cursus_id: int) -> None:
        self.cursus_id = cursus_id

    @property
    def url(self: Self) -> str:
        return self.config.endpoint + self._url % self.cursus_id

    def parse_response(self: Self, response_data: Any) -> RessourceTemplate:
        return [
            FortyTwoProject(project) for project in response_data
        ]
