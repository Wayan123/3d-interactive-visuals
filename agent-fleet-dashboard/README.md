# Cell Architecture Studio — app

> Local 3D explorer untuk **16 specimen biologi**. 3 tema (Dark / Light / System), bilingual English + Bahasa Indonesia, **5 top-bar panels** (Gallery / Library / Recents / Manual / Settings) termasuk **in-app User Manual bilingual**. 100 % procedural Three.js. Backend Python stdlib only.

```text
http://127.0.0.1:8877/
```

![Landing dark](docs/screenshots/01-landing.png)

![Demo walkthrough](docs/screenshots/demo.gif)

## Fitur lengkap

- **16 specimens** \(6 tissue + 1 immune + 1 blood + 1 bacteria + 5 viruses + 2 organelles\).
- **6 view modes**: Standalone · Microscope · Electron Microscope · **Process** (virus lifecycle) · Atlas · Compare.
- **5 top-bar panels**: Gallery, Library (with search), Recents (localStorage), **Manual** (bilingual 11 sections), Settings.
- **Read View** dengan dashed leader-lines + label per organel.
- **Cross-section** (XYZ clipping plane, slider 0-100%).
- **Process view** — auto-play 5 stage virus lifecycle + narration + receptor scaffold.
- **Hover tooltips**, **axis gizmo XYZ**, click-to-select organel, offscreen WebGL thumbnails.
- **3D Export**: Cell JSON / Atlas JSON / GLB (via `GLTFExporter`) / STEP-via-build123d instructions.
- **3 themes** (Dark / Light / System) + **bilingual UI** (English + Bahasa Indonesia), persisted ke `localStorage`.
- **Backend Python stdlib only** — zero pip deps untuk core app.

## Inventory

```text
16 cells across 6 categories:
  Tissue cells (6):       plant-cell, animal-cell, neuron, epithelial, stem, muscle
  Specialised (1):        tcell
  Blood cells (1):        erythrocyte
  Bacteria (1):           ecoli
  Viruses (5):            virus (SARS-CoV-2), bacteriophage (T4), hiv, influenza, adenovirus
  Standalone organelles:  mitochondrion, ribosome
```

5 virus cells each carry a 5-stage **lifecycle** (`cells.json` → `cells[].lifecycle`): Attachment, Entry, Replication, Assembly, Release.

## Deep-link parameters

```text
?cell=<id>
&mode=<standalone|microscope|electron|process|atlas|compare>
&component=<organelle-id>
&read=1
&section=<axis:percent>     e.g. y:60 or x:50
&theme=<dark|light|system>
&lang=<en|id>
&panel=<gallery|library|recents|manual|settings>
```

Contoh:
- `?cell=bacteriophage&mode=process` — auto-play T4 lifecycle
- `?cell=hiv&mode=standalone&section=y:50` — sliced HIV virion
- `?cell=influenza&mode=electron` — monochrome SEM Influenza
- `?theme=light&lang=id` — light theme + Bahasa Indonesia
- `?panel=manual&lang=id` — open in-app user manual in Indonesian

## Akses & run

```bash
cd agent-fleet-dashboard
./run.sh
```

via tmux:

```bash
tmux new-session -d -s biocell-atlas -c "$PWD" './run.sh'
tmux capture-pane -t biocell-atlas -p
tmux kill-session -t biocell-atlas
```

## Environment variables (optional)

| Variable | Default | Purpose |
|---|---|---|
| `BIOCELL_HOST` | `127.0.0.1` | bind host for local backend |
| `BIOCELL_PORT` | `8877` | bind port |
| `BIOCELL_EXTRA_PROBES` | *(empty)* | comma-separated `id\|label\|role\|url` quadruples to probe in `/api/services`. Off by default for privacy. |
| `BIOCELL_TMUX_EXPOSE` | *(empty)* | set to any value to include tmux session names in `/api/services`. Off by default. |

## API endpoints

```bash
curl -sS http://127.0.0.1:8877/api/health
curl -sS http://127.0.0.1:8877/api/cells    # 16 cells + 5 lifecycles
curl -sS http://127.0.0.1:8877/api/services  # self probe + system metrics
curl -sS http://127.0.0.1:8877/api/fleet     # combined
```

