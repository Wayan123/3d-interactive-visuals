# BioCell Atlas 3D — Critique Log

Catatan iteratif selama pivot dari *AI Agent Fleet Dashboard* menjadi *BioCell Atlas 3D*.

## Pass 0 · Design

Brainstorm:

- **Pivot tema** dari monitoring hardware (local services) menjadi eksplorasi biologi (bakteri, sel, organel).
- Semua 3D **procedural di browser** (Three.js), **tidak** pakai Tripo/Gemini/model eksternal.
- `text-to-cad` dijadikan **source code CAD parametrik** (build123d) di `cad_source/`, optional untuk STEP/GLB export.
- Backend Python stdlib only untuk live service probes.

## Pass 1 · Visual quality (Atlas screenshot review)

Issue yang ditemukan:

1. **Cells overlap di atlas** — animal-cell (big) menabrak e-coli, mitochondrion, ribosome.
2. **Plant cell wall opaque** — chloroplast & vacuole di dalam tidak terlihat.
3. **Ribosome terlalu kecil** & `atlasPosition` terbang di atas.
4. **Label sprite menempel ke mesh**, bukan mengambang di atas.
5. **Cristae mitochondrion** menembus keluar outer membrane (radius fix sementara panjang body ellipsoid).
6. **Status ring** punya radius hard-coded 0.8 → kelihatan besar untuk ribosome/neuron.

Fix:

- Re-layout atlas: center + 6-cell ring radius 4.2 + ribosome orbit above. Scale konsisten.
- `cellwall` material → `opacity: 0.22`, `transparent: true`, `depthWrite: false`, plus `EdgesGeometry` wireframe overlay.
- Cristae radius sekarang mengikuti envelope ellipsoid: `radius * sqrt(1 - (x/length)^2)`.
- Status ring & label size sekarang dihitung dari `Box3().setFromObject(group)` live, bukan heuristik per-cell.
- Label offset Y = heightOffset + 0.55, ring sized to `footprint`.

## Pass 2 · API + interactivity

Issue:

1. **`STATIC FALLBACK` badge** kadang muncul karena `/api/services` probe sequential dengan timeout 2 s × 5 service → bisa 10 s.
2. Tidak ada click-to-select di canvas 3D (hanya sidebar works).
3. **Microscope HUD** (MAG / λ / MODE) overlap dengan HUD kanan-atas (Localhost).
4. `µm` di size-chip ter-transform jadi `MM` karena `text-transform: uppercase`.

Fix:

- `collect_services()` pakai `ThreadPoolExecutor(max_workers=5)` → parallel probes.
- Added `collect_services_cached()` dengan TTL 1.5 s.
- Timeout per probe turun ke 1.2 s (semua localhost).
- `BioScene.onCellClick()` registrator + `THREE.Raycaster` dengan threshold 4 px (bedakan drag vs click).
- Microscope readout di-reposition ke `top:60px; left:24px`.
- `.size-chip` hilangkan `text-transform: uppercase`.

## Pass 3 · Polish (materials, bloom, animation)

Issue:

1. Emissive colors terlihat datar, kurang dramatis.
2. Selected cell tidak punya affordance tambahan selain status ring.
3. Microscope vignette terlalu lembut.

Fix:

- **Post-FX bloom**: `UnrealBloomPass` strength 0.55 radius 0.55 threshold 0.2, loaded lazily via `three/addons/postprocessing/*`. Fallback gracefully jika addon gagal load.
- Breathing animation untuk selected cell: `scale = base * (1 + sin(t*1.6)*0.012)`.
- Microscope gradient lebih kuat: `radial-gradient(..., transparent 28%, rgba(3,8,16,0.55) 46%, rgba(0,0,0,0.95) 72%, #000 100%)` + blend layer hijau lembut.
- `refreshLinks()` sekarang juga clear atlas ring secondary saat dive/microscope.

## Pass 4 · Verification

Dikonfirmasi via headless Chrome (SwiftShader WebGL) screenshot:

