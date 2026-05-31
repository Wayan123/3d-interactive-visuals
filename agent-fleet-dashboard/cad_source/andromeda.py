"""Science Atlas - Andromeda (M31) CAD source (point-cloud galaxy).

A galaxy is rendered as a procedural point cloud (hundreds of star points
along logarithmic spiral arms) by ``buildSpiralGalaxy`` in
``assets/bio/geometry.js``. There is no meaningful solid STEP body for a
galaxy, so this source emits a GLB-style point set instead of a STEP solid.

Run with build123d + trimesh installed to export a GLB point cloud.
"""

from __future__ import annotations

import math
from pathlib import Path

ARMS = 2
STAR_COUNT = 1200
RADIUS = 2.6


def star_points():
    pts = []
    for i in range(STAR_COUNT):
        t = (i / STAR_COUNT) ** 0.6
        rad = t * RADIUS
        arm = i % ARMS
        ang = (arm / ARMS) * 2 * math.pi + rad * 2.4
        spread = ((i * 1.37) % 1.0 - 0.5) * (0.5 - t * 0.32)
        ang += spread
        y = (((i * 0.71) % 1.0) - 0.5) * RADIUS * 0.06
        pts.append((math.cos(ang) * rad, y, math.sin(ang) * rad))
    return pts


def gen_glb():
    try:
        import numpy as np, trimesh
    except ImportError:
        raise SystemExit("install trimesh + numpy to export the galaxy point cloud")
    cloud = trimesh.points.PointCloud(np.array(star_points()))
    out_dir = Path(__file__).resolve().parent / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    cloud.export(str(out_dir / "andromeda.glb"))
    print(f"wrote {out_dir/'andromeda.glb'}")


if __name__ == "__main__":
    gen_glb()
