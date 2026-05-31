"""Science Atlas - Earth CAD source.

Earth: sphere with atmosphere shell and a small Moon at orbital distance.
Dimensions are educational display units in millimetres, not real
astronomical scale. The browser uses the procedural Three.js builder
``buildPlanet``/``buildStar`` in ``assets/bio/geometry.js`` at runtime;
this build123d source is optional and only needed to regenerate STEP/GLB.
"""

from __future__ import annotations

from pathlib import Path


def make():
    from build123d import Compound, Pos, Sphere

    body = Compound(label="earth_body", children=[Sphere(radius=0.72)])
    children = [body]
    moon = Compound(label="moon", children=[Sphere(radius=0.18).moved(Pos(1.5, 0.15, 0))])
    children.append(moon)

    return Compound(label="earth", children=children)


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step

    out_dir = Path(__file__).resolve().parent / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out_dir / "earth.step"))
    print(f"wrote {out_dir/'earth.step'}")
