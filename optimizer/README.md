# RNCP planner optimizer

Offline solver behind the `/planner` page: for each of the 15 combinations of
the four RNCP titles (`rncp6-1`, `rncp6-2`, `rncp7-1`, `rncp7-2`) it finds the
smallest set of projects that meets every condition, and the fastest one in days.

```bash
python3 build.py --no-variants        # writes src/data/planner.json (~15 min)
python3 build.py --level 14 --done 1396,1405
python3 planner.py --combo rncp6-1+rncp7-2 -v
python3 test_planner.py
```

Plain Python 3, no dependencies (hand-written branch & bound).

## Data (`data/`)

| File | Source |
| --- | --- |
| `rncp_21.json` | title conditions (gcc.42.fr rules) |
| `projects_21.json` | projects: XP, duration, slug, children (42 API) |
| `experience_21.json` | level → XP curve (42 API) |
| `rules.json` | hand-written: prerequisites (intra holy graph), common core, exclusions |

## Model

- XP, project-count and per-category conditions of each title, as on gcc.42.fr.
- Prerequisites are added to the plan and count in XP, projects and days.
- Besides the optimum, `--alternatives N` (default 12) keeps the next best plans.
- Optimality is proven for the best plan when the search finishes within budget;
  otherwise the page says so.
