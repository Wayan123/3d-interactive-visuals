#!/usr/bin/env python3
"""BioCell Atlas 3D — local static + live status backend.

Uses only Python standard library. No third-party dependencies.

Endpoints:
    GET  /                 -> static index.html
    GET  /<file>           -> static file under the project root
    GET  /api/health       -> self health payload
    GET  /api/cells        -> enriched cells atlas (data/cells.json + live stats)
    GET  /api/services     -> self probe + configurable BIOCELL_EXTRA_PROBES + tmux + system metrics
    GET  /api/fleet        -> unified payload (cells + services)

Usage:
    python3 server.py                         # serve on :8877
    python3 server.py --port 8877 --host 127.0.0.1

Safety: collectors are **read-only**. They probe health URLs with 2 s timeouts,
list tmux sessions, and read `/proc`. They do not restart, kill, or modify any
other service.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import shutil
import signal
import subprocess
import sys
import threading
import time
from dataclasses import dataclass
from functools import lru_cache
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib import request as urlrequest
from urllib.error import URLError

PROJECT_ROOT = Path(__file__).resolve().parent
DATA_DIR = PROJECT_ROOT / "data"
SERVICE_NAME = "biocell-atlas"
SERVICE_VERSION = "0.2.0"
START_TIME = time.time()

logger = logging.getLogger(SERVICE_NAME)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)


# ---------------------------------------------------------------------------
# Service probes (read-only, 2 second timeouts)
# ---------------------------------------------------------------------------


def probe_url(url: str, timeout: float = 1.2) -> dict:
    started = time.time()
    info = {"url": url, "ok": False, "status": None, "latencyMs": None, "error": None}
    try:
        with urlrequest.urlopen(url, timeout=timeout) as resp:
            info["status"] = resp.status
            info["ok"] = 200 <= resp.status < 400
    except URLError as exc:
        info["error"] = str(getattr(exc, "reason", exc))
    except Exception as exc:  # noqa: BLE001 defensive catchall, collector must not crash
        info["error"] = f"{type(exc).__name__}: {exc}"
    info["latencyMs"] = int((time.time() - started) * 1000)
    return info


def tmux_sessions() -> list[str]:
    # Return tmux sessions only when the BIOCELL_TMUX_EXPOSE env var is set.
    # Default: don't expose session names (privacy).
    if not os.environ.get("BIOCELL_TMUX_EXPOSE"):
        return []
    if shutil.which("tmux") is None:
        return []
    try:
        result = subprocess.run(
            ["tmux", "ls"],
            capture_output=True, text=True, timeout=3,
        )
    except Exception as exc:  # noqa: BLE001
        logger.debug("tmux ls failed: %s", exc)
        return []
    if result.returncode != 0:
        return []
    sessions = []
    for line in result.stdout.splitlines():
        name = line.split(":", 1)[0].strip()
        if name:
            sessions.append(name)
    return sessions


# ---------------------------------------------------------------------------
# System metrics from /proc and df (Linux only; macOS returns graceful fallback)
# ---------------------------------------------------------------------------


@dataclass
class CpuSample:
    total: int
    idle: int
    ts: float


_CPU_LOCK = threading.Lock()
_LAST_CPU: CpuSample | None = None


def sample_cpu() -> float | None:
    """Return CPU utilisation percentage between two samples (non-blocking)."""
    global _LAST_CPU
    stat_path = Path("/proc/stat")
    if not stat_path.exists():
        return None
    try:
        with stat_path.open() as fh:
            first = fh.readline().split()
    except OSError:
        return None
    if not first or first[0] != "cpu":
        return None
    nums = [int(x) for x in first[1:8]]
    idle = nums[3] + nums[4]  # idle + iowait
    total = sum(nums)
    now = CpuSample(total=total, idle=idle, ts=time.time())
    with _CPU_LOCK:
        prev = _LAST_CPU
        _LAST_CPU = now
    if prev is None or now.total == prev.total:
        return None
    diff_total = now.total - prev.total
    diff_idle = now.idle - prev.idle
    if diff_total <= 0:
        return None
    return round(100 * (1 - diff_idle / diff_total), 1)


def sample_memory() -> dict:
    info = {"totalMb": None, "availableMb": None, "usedPct": None}
    mem_path = Path("/proc/meminfo")
    if not mem_path.exists():
        return info
    try:
        with mem_path.open() as fh:
            lines = fh.readlines()
    except OSError:
        return info
    kv = {}
    for line in lines:
        key, _, value = line.partition(":")
        if value:
            kv[key.strip()] = value.strip()

    def kb_to_mb(raw: str | None) -> float | None:
        if not raw:
            return None
        try:
            value = int(raw.split()[0])
        except (ValueError, IndexError):
            return None
        return round(value / 1024, 1)

    total = kb_to_mb(kv.get("MemTotal"))
    available = kb_to_mb(kv.get("MemAvailable"))
    info["totalMb"] = total
    info["availableMb"] = available
    if total and available:
        info["usedPct"] = round((1 - available / total) * 100, 1)
    return info


def sample_disk(path: str) -> dict:
    # Report the mount's usage but not the actual home path (privacy).
    info = {"path": "home-mount", "totalGb": None, "freeGb": None, "usedPct": None}
    try:
        usage = shutil.disk_usage(path)
    except OSError:
        return info
    info["totalGb"] = round(usage.total / 1024 / 1024 / 1024, 1)
    info["freeGb"] = round(usage.free / 1024 / 1024 / 1024, 1)
    info["usedPct"] = round((usage.used / usage.total) * 100, 1)
    return info


# ---------------------------------------------------------------------------
# Collectors
# ---------------------------------------------------------------------------


_SERVICES_CACHE = {"payload": None, "ts": 0.0}
_SERVICES_TTL = 1.5  # seconds


def collect_services_cached() -> dict:
    now = time.time()
    if _SERVICES_CACHE["payload"] and (now - _SERVICES_CACHE["ts"]) < _SERVICES_TTL:
        return _SERVICES_CACHE["payload"]
    payload = collect_services()
    _SERVICES_CACHE["payload"] = payload
    _SERVICES_CACHE["ts"] = now
    return payload


def collect_services() -> dict:
    # Run probes in parallel so the endpoint stays responsive even when
    # remote services are down (each probe has a 2 s timeout).
    from concurrent.futures import ThreadPoolExecutor

    # Default: probe only self. Additional probes can be configured via the
    # BIOCELL_EXTRA_PROBES env var as a comma-separated list of
    # "id|label|role|url" quadruples. This keeps the public default clean
    # while letting advanced users probe their own local services.
    probe_targets = [
        (SERVICE_NAME, f"http://127.0.0.1:{SERVER_PORT.value}/api/health", "BioCell Atlas (self)", "3D cell explorer"),
    ]
    extra = os.environ.get("BIOCELL_EXTRA_PROBES", "").strip()
    if extra:
        for entry in extra.split(","):
            parts = [p.strip() for p in entry.split("|")]
            if len(parts) == 4 and all(parts):
                probe_targets.append((parts[0], parts[3], parts[1], parts[2]))

    with ThreadPoolExecutor(max_workers=max(1, len(probe_targets))) as pool:
        results = list(pool.map(lambda args: probe_url(args[1]), probe_targets))

    services = []
    for (probe_id, _url, label, role), probe in zip(probe_targets, results):
        services.append({
            "id": probe_id,
            "label": label,
            "role": role,
            "kind": "web",
            "probe": probe,
            "status": _status_from_probe(probe),
        })

    sessions = tmux_sessions()
    payload = {
        "updatedAt": _iso_now(),
        "system": {
            "cpuPct": sample_cpu(),
            "memory": sample_memory(),
            "disk": sample_disk(str(Path.home())),
        },
        "services": services,
        "tmuxSessions": sessions,
        "tmuxExpected": ["biocell-atlas"],
    }
    return payload


def collect_cells() -> dict:
    cells_path = DATA_DIR / "cells.json"
    if not cells_path.exists():
        return {"error": "cells.json missing", "cells": []}
    try:
        atlas = json.loads(cells_path.read_text())
    except json.JSONDecodeError as exc:
        return {"error": f"bad cells.json: {exc}", "cells": []}
    # attach liveness telemetry (just a lightweight annotation layer)
    atlas["servedAt"] = _iso_now()
    atlas["liveBackend"] = True
    return atlas


def collect_fleet() -> dict:
    atlas = collect_cells()
    services = collect_services_cached()
    return {
        "updatedAt": _iso_now(),
        "atlas": atlas,
        "services": services,
    }


def _status_from_probe(probe: dict) -> str:
    if probe.get("ok"):
        return "online"
    return "offline"


def _iso_now() -> str:
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")


# ---------------------------------------------------------------------------
# HTTP server
# ---------------------------------------------------------------------------


class ServerPort:
    value = 8877


SERVER_PORT = ServerPort()


class BioCellHandler(BaseHTTPRequestHandler):
    server_version = f"{SERVICE_NAME}/{SERVICE_VERSION}"

    def log_message(self, fmt: str, *args) -> None:  # noqa: A003
        logger.info("%s - %s", self.address_string(), fmt % args)

    # --- routing ---------------------------------------------------------
    def do_GET(self) -> None:  # noqa: N802
        path = self.path.split("?", 1)[0]
        if path.startswith("/api/"):
            self._handle_api(path)
            return
        self._handle_static(path)

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(HTTPStatus.NO_CONTENT)
        self._cors_headers()
        self.end_headers()

    # --- handlers --------------------------------------------------------
    def _handle_api(self, path: str) -> None:
        try:
            if path == "/api/health":
                payload = {
                    "ok": True,
                    "service": SERVICE_NAME,
                    "version": SERVICE_VERSION,
                    "uptimeSec": round(time.time() - START_TIME, 1),
                    "port": SERVER_PORT.value,
                    "time": _iso_now(),
                }
            elif path == "/api/services":
                payload = collect_services_cached()
            elif path == "/api/cells":
                payload = collect_cells()
            elif path == "/api/fleet":
                payload = collect_fleet()
            else:
                self._send_json({"error": "not found", "path": path}, HTTPStatus.NOT_FOUND)
                return
            self._send_json(payload)
        except Exception as exc:  # noqa: BLE001
            logger.exception("api error at %s", path)
            self._send_json({"error": str(exc), "path": path}, HTTPStatus.INTERNAL_SERVER_ERROR)

    def _handle_static(self, path: str) -> None:
        if path in ("", "/"):
            path = "/index.html"
        # Prevent path traversal: resolve relative to PROJECT_ROOT.
        safe = (PROJECT_ROOT / path.lstrip("/")).resolve()
        if not str(safe).startswith(str(PROJECT_ROOT)):
            self._send_text("forbidden", HTTPStatus.FORBIDDEN)
            return
        if safe.is_dir():
            safe = safe / "index.html"
        if not safe.exists() or not safe.is_file():
            self._send_text("not found", HTTPStatus.NOT_FOUND)
            return
        mime = _guess_mime(safe)
        try:
            data = safe.read_bytes()
        except OSError as exc:
            self._send_text(f"read error: {exc}", HTTPStatus.INTERNAL_SERVER_ERROR)
            return
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-cache" if safe.suffix in {".json", ".js", ".css", ".html"} else "public, max-age=60")
        self._cors_headers()
        self.end_headers()
        self.wfile.write(data)

    # --- helpers ---------------------------------------------------------
    def _send_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self._cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def _send_text(self, message: str, status: HTTPStatus) -> None:
        body = message.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self._cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def _cors_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")


@lru_cache(maxsize=64)
def _guess_mime(path: Path) -> str:
    ext = path.suffix.lower()
    return {
        ".html": "text/html; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".mjs": "application/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".glb": "model/gltf-binary",
        ".gltf": "model/gltf+json",
        ".wasm": "application/wasm",
        ".txt": "text/plain; charset=utf-8",
        ".md": "text/markdown; charset=utf-8",
        ".ico": "image/x-icon",
    }.get(ext, "application/octet-stream")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def run(host: str, port: int) -> None:
    SERVER_PORT.value = port
    httpd = ThreadingHTTPServer((host, port), BioCellHandler)
    sample_cpu()  # prime CPU baseline so first /api/services reply is populated
    logger.info("%s v%s listening on http://%s:%s/", SERVICE_NAME, SERVICE_VERSION, host, port)

    def _shutdown(*_args):
        logger.info("shutdown signal received")
        threading.Thread(target=httpd.shutdown, daemon=True).start()

    signal.signal(signal.SIGINT, _shutdown)
    signal.signal(signal.SIGTERM, _shutdown)
    try:
        httpd.serve_forever(poll_interval=0.5)
    finally:
        httpd.server_close()
        logger.info("stopped")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="BioCell Atlas local backend")
    parser.add_argument("--host", default=os.environ.get("BIOCELL_HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("BIOCELL_PORT", "8877")))
    args = parser.parse_args(argv)
    run(args.host, args.port)
    return 0


if __name__ == "__main__":
    sys.exit(main())
