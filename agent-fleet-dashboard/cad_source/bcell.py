"""BioCell Atlas — B-cell CAD source.

Lymphocyte with Y-shaped BCR receptors.
"""
from __future__ import annotations
from pathlib import Path


def make():
    from build123d import Compound, Cone, Pos, Sphere
    from cad_source._shared import fibonacci_sphere

    membrane = Compound(label="membrane", children=[Sphere(radius=0.8)])
    nucleus = Sphere(radius=0.58).moved(Pos(0.05, 0.05, 0))
    nucleus = Compound(label="nucleus", children=[nucleus])

    bcrs = []
    for u in fibonacci_sphere(30):
        base = (u[0] * 0.8, u[1] * 0.8, u[2] * 0.8)
        tip = (u[0] * 0.88, u[1] * 0.88, u[2] * 0.88)
        bcrs.append(Cone(bottom_radius=0.015, top_radius=0.012, height=0.08).moved(Pos(*base)))
        bcrs.append(Sphere(radius=0.02).moved(Pos(*tip)))
    bcr_group = Compound(label="bcr", children=bcrs)

    return Compound(label="bcell", children=[membrane, nucleus, bcr_group])


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step
    out = Path(__file__).resolve().parent / "out"
    out.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out / "bcell.step"))
    print(f"wrote {out/'bcell.step'}")
