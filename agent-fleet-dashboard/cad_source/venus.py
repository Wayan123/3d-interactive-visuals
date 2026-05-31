"""Science Atlas - Venus CAD source.

Venus: rocky sphere with a thin offset atmosphere shell.
Dimensions are educational display units in millimetres, not real
astronomical scale. The browser uses the procedural Three.js builder
``buildPlanet``/``buildStar`` in ``assets/bio/geometry.js`` at runtime;
this build123d source is optional and only needed to regenerate STEP/GLB.
"""

from __future__ import annotations

from pathlib import Path


def make():
    from build123d import Compound, Pos, Sphere

    body = Compound(label="venus_body", children=[Sphere(radius=0.7)])
    children = [body]

    return Compound(label="venus", children=children)


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step

    out_dir = Path(__file__).resolve().parent / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out_dir / "venus.step"))
    print(f"wrote {out_dir/'venus.step'}")