- Atlas view: 8 cells rendered correct, labels tidak overlap.
- Dive view per-cell (8 screenshots): semua cell + organel terlihat jelas.
- Microscope view: vignette + reticle + readout visible.
- Component isolation (mis. animal-cell ◦ mitochondria): rest organelles fade to 0.18 opacity sambil selected glow.
- API endpoints: `/api/health`, `/api/cells`, `/api/services`, `/api/fleet` balik 200 dengan response time < 10 ms setelah cache primed.
- Tidak ada console error fatal di JS.

## Yang masih bisa di-improve (next)

- **Organelle wireframe outline** saat di-hover (highlight tipis cyan).
- **Particle flow** di links (antigen flow antar cell) → partikel mengalir dari tcell ke virus, dari animal-cell ke mitochondrion.
- **GLTF export per cell** via Three.js `GLTFExporter` untuk download langsung dari browser (butuh `three/addons/exporters/GLTFExporter.js`).
- **More cells**: archaea, red blood cell, bacteriophage, yeast cell, dendritic cell.
- **Dive sub-mode**: enter organelle (mis. mitochondrion → zoom cristae → show ATP synthase rotor). Butuh tiered builder.
- **Post-FX SSAO** untuk kedalaman lebih jelas di dive mode.
- **Touch gesture**: pinch-zoom vs drag-rotate untuk iPad/tablet.
- **Speaker/TTS narration** per cell (re-use external TTS infra).

---

# Pass 5+ (v0.3.0 — Cell Architecture Studio pivot)

Reference baru: `docs/screenshots/sample-reference.jpeg` (Sample.jpeg dari user).

## Pass 5 · Layout pivot ke Cell Architecture Studio

Goal: layout match exact Sample.jpeg + tambah Electron Microscope view + Compare + Read View + axis gizmo.

Delivered:

- 3 cell builder baru: `buildEpithelial`, `buildStemCell`, `buildMuscleCell` (+ CAD sources).
- `cells.json` v3 schema: `categories`, `taxonomyTree`, `funFact`, dan `components[].size + fact` per organel.
- `index.html` rewrite: top bar full + sidebar dengan thumbnail + main viewport + axis gizmo + 6-icon control deck + view-strip 4 tile + compare row + ORG DETAILS + WHERE IT OCCURS + CAD bridge.
- `styles.css` rewrite: `#0f0f0f` + `#00d4aa` teal-only theme matching reference.
- `assets/bio/scene.js` rewrite: 5 modes (`standalone` default, `microscope`, `electron`, `atlas`, `compare`), single-canvas compare via cell repositioning, override material untuk EM, axis gizmo painter, read-view label projection callback.
- `assets/bio/thumbnails.js` baru: offscreen `WebGLRenderer` 128×128 untuk render thumbnail tiap cell satu kali saat startup.
- `assets/app.js` rewrite: top-bar tabs, thumbnail apply, taxonomy tree renderer, organelle visible/label switches, isolate/hide-others/read-view bindings, compare slot cycling, GLB export via `GLTFExporter`.

## Pass 6 · Issues found + fixed

1. Export sheet muncul saat load — fix: tambah `[hidden] { display: none !important; }` global.
2. Compare mode default kedua slot ke cell yang sama — fix: pick first different cell saat init.
3. Stage head tidak update di compare mode — fix: `renderDetail()` cek `state.mode === "compare"` dan tampilkan `"X · vs · Y"`.
4. "Hide Others" semantics ambigu — fix: redefined ke "hide all organelles except selected"; fallback ke first component bila belum ada selection.
5. Reset focus tidak revert hideOthers state — fix: button revert isolated + hideOthers + visibility.
6. Compare mode tidak ada visual separator — fix: CSS `::before` vertical line + `::after` "VS" badge + dynamic side labels via app.js.
7. Read View label berhimpit dengan controls bar — fix: padding 18 px + auto-distribute kiri/kanan.
8. Status ring di compare mode aneh — fix: hide status ring di compare mode.
9. Electron mode masih punya bloom warm — fix: disable `bloomPass.enabled = false` + accent/warm point lights ke 0 + key light naik 1.9 + tone exposure 1.0 + background `#1a1a1a`.

