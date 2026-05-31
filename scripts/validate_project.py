#!/usr/bin/env python3
"""Validate atlas data and source references without external dependencies."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "agent-fleet-dashboard"
DATA = APP / "data" / "cells.json"
GEOMETRY = APP / "assets" / "bio" / "geometry.js"


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def load_atlas() -> dict:
    try:
        return json.loads(DATA.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"{DATA} is invalid JSON: {exc}")


def exported_builders() -> set[str]:
    text = GEOMETRY.read_text(encoding="utf-8")
    return set(re.findall(r"export function (build[A-Za-z0-9_]+)\(", text))


def tree_ids(node: dict) -> set[str]:
    found = set(node.get("cellIds", []))
    for child in node.get("children", []):
        found.update(tree_ids(child))
    return found


def validate() -> None:
    atlas = load_atlas()
    cells = atlas.get("cells") or []
    categories = atlas.get("categories") or []
    builders = exported_builders()

    if atlas.get("schemaVersion", 0) < 3:
        fail("schemaVersion must be >= 3")
    if not cells:
        fail("cells array is empty")

    ids: set[str] = set()
    for cell in cells:
        cid = cell.get("id")
        if not cid:
            fail("cell missing id")
        if cid in ids:
            fail(f"duplicate cell id: {cid}")
        ids.add(cid)

        for key in ["label", "category", "summary", "components", "geometry"]:
            if key not in cell:
                fail(f"{cid} missing {key}")
        if not cell.get("components"):
            fail(f"{cid} has no components")

        builder = cell.get("geometry", {}).get("builder")
        if builder not in builders:
            fail(f"{cid} references missing builder {builder!r}")

        component_ids = {c.get("id") for c in cell.get("components", [])}
        if None in component_ids:
            fail(f"{cid} has component without id")
        if cell.get("stats", {}).get("components") and cell["stats"]["components"] != len(component_ids):
            fail(f"{cid} stats.components does not match components length")

    category_members = []
    for category in categories:
        cat_id = category.get("id")
        members = category.get("cells", [])
        if not cat_id or not members:
            fail(f"category {cat_id!r} has no cells")
        for cid in members:
            if cid not in ids:
                fail(f"category {cat_id} references unknown cell {cid}")
            category_members.append(cid)
            cell_category = next(c for c in cells if c["id"] == cid).get("category")
            if cell_category != cat_id:
                fail(f"{cid} category={cell_category!r}, expected {cat_id!r}")

    duplicates = {cid for cid in category_members if category_members.count(cid) > 1}
    if duplicates:
        fail(f"cells appear in multiple categories: {sorted(duplicates)}")
    missing_from_categories = sorted(ids - set(category_members))
    if missing_from_categories:
        fail(f"cells missing from categories: {missing_from_categories}")

    tree = atlas.get("taxonomyTree") or {}
    unknown_tree_ids = sorted(tree_ids(tree) - ids)
    if unknown_tree_ids:
        fail(f"taxonomyTree references unknown ids: {unknown_tree_ids}")

    link_errors = []
    for left, right, *_ in atlas.get("links", []):
        if left not in ids or right not in ids:
            link_errors.append([left, right])
    if link_errors:
        fail(f"links reference unknown ids: {link_errors}")

    print(
        "OK:",
        len(cells),
        "specimens,",
        len(categories),
        "categories,",
        len(builders),
        "procedural builders",
    )


if __name__ == "__main__":
    validate()
