#!/usr/bin/env python3
"""Smoke test the local BioCell/Science Atlas server."""

from __future__ import annotations

import argparse
import json
import time
from urllib.error import URLError
from urllib.request import urlopen


def fetch_json(url: str, timeout: float = 2.0) -> dict:
    with urlopen(url, timeout=timeout) as response:  # noqa: S310 - local/dev smoke URL
        if response.status != 200:
            raise RuntimeError(f"{url} returned HTTP {response.status}")
        return json.loads(response.read().decode("utf-8"))


def wait_for_health(base_url: str, seconds: float) -> dict:
    deadline = time.time() + seconds
    last_error: Exception | None = None
    while time.time() < deadline:
        try:
            return fetch_json(f"{base_url}/api/health")
        except (OSError, URLError, RuntimeError, json.JSONDecodeError) as exc:
            last_error = exc
            time.sleep(0.25)
    raise RuntimeError(f"server did not become healthy within {seconds}s: {last_error}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8877")
    parser.add_argument("--wait", type=float, default=2.0)
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/")
    health = wait_for_health(base_url, args.wait)
    if not health.get("ok"):
        raise RuntimeError(f"health check not ok: {health}")

    atlas = fetch_json(f"{base_url}/api/cells")
    cells = atlas.get("cells", [])
    categories = atlas.get("categories", [])
    if len(cells) < 27:
        raise RuntimeError(f"expected at least 27 specimens, got {len(cells)}")
    if not any(cell.get("id") == "hydrogen-atom" for cell in cells):
        raise RuntimeError("hydrogen-atom specimen missing from /api/cells")
    if len(categories) < 10:
        raise RuntimeError(f"expected at least 10 categories, got {len(categories)}")

    print(
        f"OK: {health.get('service')} v{health.get('version')} served "
        f"{len(cells)} specimens across {len(categories)} categories"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