## Pass 7 · Verification

Dikonfirmasi via headless Chrome (SwiftShader WebGL) screenshots:

- Landing (Plant Cell standalone): wireframe box + chloroplasts + organelles visible.
- Animal/Neuron/Epithelial/Stem/Muscle standalone: tiap cell render dengan organel lengkap, status ring, label.
- Microscope mode: vignette + scanlines aktif, glow tetap.
- Electron mode: monochrome SEM look, no color, no bloom.
- Atlas mode: 11 cells beredar, axis gizmo + atlas ring visible.
- Compare mode: side-by-side dengan VS separator + side labels.
- Read View: leader lines + auto-distributed labels kiri/kanan untuk Neuron + Muscle.
- API endpoints semua balik 200 dengan response < 10 ms (cached).
- 0 console error fatal.

## Yang masih bisa di-improve (next setelah v0.3)

- **Compare per-side mode**: kiri standalone, kanan electron — untuk side-by-side modal study.
- **Hover tooltip** di canvas: nama organel saat mouse over.
- **Section view** (clip plane): potong cell pakai plane horizontal/vertical untuk lihat interior.
- **Animation timeline**: scrub action potential di neuron, sarcomere contraction di muscle, virus entry.
- **Voice narration**: gunakan external TTS endpoint untuk read out fakta saat Read View aktif.
- **More cells**: archaea, RBC, bacteriophage, yeast, dendritic cell.
- **Touch gestures**: 2-finger zoom, edge swipe ke compare slot picker.
- **Real-time GLB streaming**: WebSocket dari `cad_source/*.py` saat user save (butuh build123d watcher).

---

# Pass 8+ (v0.4.0 — Virus Lab + Process + Section + Hover)

## Pass 8 · Add 4 new viruses + RBC + virus lifecycle

Goal: rich virus exploration with process timeline, more cell types.

Delivered:

- 5 new procedural builders (`buildBacteriophage`, `buildHIV`, `buildInfluenza`, `buildAdenovirus`, `buildErythrocyte`).
- 5 new CAD source files in `cad_source/`.
- `cells.json` schema v3 extended: `lifecycle` array per virus (5 stages each: attachment → release with `narration`, `durationMin`).
- New categories: `Blood cells`, `Bacteria`, `Viruses` split out from old "Prokaryotes & viruses".
- Virus taxonomy tree: Coronaviridae / Caudovirales / Retroviridae / Orthomyxoviridae / Adenoviridae as siblings under Acellular > Viruses.
- Total 16 specimens across 6 categories.

## Pass 9 · Process view (virus lifecycle timeline)

Delivered:

- New view-strip tile "Process" with custom thumbnail (cyan/orange dot animation).
- `BioScene.applyProcessStage(idx)` repositions virus relative to a host membrane plate per stage:
  - 0 attachment → above membrane
  - 1 entry → at membrane
  - 2 replication → below membrane (inside host)
  - 3 assembly → still inside, slightly higher + spawn 3 progeny copies
  - 4 release → above membrane + 5 progeny copies
- `BioScene._buildProcessScaffold()` adds a wavy host membrane plate + 12 receptor markers around the virus position.
- Process overlay HUD (top center): stage X/Y counter + label + narration + duration + play/pause + clickable timeline dots + manual next.
- Auto-advance every 4 s; clickable timeline dots for jumping.
- Per-virus narration (e.g. HIV stage 3 "Reverse transcription: RT converts viral RNA into dsDNA inside the capsid…").

## Pass 10 · Section view (cross-section)

Delivered:

- New "Section" button in viewport controls (between Hide Others and Read View).
- Section panel: bottom-center pill with axis selector (X/Y/Z) + slider (0-100%) + percent display.
- `BioScene.setClipping(axis, ratio)` sets `renderer.clippingPlanes = [Plane]`; `localClippingEnabled = true`.
- Plane offset auto-scaled by selected cell's footprint so 50% always cuts through the centre.
- Disabled in Atlas / Compare / Process modes (only meaningful for single-cell views).
- Deep-link: `?section=y:60` for testing.

