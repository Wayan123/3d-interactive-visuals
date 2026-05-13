"""BioCell Atlas — Muscle (skeletal myocyte) CAD source.

Long multinucleated muscle fibre with sarcolemma, parallel myofibrils,
sarcomere bands, and peripheral nuclei. Dimensions in millimetres.
"""

from __future__ import annotations

from pathlib import Path


def make():
    import math
    from build123d import Compound, Cylinder, Pos, Rot, Sphere, Torus

    length = 3.6
    radius = 0.42

    sarcolemma = Cylinder(radius=radius, height=length, rotation=(0, 90, 0))
    sarcolemma = Compound(label="sarcolemma", children=[sarcolemma])

    myofibrils = []
    for i in range(5):
        a = i * (2 * math.pi / 5)
        y_off = math.cos(a) * radius * 0.55
        z_off = math.sin(a) * radius * 0.55
        f = Cylinder(radius=0.045, height=length * 0.94, rotation=(0, 90, 0))
        f = f.moved(Pos(0, y_off, z_off))
        myofibrils.append(f)
    myofibril_group = Compound(label="myofibrils", children=myofibrils)

    sarcomeres = []
    for i in range(14):
        t = (i + 0.5) / 14
        x = -length * 0.45 + t * length * 0.9
        band = Torus(major_radius=radius * 0.85, minor_radius=0.015)
        band = band.moved(Pos(x, 0, 0) * Rot(0, 90, 0))
        sarcomeres.append(band)
    sarcomere_group = Compound(label="sarcomeres", children=sarcomeres)

    nuclei = []
    for i in range(5):
        t = (i + 0.5) / 5
        x = -length * 0.4 + t * length * 0.8
        angle = math.pi / 2 if i % 2 == 0 else -math.pi / 2
        y_off = math.cos(angle) * radius * 0.65
        z_off = math.sin(angle) * radius * 0.65
        nuclei.append(Sphere(radius=0.16).moved(Pos(x, y_off, z_off)))
    nuclei_group = Compound(label="nuclei", children=nuclei)

    return Compound(label="muscle_cell", children=[sarcolemma, myofibril_group, sarcomere_group, nuclei_group])


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step

    out = Path(__file__).resolve().parent / "out"
    out.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out / "muscle.step"))
    print(f"wrote {out/'muscle.step'}")
