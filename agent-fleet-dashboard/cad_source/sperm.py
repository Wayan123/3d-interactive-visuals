"""BioCell Atlas — Spermatozoon CAD source (head + midpiece + tail)."""
from __future__ import annotations
from pathlib import Path


def make():
    from build123d import Compound, Cylinder, Pos, Sphere

    head = Sphere(radius=0.45).moved(Pos(0.36, 0, 0))
    head = Compound(label="head", children=[head])

    acrosome = Sphere(radius=0.34).moved(Pos(0.52, 0, 0))
    acrosome = Compound(label="acrosome", children=[acrosome])

    midpiece = Cylinder(radius=0.055, height=0.45, rotation=(0, 0, 90))
    midpiece = midpiece.moved(Pos(0.14, 0, 0))
    midpiece = Compound(label="midpiece", children=[midpiece])

    # flagellum as a straight cylinder (approximation)
    flagellum = Cylinder(radius=0.022, height=2.4, rotation=(0, 0, 90))
    flagellum = flagellum.moved(Pos(-1.2, 0, 0))
    flagellum = Compound(label="flagellum", children=[flagellum])

    return Compound(label="sperm", children=[head, acrosome, midpiece, flagellum])


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step
    out = Path(__file__).resolve().parent / "out"
    out.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out / "sperm.step"))
    print(f"wrote {out/'sperm.step'}")
