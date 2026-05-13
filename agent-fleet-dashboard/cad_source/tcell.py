"""BioCell Atlas — T-cell (immune lymphocyte) CAD source.

Stylised cytotoxic T-cell: plasma membrane, large nucleus, distributed
T-cell receptors, internal cytotoxic granules, scattered mitochondria.
Dimensions in millimetres (educational scale).
"""

from __future__ import annotations

from pathlib import Path


def make():
    import math
    from build123d import Compound, Cone, Pos, Rot, Sphere
    from cad_source._shared import fibonacci_sphere

    membrane = Sphere(radius=0.85)
    membrane = Compound(label="membrane", children=[membrane])

    nucleus = Sphere(radius=0.52).moved(Pos(0.12, 0.05, -0.05))
    nucleus = Compound(label="nucleus", children=[nucleus])

    tcrs = []
    for u in fibonacci_sphere(40):
        base = (u[0] * 0.85, u[1] * 0.85, u[2] * 0.85)
        tip = (u[0] * 0.98, u[1] * 0.98, u[2] * 0.98)
        cone = Cone(bottom_radius=0.04, top_radius=0.015, height=0.13)
        # orient cone along radial direction (simple translation; orientation
        # is cosmetic for STEP; fine-grained alignment left to runtime render)
        cone = cone.moved(Pos(*base))
        tcrs.append(cone)
    tcr_group = Compound(label="tcr", children=tcrs)

    granules = []
    for i, u in enumerate(fibonacci_sphere(7)):
        pos = (u[0] * 0.4, u[1] * 0.4, u[2] * 0.4)
        granules.append(Sphere(radius=0.065).moved(Pos(*pos)))
    granule_group = Compound(label="granules", children=granules)

    mitos = []
    for i in range(4):
        theta = i * math.pi / 2
        mitos.append(
            Sphere(radius=0.12).moved(Pos(math.cos(theta) * 0.55, -0.25, math.sin(theta) * 0.55))
        )
    mito_group = Compound(label="mitochondria", children=mitos)

    return Compound(
        label="tcell",
        children=[membrane, nucleus, tcr_group, granule_group, mito_group],
    )


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step

    out_dir = Path(__file__).resolve().parent / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out_dir / "tcell.step"))
    print(f"wrote {out_dir/'tcell.step'}")
