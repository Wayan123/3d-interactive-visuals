"""BioCell Atlas — Ebola virus CAD source (filamentous RNA virus)."""
from __future__ import annotations
from pathlib import Path


def make():
    import math
    from build123d import Compound, Cone, Cylinder, Pos, Sphere

    # Straight filament approximation of the curved native shape
    envelope = Cylinder(radius=0.09, height=2.8, rotation=(0, 0, 90))
    envelope = Compound(label="envelope", children=[envelope])

    # GP spikes along the length
    spikes = []
    for i in range(30):
        t = i / 30
        x = -1.4 + t * 2.8
        angle = i * (math.pi * 2 / 30) * 2.7
        y = math.cos(angle) * 0.09
        z = math.sin(angle) * 0.09
        tip_y = math.cos(angle) * 0.17
        tip_z = math.sin(angle) * 0.17
        spikes.append(Cone(bottom_radius=0.018, top_radius=0.028, height=0.08).moved(Pos(x, y, z)))
        spikes.append(Sphere(radius=0.035).moved(Pos(x, tip_y, tip_z)))
    spike_group = Compound(label="spike", children=spikes)

    # Internal nucleocapsid (simple tube approximation)
    core = Cylinder(radius=0.045, height=2.4, rotation=(0, 0, 90))
    core = Compound(label="rna", children=[core])

    return Compound(label="ebola", children=[envelope, spike_group, core])


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step
    out = Path(__file__).resolve().parent / "out"
    out.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out / "ebola.step"))
    print(f"wrote {out/'ebola.step'}")
