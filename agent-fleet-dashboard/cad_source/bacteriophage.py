"""BioCell Atlas \u2014 Bacteriophage T4 CAD source.

Iconic T4 phage: icosahedral head, contractile tail tube/sheath, base
plate hexagon, six articulated tail fibers, internal helical dsDNA.
Dimensions in millimetres (educational scale).
"""

from __future__ import annotations
from pathlib import Path


def make():
    import math
    from build123d import Compound, Cylinder, Pos, Rot, Sphere

    head_radius = 0.55
    head_height = 0.7
    tail_length = 0.85
    tail_radius = 0.085

    head = Sphere(radius=head_radius)
    head = head.moved(Pos(0, tail_length * 0.5 + head_height * 0.5, 0))
    head = Compound(label="capsid", children=[head])

    sheath = Cylinder(radius=tail_radius * 1.25, height=tail_length)
    sheath = Compound(label="sheath", children=[sheath])

    tube = Cylinder(radius=tail_radius * 0.55, height=tail_length * 1.05)
    tube = Compound(label="tail", children=[tube])

    base_plate = Cylinder(radius=tail_radius * 2.6, height=0.06)
    base_plate = base_plate.moved(Pos(0, -tail_length * 0.5 - 0.03, 0))
    base_plate = Compound(label="baseplate", children=[base_plate])

    fibers = []
    for i in range(6):
        a = i * (math.pi / 3)
        base_y = -tail_length * 0.5 - 0.06
        bx = math.cos(a) * tail_radius * 2.4
        bz = math.sin(a) * tail_radius * 2.4
        fiber = Cylinder(radius=0.022, height=0.7)
        fiber = fiber.moved(Pos(bx + math.cos(a) * 0.15, base_y - 0.35, bz + math.sin(a) * 0.15))
        fibers.append(fiber)
    fiber_group = Compound(label="fibers", children=fibers)

    return Compound(label="bacteriophage", children=[head, sheath, tube, base_plate, fiber_group])


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step
    out = Path(__file__).resolve().parent / "out"
    out.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out / "bacteriophage.step"))
    print(f"wrote {out/'bacteriophage.step'}")
