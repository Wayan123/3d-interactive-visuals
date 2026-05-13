"""BioCell Atlas — Paramecium CAD source (ciliate protozoan)."""
from __future__ import annotations
from pathlib import Path


def make():
    from build123d import Compound, Cylinder, Pos, Sphere
    from cad_source._shared import fibonacci_sphere

    body = Cylinder(radius=0.55, height=2.4, rotation=(0, 90, 0))
    body = Compound(label="membrane", children=[body])

    cilia = []
    for u in fibonacci_sphere(60):
        cilia.append(
            Cylinder(radius=0.01, height=0.2).moved(
                Pos(u[0] * 1.1, u[1] * 0.55, u[2] * 0.55)
            )
        )
    cilia_group = Compound(label="cilia", children=cilia)

    macronucleus = Sphere(radius=0.35).moved(Pos(0.2, 0, 0))
    macronucleus = Compound(label="macronucleus", children=[macronucleus])
    micronucleus = Sphere(radius=0.12).moved(Pos(0.3, 0.15, 0.15))
    micronucleus = Compound(label="micronucleus", children=[micronucleus])

    return Compound(label="paramecium", children=[body, cilia_group, macronucleus, micronucleus])


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step
    out = Path(__file__).resolve().parent / "out"
    out.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out / "paramecium.step"))
    print(f"wrote {out/'paramecium.step'}")
