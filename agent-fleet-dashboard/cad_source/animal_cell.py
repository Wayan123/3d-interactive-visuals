"""BioCell Atlas — Animal Cell CAD source.

Stylised animal eukaryotic cell: plasma membrane, nucleus with nucleolus,
scattered mitochondria, tubular ER, stacked Golgi, and ribosome dots.
Dimensions in millimetres (educational scale).
"""

from __future__ import annotations

from pathlib import Path


def make():
    import math
    from build123d import Compound, Pos, Rot, Sphere, Torus, Cylinder

    # plasma membrane
    membrane = Sphere(radius=1.4)
    membrane = Compound(label="membrane", children=[membrane])

    # nucleus offset slightly
    nucleus = Sphere(radius=0.52).moved(Pos(0.1, 0.05, 0.05))
    nucleolus = Sphere(radius=0.15).moved(Pos(0.22, 0.12, 0.17))
    nucleus_group = Compound(label="nucleus", children=[nucleus, nucleolus])

    # mitochondria (ellipsoids approximated by scaled spheres)
    mitos = []
    for i in range(8):
        theta = i * math.pi / 4 + 0.3
        m = Sphere(radius=0.24)
        m = m.moved(Pos(math.cos(theta) * 0.77, math.sin(theta * 1.3) * 0.3 + 0.15, math.sin(theta) * 0.54))
        mitos.append(m)
    mito_group = Compound(label="mitochondria", children=mitos)

    # endoplasmic reticulum: torus approximation
    er = Torus(major_radius=0.75, minor_radius=0.08).moved(Pos(0, -0.3, 0) * Rot(10, 5, 0))
    er = Compound(label="er", children=[er])

    # Golgi: stacked thin tori
    golgi_parts = []
    for i in range(4):
        golgi = Torus(major_radius=0.3 - i * 0.035, minor_radius=0.04)
        golgi = golgi.moved(Pos(-0.65, -0.1 - i * 0.1, 0.55))
        golgi_parts.append(golgi)
    golgi_group = Compound(label="golgi", children=golgi_parts)

    # ribosomes as tiny spheres on ER circumference
    ribos = []
    for i in range(30):
        theta = i * (2 * math.pi / 30)
        r = 0.78 if i % 2 == 0 else 0.72
        ribos.append(
            Sphere(radius=0.048).moved(
                Pos(math.cos(theta) * r, -0.3, math.sin(theta) * r * 0.8)
            )
        )
    ribosomes = Compound(label="ribosomes", children=ribos)

    return Compound(
        label="animal_cell",
        children=[membrane, nucleus_group, mito_group, er, golgi_group, ribosomes],
    )


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step

    out_dir = Path(__file__).resolve().parent / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out_dir / "animal_cell.step"))
    print(f"wrote {out_dir/'animal_cell.step'}")
