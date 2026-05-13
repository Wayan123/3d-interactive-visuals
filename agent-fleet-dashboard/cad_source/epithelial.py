"""BioCell Atlas — Epithelial Cell CAD source.

Cuboidal epithelial cell with apical microvilli, basement membrane,
and tight-junction ring. Dimensions in millimetres (educational scale).
"""

from __future__ import annotations

from pathlib import Path


def make():
    from build123d import Box, Compound, Cylinder, Pos, Rot, Sphere, Torus

    width, depth, height = 1.2, 1.2, 1.6

    body = Box(width, height, depth)
    body = Compound(label="membrane", children=[body])

    # microvilli grid on apical face
    microvilli = []
    for ix in range(5):
        for iz in range(5):
            x = (ix - 2) * 0.18
            z = (iz - 2) * 0.18
            mv = Cylinder(radius=0.018, height=0.18)
            mv = mv.moved(Pos(x, height / 2 + 0.09, z))
            microvilli.append(mv)
    microvilli_group = Compound(label="microvilli", children=microvilli)

    junctions = Torus(major_radius=width * 0.55, minor_radius=0.025).moved(Pos(0, height * 0.36, 0))
    junctions = Compound(label="junctions", children=[junctions])

    basement = Box(width * 1.6, 0.06, depth * 1.6)
    basement = basement.moved(Pos(0, -height / 2 - 0.05, 0))
    basement = Compound(label="basement", children=[basement])

    nucleus = Sphere(radius=0.32).moved(Pos(0, -height * 0.1, 0))
    nucleus = Compound(label="nucleus", children=[nucleus])

    return Compound(
        label="epithelial",
        children=[body, microvilli_group, junctions, basement, nucleus],
    )


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step

    out = Path(__file__).resolve().parent / "out"
    out.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out / "epithelial.step"))
    print(f"wrote {out/'epithelial.step'}")
