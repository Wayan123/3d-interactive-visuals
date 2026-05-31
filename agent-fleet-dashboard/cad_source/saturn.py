"""Science Atlas - Saturn CAD source.

Saturn: gas-giant sphere with a flat ring system (thin tori).
Dimensions are educational display units in millimetres, not real
astronomical scale. The browser uses the procedural Three.js builder
``buildPlanet``/``buildStar`` in ``assets/bio/geometry.js`` at runtime;
this build123d source is optional and only needed to regenerate STEP/GLB.
"""

from __future__ import annotations

from pathlib import Path


def make():
    from build123d import Compound, Pos, Sphere

    body = Compound(label="saturn_body", children=[Sphere(radius=0.95)])
    children = [body]
    from build123d import Torus
    rings = Compound(label="rings", children=[Torus(major_radius=1.7, minor_radius=0.04)])
    children.append(rings)

    return Compound(label="saturn", children=children)


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step

    out_dir = Path(__file__).resolve().parent / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out_dir / "saturn.step"))
    print(f"wrote {out_dir/'saturn.step'}")
