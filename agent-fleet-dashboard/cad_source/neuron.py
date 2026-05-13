"""BioCell Atlas — Neuron CAD source.

Stylised neuron: soma sphere, dendrites as branched cylinders, axon
tube with myelin toroidal sheaths and terminal boutons.
Dimensions in millimetres (educational scale).
"""

from __future__ import annotations

from pathlib import Path


def make():
    import math
    from build123d import Compound, Cylinder, Pos, Rot, Sphere, Torus

    soma = Sphere(radius=0.65)
    nucleus = Sphere(radius=0.3)
    soma_group = Compound(label="soma", children=[soma, nucleus])

    # dendrites — spread over upper hemisphere
    dendrites = []
    for i in range(7):
        theta = i * (2 * math.pi / 7) + 0.1 * i
        direction = (math.cos(theta), 0.75, math.sin(theta))
        length = 0.85
        dend = Cylinder(radius=0.05, height=length, rotation=(90, 0, 0))
        dend = dend.moved(
            Pos(direction[0] * (0.5 + length / 2), direction[1] * (0.5 + length / 2), direction[2] * (0.5 + length / 2))
            * Rot(math.degrees(theta), 60, 0)
        )
        dendrites.append(dend)
    dendrite_group = Compound(label="dendrites", children=dendrites)

    # axon: long cylinder along -Y
    axon_length = 2.6
    axon = Cylinder(radius=0.05, height=axon_length)
    axon = axon.moved(Pos(0.15, -0.65 - axon_length / 2, 0.05))
    axon_group = Compound(label="axon", children=[axon])

    # myelin: 6 toroidal segments
    myelin = []
    for i in range(6):
        t = (i + 0.5) / 6
        y = -0.65 - axon_length * t
        ring = Torus(major_radius=0.115, minor_radius=0.035)
        ring = ring.moved(Pos(0.15, y, 0.05) * Rot(0, 0, 90))
        myelin.append(ring)
    myelin_group = Compound(label="myelin", children=myelin)

    # terminals
    terminal_origin = (0.15, -0.65 - axon_length, 0.05)
    terminals = []
    for i in range(5):
        theta = i * (2 * math.pi / 5)
        t_pos = (
            terminal_origin[0] + math.cos(theta) * 0.2,
            terminal_origin[1] - 0.12,
            terminal_origin[2] + math.sin(theta) * 0.2,
        )
        terminals.append(Sphere(radius=0.1).moved(Pos(*t_pos)))
    terminal_group = Compound(label="terminals", children=terminals)

    return Compound(
        label="neuron",
        children=[soma_group, dendrite_group, axon_group, myelin_group, terminal_group],
    )


def gen_step():
    return make()


if __name__ == "__main__":
    from build123d import export_step

    out_dir = Path(__file__).resolve().parent / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    export_step(make(), str(out_dir / "neuron.step"))
    print(f"wrote {out_dir/'neuron.step'}")
