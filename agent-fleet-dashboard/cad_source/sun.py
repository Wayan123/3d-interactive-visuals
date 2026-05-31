"""Science Atlas - Sun CAD source.

Sun: enlarged photosphere sphere with a smaller core marker. Educational, not to scale.
Dimensions are educational display units in millimetres, not real
astronomical scale. The browser uses the procedural Three.js builder
``buildPlanet``/``buildStar`` in ``assets/bio/geometry.js`` at runtime;
this build123d source is optional and only needed to regenerate STEP/GLB.
"""

from __future__ import annotations

from pathlib import Path


def make():
    from build123d import Compound, Pos, Sphere

    body = Compound(label="sun_body", children=[Sphere(radius=1.25)])
    children = [body]
    core = Compound(label="core", children=[Sphere(radius=0.7)])
    children.append(core)

    return Compound(label="sun", children=children)


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step

    out_dir = Path(__file__).resolve().parent / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out_dir / "sun.step"))
    print(f"wrote {out_dir/'sun.step'}")
