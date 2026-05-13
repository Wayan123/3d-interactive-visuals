"""BioCell Atlas — E. coli CAD source.

Stylised capsule body with peritrichous flagella and a nucleoid helix.
Dimensions in millimetres (educational scale).

Run with the text-to-cad skill (once build123d is installed) e.g.::

    python3.11 -m skills.cad.scripts.step cad_source/ecoli.py \
        -o cad_source/out/ecoli.step --glb cad_source/out/ecoli.glb
"""

from __future__ import annotations

from pathlib import Path


def make():
    from build123d import (
        Axis,
        Box,
        Compound,
        Cylinder,
        Location,
        Plane,
        Pos,
        Rot,
        Sphere,
    )

    length = 2.2
    radius = 0.55

    # capsule body = cylinder + two hemispheres
    body_cyl = Cylinder(radius=radius, height=length - 2 * radius, rotation=(90, 0, 0))
    cap_a = Sphere(radius=radius).moved(Pos(X=(length - 2 * radius) / 2))
    cap_b = Sphere(radius=radius).moved(Pos(X=-(length - 2 * radius) / 2))
    # orient capsule along X axis
    body = body_cyl.moved(Rot(0, 90, 0)) + cap_a + cap_b
    body = Compound(label="membrane", children=[body])

    # nucleoid = circular loop approximated as torus (educational scale)
    from build123d import Torus
    nucleoid = Torus(major_radius=0.18, minor_radius=0.04)
    nucleoid = Compound(label="nucleoid", children=[nucleoid])

    # flagella placeholders: four tapered cylinders exiting one pole
    flagella = []
    import math

    for i in range(4):
        theta = i * math.pi / 2
        flagellum = Cylinder(radius=0.035, height=1.5, rotation=(0, 90, 0))
        flagellum = flagellum.moved(
            Pos(X=-(length / 2 + 0.75), Y=math.cos(theta) * 0.25, Z=math.sin(theta) * 0.25)
        )
        flagella.append(flagellum)
    flagella_compound = Compound(label="flagella", children=flagella)

    # pili: short straight cylinders around the body (educational abstraction)
    pili = []
    for i in range(10):
        theta = i * (2 * math.pi / 10)
        pilus = Cylinder(radius=0.015, height=0.5)
        pilus = pilus.moved(
            Location(
                (0.0, math.cos(theta) * (radius + 0.25), math.sin(theta) * (radius + 0.25))
            )
            * Rot(math.degrees(theta), 0, 0)
        )
        pili.append(pilus)
    pili_compound = Compound(label="pili", children=pili)

    return Compound(label="ecoli", children=[body, nucleoid, flagella_compound, pili_compound])


def gen_step():
    return make()


if __name__ == "__main__":
    out_dir = Path(__file__).resolve().parent / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    assembly = make()
    from build123d import export_step

    export_step(assembly, str(out_dir / "ecoli.step"))
    print(f"wrote {out_dir/'ecoli.step'}")
