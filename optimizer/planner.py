#!/usr/bin/env python3
"""Optimiseur de parcours RNCP 42 — cursus 21.

Repond a : « quelle liste de projets faire, la plus courte possible, pour
decrocher tel(s) titre(s) RNCP ? », pour chaque combinaison de
rncp6-1 / rncp6-2 / rncp7-1 / rncp7-2.

Conditions modelisees (toutes issues de optimizer/data/rncp_21.json, donnees reelles 42) :
  - niveau de cursus requis  : 17 (RNCP 6) / 21 (RNCP 7)  -> seuil d'XP total
  - par categorie d'option   : XP minimum ET nombre minimum de projets
  - 2 experiences pro        : stage / alternance / startup
  - 1 projet « suite »       : un des gros projets de fin
  - prerequis                : chaines sequentielles (optimizer/data/rules.json)
  - piscines                 : comptent pour 1 projet, XP = somme des modules

Zero dependance externe : branch & bound exact en Python pur.

Usage:
    python3 planner.py                              # toutes les combinaisons
    python3 planner.py --level 14 --verbose
    python3 planner.py --combo rncp6-1+rncp7-2 --verbose
    python3 planner.py --json out.json
"""
from __future__ import annotations

import argparse
import json
import os
import statistics
from itertools import combinations

DATA = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "data"))
DAY = 86400.0
INF = float("inf")

TITLE_KEYS = ("rncp6-1", "rncp6-2", "rncp7-1", "rncp7-2")


def _load(name):
    with open(os.path.join(DATA, name)) as fh:
        return json.load(fh)


