"""BioCell Atlas — Staphylococcus aureus CAD source (grape-cluster cocci)."""
from __future__ import annotations
from pathlib import Path


def make():
    from build123d import Compound, Pos, Sphere

    positions = [
        (0, 0, 0), (0.55, 0.1, 0), (-0.45, 0.2, 0.15),
        (0.15, 0.55, -0.1), (-0.15, -0.4, 0.2), (0.5, -0.35, 0.1),
        (-0.5, -0.15, -0.3), (0.2, 0.3, 0.45), (-0.25, 0.45, 0.3),
    ]
    cocci = [Sphere(radius=0.3).moved(Pos(*p)) for p in positions]
    cocci_group = Compound(label="cocci", children=cocci)

    nucleoids = [Sphere(radius=0.1).moved(Pos(*p)) for p in positions]
    nuc_group = Compound(label="nucleoids", children=nucleoids)

    return Compound(label="staph", children=[cocci_group, nuc_group])


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step
    out = Path(__file__).resolve().parent / "out"
    out.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out / "staph.step"))
    print(f"wrote {out/'staph.step'}")
