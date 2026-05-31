# Roadmap

Scale Explorer (formerly Cell Architecture Studio) is a multi-scale interactive science atlas: atoms, cells, viruses, organelles, planets, stars, and galaxies — objects that are easier to learn visually than from static diagrams. It is built to keep expanding across scales.

## Current focus: OSS readiness and classroom usefulness

- Keep the core app easy to run locally with no package install.
- Make contribution paths clear for new specimens, translations, docs, and tests.
- Add CI smoke tests for data validity and the local server.
- Prepare a static deployment path for Vercel/GitHub Pages.
- Add public-source references and educational disclaimers for each domain.

## Scale expansion

### 1. Biological scale: cells, microbes, viruses, organelles

Status: active.

- Expand existing cell categories with more immune, nervous, plant, bacterial, and microbial examples.
- Improve lifecycle/process mode beyond viruses: cell division, immune recognition, protein synthesis, photosynthesis, respiration.
- Add source notes for each biological fact and scale claim.

### 2. Molecular scale

Status: planned.

- Add water, carbon dioxide, glucose, ATP, DNA base pairs, amino acids, and simple proteins.
- Add bond-angle labels, charge/polarity overlays, and compare mode for molecular geometry.
- Use simplified educational geometry; avoid claiming quantum/MD accuracy.

### 3. Atomic scale

Status: started with Hydrogen Atom.

- Add hydrogen, helium, carbon, oxygen, sodium, chlorine, and iron.
- Show nucleus, electron shell/cloud, orbitals as educational abstractions, isotopes, and ion states.
- Add warnings that Bohr/orbital visuals are conceptual models, not literal electron paths.

### 4. Materials and crystal scale

Status: planned.

- Add simple cubic, BCC, FCC, diamond lattice, graphene, salt crystal, and ice lattice.
- Add unit-cell repeat controls and cross-section slicing.

### 5. Macro / cosmic scale

Status: started in v0.8 (Solar System + galaxies).

- Delivered: the Sun, 8 planets, the Moon, and the Milky Way + Andromeda galaxies.
- Next: dwarf planets (Pluto, Ceres), more moons (Titan, Europa, Io), asteroid belt, comets.
- Next: more galaxy types (elliptical, irregular), nebulae, and a star-cluster scale.
- Next: Earth interior layers, volcano cross-section, and a solar-system scale-comparison mode.
- Capture fresh Cosmos screenshots + demo GIF for the release (atlas band, Sun, Saturn rings, galaxies).

## Contributor-friendly backlog

Good first issues:

- Add one molecule entry and procedural builder.
- Add Indonesian/English reference copy for existing specimens.
- Improve keyboard navigation and screen-reader labels.
- Add a low-end device performance mode.
- Add a script that captures consistent screenshots for releases.

Help wanted:

- Science educators to review explanations and classroom flow.
- WebGL/Three.js contributors to improve performance and visual clarity.
- Translators for more languages after EN/ID content stabilizes.
- Vercel/GitHub Pages users to test static deployment.

## Release targets

- `v0.8`: ✅ Scale Explorer rename, Cosmos scale (Sun + 8 planets + Moon + 2 galaxies), Hydrogen Atom, OSS readiness, CI validation, contribution docs. (Pending: fresh Cosmos screenshots, static deployment guide.)
- `v0.9`: molecule pack, source notes, improved classroom guide, more Solar System bodies.
- `v1.0`: stable multi-scale science atlas with documented contribution workflow, tested data schema, and live demo.
