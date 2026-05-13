"""BioCell Atlas — Ribosome CAD source.

Stylised ribosome: large subunit (60S), small subunit (40S), and a thin
mRNA tube threading through the interface cleft.
Dimensions in millimetres (educational scale).
"""

from __future__ import annotations

from pathlib import Path


def make():
    from build123d import Compound, Cylinder, Pos, Rot, Sphere

    large = Sphere(radius=0.36).moved(Pos(0, 0.08, 0))
    large = Compound(label="large_subunit_60S", children=[large])

    small = Sphere(radius=0.24).moved(Pos(0, -0.18, 0))
    small = Compound(label="small_subunit_40S", children=[small])

    mrna = Cylinder(radius=0.03, height=1.2, rotation=(0, 0, 90))
    mrna = mrna.moved(Pos(0, -0.18, 0))
    mrna = Compound(label="mrna", children=[mrna])

    return Compound(label="ribosome", children=[large, small, mrna])


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step

    out_dir = Path(__file__).resolve().parent / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out_dir / "ribosome.step"))
    print(f"wrote {out_dir/'ribosome.step'}")
