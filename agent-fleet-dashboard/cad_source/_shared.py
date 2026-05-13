"""Shared helpers for BioCell Atlas build123d sources.

These modules use the text-to-cad convention: each cell file exports
a ``make()`` function returning a labeled build123d ``Compound`` and a
``gen_step()`` function the CAD skill CLI can call to emit STEP.

Install build123d separately (``pip install build123d ocp_vscode trimesh``)
to regenerate STEP/GLB/STL artifacts. The browser renderer does NOT
require build123d — it uses the procedural Three.js library in
``assets/bio/geometry.js`` as the runtime source of truth.
"""

from __future__ import annotations


def label_compound(shape, label: str, children=None):
    """Attach a label to a build123d shape for STEP assembly export.

    Importing build123d lazily so the module stays importable without it.
    """
    from build123d import Compound

    if children is None:
        comp = Compound(label=label, children=[shape])
    else:
        comp = Compound(label=label, children=list(children))
    return comp


def fibonacci_sphere(count: int):
    """Evenly distributed unit vectors on a sphere (golden spiral)."""
    import math

    points = []
    phi = math.pi * (3 - math.sqrt(5))
    for i in range(count):
        y = 1 - (i / max(count - 1, 1)) * 2
        r = math.sqrt(max(0.0, 1 - y * y))
        theta = phi * i
        points.append((math.cos(theta) * r, y, math.sin(theta) * r))
    return points
