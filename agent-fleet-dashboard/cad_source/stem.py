"""BioCell Atlas — Stem Cell CAD source.

Pluripotent stem cell: large nucleus with chromatin patches, surface
markers, and small daughter buds. Dimensions in millimetres.
"""

from __future__ import annotations

from pathlib import Path


def make():
    import math
    from build123d import Compound, Cone, Pos, Sphere
    from cad_source._shared import fibonacci_sphere

    radius = 0.7
    membrane = Sphere(radius=radius)
    membrane = Compound(label="membrane", children=[membrane])

    nucleus = Sphere(radius=radius * 0.62)
    nucleus = Compound(label="nucleus", children=[nucleus])

    chromatin = []
    for u in fibonacci_sphere(6):
        r = radius * 0.62 * 0.55
        chromatin.append(Sphere(radius=0.06).moved(Pos(u[0] * r, u[1] * r, u[2] * r)))
    chromatin_group = Compound(label="chromatin", children=chromatin)

    markers = []
    for u in fibonacci_sphere(28):
        markers.append(Sphere(radius=0.022).moved(Pos(u[0] * radius * 1.02, u[1] * radius * 1.02, u[2] * radius * 1.02)))
    marker_group = Compound(label="markers", children=markers)

    daughters = []
    for i in range(4):
        a = i * (math.pi / 2) + 0.7
        d = Sphere(radius=radius * 0.18).moved(Pos(math.cos(a) * (radius + 0.18), -0.05, math.sin(a) * (radius + 0.18)))
        daughters.append(d)
    daughter_group = Compound(label="daughters", children=daughters)

    return Compound(label="stem_cell", children=[membrane, nucleus, chromatin_group, marker_group, daughter_group])


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step

    out = Path(__file__).resolve().parent / "out"
    out.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out / "stem.step"))
    print(f"wrote {out/'stem.step'}")
