# Cell Architecture Studio 3D

> Local 3D explorer for **16 biological specimens** — tissue cells, bacteria, **5 viruses** (SARS-CoV-2, Bacteriophage T4, HIV, Influenza A, Adenovirus), red blood cell, and standalone organelles. 100 % procedural Three.js. Backend Python standard library only. Dark / Light / System theme. English + Bahasa Indonesia. No external 3D model services.

![Demo walkthrough](agent-fleet-dashboard/docs/screenshots/demo.gif)

**Live (local)**: `http://127.0.0.1:8877/`

## Quick start

```bash
git clone https://github.com/Wayan123/3d-interactive-visuals.git
cd 3d-interactive-visuals/agent-fleet-dashboard
./run.sh
```

Then open <http://127.0.0.1:8877/> in any WebGL-capable browser.

No `pip install`, no `npm install`. Just Python 3.10+ and a browser. Three.js loads from CDN on first run, then the app works fully offline.

## What's inside

- **16 specimens** across 6 categories:
  - *Tissue cells* (6): Plant, Animal, Neuron, Epithelial, Stem, Muscle
  - *Specialised* (1): T-cell
  - *Blood cells* (1): Red Blood Cell (erythrocyte)
  - *Bacteria* (1): E. coli
  - *Viruses* (5): SARS-CoV-2, Bacteriophage T4, HIV, Influenza A, Adenovirus
  - *Standalone organelles* (2): Mitochondrion, Ribosome
- **6 view modes**: Standalone · Microscope · Electron Microscope · **Process** (virus lifecycle) · Atlas · Compare
- **Read View** with auto-annotated leader-lines + labels per organelle
- **Cross-section** (XYZ clipping plane) to reveal interior
- **Process view** — animated 5-stage virus replication timeline with narration
- **5 top-bar panels**: Gallery · Library · Recents · **Manual** (bilingual in-app guide, 11 sections) · Settings
- **3 themes** (Dark / Light / System) and **bilingual UI** (English + Bahasa Indonesia)
- **3D Export** (Cell JSON, Atlas JSON, GLB via `GLTFExporter`, STEP-via-build123d instructions)
- **Axis gizmo XYZ indicator**, hover tooltips, click-to-select organelles
- **Backend Python stdlib only** — `/api/health`, `/api/cells`, `/api/services`, `/api/fleet`, zero pip deps

## Screenshots

### Landing (Plant Cell · Dark · English)

![Landing](agent-fleet-dashboard/docs/screenshots/01-landing.png)

### Atlas — all 16 specimens at once

![Atlas](agent-fleet-dashboard/docs/screenshots/02-atlas.png)

### Gallery panel — grid with rendered thumbnails

![Gallery](agent-fleet-dashboard/docs/screenshots/03-gallery.png)

### Read View — annotated organelles with leader lines

![Read View](agent-fleet-dashboard/docs/screenshots/05-read-view.png)

### Cross-Section — slice the cell to see interior

![Section](agent-fleet-dashboard/docs/screenshots/06-cross-section.png)

### Virus Lifecycle (Process mode) — SARS-CoV-2 replication stage

![Process](agent-fleet-dashboard/docs/screenshots/08-process-mode.png)

### Electron Microscope — true monochrome SEM

![Electron](agent-fleet-dashboard/docs/screenshots/10-electron-microscope.png)

### Compare — two cells side-by-side with VS separator

![Compare](agent-fleet-dashboard/docs/screenshots/11-compare-cells.png)

### In-app Manual (bilingual English / Bahasa Indonesia)

![Manual EN](agent-fleet-dashboard/docs/screenshots/13-manual-english.png)

### Light theme + Bahasa Indonesia

![Light ID](agent-fleet-dashboard/docs/screenshots/12-light-theme-indonesian.png)

### Settings — Theme, Language, autoplay, bloom

![Settings](agent-fleet-dashboard/docs/screenshots/15-settings-panel.png)

## Repository layout

