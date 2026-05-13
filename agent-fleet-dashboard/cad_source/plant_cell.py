"""BioCell Atlas — Plant Cell CAD source.

Stylised plant cell: rigid box cell wall, inner spherical membrane,
central vacuole, lens-shaped chloroplasts, nucleus, mitochondria.
Dimensions in millimetres (educational scale).
"""

from __future__ import annotations

from pathlib import Path


def make():
    import math
    from build123d import Box, Compound, Pos, Rot, Sphere
    from cad_source._shared import fibonacci_sphere

    cell_wall_outer = Box(2.2, 2.2, 2.2)
    cell_wall_inner = Box(2.04, 2.04, 2.04)
    cell_wall = cell_wall_outer - cell_wall_inner
    cell_wall = Compound(label="cellwall", children=[cell_wall])

    plasma_membrane = Sphere(radius=1.01)
    plasma_membrane = Compound(label="membrane", children=[plasma_membrane])

    vacuole = Sphere(radius=0.75)
    vacuole = Compound(label="vacuole", children=[vacuole])

    nucleus = Sphere(radius=0.38).moved(Pos(0.55, -0.3, 0.45))
    nucleus_group = Compound(label="nucleus", children=[nucleus])

    chloroplasts = []
    for u in fibonacci_sphere(7):
        r = 0.92
        chl = Sphere(radius=0.24)
        chl = chl.moved(Pos(u[0] * r, u[1] * r * 0.7, u[2] * r))
        chloroplasts.append(chl)
    chloroplast_group = Compound(label="chloroplasts", children=chloroplasts)

    mitos = []
    for i in range(5):
        theta = i * (2 * math.pi / 5) + 0.1
        m = Sphere(radius=0.18).moved(Pos(math.cos(theta) * 0.9, -0.6, math.sin(theta) * 0.9))
        mitos.append(m)
    mito_group = Compound(label="mitochondria", children=mitos)

    return Compound(
        label="plant_cell",
        children=[cell_wall, plasma_membrane, vacuole, nucleus_group, chloroplast_group, mito_group],
    )


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step

    out_dir = Path(__file__).resolve().parent / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out_dir / "plant_cell.step"))
    print(f"wrote {out_dir/'plant_cell.step'}")
