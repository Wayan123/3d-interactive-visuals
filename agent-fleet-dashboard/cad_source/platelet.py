"""BioCell Atlas — Platelet CAD source.

Biconvex disc with marginal microtubule ring + granules.
"""
from __future__ import annotations
from pathlib import Path


def make():
    import math
    from build123d import Compound, Cylinder, Pos, Sphere, Torus

    body = Cylinder(radius=0.55, height=0.18)
    body = Compound(label="membrane", children=[body])

    microring = Torus(major_radius=0.48, minor_radius=0.015)
    microring = Compound(label="microtubules", children=[microring])

    grans = []
    for i in range(16):
        a = i * (math.pi * 2 / 16)
        r = 0.3
        grans.append(Sphere(radius=0.035).moved(Pos(math.cos(a) * r, 0, math.sin(a) * r)))
    gran_group = Compound(label="granules", children=grans)

    return Compound(label="platelet", children=[body, microring, gran_group])


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step
    out = Path(__file__).resolve().parent / "out"
    out.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out / "platelet.step"))
    print(f"wrote {out/'platelet.step'}")
