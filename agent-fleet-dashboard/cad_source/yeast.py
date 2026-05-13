"""BioCell Atlas — Yeast CAD source (Saccharomyces with budding daughter)."""
from __future__ import annotations
from pathlib import Path


def make():
    from build123d import Compound, Pos, Sphere

    wall = Compound(label="cell_wall", children=[Sphere(radius=0.75)])
    membrane = Compound(label="membrane", children=[Sphere(radius=0.7)])
    nucleus = Sphere(radius=0.25).moved(Pos(0, 0.05, 0))
    nucleus = Compound(label="nucleus", children=[nucleus])
    vacuole = Sphere(radius=0.28).moved(Pos(-0.2, -0.15, 0.15))
    vacuole = Compound(label="vacuole", children=[vacuole])

    bud = Sphere(radius=0.32).moved(Pos(0.75, 0.55, 0))
    bud = Compound(label="bud", children=[bud])

    return Compound(label="yeast", children=[wall, membrane, nucleus, vacuole, bud])


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step
    out = Path(__file__).resolve().parent / "out"
    out.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out / "yeast.step"))
    print(f"wrote {out/'yeast.step'}")
