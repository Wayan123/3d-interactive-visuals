# Contributing

Thanks for helping make 3D science learning more accessible. This project is intentionally lightweight: the core app runs with Python stdlib, browser WebGL, and procedural Three.js geometry.

## Good first contributions

- Add a new specimen in `agent-fleet-dashboard/data/cells.json`.
- Improve bilingual copy in `agent-fleet-dashboard/assets/bio/i18n.js` or `manual.js`.
- Add public-source references for an existing specimen.
- Improve accessibility, keyboard navigation, or low-end device performance.
- Add screenshots or docs for classroom/self-study use cases.

## Local setup

```bash
git clone https://github.com/Wayan123/3d-interactive-visuals.git
cd 3d-interactive-visuals/agent-fleet-dashboard
./run.sh
```

Open `http://127.0.0.1:8877/`.

No `pip install` or `npm install` is required for the core app.

## Validate before opening a PR

From the repository root:

```bash
python3 scripts/validate_project.py
python3 -m py_compile agent-fleet-dashboard/server.py
```

Optional server smoke test:

```bash
cd agent-fleet-dashboard
PORT=8899 ./run.sh
# in another terminal
python3 ../scripts/smoke_server.py --base-url http://127.0.0.1:8899
```

## Adding a new specimen

1. Add an entry to `agent-fleet-dashboard/data/cells.json`.
2. Add its id to exactly one category in `categories`.
3. Add a `taxonomy` path and update `taxonomyTree` if the object introduces a new domain.
4. Add 3-6 `components`; each `components[].id` should map to geometry `componentId` values.
5. Add or reuse a procedural builder in `agent-fleet-dashboard/assets/bio/geometry.js`.
6. Add CAD export instructions or source under `agent-fleet-dashboard/cad_source/` if practical.
7. Run `python3 scripts/validate_project.py`.

Use stylized educational geometry. Do not present dimensions as clinical, diagnostic, or research-grade precision.

## Data quality expectations

- Prefer public educational references and note uncertainty in plain language.
- Keep facts short enough for labels/tooltips.
- Include a scale field, even if the 3D display uses a normalized educational scale.
- Avoid copyrighted 3D assets; runtime geometry should stay procedural.
- Keep Bahasa Indonesia and English UI understandable for students.

## Pull request checklist

- [ ] App starts locally with `./run.sh`.
- [ ] `python3 scripts/validate_project.py` passes.
- [ ] New specimen is reachable through the sidebar/gallery/search.
- [ ] README or roadmap is updated if the change affects project scope.
- [ ] Screenshots are updated when visual behavior changes significantly.
