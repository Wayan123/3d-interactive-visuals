"""BioCell Atlas \u2014 Adenovirus CAD source.

Icosahedral capsid with 12 fiber projections from each vertex, dsDNA core.
"""

from __future__ import annotations
from pathlib import Path


def make():
    import math
    from build123d import Compound, Cone, Cylinder, Pos, Sphere

    radius = 0.55
    capsid = Sphere(radius=radius)
    capsid = Compound(label="capsid", children=[capsid])

    phi = (1 + math.sqrt(5)) / 2
    verts = [
        (-1, phi, 0), (1, phi, 0), (-1, -phi, 0), (1, -phi, 0),
        (0, -1, phi), (0, 1, phi), (0, -1, -phi), (0, 1, -phi),
        (phi, 0, -1), (phi, 0, 1), (-phi, 0, -1), (-phi, 0, 1),
    ]
    fibers = []
    for v in verts:
        norm = math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2)
        u = (v[0] / norm, v[1] / norm, v[2] / norm)
        base = (u[0] * radius, u[1] * radius, u[2] * radius)
        tip = (u[0] * (radius + 0.32), u[1] * (radius + 0.32), u[2] * (radius + 0.32))
        fibers.append(Cone(bottom_radius=0.025, top_radius=0.014, height=0.32).moved(Pos(*base)))
        fibers.append(Sphere(radius=0.05).moved(Pos(*tip)))
    fiber_group = Compound(label="fibers", children=fibers)

    dna = Cylinder(radius=0.025, height=radius * 1.3)
    dna = Compound(label="dna", children=[dna])

    return Compound(label="adenovirus", children=[capsid, fiber_group, dna])


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step
    out = Path(__file__).resolve().parent / "out"
    out.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out / "adenovirus.step"))
    print(f"wrote {out/'adenovirus.step'}")
