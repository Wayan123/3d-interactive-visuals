"""BioCell Atlas — Neutrophil CAD source.

Polymorphonuclear granulocyte: multilobed nucleus + granules.
"""
from __future__ import annotations
from pathlib import Path


def make():
    import math
    from build123d import Compound, Pos, Sphere

    membrane = Sphere(radius=0.85)
    membrane = Compound(label="membrane", children=[membrane])

    lobes = []
    for i in range(4):
        a = i * (math.pi / 2)
        lobes.append(Sphere(radius=0.22).moved(Pos(math.cos(a) * 0.3, 0, math.sin(a) * 0.3)))
    lobes_group = Compound(label="nucleus_lobes", children=lobes)

    granules = [Sphere(radius=0.032).moved(Pos((i % 5) * 0.15 - 0.3, 0, (i // 5) * 0.15 - 0.3)) for i in range(25)]
    granules_group = Compound(label="granules", children=granules)

    return Compound(label="neutrophil", children=[membrane, lobes_group, granules_group])


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step
    out = Path(__file__).resolve().parent / "out"
    out.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out / "neutrophil.step"))
    print(f"wrote {out/'neutrophil.step'}")