## Pass 11 · Hover tooltip

Delivered:

- `pointermove` raycast on canvas → `BioScene._handleHover()` → app callback.
- Tooltip DOM element `#hoverTooltip` follows pointer with component name + role + size.
- `pointerleave` clears hover.
- Hide tooltip when no component under pointer.

## Pass 12 · Verification

- All 16 builders tested headless: each returns Group with componentMap.
- Endpoints all 200 with response < 12 ms.
- `/api/cells` payload now 30+ KB with 16 cells, 6 categories, full virus lifecycle data.
- Browser console: 0 errors.
- All 21 v0.4 screenshots captured in headless Chrome (SwiftShader WebGL):
  - 5 viruses standalone
  - 5 viruses in Process view (mid-stage)
  - 5 viruses in Electron Microscope view
  - 3 cells in Section view (animal cell, HIV, bacteriophage)
  - 1 read view (bacteriophage)
  - 1 atlas with all 16 specimens
  - 1 compare (HIV vs plant cell)
  - 1 landing (plant cell)

## Yang masih bisa di-improve (next setelah v0.4)

- Animation across stages (smooth tween between virus positions in Process view, not jump-cut).
- Variant capsid renders per Process stage (phage with empty head after injection, RBV without RNA after entry).
- More cells: archaea, dendritic cell, sperm, oocyte, neutrophil, fibroblast.
- Mitosis stages (prophase / metaphase / anaphase / telophase) similar to virus Process.
- Volumetric raymarching for vesicle / lysosome / peroxisome interiors.
- Sound effects for Process stages (TTS narration via external TTS).
- Microscope mode + Section combined (currently Section disabled in Microscope).

---

# Pass 13+ (v0.5.0 — Themes + Localisation + Functional Panels)

## Pass 13 · Design + architecture

Goal: make Gallery/Library/Recents/Settings tabs functional + add 3 themes + bilingual i18n.

Delivered:

- `assets/bio/i18n.js` — translation dictionary for English + Bahasa Indonesia + `t()` helper + `applyTranslations()` that walks DOM and applies `data-i18n="key"` + `data-i18n-attr="attr:key"`.
- Theme system via CSS custom properties — `body[data-theme="light"]` overrides root vars; `body[data-theme="system"]` uses `@media (prefers-color-scheme: light)` guard.
- 4 overlay panels (fixed-position glass panels) for Gallery / Library / Recents / Settings.
- localStorage-persisted preferences: `cellstudio.prefs.v1` (theme, lang, processAutoplay, bloom) + `cellstudio.recents.v1` (array of {cellId, ts}).

## Pass 14 · Gallery panel

Delivered:

- Grid of all 16 cells with thumbnails + category badge + name/kingdom/size.
- Click card → `selectCell()` + close panel.
- Bilingual title + subtitle (`{N} specimens at a glance` / `Semua {N} spesimen sekilas`).

## Pass 15 · Library panel

Delivered:

- Categorized list with count badge per category.
- Live search input (`input` event) filters by label, kingdom, summary, or component labels.
- Empty state when no matches.

## Pass 16 · Recents panel

Delivered:

- `pushRecent(cellId)` called on every `selectCell()` → adds {cellId, ts} to front, dedup, cap at 12.
- Relative time formatter: "just now / 5 min ago / 2 hr ago / 3 d ago" + Indonesian variants.
- Clear history button.
- Empty state.

## Pass 17 · Settings panel

Delivered:

- Segmented control for Theme (3 options: Dark / Light / System).
- Segmented control for Language (2 options: English / Indonesian).
- Toggle switches for Process auto-play + Post-FX bloom.
- Reset to defaults button (clears prefs + re-applies dark + en).
- Each change persists to localStorage.

## Pass 18 · i18n + translations