## Text-to-CAD export (optional)

Browser does **not** need `build123d`. To regenerate STEP/GLB from `cad_source/`:

```bash
python3.11 -m venv .venv
./.venv/bin/pip install -r requirements-optional.txt
./.venv/bin/python cad_source/epithelial.py
# writes cad_source/out/epithelial.step
```

Or use the [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad) harness with `cad_source/*.py` directly.

## Struktur

```text
agent-fleet-dashboard/
  index.html
  run.sh
  server.py                       Python stdlib backend
  requirements-optional.txt       build123d (OPTIONAL)
  assets/
    app.js                        orchestrator
    styles.css                    theme + panels
    bio/
      geometry.js                 16 procedural cell builders
      scene.js                    scene, lighting, bloom, modes, gizmo, section, process
      thumbnails.js               offscreen WebGL thumb renderer
      i18n.js                     en + id translations (~200 keys)
      manual.js                   bilingual user manual content
      microscope.js               legacy CSS overlay
      poll.js                     API polling
  cad_source/                     build123d Python (OPTIONAL)
    _shared.py
    ecoli.py animal_cell.py plant_cell.py neuron.py
    tcell.py virus_sarscov2.py mitochondrion.py ribosome.py
    epithelial.py stem.py muscle.py
    bacteriophage.py hiv.py influenza.py adenovirus.py erythrocyte.py
  data/cells.json                 16 cells + categories + taxonomy + lifecycles
  docs/
    BIOCELL_ARCHITECTURE.md
    CRITIQUE_LOG.md               iteration notes (21+ passes)
    screenshots/                  demo GIF + 15 PNG screenshots
```

## Cuplikan screenshots

| Scene | File |
|---|---|
| Landing — Plant Cell standalone | `docs/screenshots/01-landing.png` |
| Atlas (all 16) | `docs/screenshots/02-atlas.png` |
| Gallery panel | `docs/screenshots/03-gallery.png` |
| Animal Cell standalone | `docs/screenshots/04-animal-cell.png` |
| Read View | `docs/screenshots/05-read-view.png` |
| Cross-Section | `docs/screenshots/06-cross-section.png` |
| SARS-CoV-2 standalone | `docs/screenshots/07-sars-cov-2.png` |
| Process mode | `docs/screenshots/08-process-mode.png` |
| T4 phage Process | `docs/screenshots/09-phage-process.png` |
| Electron Microscope (HIV) | `docs/screenshots/10-electron-microscope.png` |
| Compare (HIV vs Plant) | `docs/screenshots/11-compare-cells.png` |
| Light theme + Indonesian | `docs/screenshots/12-light-theme-indonesian.png` |
| Manual (English) | `docs/screenshots/13-manual-english.png` |
| Manual (Indonesian) | `docs/screenshots/14-manual-indonesian.png` |
| Settings panel | `docs/screenshots/15-settings-panel.png` |

## Iterasi

`docs/CRITIQUE_LOG.md` — 21+ critique passes documented dari v0.1 → v0.6.

## Changelog ringkas

- **v0.6** — In-app User Manual (bilingual, 11 sections). Demo GIF + 15 curated screenshots. Privacy-first defaults: service probes + tmux session exposure now opt-in via env var. Published to GitHub.
- **v0.5** — 4 functional top-bar panels (Gallery, Library, Recents, Settings). 3 themes. Bilingual en + id. localStorage persistence.
- **v0.4** — 4 new viruses + RBC. Process view dengan 5-stage virus lifecycle. Section view. Hover tooltips. Total 16 specimens.
- **v0.3** — Cell Architecture Studio pivot: top bar, thumbnail sidebar, axis gizmo, Read View, Compare, Electron Microscope, GLB export. 11 cells.
- **v0.2** — BioCell Atlas 3D pivot: 8 cells procedural, bloom, live API.
- **v0.1** — Initial 3D AI Agent Fleet Dashboard prototype (archived).
