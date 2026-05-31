"""Science Atlas - Neptune CAD source.

Neptune: ice-giant sphere with atmosphere shell.
Dimensions are educational display units in millimetres, not real
astronomical scale. The browser uses the procedural Three.js builder
``buildPlanet``/``buildStar`` in ``assets/bio/geometry.js`` at runtime;
this build123d source is optional and only needed to regenerate STEP/GLB.
"""

from __future__ import annotations

from pathlib import Path


def make():
    from build123d import Compound, Pos, Sphere

    body = Compound(label="neptune_body", children=[Sphere(radius=0.8)])
    children = [body]

    return Compound(label="neptune", children=children)


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step

    out_dir = Path(__file__).resolve().parent / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out_dir / "neptune.step"))
    print(f"wrote {out_dir/'neptune.step'}")