```text
3d-interactive-visuals/
├── README.md                              this file
├── LICENSE                                MIT
└── agent-fleet-dashboard/                 the live Cell Architecture Studio app
    ├── index.html
    ├── run.sh
    ├── server.py                          Python stdlib backend
    ├── requirements-optional.txt          build123d (OPTIONAL — CAD export only)
    ├── assets/
    │   ├── app.js                         frontend orchestrator
    │   ├── styles.css                     theme + panels + tooltips
    │   └── bio/
    │       ├── geometry.js                16 procedural cell builders
    │       ├── scene.js                   scene, lighting, bloom, modes, gizmo
    │       ├── thumbnails.js              offscreen WebGL thumbnail renderer
    │       ├── i18n.js                    en + id translations (190+ keys)
    │       ├── manual.js                  bilingual user manual content
    │       ├── microscope.js              legacy CSS overlay
    │       └── poll.js                    API polling with graceful fallback
    ├── cad_source/                        build123d Python (OPTIONAL export)
    ├── data/cells.json                    16 cells + 6 categories + taxonomy + lifecycles
    └── docs/
        ├── BIOCELL_ARCHITECTURE.md
        ├── CRITIQUE_LOG.md                iteration notes
        └── screenshots/                   demo GIF + 15 PNG screenshots
```

See [`agent-fleet-dashboard/README.md`](agent-fleet-dashboard/README.md) for the full app documentation, deep-link parameters, and `docs/CRITIQUE_LOG.md` for the iteration history.

## Deep-links (try these)

```text
http://127.0.0.1:8877/?cell=bacteriophage&mode=process
http://127.0.0.1:8877/?cell=hiv&mode=standalone&section=y:50
http://127.0.0.1:8877/?cell=animal-cell&mode=standalone&read=1
http://127.0.0.1:8877/?cell=influenza&mode=electron
http://127.0.0.1:8877/?theme=light&lang=id&panel=gallery
http://127.0.0.1:8877/?panel=manual&lang=id
```

## Environment variables (optional)

| Variable | Default | Purpose |
|---|---|---|
| `BIOCELL_HOST` | `127.0.0.1` | HTTP bind host |
| `BIOCELL_PORT` | `8877` | HTTP bind port |
| `BIOCELL_EXTRA_PROBES` | *(empty)* | Comma-separated `id\|label\|role\|url` quadruples to probe in `/api/services`. Private by default. |
| `BIOCELL_TMUX_EXPOSE` | *(empty)* | Set to any value to include local tmux session names in `/api/services`. Off by default for privacy. |

## Design decisions

- **Procedural first**: every cell, organelle, spike, flagellum is built from `BufferGeometry` + `InstancedMesh` + `CatmullRomCurve3` + noise displacement. No GLB assets.
- **Offline by default**: Python stdlib backend, Three.js CDN only on first load.
- **build123d as CAD source**: `cad_source/*.py` matches the [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad) harness convention. Optional install if you want STEP/GLB export; not needed for browser rendering.
- **Clear separation** of view modes: Atlas for overview, Standalone for focus, Process for animation, Compare for teaching, Section for interior, Electron Microscope for scientific illustration.
- **Privacy by default**: the backend does not expose home-directory paths, tmux sessions, or external service probes unless explicitly enabled.

## References & credits

### Inspiration

- **The AI Leverage — "Full Build Guide: 3D Interactive Visuals"** (beehiiv article) — the original concept of combining image-model mockups + text-to-3D + multimodal coding-model into interactive desktop 3D apps. The *Cell Architecture Studio* mockup is adapted from that article's example.
  Article: <https://theaileverage.beehiiv.com/p/full-build-guide-3d-interactive-visuals>

### Libraries & tools

- **[Three.js](https://threejs.org/)** — WebGL rendering engine (MIT). Loaded from jsDelivr CDN at runtime.
- **[earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad)** — harness that inspired the `cad_source/` layout convention (MIT).
- **[build123d](https://github.com/gumyr/build123d)** + **[OCP](https://github.com/CadQuery/OCP)** — optional Python CAD kernel for STEP/GLB export (Apache-2.0).
- **[ImageMagick](https://imagemagick.org/)** + **[ffmpeg](https://ffmpeg.org/)** — used offline to generate demo GIFs from screenshot sequences.

### Biology content

All cell / virus / organelle structural data in `cells.json` (sizes, lifecycle stages, organelle roles, fun facts) are synthesised from general public-domain biology knowledge. The 3D geometry is stylised and educational — **not** anatomically precise to nanometre scale. Do not use for clinical or research reference.

### Sample mockup

The UI layout was adapted from a reference mockup image (`agent-fleet-dashboard/docs/screenshots/sample-reference.jpeg`) provided by the original designer.

## License

MIT — see [LICENSE](LICENSE).

## Author

Built by Wayan and contributors through iterative critique passes (see `agent-fleet-dashboard/docs/CRITIQUE_LOG.md`). Happy to accept PRs for additional cell types, translations, or view modes.
