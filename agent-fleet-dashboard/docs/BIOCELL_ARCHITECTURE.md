# BioCell Atlas 3D — Architecture

Dashboard local untuk eksplorasi bakteri, sel, dan organel secara interaktif. Semua render 3D **procedural** di browser via Three.js (tanpa GLB eksternal, tanpa Tripo/Gemini). Backend Python stdlib menyediakan live service metrics.

## Goal

Visualisasi 3D yang teroptimasi untuk:

1. Bacteria (E. coli)
2. Animal cell (eukaryote)
3. Plant cell (dengan chloroplast + vacuole)
4. Neuron (dengan dendrit + axon + myelin)
5. T-cell (immune lymphocyte)
6. Virus (SARS-CoV-2 capsid + spike)
7. Mitochondrion (internal: cristae + matrix + DNA circular)
8. Ribosome (large + small subunit)

## Views

- **Atlas**: semua cell orbit di ring, auto-rotate.
- **Dive**: cell terpilih membesar, organel internal visible + label.
- **Microscope**: vignette, scan lines, brightness slider, grayscale toggle.
- **CAD source preview**: tampilkan Python build123d source untuk tiap cell (text-only, read-only, copy-able).

## File Map

```text
index.html
run.sh
server.py                       ← Python stdlib backend
requirements-optional.txt       ← build123d/trimesh (tidak auto-install)
README.md
assets/
  styles.css
  app.js                        ← orchestrator
  bio/
    geometry.js                 ← cell + organelle factories
    scene.js                    ← scene/lighting/camera + modes
    microscope.js               ← post-effects overlay
    poll.js                     ← /api polling + live metrics
data/
  cells.json                    ← atlas data (primary)
  fleet.json                    ← back-compat (services as fleet nodes)
cad_source/                     ← build123d Python (optional run)
  ecoli.py
  animal_cell.py
  plant_cell.py
  neuron.py
  tcell.py
  virus_sarscov2.py
  mitochondrion.py
  ribosome.py
  README.md
docs/
  BIOCELL_ARCHITECTURE.md
  TEXT_TO_CAD_REFERENCE.md
  CRITIQUE_LOG.md
```

## Rendering Optimizations

- `InstancedMesh` untuk ribosomes (tinggi jumlahnya).
- Shared materials: satu `MeshPhysicalMaterial` membrane di-share antar cell.
- `BufferGeometry` custom untuk flagella (tube), DNA helix (CatmullRom curve), cristae (lathe).
- LOD: atlas mode pakai geometry resolusi rendah, dive mode naikkan resolusi.
- Procedural noise (simplex-like) via displacement untuk organic feel.
- Post-FX: subtle bloom/vignette via `UnrealBloomPass` + radial vignette shader.
- Auto-rotate halus + micro-brownian jitter untuk organel.

## Backend

`server.py` pakai `http.server.ThreadingHTTPServer` + `BaseHTTPRequestHandler`, **tanpa** install dependency. Endpoints:

- `GET /api/health` — status self + port.
- `GET /api/cells` — atlas data (cells + organelles + facts).
- `GET /api/services` — probe optional extra services (BIOCELL_EXTRA_PROBES), tmux sessions, `/proc/stat`, `/proc/meminfo`, `df`.
- `GET /api/fleet` — gabungan cells + services (back-compat).

Collector aman:
- HTTP probe via `urllib.request` timeout 2s, jangan restart/kill apapun.
- tmux via `subprocess.run(["tmux", "ls"], timeout=3)`.
- System metrics via `/proc/stat` delta + `/proc/meminfo` + `df -P ~`.

## Data Schema (cells.json)

```jsonc
{
  "updatedAt": "ISO",
  "cells": [
    {
      "id": "ecoli",
      "label": "E. coli",
      "kingdom": "Bacteria",
      "type": "prokaryote",
      "atlasPosition": [x, y, z],
      "scale": 1.0,
      "size": "2 µm x 0.5 µm",
      "facts": ["..."],
      "stats": { "complexity": 3, "components": 5, "genomeKb": 4640 },
      "components": [
        { "id": "flagellum", "label": "Flagellum", "role": "motility", "color": "#5ff0c4" }
      ],
      "cad": { "source": "cad_source/ecoli.py", "prompt": "..." },
      "geometry": { "builder": "buildEcoli", "params": { "length": 2.2, "radius": 0.55, "flagella": 4 } }
    }
  ],
  "links": [ ["ecoli", "tcell", "antigen recognition"] ]
}
```

## Iterasi (critique loop)

- Pass 1: semua 8 cell render, UI berfungsi, no console error fatal.
- Pass 2: fix issue dari pass 1, tuning material/lighting, live polling stabil.
- Pass 3: polish motion, scan lines HUD, hover tooltip, dive camera cinematic.

## Safety Rules (dari handoff)

- Tidak restart/kill service lain selain `agent-fleet-dashboard` sendiri.
- Tidak install dependency tanpa izin eksplisit.
- Tidak push/pull git.
- Tidak hapus file user.
- Tidak modify cron.