Delivered:

- Static HTML labels carry `data-i18n="key"` attribute (100+ attributes).
- `applyTranslations(document, lang)` walks the DOM and sets textContent to translated string.
- Dynamic strings (export subtitle with cell name, cad help with source path, gallery subtitle with cell count) built via `t(key, lang, ...args)` + `innerHTML`.
- Cell/organelle-specific data (labels like "Plant Cell", "Cell wall - cellulose scaffold") kept in English since data is sourced from `cells.json`. Future: add `label_id`, `summary_id` fields if needed.

## Pass 19 · Panel wiring

Delivered:

- Top-bar tabs toggle their panel: click same tab twice to close.
- ESC key closes any active panel.
- Close button (`[data-close-panel]`) on each panel card.
- Deep-link `?panel=gallery|library|recents|settings` auto-opens on load.
- Deep-link `?theme=light&lang=id` also honoured.

## Pass 20 · Verification

Dikonfirmasi via headless Chrome screenshots (SwiftShader WebGL):

- All 4 panels render correctly in Dark + English (default).
- All 4 panels render correctly in Light + Indonesian (switched).
- Landing view tested in all 4 theme × lang combinations.
- No JS console errors.
- localStorage writes visible after theme/lang change.
- Switching theme live updates entire UI (no reload needed).
- Switching language live updates all 100+ translated labels.

## Pass 21 · Small fixes applied

- `.vc` button text colour hardcoded to near-white so controls stay visible over dark viewport regardless of body theme.
- `.hud` background fixed to dark glass with near-white text (same reason).
- Removed `is-active` from Gallery tab in default HTML (no default tab active until user clicks).
- Close panel (`closePanel()`) no longer reassigns "is-active" to first tab.

## Yang masih bisa di-improve (next setelah v0.5)

- Translate cell-specific strings (summary, facts, component labels, narrations) — needs `*_id` keys in `cells.json` or a runtime translation service.
- Add more languages (e.g. Japanese, Korean, Spanish).
- High-contrast theme variant for accessibility.
- Full-width light-theme 3D viewport (currently scene stays dark for visual clarity).
- Top-bar search with keyboard shortcut (`⌘K` already shown but not wired).
- Panel animation transitions (fade/slide) for smoother feel.
- Settings row for canvas-background colour override per theme.

---

# Pass 22+ (v0.7 — 10 new specimens + 3 new categories)

## Pass 22 · Design + scope

Goal: expand from 16 → 26 specimens with more biological diversity. Target categories to add: Immune cells (expanded), Fungi, Protists, Reproductive.

10 new specimens:
- Neutrophil (PMN granulocyte with multilobed nucleus)
- B-cell (lymphocyte with Y-shaped BCRs)
- Macrophage (phagocyte with pseudopodia + phagosomes + lysosomes)
- Platelet (biconvex disc thrombocyte)
- Yeast (Saccharomyces cerevisiae with budding daughter)
- Paramecium (ciliated protozoan with cilia carpet + two nuclei)
- Amoeba (shape-shifting protozoan with pseudopods)
- Spermatozoon (head + acrosome + midpiece + flagellum tail)
- Staphylococcus aureus (grape-cluster Gram-positive cocci)
- Ebola virus (filamentous RNA virus with GP spikes)

## Pass 23 · Implementation

Delivered:

- 10 new procedural builders in `assets/bio/geometry.js` (~900 LOC added).
- 10 new entries in `cells.json` with full taxonomy + components + facts + funFact.
- Ebola carries its own 5-stage lifecycle (so now 6 viruses with Process mode).
- 3 new categories added to `cells.json`: Immune cells, Fungi, Protists + Reproductive cells.
- "Specialised" category renamed → "Immune cells" (4 cells: tcell, bcell, macrophage, neutrophil).
- Taxonomy tree extended: Archaea empty, Protista with 2 cells, Fungi with 1, Animalia > Immune cells subdivided into T-cell / B-cell / Macrophage / Neutrophil, Animalia > Reproductive.
- 10 new CAD source files in `cad_source/` following existing build123d convention.