# ══════════════════════════════════════════════════════════════ donnees ══════
class Dataset:
    def __init__(self, time_model="clamped", chains_off=()):
        self.time_model = time_model
        self.chains_off = frozenset(chains_off)
        raw = _load("projects_21.json")["projects"]
        self.projects = {p["id"]: p for p in raw}
        self.rules = _load("rules.json")
        self.levels = {int(l["level"]): float(l["experience"])
                       for l in _load("experience_21.json")["levels"]}

        self.common_core = set(self.rules["common_core"]["projects"])
        self.excluded = {int(k): v for k, v in self.rules["excluded"]["projects"].items()}
        self.min_completions = self.rules["availability"]["min_completions"]

        self._build_titles(_load("rncp_21.json"))
        self._build_durations()
        self._build_groups()

    # ── titres et pools ──
    def _build_titles(self, raw):
        order = {m["index"]: m["key"] for m in self.rules["titles"]["map"]}
        self.titles = {}
        for idx, t in enumerate(raw["rncp"]):
            key = order.get(idx, f"rncp-{idx}")
            lvl = int(t["level"])
            self.titles[key] = {
                "key": key, "type": t["type"], "name": t["title"],
                "level": lvl, "level_xp": self.levels[lvl],
                "n_events": int(t["number_of_events"]),
                "n_experiences": int(t["number_of_experiences"]),
                "n_suite": int(t["number_of_suite"]),
                "options": [{"title": o["title"], "min_xp": int(o["experience"]),
                             "min_n": int(o["number_of_projects"]),
                             "pool": set(o["projects"])} for o in t["options"]],
            }
        self.suite_pool = set(raw["suite"]["projects"])
        self.exp_pool = set(raw["experience"]["projects"])
        self.group_pool = set(raw.get("group", {}).get("projects", []))
        for t, rt in zip(self.titles.values(), raw["rncp"]):
            t["n_group"] = int(rt.get("number_of_group", 0))
        self.rncp_pool = set(self.suite_pool) | set(self.exp_pool) | self.group_pool
        for t in self.titles.values():
            for o in t["options"]:
                self.rncp_pool |= o["pool"]

    # ── modele de duree ───────────────────────────────────────────────────────
    # L'intra expose un champ `duration` tres incoherent : de 0,37 a 20 jours
    # pour 1000 XP selon les projets (facteur 50 pour un meme effort). On le
    # garde comme signal, borne autour d'une estimation proportionnelle.
    CLAMP_LO, CLAMP_HI = 0.5, 2.0

    def _build_durations(self):
        self.override_days = {int(k): float(v) for k, v in
                              self.rules.get("duration_overrides", {})
                              .get("days", {}).items()}
        rates = [(p["duration"] / DAY) / (p["difficulty"] / 1000.0)
                 for p in self.projects.values()
                 if p["difficulty"] > 0 and p.get("duration", 0) > 0
                 and p.get("completions", 0) >= 5 and p["id"] not in self.override_days]
        self.rate = statistics.median(rates) if rates else 2.5  # jours / 1000 XP

        self._days, self.days_source = {}, {}
        for pid, p in self.projects.items():
            xp = p["difficulty"] or 0
            est = xp / 1000.0 * self.rate
            if pid in self.override_days:
                self._days[pid], self.days_source[pid] = self.override_days[pid], "curee"
                continue
            raw_days = (p.get("duration") or 0) / DAY
            if self.time_model == "xp" or raw_days <= 0:
                self._days[pid] = est
                self.days_source[pid] = "estimee" if raw_days <= 0 else "proportionnelle"
            elif self.time_model == "raw":
                self._days[pid], self.days_source[pid] = raw_days, "intra"
            else:
                lo, hi = est * self.CLAMP_LO, est * self.CLAMP_HI
                if raw_days < lo:
                    self._days[pid], self.days_source[pid] = lo, "bornee-bas"
                elif raw_days > hi:
                    self._days[pid], self.days_source[pid] = hi, "bornee-haut"
                else:
                    self._days[pid], self.days_source[pid] = raw_days, "intra"

    # ── groupes de choix ──────────────────────────────────────────────────────
    def _build_groups(self):
        """Un groupe = une decision. Trois formes :
        single : un projet, pris ou pas
        chain  : suite de prerequis, on ne peut prendre qu'un prefixe
        bundle : une piscine = 1 projet au sens RNCP, XP = somme des modules
        """
        kids_of = {}
        for p in self.projects.values():
            ids = [c["id"] if isinstance(c, dict) else c for c in (p.get("children") or [])]
            if ids:
                kids_of[p["id"]] = [i for i in ids if i in self.projects]
        child_ids = {c for v in kids_of.values() for c in v}

        in_chain = {}
        self.chains = []
        for c in self.rules["chains"]:
            if c["id"] in self.chains_off:
                continue  # prerequis desactive : les projets redeviennent independants
            ids = [i for i in c["projects"] if i in self.projects and i not in self.excluded]
            if not ids:
                continue
            ci = len(self.chains)
            self.chains.append({**c, "projects": ids})
            for i in ids:
                in_chain[i] = ci

        self.groups, self.risky, self.bundles = [], set(), {}
        pending = {}  # unit -> groupe, avant regroupement par prerequis

        # bundles : piscines et conteneurs
        for cid, kids in sorted(kids_of.items()):
            if cid in self.excluded or cid in in_chain or cid in self.common_core:
                continue
            own = self.projects[cid]["difficulty"] or 0
            live = [k for k in kids if k not in self.excluded]
            kids_xp = sum(self.projects[k]["difficulty"] or 0 for k in live)
            if own <= 0 and kids_xp <= 0:
                continue
            in_pool = cid in self.rncp_pool
            comp = max([self.projects[cid].get("completions", 0)]
                       + [self.projects[k].get("completions", 0) for k in live])
            if comp < self.min_completions:
                if not in_pool:
                    continue
                self.risky.add(cid)
            if own > 0:
                ids, xp, days = (cid,), float(own), self._days[cid]
            else:
                ids = tuple([cid] + live)
                xp = float(kids_xp)
                days = sum(self._days[k] for k in live)
            self.bundles[cid] = ids
            pending[cid] = {
                "kind": "bundle", "key": f"b{cid}", "label": self.name(cid),
                "unit": cid,
                "choices": [{"ids": (), "cost": 0, "xp": 0.0, "days": 0.0},
                            {"ids": ids, "cost": 1, "xp": xp, "days": days}]}

        # chaines de prerequis
        for ch in self.chains:
            choices = [{"ids": (), "cost": 0, "xp": 0.0, "days": 0.0}]
            for k in range(1, len(ch["projects"]) + 1):
                pref = tuple(ch["projects"][:k])
                choices.append({"ids": pref, "cost": k,
                                "xp": float(sum(self.xp(i) for i in pref)),
                                "days": sum(self._days[i] for i in pref)})
            self.groups.append({"kind": "chain", "key": ch["id"], "label": ch["label"],
                                "unit": ch["projects"][0], "choices": choices})

        # projets simples
        covered = set(child_ids) | set(self.bundles) | set(in_chain)
        for pid, p in sorted(self.projects.items(), key=lambda kv: -(kv[1]["difficulty"] or 0)):
            if pid in covered or pid in self.excluded or pid in self.common_core:
                continue
            if not p["difficulty"]:
                continue
            in_pool = pid in self.rncp_pool
            if p.get("completions", 0) < self.min_completions:
                if not in_pool:
                    continue
                self.risky.add(pid)
            pending[pid] = {
                "kind": "single", "key": f"p{pid}", "label": self.name(pid), "unit": pid,
                "choices": [{"ids": (), "cost": 0, "xp": 0.0, "days": 0.0},
                            {"ids": (pid,), "cost": 1, "xp": float(p["difficulty"]),
                             "days": self._days[pid]}]}

        self._build_prereqs(pending)

    def _build_prereqs(self, pending):
        """Prerequis intra (holy graph) : un projet ne se debloque qu'une fois ses
        prerequis valides. Chaque composante connexe du graphe devient un groupe
        « dag » dont les choix sont ses ideaux (ensembles clos par prerequis) :
        prendre kfs-4 inclut kfs-1..3, et leurs XP, jours et nombre de projets.
        Un prerequis indisponible rend le projet indisponible.
        """
        raw = {int(k): [int(x) for x in v]
               for k, v in self.rules.get("prereqs", {}).get("projects", {}).items()}
        self.prereqs = {}
        dead = set()
        changed = True
        while changed:
            changed = False
            for a, bs in raw.items():
                if a not in pending or a in dead:
                    continue
                if any(b in dead or (b not in pending and b not in self.common_core)
                       for b in bs):
                    dead.add(a)
                    changed = True
        for a, bs in raw.items():
            if a in pending and a not in dead:
                need = [b for b in bs if b in pending]
                if need:
                    self.prereqs[a] = need
        adj = {}
        for a, bs in self.prereqs.items():
            for b in bs:
                adj.setdefault(a, set()).add(b)
                adj.setdefault(b, set()).add(a)
        comp_of, comps = {}, []
        for start in sorted(adj):
            if start in comp_of:
                continue
            stack, comp = [start], []
            comp_of[start] = len(comps)
            while stack:
                x = stack.pop()
                comp.append(x)
                for y in adj[x]:
                    if y not in comp_of:
                        comp_of[y] = len(comps)
                        stack.append(y)
            comps.append(sorted(comp))
        self.unit_ids = {u: g["choices"][1]["ids"] for u, g in pending.items()}
        for u in sorted(pending, key=lambda u: -max(ch["xp"] for ch in pending[u]["choices"])):
            if u in dead or u in comp_of:
                continue
            self.groups.append(pending[u])
        for comp in comps:
            topo, placed = [], set()
            while len(topo) < len(comp):
                for u in comp:
                    if u not in placed and all(b in placed for b in self.prereqs.get(u, ())):
                        topo.append(u)
                        placed.add(u)
            ideals = [()]
            for u in topo:  # topo : les prerequis de u sont deja decides
                nxt = []
                for s in ideals:
                    nxt.append(s)
                    if all(b in s for b in self.prereqs.get(u, ())):
                        nxt.append(s + (u,))
                ideals = nxt
            choices = []
            for s in ideals:
                ids = tuple(i for u in s for i in self.unit_ids[u])
                choices.append({"ids": ids, "units": s, "cost": len(s),
                                "xp": float(sum(self.xp(i) for i in ids)),
                                "days": sum(self._days[i] for i in ids)})
            sinks = [u for u in comp if not any(u in self.prereqs.get(v, ()) for v in comp)]
            label = " / ".join(self.name(u) for u in sinks[:2]) + (" …" if len(sinks) > 2 else "")
            self.groups.append({"kind": "dag", "key": f"d{topo[0]}", "label": label,
                                "unit": topo[0], "choices": choices})
        self.dag_of = comp_of

    def prereq_closure(self, pid):
        out, stack = [], list(self.prereqs.get(pid, ()))
        while stack:
            b = stack.pop()
            if b not in out:
                out.append(b)
                stack.extend(self.prereqs.get(b, ()))
        return out

    # ── helpers ──
    def xp_pool(self, pool):
        """Pool XP : une piscine apporte l'XP de tous ses modules (gcc compte
        chaque module), mais ne compte qu'une fois en nombre de projets."""
        out = set(pool)
        for c in pool:
            out |= set(self.bundles.get(c, ()))
        return out

    def name(self, pid):
        return (self.projects[pid]["name"] or "").strip() or f"#{pid}"

    def xp(self, pid):
        return self.projects[pid]["difficulty"] or 0

    def days(self, pid):
        return self._days.get(pid, 0.0)

    def level_for_xp(self, xp):
        return max((lv for lv, need in self.levels.items() if xp >= need), default=0)

    def tags(self, pid):
        t = []
        if pid in self.suite_pool:
            t.append("suite")
        if pid in self.exp_pool:
            t.append("exp")
        if pid in self.risky:
            t.append("0 validation")
        return t


