# Scale Explorer — 3D Interactive Visuals

> Local 3D explorer spanning **every scale of nature** — from a single **hydrogen atom**, through **cells, viruses, and organelles**, all the way out to the **Sun, the eight planets, the Moon, and spiral galaxies**. **39 specimens** in **14 categories**, 100 % procedural Three.js, backend Python standard library only. Dark / Light / System theme. English + Bahasa Indonesia. No external 3D model services.
>
> *Formerly "Cell Architecture Studio" — renamed because the atlas now reaches well beyond cells, from the atomic scale to the galactic scale.*

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

- **39 specimens** across 14 categories spanning the **atomic → biological → cosmic** scales:
  - *Tissue cells* (6): Plant, Animal, Neuron, Epithelial, Stem, Muscle
  - *Immune cells* (4): T-cell, B-cell, Macrophage, Neutrophil
  - *Blood cells* (2): Red Blood Cell, Platelet
  - *Reproductive cells* (1): Spermatozoon
  - *Bacteria* (2): E. coli, Staphylococcus aureus
  - *Fungi* (1): Yeast (S. cerevisiae)
  - *Protists* (2): Paramecium, Amoeba
  - *Viruses* (6): SARS-CoV-2, Bacteriophage T4, HIV, Influenza A, Adenovirus, Ebola
  - *Standalone organelles* (2): Mitochondrion, Ribosome
  - *Atoms* (1): Hydrogen Atom
  - *Stars* (1): The Sun
  - *Planets* (8): Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune
  - *Moons* (1): The Moon
  - *Galaxies* (2): Milky Way (barred spiral), Andromeda / M31
- **6 view modes**: Standalone · Microscope · Electron Microscope · **Process** (virus lifecycle) · Atlas · Compare
- **Read View** with auto-annotated leader-lines + labels per component
- **Cross-section** (XYZ clipping plane) to reveal interior
- **Process view** — animated 5-stage virus replication timeline with narration
- **5 top-bar panels**: Gallery · Library · Recents · **Manual** (bilingual in-app guide, 11 sections) · Settings
- **3 themes** (Dark / Light / System) and **bilingual UI** (English + Bahasa Indonesia)
- **3D Export** (Specimen JSON, Atlas JSON, GLB via `GLTFExporter`, STEP-via-build123d instructions)
- **Axis gizmo XYZ indicator**, hover tooltips, click-to-select components
- **Backend Python stdlib only** — `/api/health`, `/api/cells`, `/api/services`, `/api/fleet`, zero pip deps

## New in v0.8 — the Cosmos scale 🪐

Scale Explorer now reaches past biology in both directions:

- **Atomic scale**: a conceptual **Hydrogen Atom** (proton nucleus, 1s probability cloud, Bohr orbit guides, animated electron).
- **Solar System**: the **Sun** (photosphere + core + corona + plasma flares), all **8 planets** (terrestrial, gas giants, ice giants), Saturn with a ring system, Jupiter with cloud bands + Great Red Spot, Earth with atmosphere + orbiting **Moon**.
- **Galaxies**: the **Milky Way** (barred spiral, ~2,600-star point cloud along logarithmic arms) and **Andromeda / M31** (grand-design spiral).

The Cosmos specimens occupy a dedicated elevated band in the Atlas so the macroscopic bodies never visually collide with the microscopic biology. Each cosmic specimen carries real educational stats (diameters, temperatures, moon counts, distances, ages) and the Solar System + galaxy sets are **designed to keep expanding** (more moons, dwarf planets, nebulae, and galaxy types over time).

```text
Atom  →  Organelle  →  Cell  →  Virus  →  Planet  →  Star  →  Galaxy
  ▲ smallest                                              largest ▲
```

## Screenshots

### Cosmos scale — Solar System (Sun + 8 planets + Moon)

![Solar System](agent-fleet-dashboard/docs/screenshots/demo-solar-system.png)

### Atomic scale — Hydrogen Atom (nucleus + orbitals + electron cloud)

![Hydrogen Atom](agent-fleet-dashboard/docs/screenshots/demo-hydrogen-atom.png)

### Landing (Plant Cell · Dark · English)

![Landing](agent-fleet-dashboard/docs/screenshots/01-landing.png)

### Atlas — all 39 specimens at once (atoms → cells → planets → galaxies)

![Atlas](agent-fleet-dashboard/docs/screenshots/02-atlas.png)

> Note: the Atlas screenshot above predates the Cosmos additions; the Sun, planets, Moon, and galaxies now render in a dedicated elevated band behind the biology cluster. Run the app locally (or open `?mode=atlas`) to see all 39 specimens together. Fresh Cosmos screenshots are tracked in [`ROADMAP.md`](ROADMAP.md).

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

### Immune cells showcase — Neutrophil (multilobed PMN)

![Neutrophil](agent-fleet-dashboard/docs/screenshots/16-neutrophil.png)

### Macrophage — large tissue phagocyte with pseudopodia

![Macrophage](agent-fleet-dashboard/docs/screenshots/18-macrophage.png)

### Staphylococcus aureus — grape-cluster Gram-positive cocci

![Staph](agent-fleet-dashboard/docs/screenshots/24-staphylococcus.png)

### Yeast (S. cerevisiae) — eukaryote with budding daughter

![Yeast](agent-fleet-dashboard/docs/screenshots/20-yeast.png)

