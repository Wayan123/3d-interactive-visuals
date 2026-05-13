"""BioCell Atlas \u2014 Influenza A CAD source.

Spherical envelope with HA (hemagglutinin) club spikes and NA
(neuraminidase) tetramer mushrooms; 8 internal RNA segments.
"""

from __future__ import annotations
from pathlib import Path


def make():
    import math
    from build123d import Compound, Cone, Cylinder, Pos, Sphere
    from cad_source._shared import fibonacci_sphere

    envelope = Sphere(radius=0.55)
    envelope = Compound(label="envelope", children=[envelope])

    ha_pts = fibonacci_sphere(38)[:28]
    na_pts = fibonacci_sphere(38)[28:]

    ha_parts = []
    for u in ha_pts:
        base = (u[0] * 0.55, u[1] * 0.55, u[2] * 0.55)
        tip = (u[0] * 0.71, u[1] * 0.71, u[2] * 0.71)
        ha_parts.append(Cone(bottom_radius=0.018, top_radius=0.03, height=0.16).moved(Pos(*base)))
        ha_parts.append(Sphere(radius=0.05).moved(Pos(*tip)))
    ha_group = Compound(label="ha", children=ha_parts)

    na_parts = []
    for u in na_pts:
        base = (u[0] * 0.55, u[1] * 0.55, u[2] * 0.55)
        tip = (u[0] * 0.67, u[1] * 0.67, u[2] * 0.67)
        na_parts.append(Cylinder(radius=0.018, height=0.1).moved(Pos(*base)))
        na_parts.append(Sphere(radius=0.05).moved(Pos(*tip)))
    na_group = Compound(label="na", children=na_parts)

    rna_segs = []
    for i in range(8):
        a = i * (math.pi * 2 / 8)
        rna_segs.append(Cylinder(radius=0.022, height=0.55).moved(Pos(math.cos(a) * 0.2, 0, math.sin(a) * 0.2)))
    rna_group = Compound(label="rna", children=rna_segs)

    return Compound(label="influenza", children=[envelope, ha_group, na_group, rna_group])


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step
    out = Path(__file__).resolve().parent / "out"
    out.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out / "influenza.step"))
    print(f"wrote {out/'influenza.step'}")
