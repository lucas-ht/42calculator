"""Fast, list-only refresh of data/projects_{id}.json for the calculator.

Unlike fetch_projects.py, this does NOT fetch project users (completions /
duration), which the app never displays. It only fetches the project list, so
it finishes in a handful of requests instead of hours.

Curation:
  - Include a project if its XP (difficulty) > 0, OR if it already exists in
    the current file (keeps curated 0-XP entries like cpp-module / exam-rank,
    while dropping NEW 0-XP admin noise such as work-experience-* / exam_test_*).
  - Preserve existing completions / duration; 0 for newly-added projects.
  - Prune children to the included, non-exam set so the app never resolves a
    missing id.

Run from the repo root (so .env and data/ resolve):
    python3 scripts/refresh_projects.py
"""
import json
import logging
import os
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv

from fortytwo_client import (
    FortyTwoClient,
    FortyTwoProject,
    GetProjectsByCursus,
    PageNumber,
    PageSize,
)

DIRECTORY = "data"
CURSUS_ID = 21
CURSUS_META = {"id": CURSUS_ID, "kind": "main", "name": "42cursus", "slug": "42cursus"}


def slim(ref: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Normalize a parent/child ref to {name, id, slug}."""
    if not ref:
        return None
    return {"name": ref.get("name"), "id": ref.get("id"), "slug": ref.get("slug")}


def get_projects(ftc: FortyTwoClient) -> List[FortyTwoProject]:
    projects: List[FortyTwoProject] = []
    for i in range(1, 1000):
        r = ftc.request(GetProjectsByCursus(CURSUS_ID), PageSize(100), PageNumber(i))
        if not r:
            break
        projects.extend(r)
    return projects


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    load_dotenv(".env")

    ftc = FortyTwoClient(
        client_id=os.environ.get("AUTH_42_SCHOOL_ID"),
        client_secret=os.environ.get("AUTH_42_SCHOOL_SECRET"),
    )

    filename = os.path.join(DIRECTORY, f"projects_{CURSUS_ID}.json")

    existing: Dict[int, Any] = {}
    if os.path.exists(filename):
        with open(filename, encoding="utf-8") as f:
            existing = {p["id"]: p for p in json.load(f).get("projects", [])}

    logging.info("Fetching project list...")
    api = get_projects(ftc)

    out: List[Dict[str, Any]] = []
    for p in api:
        xp = p.difficulty or 0
        prev = existing.get(p.id)

        # Drop NEW 0-XP entries (admin noise); keep already-curated 0-XP ones.
        if xp <= 0 and prev is None:
            continue

        out.append({
            "id": p.id,
            "name": p.name,
            "slug": p.slug,
            "difficulty": xp,
            "completions": prev["completions"] if prev else 0,
            "duration": prev["duration"] if prev else 0,
            "created_at": p.created_at.isoformat(),
            "updated_at": p.updated_at.isoformat(),
            "exam": p.exam,
            "parent": slim(p.parent),
            "children": [slim(c) for c in (p.children or [])],
        })

    out.sort(key=lambda x: x["id"])

    # Prune children to the included, non-exam set (the app resolves children by
    # id and would otherwise splice `undefined`).
    included = {p["id"] for p in out if p["exam"] is not True}
    for p in out:
        p["children"] = [c for c in p["children"] if c["id"] in included]

    os.makedirs(DIRECTORY, exist_ok=True)
    with open(filename, "w", encoding="utf-8") as f:
        json.dump({"meta": CURSUS_META, "projects": out}, f, indent=2, ensure_ascii=False)

    added = sum(1 for p in api if p.id not in existing and (p.difficulty or 0) > 0)
    removed = sum(1 for i in existing if i not in {p.id for p in api})
    logging.info(
        "Wrote %s: %d projects (%d added, %d removed).",
        filename, len(out), added, removed,
    )


if __name__ == "__main__":
    main()
