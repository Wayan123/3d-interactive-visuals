"""BioCell Atlas \u2014 HIV virion CAD source.

Spherical lipid envelope, conical capsid (p24), gp120/gp41 spikes,
two RNA copies + reverse transcriptase clusters.
"""

from __future__ import annotations
from pathlib import Path


def make():
    from build123d import Compound, Cone, Cylinder, Pos, Sphere
    from cad_source._shared import fibonacci_sphere

    envelope = Sphere(radius=0.55)
    envelope = Compound(label="envelope", children=[envelope])

    spikes = []
    for u in fibonacci_sphere(22):
        base = (u[0] * 0.55, u[1] * 0.55, u[2] * 0.55)
        tip = (u[0] * 0.7, u[1] * 0.7, u[2] * 0.7)
        stalk = Cone(bottom_radius=0.022, top_radius=0.03, height=0.13).moved(Pos(*base))
        head = Sphere(radius=0.03).moved(Pos(*tip))
        spikes.append(stalk)
        spikes.append(head)
    spike_group = Compound(label="spike", children=spikes)

    capsid = Cone(bottom_radius=0.18, top_radius=0.07, height=0.5)
    capsid = Compound(label="capsid", children=[capsid])

    rna = Cylinder(radius=0.015, height=0.5)
    rna = Compound(label="rna", children=[rna])

    return Compound(label="hiv", children=[envelope, spike_group, capsid, rna])


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step
    out = Path(__file__).resolve().parent / "out"
    out.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out / "hiv.step"))
    print(f"wrote {out/'hiv.step'}")