# ══════════════════════════════════════════════════════════ contraintes ══════
class Constraint:
    __slots__ = ("label", "kind", "need", "contrib", "suffix_max", "dp", "dp_cnt",
                 "mask", "slotset")

    def __init__(self, label, kind, need):
        self.label, self.kind, self.need = label, kind, need


def build_slots(ds, done, banned=frozenset()):
    """Copie les groupes en retirant ce qui est deja valide.

    Cout d'un choix = nombre de projets a valider. Une piscine compte pour 1 :
    l'intra la compte comme un projet dans les listes RNCP, et on s'y inscrit une
    seule fois, meme si elle contient neuf modules. Une chaine de prerequis au
    contraire coute son nombre de maillons : prendre kfs-4 oblige a faire kfs-1,
    2 et 3, et ces trois-la sont bien trois projets de plus.
    """
    slots = []
    for g in ds.groups:
        uniq, seen = [], set()
        for ch in g["choices"]:
            ids = tuple(i for i in ch["ids"] if i not in done)
            if ch["ids"] and not ids:
                continue
            if banned and not banned.isdisjoint(ids):
                continue
            if ids in seen:
                continue
            seen.add(ids)
            if g["kind"] == "bundle":
                cost = 1 if ids else 0
            elif g["kind"] == "dag":
                cost = sum(1 for u in ch["units"]
                           if any(i not in done for i in ds.unit_ids[u]))
            else:
                cost = len(ids)
            uniq.append({"ids": ids, "cost": cost,
                         "xp": float(sum(ds.xp(i) for i in ids)),
                         "days": sum(ds.days(i) for i in ids)})
        if len(uniq) < 2:
            continue
        slots.append({**g, "choices": uniq, "_idx": len(slots)})
    return slots


def relevant_pool(ds, combo):
    """Tous les projets qui comptent pour une condition de cette combinaison."""
    pool = set(ds.suite_pool) | set(ds.exp_pool) | set(ds.group_pool)
    for key in combo:
        for o in ds.titles[key]["options"]:
            pool |= o["pool"]
    return pool


def prune_fillers(ds, combo, slots, objective, cap):
    """Un projet hors pool ne sert qu'a monter en niveau. Ces « bouche-trous »
    sont interchangeables : seuls les plus gros comptent.

    Reduction sure pour l'objectif « nombre de projets » : toute solution tient
    en `cap` projets, donc en au plus `cap` bouche-trous ; si une solution en
    utilise un hors des `cap` meilleurs, c'est qu'un des `cap` meilleurs est
    libre, et l'echanger ne peut qu'augmenter l'XP a nombre egal.

    Pour l'objectif temps le cout n'est plus le nombre mais la duree : deux
    bouche-trous de meme XP ne sont plus interchangeables sans risque, donc on
    ne retire rien. `mode='both'` garde en plus le front de Pareto (XP/jours)
    pour que le departage sur la duree ait du choix.
    """
    if objective == "days":
        return slots
    pool = relevant_pool(ds, combo)
    keep, fillers = [], []
    for s in slots:
        useful = any(i in pool for ch in s["choices"] for i in ch["ids"])
        if useful or s["kind"] in ("chain", "dag"):
            keep.append(s)
        else:
            fillers.append(s)

    def best(s):
        return max((ch for ch in s["choices"] if ch["ids"]), key=lambda ch: ch["xp"])

    by_xp = sorted(fillers, key=lambda s: (-best(s)["xp"], best(s)["days"]))
    chosen = by_xp[:max(1, cap)]
    if objective == "both":
        front, top = [], -1.0
        for s in sorted(fillers, key=lambda s: (best(s)["days"], -best(s)["xp"])):
            if best(s)["xp"] > top:
                front.append(s)
                top = best(s)["xp"]
        seen = {id(s) for s in chosen}
        chosen = chosen + [s for s in front if id(s) not in seen]
    keep += chosen
    for i, s in enumerate(keep):
        s["_idx"] = i
    return keep


