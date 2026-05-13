# BioCell Atlas — CAD Sources

Parametric build123d sources untuk tiap cell/organel di atlas.

## Tujuan

Aplikasi browser (Three.js di `assets/bio/geometry.js`) adalah sumber runtime untuk rendering 3D. File-file Python di folder ini adalah **optional CAD export pipeline** yang mengikuti harness [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad). File-file ini tidak wajib untuk menjalankan dashboard; hanya diperlukan kalau mau menghasilkan `.step` / `.glb` / `.stl` yang siap untuk CAD Explorer, 3D printing, atau download di halaman.

## Instalasi Dependency (OPTIONAL, tidak auto-install)

```bash
python3.11 -m venv .venv
./.venv/bin/pip install --upgrade pip
./.venv/bin/pip install -r ../requirements-optional.txt
```

## Menjalankan Lewat Harness

Opsi A — gunakan skill CLI dari repo `text-to-cad`:

```bash
cd /path/to/text-to-cad
./.venv/bin/python -m skills.cad.scripts.step \
    ./agent-fleet-dashboard/cad_source/ecoli.py \
    -o ./agent-fleet-dashboard/cad_source/out/ecoli.step \
    --glb ./agent-fleet-dashboard/cad_source/out/ecoli.glb
```

Opsi B — direct python script (gunakan `build123d.export_step`):

```bash
./.venv/bin/python cad_source/ecoli.py
```

Output muncul di `cad_source/out/*.step`.

## File List

| File | Target Cell |
|---|---|
| `ecoli.py` | E. coli bacterium |
| `animal_cell.py` | Animal (generic eukaryotic) cell |
| `plant_cell.py` | Plant cell with chloroplasts |
| `neuron.py` | Neuron with axon + myelin |
| `tcell.py` | T-cell / cytotoxic lymphocyte |
| `virus_sarscov2.py` | SARS-CoV-2 envelope + spikes |
| `mitochondrion.py` | Mitochondrion with cristae + mtDNA |
| `ribosome.py` | Ribosome (60S + 40S + mRNA) |

Masing-masing mengekspos `make()` dan `gen_step()` sesuai konvensi skill.

## Catatan

- Dimensi dalam milimeter; skala edukasi, bukan skala biologis sebenarnya (sel asli < 50 μm).
- Geometry deliberately simplified ke primitive (Sphere/Cylinder/Torus/Box) agar STEP export stabil dan cepat.
- Browser runtime rendering lebih kaya (noise displacement, micro motion) karena tidak dibatasi oleh kompatibilitas STEP.
- Untuk menggunakan model ini dari CAD Explorer, ikuti `skills/cad-explorer/SKILL.md` di repo `text-to-cad`.

## Safety

- Tidak auto-install dependency.
- Tidak menulis di luar folder `cad_source/out/`.
- Tidak network call keluar dari mesin ini.
