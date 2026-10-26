# RNCP progress rules

Reviewed on 26 October 2026 against the authenticated 42 articles:

- [RNCP 6](https://meta.intra.42.fr/articles/rncp-6-certificate)
- [RNCP 7](https://meta.intra.42.fr/articles/rncp-7-certificate)

`data/rncp_21.json` owns category membership, thresholds, Suite choices and
professional-experience project IDs. Every category in the selected track,
Suite, and all general requirements must be met. Both RNCP levels require
common core and two post-core group projects.

`data/rncp_rules_21.json` owns the completion-project ID for each piscine,
its ordered modules, the common-core terminal project, and group-project IDs.
The group list was checked against 42's cursus-21 project-session metadata:
all applicable sessions must have `solo: false`; exam and professional-
experience projects are excluded. Mixed solo/group settings require an explicit
campus-specific rule before being added. Validation dates must fall after the
common-core terminal validation. Missing dates never imply completion.

A piscine earns one project when its final module is validated. Its XP is the
sum of individually validated modules, using their marks. A simulation adds
only unearned module XP. Marks and coalition bonuses for individual planned
modules persist under the parent plan. Already-earned modules remain part of
the starting level and are not awarded again by calculator hydration.

Each distinct validated professional-experience ID contributes one experience,
including apprenticeship terminal milestones and the newer full-time
apprenticeship projects. Part-time work is not in this list.

The flat project index retains nested project IDs so experience milestones can
be looked up directly. Parent trees are a presentation/calculation view of the
same index; they are not extra project completions.

Run `npm test -- --ci --runInBand`, `npm run typecheck` and `npm run build`
after changing these rules. Update the checked date and tests with the data.
The RNCP tests use synthetic profiles and make no live API calls.