def build_constraints(ds, combo, slots, base_xp, done):
    cons = []

    def add(label, kind, need, value_of):
        if need <= 0:
            return
        c = Constraint(label, kind, float(need))
        c.contrib = [[float(value_of(ch["ids"])) for ch in s["choices"]] for s in slots]
        cons.append(c)

    top = max(combo, key=lambda k: ds.titles[k]["level"])
    add(f"Niveau {ds.titles[top]['level']}", "xp", ds.titles[top]["level_xp"] - base_xp,
        lambda ids: sum(ds.xp(i) for i in ids))

    seen = set()
    for key in combo:
        for o in ds.titles[key]["options"]:
            sig = (o["title"], o["min_xp"], o["min_n"])
            if sig in seen:
                continue
            seen.add(sig)
            pool, xpool = o["pool"], ds.xp_pool(o["pool"])
            add(f"{o['title']} · XP", "xp",
                o["min_xp"] - sum(ds.xp(i) for i in done if i in xpool),
                lambda ids, xpool=xpool: sum(ds.xp(i) for i in ids if i in xpool))
            add(f"{o['title']} · projets", "count",
                o["min_n"] - sum(1 for i in done if i in pool),
                lambda ids, pool=pool: sum(1 for i in ids if i in pool))

    add("Experiences pro", "count",
        max(ds.titles[k]["n_experiences"] for k in combo)
        - sum(1 for i in done if i in ds.exp_pool),
        lambda ids: sum(1 for i in ids if i in ds.exp_pool))
    add("Projet suite", "count",
        max(ds.titles[k]["n_suite"] for k in combo)
        - sum(1 for i in done if i in ds.suite_pool),
        lambda ids: sum(1 for i in ids if i in ds.suite_pool))
    add("Projets de groupe", "count",
        max(ds.titles[k]["n_group"] for k in combo)
        - sum(1 for i in done if i in ds.group_pool),
        lambda ids: sum(1 for i in ids if i in ds.group_pool))
    return cons


