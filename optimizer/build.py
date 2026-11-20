#!/usr/bin/env python3
"""Genere src/data/planner.json, lu par la page /planner du site Next.js.

Calcule, pour un etat de depart donne (XP actuels + projets deja valides), les
15 combinaisons de titres RNCP, et cela pour chaque reglage des chaines de
prerequis (chaque chaine activable ou non depuis la page).

    python3 build.py                                  # etat par defaut
    python3 build.py --xp 167758 --done 1396,1405     # un etat reel
    python3 build.py --level 17
    python3 build.py --no-variants                    # 1 seul reglage, rapide
"""
from __future__ import annotations

import argparse
import datetime
import json
import os
import time
from concurrent.futures import ProcessPoolExecutor

import planner as pl

HERE = os.path.dirname(os.path.abspath(__file__))

KIND = {1: "single", 2: "pair", 3: "triple", 4: "quad"}

CAT_CODE = {
    "Web": "W", "Mobile": "M", "Object Oriented Programming": "O",
    "Functional programming": "F", "Imperative programming": "I",
    "Unix/Kernel": "K", "System administration": "A", "Security": "S",
    "Web - Database": "D", "Artificial Intelligence": "IA",
}

_W = {}


def _init(time_model):
    _W["time_model"] = time_model
    _W["ds"] = {}


def _dataset(off):
    """Un Dataset par reglage de chaines, construit une seule fois par process."""
    key = tuple(sorted(off))
    if key not in _W["ds"]:
        _W["ds"][key] = pl.Dataset(time_model=_W["time_model"], chains_off=key)
    return _W["ds"][key]


def _job(task):
    mask, off, combo, obj, base_xp, done, budget, *rest = task
    banned = frozenset(rest[0]) if rest else frozenset()
    ds = _dataset(off)
    p = pl.solve_combo(ds, combo, base_xp, set(done), obj, budget, banned)
    return (mask, "+".join(combo), obj, {
        "feasible": p["feasible"], "n": p["n"], "units": p["units_n"],
        "days": round(p["days"]), "xp": p["xp"], "proven": p["proven"],
        "n_raw": p["n_raw"], "ids": p["rows"],
        "checks": [{"l": c["label"], "n": c["need"], "h": c["have"],
                    "u": c["unit"], "ok": c["ok"]} for c in p["checks"]],
    })


def budget_for(combo, obj, args):
    if obj == "days":
        return args.days_budget
    return args.budget if len(combo) <= 2 else args.big_budget


def collect(chains, base_xp, done, args):
    """Une entree par (reglage de chaines, combinaison, objectif)."""
    masks = ([(1 << len(chains)) - 1] if args.no_variants
             else list(range(1 << len(chains))))
    variants, tasks = {}, []
    for mask in masks:
        off = tuple(c["id"] for i, c in enumerate(chains) if not (mask >> i) & 1)
        variants[str(mask)] = {}
        for combo in pl.all_combos():
            variants[str(mask)]["+".join(combo)] = {
                "combo": list(combo), "kind": KIND[len(combo)]}
            for obj in ("projects", "days"):
                tasks.append((mask, off, combo, obj, base_xp, tuple(sorted(done)),
                              budget_for(combo, obj, args)))
    # les plus lourdes d'abord, sinon les coeurs finissent a vide
    tasks.sort(key=lambda t: (len(t[2]), t[6]), reverse=True)

    n = 0
    with ProcessPoolExecutor(max_workers=args.workers, initializer=_init,
                             initargs=(args.time_model,)) as ex:
        for mask, key, obj, res in ex.map(_job, tasks):
            variants[str(mask)][key][obj] = res
            n += 1
            if n % 10 == 0 or n == len(tasks):
                print(f"  {n:>4}/{len(tasks)}  ({time.strftime('%H:%M:%S')})", flush=True)

    # La recherche en temps a un budget borne : quand elle rend un plan plus long
    # que celui a nombre minimal de projets, ce dernier est valide et plus court.
    fixed = 0
    for v in variants.values():
        for row in v.values():
            a, b = row["projects"], row["days"]
            if a["feasible"] and b["feasible"] and a["days"] < b["days"]:
                row["days"] = dict(a, proven=False)
                fixed += 1
    if fixed:
        print(f"  ({fixed} plans 'min temps' remplaces par le plan 'min projets')")
    if args.alternatives:
        full = str((1 << len(chains)) - 1)
        alternatives(variants[full], (),
                     base_xp, done, args)
    return variants


def _banned_for(ds, rows):
    out = set()
    for r in rows:
        out |= set(ds.bundles.get(r, (r,)))
    return tuple(sorted(out))