### Paramecium — ciliated protozoan

![Paramecium](agent-fleet-dashboard/docs/screenshots/21-paramecium.png)

### Amoeba — shape-shifting protozoan with pseudopods

![Amoeba](agent-fleet-dashboard/docs/screenshots/22-amoeba.png)

### Spermatozoon — head + midpiece + flagellum

![Sperm](agent-fleet-dashboard/docs/screenshots/23-sperm.png)

### Ebola virus — filamentous negative-sense RNA virus

![Ebola](agent-fleet-dashboard/docs/screenshots/25-ebola.png)

## Repository layout

```text
3d-interactive-visuals/
├── README.md                              this file
├── LICENSE                                MIT
└── agent-fleet-dashboard/                 the live Scale Explorer app
    ├── index.html
    ├── run.sh
    ├── server.py                          Python stdlib backend
    ├── requirements-optional.txt          build123d (OPTIONAL — CAD export only)
    ├── assets/
    │   ├── app.js                         frontend orchestrator
    │   ├── styles.css                     theme + panels + tooltips
    │   └── bio/
    │       ├── geometry.js                30 procedural builders (cells → atoms → planets → galaxies)
    │       ├── scene.js                   scene, lighting, bloom, modes, gizmo
    │       ├── thumbnails.js              offscreen WebGL thumbnail renderer
    │       ├── i18n.js                    en + id translations (125 keys each)
    │       ├── manual.js                  bilingual user manual content
    │       ├── microscope.js              legacy CSS overlay
    │       └── poll.js                    API polling with graceful fallback
    ├── cad_source/                        build123d Python (OPTIONAL export)
    ├── data/cells.json                    39 specimens + 14 categories + taxonomy + lifecycles
    └── docs/
        ├── BIOCELL_ARCHITECTURE.md
        ├── CRITIQUE_LOG.md                iteration notes
        └── screenshots/                   demo GIF + PNG screenshots
```

See [`agent-fleet-dashboard/README.md`](agent-fleet-dashboard/README.md) for the full app documentation, deep-link parameters, and `docs/CRITIQUE_LOG.md` for the iteration history.

## Deep-links (try these)

```text
# Biology
http://127.0.0.1:8877/?cell=bacteriophage&mode=process
http://127.0.0.1:8877/?cell=hiv&mode=standalone&section=y:50
http://127.0.0.1:8877/?cell=animal-cell&mode=standalone&read=1
http://127.0.0.1:8877/?cell=influenza&mode=electron

# Atoms & Cosmos (new)
http://127.0.0.1:8877/?cell=hydrogen-atom&mode=standalone
http://127.0.0.1:8877/?cell=sun&mode=standalone
http://127.0.0.1:8877/?cell=saturn&mode=standalone&read=1
http://127.0.0.1:8877/?cell=earth&mode=standalone&section=x:50
http://127.0.0.1:8877/?cell=milky-way&mode=standalone
http://127.0.0.1:8877/?cell=jupiter&mode=compare

# Theme / language / panels
http://127.0.0.1:8877/?theme=light&lang=id&panel=gallery
http://127.0.0.1:8877/?panel=manual&lang=id
http://127.0.0.1:8877/?mode=atlas
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

### Science content

All specimen structural data in `cells.json` (sizes, lifecycle stages, component roles, fun facts, planetary stats, galaxy distances) are synthesised from general public-domain science knowledge. The 3D geometry is **stylised and educational** — deliberately not to physical scale. Atomic visuals are conceptual teaching models (electrons are not literal orbiting planets); planet and galaxy sizes/distances are compressed for display. Do not use for clinical, research, or navigational reference.

### Changelog

- **v0.8** — Renamed *Cell Architecture Studio* → **Scale Explorer**. Added the **Cosmos** scale: Sun, 8 planets, the Moon, Milky Way + Andromeda galaxies, plus a conceptual Hydrogen Atom. **39 specimens** across **14 categories** (added Atoms, Stars, Planets, Moons, Galaxies). New procedural builders `buildStar`, `buildPlanet`, `buildSpiralGalaxy`. Cosmos atlas band, planet/galaxy/star animations, point-cloud opacity fade, real barred-spiral geometry. Bilingual brand + manual updates.
- **v0.7** — 10 new biology specimens (26 total) across 9 categories.
- **v0.6** — In-app bilingual User Manual + demo GIF + screenshots.
- **v0.5** — Functional panels, 3 themes, English + Bahasa Indonesia.
- **v0.4** — 4 new viruses + RBC, Process view, Section view, hover tooltips (16 specimens).
- **v0.3** — Cell Architecture Studio pivot: top bar, Read View, Compare, Electron Microscope, GLB export.
- **v0.2** — BioCell Atlas 3D: 8 procedural cells, bloom, live API.
- **v0.1** — Initial 3D AI Agent Fleet Dashboard prototype.

### Sample mockup

The UI layout was adapted from a reference mockup image (`agent-fleet-dashboard/docs/screenshots/sample-reference.jpeg`) provided by the original designer.

## License

MIT — see [LICENSE](LICENSE).

## Author

Built by Wayan and contributors through iterative critique passes (see `agent-fleet-dashboard/docs/CRITIQUE_LOG.md`). Happy to accept PRs for additional cell types, translations, or view modes.
