"""BioCell Atlas — SARS-CoV-2 virus CAD source.

Stylised enveloped RNA virus: icosphere envelope, 40 spike trimers as
tapered clubs, dotted M/E proteins, and an internal helical RNA coil.
Dimensions in millimetres (educational scale).
"""

from __future__ import annotations

from pathlib import Path


def make():
    import math
    from build123d import Compound, Cone, Cylinder, Pos, Rot, Sphere
    from cad_source._shared import fibonacci_sphere

    envelope = Sphere(radius=0.55)
    envelope = Compound(label="envelope", children=[envelope])

    spikes = []
    for u in fibonacci_sphere(40):
        base = (u[0] * 0.55, u[1] * 0.55, u[2] * 0.55)
        tip = (u[0] * 0.77, u[1] * 0.77, u[2] * 0.77)
        stalk = Cone(bottom_radius=0.022, top_radius=0.045, height=0.22).moved(Pos(*base))
        head = Sphere(radius=0.07).moved(Pos(*tip))
        spikes.append(stalk)
        spikes.append(head)
    spike_group = Compound(label="spike", children=spikes)

    mp_nodes = []
    for u in fibonacci_sphere(25):
        mp_nodes.append(Sphere(radius=0.045).moved(Pos(u[0] * 0.56, u[1] * 0.56, u[2] * 0.56)))
    mp_group = Compound(label="membrane_prot", children=mp_nodes)

    # RNA: approximate as a chain of small spheres along a helix
    rna_balls = []
    for i in range(40):
        t = i / 39
        ang = t * 5 * math.pi * 2
        x = -0.4 + t * 0.8
        y = math.cos(ang) * 0.18
        z = math.sin(ang) * 0.18
        rna_balls.append(Sphere(radius=0.035).moved(Pos(x, y, z)))
    rna_group = Compound(label="rna", children=rna_balls)

    return Compound(
        label="virus_sarscov2",
        children=[envelope, spike_group, mp_group, rna_group],
    )


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step

    out_dir = Path(__file__).resolve().parent / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out_dir / "virus_sarscov2.step"))
    print(f"wrote {out_dir/'virus_sarscov2.step'}")
