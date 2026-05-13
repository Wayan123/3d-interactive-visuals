"""BioCell Atlas — Macrophage CAD source.

Large phagocyte with pseudopodia + phagosomes + lysosomes.
"""
from __future__ import annotations
from pathlib import Path


def make():
    import math
    from build123d import Compound, Pos, Sphere
    from cad_source._shared import fibonacci_sphere

    membrane = Compound(label="membrane", children=[Sphere(radius=1.1)])
    nucleus = Sphere(radius=0.45).moved(Pos(0.25, 0.1, 0))
    nucleus = Compound(label="nucleus", children=[nucleus])

    pseudos = []
    for i in range(7):
        a = i * (math.pi * 2 / 7)
        tip = (math.cos(a) * 1.5, math.sin(i * 1.3) * 0.5, math.sin(a) * 1.5)
        pseudos.append(Sphere(radius=0.28).moved(Pos(*tip)))
    pseudo_group = Compound(label="pseudopodia", children=pseudos)

    phagosomes = [Sphere(radius=0.14).moved(Pos(math.cos(i * 1.5) * 0.5, -0.25, math.sin(i * 1.5) * 0.5)) for i in range(4)]
    phag_group = Compound(label="phagosomes", children=phagosomes)

    lysosomes = [Sphere(radius=0.05).moved(Pos(u[0] * 0.6, u[1] * 0.6, u[2] * 0.6)) for u in fibonacci_sphere(15)]
    lys_group = Compound(label="lysosomes", children=lysosomes)

    return Compound(label="macrophage", children=[membrane, nucleus, pseudo_group, phag_group, lys_group])


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step
    out = Path(__file__).resolve().parent / "out"
    out.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out / "macrophage.step"))
    print(f"wrote {out/'macrophage.step'}")
