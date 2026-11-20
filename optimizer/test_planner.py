#!/usr/bin/env python3
"""Verifications du solveur.  python3 test_planner.py

Ne teste pas que le code tourne, mais que les plans produits sont valides :
conditions satisfaites, prerequis respectes, aucun projet superflu, et pour les
petits cas une verification exhaustive de l'optimalite.
"""
from __future__ import annotations

import itertools
import sys

import planner as pl

FAIL = []


def ok(cond, msg):
    print(("  ok   " if cond else "  FAIL ") + msg)
    if not cond:
        FAIL.append(msg)


def satisfies(ds, combo, ids, base_xp):
    return all(c["ok"] is not False for c in pl.check(ds, combo, list(ids), base_xp, set()))


def main():
    ds = pl.Dataset()
    base = ds.levels[13]
    combos = [("rncp6-1",), ("rncp6-2",), ("rncp7-1",), ("rncp7-2",), ("rncp6-1", "rncp7-2")]

    print("1. les plans satisfont toutes les conditions")
    plans = {}
    for combo in combos:
        p = pl.solve_combo(ds, combo, base, set(), "projects", 2_000_000)
        plans[combo] = p
        ok(p["feasible"], f"{'+'.join(combo)} : un plan existe")
        ok(all(c["ok"] is not False for c in p["checks"]),
           f"{'+'.join(combo)} : {p['n']} projets, toutes conditions remplies")

    print("\n2. rien de superflu : retirer une decision casse une condition")
    #    Le grain est la decision, pas le projet brut : on ne peut pas retirer un
    #    module de piscine seul (la piscine ne serait plus validee), ni un maillon
    #    au milieu d'une chaine (seul le dernier peut sauter).
    for combo, p in plans.items():
        if not p["feasible"]:
            continue
        sel = set(p["projects"])
        useless = []
        for u in p["units"]:
            drops = [set(u["ids"])]
            if u["kind"] == "chain" and u["n"] > 1:
                drops.append({u["ids"][-1]})
            for d in drops:
                if satisfies(ds, combo, sel - d, base):
                    useless.append(u["label"] + (f" (−{len(d)})" if len(d) > 1 else ""))
                    break
        ok(not useless, f"{'+'.join(combo)} : aucune decision retirable"
           + (f" — superflues : {useless}" if useless else ""))

    print("\n3. prerequis : seuls des prefixes de chaine sont pris")
    for combo, p in plans.items():
        if not p["feasible"]:
            continue
        sel = set(p["projects"])
        bad = []
        for ch in ds.chains:
            took = [i for i in ch["projects"] if i in sel]
            pref = ch["projects"][:len(took)]
            if took and took != pref:
                bad.append(ch["label"])
        ok(not bad, f"{'+'.join(combo)} : chaines coherentes"
           + (f" — cassees : {bad}" if bad else ""))
        # prerequis intra (holy graph) : tout projet pris a ses prerequis pris
        miss = [(ds.name(a), ds.name(b)) for a in sel for b in ds.prereqs.get(a, ())
                if not set(ds.unit_ids[b]) <= sel]
        ok(not miss, f"{'+'.join(combo)} : prerequis intra respectes"
           + (f" — manquants : {miss}" if miss else ""))

    print("\n4. piscines : prendre une piscine prend tous ses modules")
    for combo, p in plans.items():
        if not p["feasible"]:
            continue
        sel = set(p["projects"])
        bad = [ds.name(c) for c, ids in ds.bundles.items()
               if (sel & set(ids)) and not set(ids) <= sel]
        ok(not bad, f"{'+'.join(combo)} : piscines entieres"
           + (f" — partielles : {bad}" if bad else ""))

    print("\n5. optimalite : aucun ensemble plus petit ne marche")
    #    Verification exhaustive sur le pool restreint aux projets vraiment
    #    utiles (ceux qui comptent pour une condition, plus les meilleurs
    #    pourvoyeurs d'XP), a n-1 projets.
    for combo in combos[:2]:
        p = plans[combo]
        if not p["feasible"] or not p["proven"]:
            print(f"  skip  {'+'.join(combo)} : optimum non prouve, rien a verifier")
            continue
        n = p["n"]
        pool = pl.relevant_pool(ds, combo)
        cand = sorted(
            (pid for pid in ds.candidates if pid in pool) if hasattr(ds, "candidates")
            else (pid for g in ds.groups for ch in g["choices"] for pid in ch["ids"]
                  if pid in pool),
            key=lambda i: -ds.xp(i))
        top = sorted((pid for g in ds.groups for ch in g["choices"] for pid in ch["ids"]
                      if pid not in pool), key=lambda i: -ds.xp(i))[:n]
        cand = list(dict.fromkeys(list(cand) + top))
        if len(cand) > 26:
            cand = cand[:26]
        found = None
        for size in range(1, n):
            for sub in itertools.combinations(cand, size):
                if satisfies(ds, combo, sub, base):
                    found = sub
                    break
            if found:
                break
        ok(found is None,
           f"{'+'.join(combo)} : {n} projets, rien de plus petit sur {len(cand)} candidats"
           + (f" — trouve {[ds.name(i) for i in found]}" if found else ""))

    print("\n6. monotonie : plus on part haut, moins il reste a faire")
    for combo in (("rncp6-1",), ("rncp7-1",)):
        ns = [pl.solve_combo(ds, combo, ds.levels[lv], set(), "projects", 1_000_000)["n"]
              for lv in (11, 15, 19)]
        ok(ns[0] >= ns[1] >= ns[2], f"{'+'.join(combo)} : niveaux 11/15/19 -> {ns}")

    print("\n7. deja valide : un projet du plan retire du restant")
    combo = ("rncp6-1",)
    p = plans[combo]
    first = p["projects"][0]
    q = pl.solve_combo(ds, combo, base, {first}, "projects", 2_000_000)
    ok(first not in q["projects"], f"{ds.name(first)} marque fait -> absent du nouveau plan")
    ok(q["n"] <= p["n"], f"et le reste n'augmente pas ({p['n']} -> {q['n']})")

    print()
    if FAIL:
        print(f"{len(FAIL)} echec(s)")
        return 1
    print("tout est bon")
    return 0


if __name__ == "__main__":
    sys.exit(main())
