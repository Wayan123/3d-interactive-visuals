"""Science Atlas - Hydrogen Atom CAD source.

Conceptual atom-scale model with enlarged proton nucleus, probability cloud,
orbit guide rings, and one electron marker. Dimensions are educational display
units in millimetres, not real atomic scale.
"""

from __future__ import annotations

from pathlib import Path


def make():
    from build123d import Compound, Pos, Rot, Sphere, Torus

    nucleus = Compound(label="proton_nucleus", children=[Sphere(radius=0.18)])

    cloud = Sphere(radius=1.08)
    cloud = Compound(label="one_s_probability_cloud", children=[cloud])

    orbit_xy = Torus(major_radius=0.95, minor_radius=0.01)
    orbit_yz = Torus(major_radius=0.95, minor_radius=0.01).moved(Rot(90, 0, 0))
    orbit_tilt = Torus(major_radius=0.95, minor_radius=0.01).moved(Rot(0, 90, 36))
    orbits = Compound(label="orbit_guides", children=[orbit_xy, orbit_yz, orbit_tilt])

    electron = Sphere(radius=0.06).moved(Pos(0.95, 0, 0))
    electron = Compound(label="electron_marker", children=[electron])

    return Compound(label="hydrogen_atom_conceptual", children=[nucleus, cloud, orbits, electron])


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step

    out_dir = Path(__file__).resolve().parent / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out_dir / "hydrogen_atom.step"))
    print(f"wrote {out_dir/'hydrogen_atom.step'}")