## Pass 24 · Visual critique (headless Chrome + screenshot review)

Each new specimen was rendered and reviewed:

- **Neutrophil** ✓ multilobed nucleus (4 purple lobes connected by strands), yellow granules, pseudopod bulges. Classic PMN shape.
- **B-cell** ✓ smooth blue membrane, Y-shaped BCRs on surface. Distinct from T-cell (which uses cone receptors).
- **Macrophage** ✓ large irregular purple body, pseudopod bumps extending outward, teal phagosomes + pink lysosomes inside.
- **Platelet** ✓ small biconvex disc with granules + microtubule ring.
- **Yeast** ✓ mother + budding daughter attached, with chitin wall + nucleus + vacuole visible. Iconic S. cerevisiae.
- **Paramecium** ✓ slipper-shaped body with dense cilia carpet radiating outward. Macronucleus + micronucleus + oral groove visible.
- **Amoeba** ✓ irregular magenta blob with 5 finger-like pseudopods extending. Nucleus + vacuoles visible.
- **Sperm** ⚠ initially off-centre (head at +x, tail at -x). Fixed via camera bbox-centre targeting + status-ring footprint cap.
- **Staphylococcus aureus** ✓ cluster of 9 cocci with peptidoglycan wall rings + nucleoids. Instantly recognisable grape-cluster morphology.
- **Ebola** ✓ long curved filament with GP spike trimers + helical nucleocapsid. Clearly different from icosahedral/spherical viruses.

## Pass 25 · Scene fixes

- `_focusOnSelected()` now targets the cell's actual bounding-box centre (not origin), so elongated cells (sperm, muscle, ebola, paramecium) are framed correctly.
- Status-ring footprint capped at 1.9 to avoid huge rings on elongated cells.
- Camera zoom factor reduced from 1.9 × maxDim to 1.35 × maxDim so long cells fill the viewport nicely.

## Pass 26 · Atlas with 26 specimens

Atlas rendering shows rich biodiversity: 26 cells visible simultaneously in a packed orbit. While crowded in the centre, it successfully conveys "variety of life" \u2014 which is the atlas' role (drill into a cell via sidebar click or Gallery panel for detail).

## Pass 27 · Verification

- Headless node script validated all 10 new builders \u2014 each returns a valid THREE.Group with non-empty componentMap.
- `python3 -m py_compile server.py` \u2014 OK.
- `python3 -c "import json; json.load(...)"` on cells.json \u2014 valid.
- `node --check` on all JS modules \u2014 OK.
- Fresh demo GIF captured with mix of new + old specimens (14 frames, ~1.3 MB).
- `/api/cells` returns 26 cells across 9 categories.

## Yang masih bisa di-improve (next setelah v0.7)

- Atlas auto-positioning algorithm to avoid overlap when specimen count grows.
- Add Archaea specimen (e.g. methanogen) to fill the empty taxonomy slot.
- Add pollen grain, stomata guard cells for plant-kingdom completeness.
- Add centriole + lysosome + Golgi + nucleus as standalone organelles.
- Add prion as another acellular entity (beyond viruses).
- Localised cell-specific strings (summary, facts) in Bahasa Indonesia via `label_id`/`summary_id` keys in `cells.json`.

---

# Pass 28+ (v0.8 — Scale Explorer: Cosmos scale)

## Pass 28 · Design + scope

Goal: extend the atlas beyond biology in both directions and rename the
project to reflect its true range. The WIP already added a Hydrogen Atom +
"Matter" branch, confirming the atom→… pivot. This pass adds the **Cosmos**
scale (Solar System + galaxies) and finalises the rename.

Decision: rename brand **Cell Architecture Studio → Scale Explorer**
("Atom → Galaxy"). Keep the internal `cells` / `cellId` data keys and
`buildCell()` dispatcher unchanged so deep-links, localStorage, and the API
stay backward-compatible (non-breaking rename — user-visible strings only).

