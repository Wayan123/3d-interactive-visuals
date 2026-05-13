"""BioCell Atlas \u2014 Erythrocyte (red blood cell) CAD source.

Biconcave disc with central depression on both sides; surface antigen
markers; internal hemoglobin grain (instanced spheres).
"""

from __future__ import annotations
from pathlib import Path


def make():
    from build123d import Compound, Cylinder, Pos, Sphere
    from cad_source._shared import fibonacci_sphere

    # Approximate biconcave disc as flat cylinder with two indents
    # (full biconcave geometry needs custom revolve, kept simple for STEP)
    radius = 1.0
    thickness = 0.32
    disc = Cylinder(radius=radius, height=thickness)
    indent_top = Sphere(radius=radius * 0.85).moved(Pos(0, thickness * 0.45, 0))
    indent_bot = Sphere(radius=radius * 0.85).moved(Pos(0, -thickness * 0.45, 0))
    membrane = disc - indent_top - indent_bot
    membrane = Compound(label="membrane", children=[membrane])

    hb = []
    for i, u in enumerate(fibonacci_sphere(40)):
        r = (i % 8) / 8 * radius * 0.7
        hb.append(Sphere(radius=0.04).moved(Pos(u[0] * r, 0, u[2] * r)))
    hb_group = Compound(label="hemoglobin", children=hb)

    antigens = []
    for u in fibonacci_sphere(20):
        antigens.append(Sphere(radius=0.025).moved(Pos(u[0] * radius, u[1] * thickness * 0.5, u[2] * radius)))
    antigen_group = Compound(label="antigens", children=antigens)

    return Compound(label="erythrocyte", children=[membrane, hb_group, antigen_group])


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step
    out = Path(__file__).resolve().parent / "out"
    out.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out / "erythrocyte.step"))
    print(f"wrote {out/'erythrocyte.step'}")
