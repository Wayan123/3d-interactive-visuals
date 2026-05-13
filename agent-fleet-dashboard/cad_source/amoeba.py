"""BioCell Atlas — Amoeba CAD source (shape-shifting protozoan)."""
from __future__ import annotations
from pathlib import Path


def make():
    import math
    from build123d import Compound, Pos, Sphere

    body = Compound(label="membrane", children=[Sphere(radius=0.9)])
    nucleus = Sphere(radius=0.32).moved(Pos(0, 0, 0.1))
    nucleus = Compound(label="nucleus", children=[nucleus])

    pseudos = []
    for i in range(5):
        a = i * (math.pi * 2 / 5)
        tip = (math.cos(a) * 1.35, math.sin(i * 1.7) * 0.3, math.sin(a) * 1.35)
        pseudos.append(Sphere(radius=0.25).moved(Pos(*tip)))
    pseudo_group = Compound(label="pseudopods", children=pseudos)

    food = Sphere(radius=0.22).moved(Pos(0.3, -0.15, -0.2))
    contractile = Sphere(radius=0.16).moved(Pos(-0.35, 0.2, 0))
    vacuoles = Compound(label="vacuoles", children=[food, contractile])

    return Compound(label="amoeba", children=[body, nucleus, pseudo_group, vacuoles])


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step
    out = Path(__file__).resolve().parent / "out"
    out.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out / "amoeba.step"))
    print(f"wrote {out/'amoeba.step'}")