# ═══════════════════════════════════════════════════ branch and bound ════════
class Solver:
    """objective='projects' : approfondissement iteratif, optimum prouve.
    objective='days'      : B&B amorce par un glouton, borne DP, budget de noeuds.
    """

    DAYS_BUCKET = 10.0

    def __init__(self, slots, constraints, objective="projects", node_budget=1_500_000,
                 max_count=None):
        self.cons, self.objective, self.node_budget = constraints, objective, node_budget
        self.max_count = max_count
        self.nodes = 0
        for s in slots:
            for ch in s["choices"]:
                if objective == "projects":
                    ch["c1"], ch["c2"] = float(ch["cost"]), ch["days"]
                else:
                    ch["c1"], ch["c2"] = ch["days"], float(ch["cost"])

        self._prune_dominated(slots)

        def rank(s):
            real = [ch for ch in s["choices"] if ch["ids"]]
            # a nombre de projets plafonne, on doit viser l'XP d'abord : sinon la
            # descente epuise son budget sur des petits projets et ne trouve rien.
            if objective == "projects" or max_count is not None:
                return -max((ch["xp"] for ch in real), default=0.0)
            return -max((ch["xp"] / ch["days"]) if ch["days"] > 0 else INF for ch in real)

        slots.sort(key=rank)
        order = [s["_idx"] for s in slots]
        for i, s in enumerate(slots):
            s["_idx"] = i
        for c in self.cons:
            c.contrib = [c.contrib[i] for i in order]
        self.slots, self.n = slots, len(slots)
        self._build_bounds()
        self.best, self.best_cost = None, (INF, INF)

    def _prune_dominated(self, slots):
        """Groupes « dag » : beaucoup d'ideaux ne servent a rien pour une
        combinaison donnee. On retire ceux qu'un autre choix bat partout
        (apport >= sur chaque condition, cout et duree <=)."""
        for s in slots:
            if len(s["choices"]) <= 2:
                continue
            i = s["_idx"]
            vec = [tuple(c.contrib[i][j] for c in self.cons) for j in range(len(s["choices"]))]
            keep = []
            for j, ch in enumerate(s["choices"]):
                dom = False
                for k, o in enumerate(s["choices"]):
                    if k == j:
                        continue
                    if (o["c1"] <= ch["c1"] + 1e-9 and o["c2"] <= ch["c2"] + 1e-9
                            and all(x >= y - 1e-9 for x, y in zip(vec[k], vec[j]))
                            and (o["c1"], o["c2"], vec[k]) != (ch["c1"], ch["c2"], vec[j])
                            or (k < j and (o["c1"], o["c2"], vec[k]) == (ch["c1"], ch["c2"], vec[j]))):
                        dom = True
                        break
                if not dom or not ch["ids"]:
                    keep.append(j)
            if len(keep) < len(s["choices"]):
                s["choices"] = [s["choices"][j] for j in keep]
                for c in self.cons:
                    c.contrib[i] = [c.contrib[i][j] for j in keep]

    def _build_bounds(self):
        n = self.n
        ccost = [[int(ch["cost"]) for ch in s["choices"]] for s in self.slots]
        self.ckmax = min(45, sum(max(c) for c in ccost))
        if self.objective == "projects":
            self.icost, self.kmax = ccost, self.ckmax
        else:
            B = self.DAYS_BUCKET
            self.icost = [[int(ch["days"] // B) for ch in s["choices"]] for s in self.slots]
            self.kmax = min(300, sum(max(c) for c in self.icost))

        def table(cost, K, val):
            dp = [None] * (n + 1)
            dp[n] = [0.0] * (K + 1)
            for i in range(n - 1, -1, -1):
                prev, cur, ci, vi = dp[i + 1], [0.0] * (K + 1), cost[i], val[i]
                for k in range(K + 1):
                    best = 0.0
                    for j, ck in enumerate(ci):
                        if ck <= k:
                            v = vi[j] + prev[k - ck]
                            if v > best:
                                best = v
                    cur[k] = best
                dp[i] = cur
            return dp

        for c in self.cons:
            smax = [0.0] * (n + 1)
            for i in range(n - 1, -1, -1):
                smax[i] = smax[i + 1] + max(c.contrib[i])
            c.suffix_max = smax
            c.dp = table(self.icost, self.kmax, c.contrib)
            c.dp_cnt = c.dp if self.objective == "projects" else \
                table(ccost, self.ckmax, c.contrib)
            c.slotset = frozenset(i for i in range(n) if max(c.contrib[i]) > 0)

        # Deux conditions dont les pools de projets sont disjoints exigent des
        # projets differents : leurs bornes inferieures s'additionnent. On
        # precalcule qui recouvre qui pour exploiter ca a chaque noeud.
        m = len(self.cons)
        for a, ca in enumerate(self.cons):
            mask = 1 << a
            for b, cb in enumerate(self.cons):
                if b != a and (ca.slotset & cb.slotset):
                    mask |= 1 << b
            ca.mask = mask

    def _per_constraint_lb(self, i, got, dp_attr, K):
        """Pour chaque condition non encore remplie : cout minimal pour la
        remplir seule. INF si plus atteignable."""
        out = []
        for k, c in enumerate(self.cons):
            gap = c.need - got[k]
            if gap <= 1e-9:
                continue
            dpi = getattr(c, dp_attr)[i]
            if dpi[K] < gap - 1e-9:
                return None
            lo, hi = 0, K
            while lo < hi:
                mid = (lo + hi) // 2
                if dpi[mid] >= gap - 1e-9:
                    hi = mid
                else:
                    lo = mid + 1
            out.append((lo, k))
        return out

    @staticmethod
    def _combine(lbs, cons):
        """max( borne individuelle , somme sur des conditions disjointes )."""
        if not lbs:
            return 0
        best = max(v for v, _ in lbs)
        blocked, total = 0, 0
        for v, k in sorted(lbs, reverse=True):
            if blocked & (1 << k):
                continue
            total += v
            blocked |= cons[k].mask
        return max(best, total)

    def _lb(self, i, got):
        lbs = self._per_constraint_lb(i, got, "dp", self.kmax)
        if lbs is None:
            return INF
        v = self._combine(lbs, self.cons)
        return float(v) if self.objective == "projects" else v * self.DAYS_BUCKET

    def _lb_count(self, i, got):
        lbs = self._per_constraint_lb(i, got, "dp_cnt", self.ckmax)
        if lbs is None:
            return INF
        return self._combine(lbs, self.cons)

    def _greedy(self):
        """Glouton avec ameliorations : un groupe deja pris peut passer a un
        choix plus grand (ex. ajouter kfs-3 a kfs-1..2)."""
        cons = self.cons
        got, cur = [0.0] * len(cons), [None] * self.n
        c1 = c2 = 0.0

        def value(k, x):
            return min(x, cons[k].need) / cons[k].need if cons[k].need > 0 else 0.0

        for _ in range(4 * self.n + 10):
            if all(got[k] >= c.need - 1e-9 for k, c in enumerate(cons)):
                break
            best = None
            for i in range(self.n):
                j0 = cur[i]
                o1 = self.slots[i]["choices"][j0]["c1"] if j0 is not None else 0.0
                for j, ch in enumerate(self.slots[i]["choices"]):
                    if j == j0 or not ch["ids"]:
                        continue
                    gain = 0.0
                    for k, c in enumerate(cons):
                        d = c.contrib[i][j] - (c.contrib[i][j0] if j0 is not None else 0.0)
                        if d:
                            gain += value(k, got[k] + d) - value(k, got[k])
                    if gain <= 1e-12:
                        continue
                    sc = gain / max(ch["c1"] - o1, 1e-6)
                    if best is None or sc > best[0]:
                        best = (sc, i, j)
            if best is None:
                return
            _, i, j = best
            j0 = cur[i]
            if j0 is not None:
                old = self.slots[i]["choices"][j0]
                c1, c2 = c1 - old["c1"], c2 - old["c2"]
                for k, c in enumerate(cons):
                    got[k] -= c.contrib[i][j0]
            ch = self.slots[i]["choices"][j]
            c1, c2 = c1 + ch["c1"], c2 + ch["c2"]
            for k, c in enumerate(cons):
                got[k] += c.contrib[i][j]
            cur[i] = j
        if all(got[k] >= c.need - 1e-9 for k, c in enumerate(cons)):
            self.best = [(i, j) for i, j in enumerate(cur) if j is not None]
            self.best_cost = (c1, c2)

    def local_search(self, max_count=None):
        """Ameliore la meilleure solution par echanges : retirer un choix,
        remplacer un choix par un autre (meme groupe ou autre groupe), ou en
        remplacer deux par un. Le B&B en temps a un budget borne ; ces echanges
        recuperent l'essentiel de l'ecart sur les grosses combinaisons."""
        if self.best is None:
            return
        cons, nk = self.cons, len(self.cons)
        cur = {i: j for i, j in self.best}

        def totals(cur):
            got, c1, c2, cnt = [0.0] * nk, 0.0, 0.0, 0
            for i, j in cur.items():
                ch = self.slots[i]["choices"][j]
                c1, c2, cnt = c1 + ch["c1"], c2 + ch["c2"], cnt + ch["cost"]
                for k, c in enumerate(cons):
                    got[k] += c.contrib[i][j]
            return got, (c1, c2), cnt

        def ok(got, cnt):
            return (all(got[k] >= c.need - 1e-9 for k, c in enumerate(cons))
                    and (max_count is None or cnt <= max_count))

        got, cost, cnt = totals(cur)
        if not ok(got, cnt):
            return
        moves = [(i, j) for i in range(self.n)
                 for j, ch in enumerate(self.slots[i]["choices"]) if ch["ids"]]
        improved = True
        while improved:
            improved = False
            keys = list(cur)
            cands = [[k] for k in keys] + [[a, b] for x, a in enumerate(keys) for b in keys[x + 1:]]
            for out in cands:
                base = {i: j for i, j in cur.items() if i not in out}
                for i, j in [(None, None)] + moves:
                    trial = dict(base)
                    if i is not None:
                        if i in base or (len(out) == 1 and i == out[0] and j == cur[i]):
                            continue
                        trial[i] = j
                    g, cst, cn = totals(trial)
                    if cst < cost and ok(g, cn):
                        cur, cost, got, cnt = trial, cst, g, cn
                        improved = True
                        break
                if improved:
                    break
        self.best, self.best_cost = sorted(cur.items()), cost

    def seed_with(self, ids):
        """Borne superieure de depart a partir d'un plan deja connu."""
        want, picked, got = set(ids), [], [0.0] * len(self.cons)
        c1 = c2 = 0.0
        for i, s in enumerate(self.slots):
            cand = [(j, ch) for j, ch in enumerate(s["choices"])
                    if ch["ids"] and set(ch["ids"]) <= want]
            if not cand:
                continue
            j, ch = max(cand, key=lambda t: len(t[1]["ids"]))
            picked.append((i, j))
            c1, c2 = c1 + ch["c1"], c2 + ch["c2"]
            for k, c in enumerate(self.cons):
                got[k] += c.contrib[i][j]
        if all(got[k] >= c.need - 1e-9 for k, c in enumerate(self.cons)):
            self.best, self.best_cost = picked, (c1, c2)
            return True
        return False

    def solve(self):
        if not self.cons:
            return [], (0.0, 0.0), 0, True
        if self.best is None:
            self._greedy()
        if self.objective == "days":
            self._dfs(0, [], [0.0] * len(self.cons), 0.0, 0.0, 0)
            return self.best, self.best_cost, self.nodes, self.nodes <= self.node_budget
        seed, seed_cost = self.best, self.best_cost
        lb0 = self._lb(0, [0.0] * len(self.cons))
        if lb0 == INF:
            return None, (INF, INF), self.nodes, True
        ub = int(seed_cost[0]) if seed else sum(max(c) for c in self.icost)
        for cap in range(int(lb0), ub + 1):
            self.best, self.best_cost = None, (cap + 1.0, INF)
            self._dfs(0, [], [0.0] * len(self.cons), 0.0, 0.0, 0)
            if self.best is not None:
                return self.best, self.best_cost, self.nodes, True
            if self.nodes > self.node_budget:
                return seed, seed_cost, self.nodes, False
        return seed, seed_cost, self.nodes, True

    def _dfs(self, i, picked, got, c1, c2, cnt):
        self.nodes += 1
        if self.nodes > self.node_budget:
            return
        if all(got[k] >= c.need - 1e-9 for k, c in enumerate(self.cons)):
            if (c1, c2) < self.best_cost:
                self.best_cost, self.best = (c1, c2), list(picked)
            return
        if i >= self.n:
            return
        for k, c in enumerate(self.cons):
            if got[k] + c.suffix_max[i] < c.need - 1e-9:
                return
        if self.max_count is not None:
            lbc = self._lb_count(i, got)
            if lbc == INF or cnt + lbc > self.max_count:
                return
        lb = self._lb(i, got)
        if lb == INF or (c1 + lb, c2) >= self.best_cost:
            return
        slot = self.slots[i]
        for j in sorted(range(len(slot["choices"])), key=lambda j: -slot["choices"][j]["xp"]):
            ch = slot["choices"][j]
            nc1, nc2 = c1 + ch["c1"], c2 + ch["c2"]
            ncnt = cnt + ch["cost"]
            if self.max_count is not None and ncnt > self.max_count:
                continue
            if (nc1, nc2) >= self.best_cost:
                continue
            if ch["ids"]:
                ng = got[:]
                for k, c in enumerate(self.cons):
                    ng[k] += c.contrib[i][j]
                picked.append((i, j))
                self._dfs(i + 1, picked, ng, nc1, nc2, ncnt)
                picked.pop()
            else:
                self._dfs(i + 1, picked, got, nc1, nc2, ncnt)


# ═════════════════════════════════════════════════════════ orchestration ═════
def all_combos(keys=TITLE_KEYS):
    """Les 15 combinaisons non vides : 4 titres seuls, 6 paires, 4 triplets, 1 quadruplet."""
    return [tuple(c) for r in range(1, len(keys) + 1) for c in combinations(keys, r)]


def check(ds, combo, ids, base_xp, done):
    sel = set(ids) | set(done)
    rows = []
    top = max(combo, key=lambda k: ds.titles[k]["level"])
    total = base_xp + sum(ds.xp(i) for i in ids)
    need = ds.titles[top]["level_xp"]
    rows.append({"label": f"Niveau {ds.titles[top]['level']}", "need": int(need),
                 "have": int(total), "unit": "xp", "ok": total >= need - 1e-6})
    seen = set()
    for key in combo:
        for o in ds.titles[key]["options"]:
            sig = (o["title"], o["min_xp"], o["min_n"])
            if sig in seen:
                continue
            seen.add(sig)
            hx = sum(ds.xp(i) for i in sel if i in ds.xp_pool(o["pool"]))
            hn = sum(1 for i in sel if i in o["pool"])
            rows.append({"label": f"{o['title']} · XP", "need": o["min_xp"], "have": int(hx),
                         "unit": "xp", "ok": hx >= o["min_xp"]})
            rows.append({"label": f"{o['title']} · projets", "need": o["min_n"], "have": hn,
                         "unit": "n", "ok": hn >= o["min_n"]})
    for label, pool, n in (
        ("Experiences pro", ds.exp_pool, max(ds.titles[k]["n_experiences"] for k in combo)),
        ("Projet suite", ds.suite_pool, max(ds.titles[k]["n_suite"] for k in combo)),
        ("Projets de groupe", ds.group_pool, max(ds.titles[k]["n_group"] for k in combo)),
    ):
        have = sum(1 for i in sel if i in pool)
        rows.append({"label": label, "need": n, "have": have, "unit": "n", "ok": have >= n})
    rows.append({"label": "Events", "need": max(ds.titles[k]["n_events"] for k in combo),
                 "have": None, "unit": "n", "ok": None})
    return rows


def _plan(ds, combo, base_xp, done, solver, best, nodes, proven):
    units, ids = [], []
    for (i, j) in best:
        slot, ch = solver.slots[i], solver.slots[i]["choices"][j]
        units.append({"label": slot["label"], "kind": slot["kind"], "unit": slot["unit"],
                      "ids": list(ch["ids"]), "n": len(ch["ids"]),
                      "xp": int(ch["xp"]), "days": round(ch["days"], 1)})
        ids.extend(ch["ids"])
    ids = list(dict.fromkeys(ids))
    units.sort(key=lambda u: -u["xp"])
    # lignes affichables : une piscine = une ligne, ses modules sont dedans
    rows, inside = [], set()
    for c, bids in ds.bundles.items():
        if c in ids:
            inside |= set(bids) - {c}
    for i in ids:
        if i not in inside:
            rows.append(i)
    return {"feasible": True, "units": units, "projects": ids, "rows": rows,
            "n": len(rows), "n_raw": len(ids), "units_n": len(units),
            "days": round(sum(ds.days(i) for i in ids), 1),
            "xp": sum(ds.xp(i) for i in ids), "nodes": nodes, "proven": proven,
            "days_proven": proven, "checks": check(ds, combo, ids, base_xp, done)}


_INFEASIBLE = {"feasible": False, "units": [], "projects": [], "rows": [], "n": 0,
               "n_raw": 0, "units_n": 0, "days": 0.0, "xp": 0, "nodes": 0,
               "proven": True, "days_proven": True, "checks": []}


def solve_combo(ds, combo, base_xp, done, objective, budget=400_000,
                banned=frozenset()):
    """objective='projects' : nombre de projets minimal (prouve), puis le plan
    le plus court a ce nombre -> resultat stable et reproductible.
    objective='days'       : duree totale minimale, sans limite de nombre.
    banned : projets interdits, pour chercher des plans alternatifs.
    """
    def fresh(objective=None, cap=None):
        sl = build_slots(ds, done, banned)
        if objective is not None:
            cons0 = build_constraints(ds, combo, sl, base_xp, done)
            sl = prune_fillers(ds, combo, sl, objective, cap)
            del cons0
        return sl, build_constraints(ds, combo, sl, base_xp, done)

    def probe_ub():
        """Nombre de projets d'une solution gloutonne : majorant de l'optimum."""
        sl = build_slots(ds, done, banned)
        cons = build_constraints(ds, combo, sl, base_xp, done)
        sv = Solver(sl, cons, "projects", 1)
        sv._greedy()
        return int(sv.best_cost[0]) if sv.best is not None else None

    if objective == "days":
        seed = solve_combo(ds, combo, base_xp, done, "projects", budget // 4, banned)
        sl, cons = fresh()
        sv = Solver(sl, cons, "days", budget)
        if seed.get("feasible"):
            sv.seed_with(seed["projects"])
        best, _, nodes, proven = sv.solve()
        if best is None and seed.get("feasible"):
            return seed
        if best is not None and not proven:
            sv.local_search()
            best = sv.best
        if best is None:
            return dict(_INFEASIBLE, nodes=nodes, proven=proven)
        return _plan(ds, combo, base_xp, done, sv, best, nodes, proven)

    # phase 1 : plus petit nombre de projets possible
    ub = probe_ub()
    if ub is None:
        return dict(_INFEASIBLE)
    sl, cons = fresh("projects", ub)
    sv = Solver(sl, cons, "projects", budget)
    best, cost, nodes, proven = sv.solve()
    if best is None:
        return dict(_INFEASIBLE, nodes=nodes, proven=proven)
    n_opt = int(cost[0])
    plan = _plan(ds, combo, base_xp, done, sv, best, nodes, proven)
    if not proven:
        plan["days_proven"] = False
        return plan

    # phase 2 : a nombre de projets fixe, le plan le plus court
    sl2, cons2 = fresh("both", n_opt)
    sv2 = Solver(sl2, cons2, "days", budget, max_count=n_opt)
    sv2.seed_with(plan["projects"])
    best2, cost2, nodes2, proven2 = sv2.solve()
    if best2 is not None and not proven2:
        sv2.local_search(max_count=n_opt)
        best2, cost2 = sv2.best, sv2.best_cost
    if best2 is not None and cost2[0] < plan["days"] - 1e-6:
        p2 = _plan(ds, combo, base_xp, done, sv2, best2, nodes + nodes2, True)
        if p2["n"] <= n_opt:
            p2["days_proven"] = proven2
            return p2
    plan["nodes"] = nodes + nodes2
    plan["days_proven"] = proven2
    return plan


def solve_all(ds, base_xp, done, budget=1_500_000, objectives=("projects", "days")):
    out = {}
    for combo in all_combos():
        out["+".join(combo)] = {
            "combo": list(combo),
            **{f"min_{o}": solve_combo(ds, combo, base_xp, done, o, budget)
               for o in objectives}}
    return out


# ══════════════════════════════════════════════════════════════════ cli ══════
def main():
    ap = argparse.ArgumentParser(description="Optimiseur RNCP 42")
    ap.add_argument("--level", type=int, default=11)
    ap.add_argument("--xp", type=float, default=None)
    ap.add_argument("--done", default="")
    ap.add_argument("--combo", default=None)
    ap.add_argument("--objective", choices=("projects", "days", "both"), default="both")
    ap.add_argument("--time-model", choices=("clamped", "xp", "raw"), default="clamped")
    ap.add_argument("--chains-off", default="",
                    help="ids de chaines de prerequis a ignorer (ex: virus,kfs)")
    ap.add_argument("--json", default=None)
    ap.add_argument("--verbose", action="store_true")
    args = ap.parse_args()

    ds = Dataset(time_model=args.time_model,
                 chains_off={x.strip() for x in args.chains_off.split(",") if x.strip()})
    base_xp = args.xp if args.xp is not None else ds.levels[args.level]
    done = {int(x) for x in args.done.split(",") if x.strip()}

    print(f"groupes de choix: {len(ds.groups)}  (chaines {len(ds.chains)}, "
          f"piscines {len(ds.bundles)})   exclus: {len(ds.excluded)}   "
          f"tronc commun: {len(ds.common_core)}")
    print(f"base: niveau {ds.level_for_xp(base_xp)} = {int(base_xp)} XP   "
          f"taux: {ds.rate:.2f} j/1000 XP   modele temps: {args.time_model}\n")

    combos = [tuple(args.combo.split("+"))] if args.combo else all_combos()
    objs = ("projects", "days") if args.objective == "both" else (args.objective,)
    print(f"{'combinaison':<20} {'min projets':>20} {'min temps':>20}")
    print("-" * 62)
    results = {}
    for combo in combos:
        r = {f"min_{o}": solve_combo(ds, combo, base_xp, done, o) for o in objs}
        results["+".join(combo)] = {"combo": list(combo), **r}

        def fmt(x):
            if not x:
                return " " * 20
            if not x["feasible"]:
                return f"{'IMPOSSIBLE':>20}"
            return f"{x['n']:>3} proj / {x['days']:>5.0f} j{'' if x['proven'] else '~'}".rjust(20)

        print(f"{'+'.join(combo):<20} {fmt(r.get('min_projects'))} {fmt(r.get('min_days'))}")

    if args.verbose:
        for key, r in results.items():
            for obj in objs:
                plan = r.get(f"min_{obj}")
                if not plan or not plan["feasible"]:
                    continue
                flag = "" if plan["proven"] else "  (meilleur trouve, non prouve)"
                print(f"\n=== {key} / min {obj} — {plan['n']} projets, "
                      f"{plan['days']:.0f} j, {plan['xp']:,} XP{flag}")
                for u in plan["units"]:
                    extra = (f" +{u['n']-1} modules" if u["n"] > 1 and u["kind"] == "bundle"
                             else (f" ({u['n']} projets)" if u["n"] > 1 else ""))
                    tg = sorted({t for i in u["ids"] for t in ds.tags(i)})
                    print(f"   {u['xp']:>7} XP {u['days']:>6.0f} j  {u['label'][:40]:<41}"
                          f"{extra}{' ' + ' '.join('[' + t + ']' for t in tg) if tg else ''}")
                print("   conditions:")
                for c in plan["checks"]:
                    mark = "·" if c["ok"] is None else ("ok" if c["ok"] else "KO")
                    print(f"     {mark:>2}  {c['label']:<32} "
                          f"{'?' if c['have'] is None else c['have']} / {c['need']}")

    if args.json:
        with open(args.json, "w") as fh:
            json.dump({"base_xp": base_xp, "results": results}, fh, indent=1)
        print(f"\n-> {args.json}")


if __name__ == "__main__":
    main()
