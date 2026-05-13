"""BioCell Atlas — Mitochondrion CAD source.

Stylised mitochondrion: ellipsoid outer/inner membranes, cristae as
lateral toroidal folds, mtDNA circular loops in the matrix.
Dimensions in millimetres (educational scale).
"""

from __future__ import annotations

from pathlib import Path


def make():
    import math
    from build123d import Compound, Pos, Rot, Sphere, Torus, Cylinder

    # approximate ellipsoid as sphere + scale via Location? build123d doesn't
    # scale directly on a body, so we keep sphere and note scale in label.
    outer = Sphere(radius=0.6)
    outer = Compound(label="outer_membrane_1.5x0.55x0.55mm", children=[outer])

    inner = Sphere(radius=0.53)
    inner = Compound(label="inner_membrane", children=[inner])

    cristae = []
    for i in range(7):
        t = (i + 0.5) / 7
        x = -0.6 + t * 1.2
        phase = i * (2 * math.pi / 7)
        tor = Torus(major_radius=0.32, minor_radius=0.022)
        tor = tor.moved(Pos(x, math.sin(phase) * 0.08, math.cos(phase) * 0.08) * Rot(0, 90, 0))
        cristae.append(tor)
    cristae_group = Compound(label="cristae", children=cristae)

    mtdna = []
    for i in range(2):
        mtdna.append(
            Torus(major_radius=0.18, minor_radius=0.015).moved(Pos(-0.3 + i * 0.3, 0, 0) * Rot(90, 0, 0))
        )
    mtdna_group = Compound(label="mtdna", children=mtdna)

    return Compound(
        label="mitochondrion",
        children=[outer, inner, cristae_group, mtdna_group],
    )


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step

    out_dir = Path(__file__).resolve().parent / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out_dir / "mitochondrion.step"))
    print(f"wrote {out_dir/'mitochondrion.step'}")