def alternatives(combos, off, base_xp, done, args):
    """Autres plans valides pour chaque combinaison : on interdit tour a tour
    un projet des meilleurs plans et on relance la recherche (deux niveaux).
    Les plans distincts sont gardes dans `alts` ; l'interface les trie selon
    le mode (jours ou nombre de projets)."""
    ds = pl.Dataset(time_model=args.time_model)
    found = {}   # key -> {frozenset(ids): plan}
    for key, row in combos.items():
        found[key] = {}
        for obj in ("projects", "days"):
            plan = row[obj]
            if plan["feasible"]:
                found[key][frozenset(plan["ids"])] = dict(plan, banned=[])

    def run(level_tasks, label):
        if not level_tasks:
            return
        level_tasks.sort(key=lambda t: len(t[2]), reverse=True)
        print(f"  alternatives {label} : {len(level_tasks)} recherches", flush=True)
        with ProcessPoolExecutor(max_workers=args.workers, initializer=_init,
                                 initargs=(args.time_model,)) as ex:
            for (_m, key, _o, res), task in zip(ex.map(_job, level_tasks), level_tasks):
                if res["feasible"]:
                    res["proven"] = False
                    res["banned"] = list(task[7])
                    found[key].setdefault(frozenset(res["ids"]), res)

    def tasks_from(key, plans, seen):
        combo = tuple(combos[key]["combo"])
        out = []
        for plan in plans:
            for r in plan["ids"]:
                banned = tuple(sorted(set(plan.get("banned", [])) | set(_banned_for(ds, [r]))))
                if banned in seen:
                    continue
                seen.add(banned)
                for obj in ("projects", "days"):
                    out.append((0, off, combo, obj, base_xp, tuple(sorted(done)),
                                args.alt_budget if obj == "projects" else args.alt_days_budget,
                                banned))
        return out

    seen = {k: set() for k in combos}
    lvl1 = []
    for key in combos:
        lvl1 += tasks_from(key, list(found[key].values()), seen[key])
    run(lvl1, "niveau 1")

    lvl2 = []
    for key in combos:
        if len(found[key]) >= args.alternatives:
            continue
        alts = sorted((p for p in found[key].values() if p["banned"]),
                      key=lambda p: (p["n"], p["days"]))[:3]
        lvl2 += tasks_from(key, alts, seen[key])
    run(lvl2, "niveau 2")

    for key, row in combos.items():
        plans = list(found[key].values())
        by_days = sorted(plans, key=lambda p: (p["days"], p["n"]))
        by_n = sorted(plans, key=lambda p: (p["n"], p["days"]))
        keep, ids = [], set()
        for p in by_days[:args.alternatives] + by_n[:args.alternatives]:
            k = frozenset(p["ids"])
            if k not in ids:
                ids.add(k)
                keep.append({k2: v for k2, v in p.items() if k2 != "banned"})
        row["alts"] = keep
        print(f"  {key:<34} {len(plans):>3} plans distincts, {len(keep)} gardes")


def row_id(ds, pid):
    """Ligne affichable d'un id : un module de piscine -> sa piscine."""
    for c, ids in ds.bundles.items():
        if pid in ids:
            return c
    return pid


def pool_rows(ds, pool):
    """Projets realisables d'un pool, une ligne par piscine."""
    ok = {g["unit"] for g in ds.groups if g["kind"] != "dag"} | set(ds.unit_ids)
    return sorted({row_id(ds, p) for p in pool} & ok)


def project_table(ds, variants):
    """Une fiche par ligne affichable. Une piscine porte l'XP et la duree de
    tous ses modules, et dit combien ils sont."""
    used = set()
    for v in variants.values():
        for row in v.values():
            for obj in ("projects", "days"):
                used |= set(row[obj]["ids"])
            for alt in row.get("alts", []):
                used |= set(alt["ids"])
    for t in ds.titles.values():
        for o in t["options"]:
            used |= set(pool_rows(ds, o["pool"]))
    for pool in (ds.suite_pool, ds.exp_pool, ds.group_pool):
        used |= set(pool_rows(ds, pool))
    for pid in list(used):
        used |= set(ds.prereq_closure(pid))
    cats = {}
    for t in ds.titles.values():
        for o in t["options"]:
            code = CAT_CODE.get(o["title"], o["title"][:2])
            for pid in o["pool"]:
                cats.setdefault(pid, set()).add(code)
    chain_of = {}
    for c in ds.rules["chains"]:
        for rank, pid in enumerate(c["projects"]):
            chain_of[pid] = [c["id"], rank + 1, len(c["projects"])]
    out = {}
    for pid in sorted(used):
        ids = ds.bundles.get(pid, (pid,))
        row = {"n": ds.name(pid),
               "xp": sum(ds.xp(i) for i in ids),
               "d": round(sum(ds.days(i) for i in ids)),
               "t": ds.tags(pid), "s": ds.days_source.get(pid, ""),
               "c": sorted(cats.get(pid, ()))}
        slug = ds.projects.get(pid, {}).get("slug")
        if slug:
            row["sl"] = slug
        if len(ids) > 1:
            row["sub"] = len(ids) - 1
        if len(ids) > 1 or "piscine" in row["n"].lower():
            row["pi"] = 1
        if pid in chain_of:
            row["ch"] = chain_of[pid]
        if ds.prereqs.get(pid):
            row["pre"] = ds.prereqs[pid]
        out[str(pid)] = row
    return out