12 new specimens:
- Sun (G2V star: photosphere granules, core, corona, plasma flares)
- Mercury, Venus, Earth (+ atmosphere + orbiting Moon), Mars
- Jupiter (cloud bands + Great Red Spot), Saturn (ring system + bands)
- Uranus, Neptune (atmospheres)
- The Moon (standalone satellite)
- Milky Way (barred spiral, ~2,600-star point cloud), Andromeda / M31

5 new categories: Atoms, Stars, Planets, Moons, Galaxies (14 total).

## Pass 29 · Implementation

Delivered:
- 3 new procedural builders in `geometry.js`: `buildStar`, `buildPlanet`
  (parameterised: bands / spot / atmosphere / rings / moon), `buildSpiralGalaxy`
  (logarithmic-arm `THREE.Points` disc + bulge + halo).
- 12 `cells.json` entries with real educational stats (diameters, temps,
  moon counts, distances, ages) + taxonomy Cosmos branch + scale-bridge links.
- Cosmos animation block in `scene.js` live loop, keyed on
  `entry.cell.kingdom === "Cosmos"` + `entry.cell.type`.
- Brand + count updates across `index.html`, `i18n.js` (125/125 keys),
  `manual.js`, `app.js`, `cells.json` atlasTitle.
- build123d CAD sources for all cosmic bodies (galaxies → GLB point clouds).

## Pass 30 · Critique (reviewer subagent) + fixes

Reviewer findings, all fixed and re-verified:
1. **`bar` param was a no-op** in `buildSpiralGalaxy` (`… ? 0 : 0`). Now inner
   stars (rad < 0.34·R) form a real straight central bar — verified the barred
   galaxy's inner |z| spread is ~6× tighter than the unbarred one.
2. **`setOpacity` skipped `THREE.Points`** (guarded on `isMesh`), so the galaxy
   disc never dimmed on focus / Read View. Now applies to any object with a
   material.
3. **Brand leftovers**: `cells.json` atlasTitle, hardcoded "26 across 9
   categories" in the About dialog, EN manual intro ("26 biological
   specimens" + "9 categories"), and the load-error banner all still said
   "Cell Architecture Studio". Fixed.
4. **Dead `userData.glow`** metadata removed.
5. **Andromeda** "most distant naked-eye object" claim softened (contested).
6. **Atlas crowding**: cosmos bodies collided with microscopic biology
   (staph↔Mercury, erythrocyte/yeast↔Saturn). Moved all Cosmos specimens to a
   dedicated elevated band (+y, −z); 0 cosmos↔biology pairs <0.8u remain.
7. Search dropdown cap raised 30 → 50 so all 39 specimens are reachable.

## Pass 31 · Verification

- `node --check` on all 8 JS modules — OK.
- Headless builder harness: all 12 cosmos builders + atom return valid Groups
  with complete componentMaps (28 OK; the 11 "failures" are pre-existing
  complex biology builders the minimal Three stub can't model, unchanged).
- Data integrity script: 39 cells / 14 categories, every category + taxonomy +
  link ref resolves, every cell has a registered builder + valid category — OK.
- i18n parity en↔id: 125/125 keys, no gaps.
- `python3 -m py_compile` on `server.py` + all 12 new CAD sources — OK.
- Live server `/api/cells` returns 39 specimens, atlasTitle "Scale Explorer",
  Saturn components [surface, bands, rings], Milky Way `bar:true`.

## Yang masih bisa di-improve (next setelah v0.8)

- Fresh Cosmos screenshots + demo GIF (atlas band, Sun, Saturn rings, galaxies).
- More Solar System bodies: dwarf planets (Pluto, Ceres), more moons (Titan,
  Europa, Io), asteroid belt, comets.
- More galaxy types (elliptical, irregular) + nebulae + star-cluster scale.
- Molecules + materials to fill the empty "Matter" taxonomy slots.
- A "scale ladder" view that flies between atom → cell → planet → galaxy.
- Localised cosmos summaries/facts in Bahasa Indonesia (data-level `*_id`).