def title_meta(ds):
    return {key: {
        "name": t["name"], "level": t["level"], "level_xp": int(t["level_xp"]),
        "events": t["n_events"], "exp": t["n_experiences"], "suite": t["n_suite"],
        "group": t["n_group"],
        "options": [{"t": o["title"], "xp": o["min_xp"], "n": o["min_n"],
                     "pool": len(o["pool"]), "ids": pool_rows(ds, o["pool"])}
                    for o in t["options"]],
    } for key, t in ds.titles.items()}


def extra_pools(ds):
    return {"Experiences pro": pool_rows(ds, ds.exp_pool),
            "Projet suite": pool_rows(ds, ds.suite_pool),
            "Projets de groupe": pool_rows(ds, ds.group_pool)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--xp", type=float, default=None, help="XP de cursus actuels")
    ap.add_argument("--level", type=float, default=None, help="niveau actuel (ex: 13.91)")
    ap.add_argument("--done", default="", help="ids de projets deja valides")
    ap.add_argument("--budget", type=int, default=4_000_000)
    ap.add_argument("--big-budget", type=int, default=2_000_000,
                    help="budget pour les combinaisons de 3 ou 4 titres")
    ap.add_argument("--days-budget", type=int, default=400_000)
    ap.add_argument("--no-variants", action="store_true",
                    help="ne calculer que le reglage ou toutes les chaines sont actives")
    ap.add_argument("--alternatives", type=int, default=12,
                    help="plans alternatifs gardes par combinaison et par mode (0 = aucun)")
    ap.add_argument("--alt-budget", type=int, default=600_000)
    ap.add_argument("--alt-days-budget", type=int, default=150_000)
    ap.add_argument("--workers", type=int, default=os.cpu_count() or 4)
    ap.add_argument("--time-model", choices=("clamped", "xp", "raw"), default="clamped")
    ap.add_argument("--json-out", default=os.path.normpath(
        os.path.join(HERE, "..", "src", "data", "planner.json")),
                    help="donnees lues par la page /planner du site Next.js")
    args = ap.parse_args()

    ds = pl.Dataset(time_model=args.time_model)
    if args.xp is not None:
        base_xp, level = args.xp, None
    elif args.level is not None:
        lo = int(args.level)
        base_xp = ds.levels[lo] + (args.level - lo) * (ds.levels[lo + 1] - ds.levels[lo])
        level = args.level
    else:
        base_xp, level = ds.levels[11], 11.0
    if level is None:
        lo = ds.level_for_xp(base_xp)
        span = ds.levels[lo + 1] - ds.levels[lo]
        level = round(lo + (base_xp - ds.levels[lo]) / span, 2) if span else float(lo)
    done = {int(x) for x in args.done.split(",") if x.strip()}

    chains = [{"id": c["id"], "label": c["label"], "confidence": c.get("confidence", ""),
               "note": c.get("note", ""), "n": len(c["projects"])}
              for c in ds.rules["chains"]]
    n_var = 1 if args.no_variants else 1 << len(chains)
    print(f"depart : niveau {level} = {int(base_xp)} XP"
          + (f", {len(done)} projet(s) deja valide(s)" if done else ""))
    print(f"{n_var} reglage(s) de chaines x {len(pl.all_combos())} combinaisons "
          f"x 2 objectifs sur {args.workers} coeurs", flush=True)

    t0 = time.time()
    variants = collect(chains, base_xp, done, args)
    data = {
        "baseline": {"xp": int(base_xp), "level": level,
                     "done": [{"id": i, "n": ds.name(i), "xp": ds.xp(i)}
                              for i in sorted(done)]},
        "chains": chains,
        "full_mask": (1 << len(chains)) - 1,
        "only_full": bool(args.no_variants),
        "variants": variants,
        "projects": project_table(ds, variants),
        "titles": title_meta(ds),
        "pools": extra_pools(ds),
        "meta": {
            "generated": datetime.date.today().isoformat(),
            "rate": round(ds.rate, 2), "time_model": args.time_model,
            "groups": len(ds.groups), "bundles": len(ds.bundles),
            "excluded": len(ds.excluded), "risky": sorted(ds.risky),
            "cats": {v: k for k, v in CAT_CODE.items()},
            "prereqs": len(ds.prereqs),
            "source": "gcc.42.fr + holy graph intra Lyon (2026-11-20)",
        },
    }
    os.makedirs(os.path.dirname(args.json_out), exist_ok=True)
    with open(args.json_out, "w") as fh:
        json.dump(data, fh, ensure_ascii=False, separators=(",", ":"))
    print(f"\n-> {args.json_out}  ({os.path.getsize(args.json_out) // 1024} Ko, "
          f"{time.time() - t0:.0f}s de calcul)")


if __name__ == "__main__":
    main()
