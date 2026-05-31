#!/usr/bin/env python3
"""Append Cosmos specimens (Sun, planets, Moon, galaxies) to cells.json.
Idempotent: skips ids that already exist. Educational data; sizes are real.
"""
import json, sys
from pathlib import Path

path = Path(__file__).resolve().parent.parent / "data" / "cells.json"
atlas = json.loads(path.read_text())
existing = {c["id"] for c in atlas["cells"]}

ACCENT = {
    "sun": "#ffb13b", "mercury": "#9c948c", "venus": "#e6c88a", "earth": "#5aa9e6",
    "mars": "#e0734a", "jupiter": "#d9a066", "saturn": "#e8d39a", "uranus": "#8fe3e0",
    "neptune": "#4060d0", "moon": "#cfcfcf", "milky-way": "#9fc6ff", "andromeda": "#c7b3ff",
}

def planet(cid, label, color, size, summary, funfact, facts, comps, params, taxo, pos, scale, stats):
    base = dict(params)
    base["cellId"] = cid
    return {
        "id": cid, "label": label, "kingdom": "Cosmos", "type": "planet",
        "category": ("planets" if cid not in ("moon",) else "moons"),
        "taxonomy": taxo, "atlasPosition": pos, "scale": scale, "size": size,
        "accent": ACCENT[cid], "status": "online", "summary": summary, "funFact": funfact,
        "facts": facts, "stats": stats, "components": comps,
        "cad": {"source": "cad_source/" + cid.replace("-", "_") + ".py", "outputs": ["STEP", "GLB"],
                "prompt": f"Stylised {label}: educational planetary model, not to physical scale."},
        "geometry": {"builder": "buildPlanet", "params": base},
    }

SURFACE = lambda c, label, fact: {"id": "surface", "label": label, "role": "outer layer", "color": c, "size": "—", "fact": fact}

new = []

# --- Sun ---
new.append({
    "id": "sun", "label": "Sun", "kingdom": "Cosmos", "type": "star",
    "category": "star", "taxonomy": ["Science", "Cosmos", "Stars"],
    "atlasPosition": [0.0, -2.4, -3.2], "scale": 1.1, "size": "~1,391,000 km diameter",
    "accent": ACCENT["sun"], "status": "online",
    "summary": "G-type main-sequence star (G2V) holding 99.86% of the Solar System's mass; fuses hydrogen into helium in its core.",
    "funFact": "About 1.3 million Earths could fit inside the Sun by volume.",
    "facts": [
        "Surface (photosphere) is ~5,500 °C; the core reaches ~15 million °C.",
        "Light takes ~8 minutes 20 seconds to travel from the Sun to Earth.",
        "Energy is released by nuclear fusion: ~600 million tonnes of hydrogen per second.",
        "The Sun is about 4.6 billion years old and roughly halfway through its life.",
    ],
    "stats": {"complexity": 4, "components": 4, "massEarths": 333000, "surfaceTempC": 5500, "ageGyr": 4.6},
    "components": [
        {"id": "core", "label": "Core", "role": "fusion engine", "color": "#fff3c4", "size": "~0.25 solar radii", "fact": "Hydrogen fuses to helium here at ~15 million °C."},
        {"id": "photosphere", "label": "Photosphere", "role": "visible surface", "color": "#ffd24a", "size": "~5,500 °C", "fact": "The layer that emits the light we see, dotted with granules."},
        {"id": "corona", "label": "Corona", "role": "outer atmosphere", "color": "#ff8a2a", "size": "millions of km", "fact": "Counter-intuitively hotter (>1,000,000 °C) than the surface."},
        {"id": "flares", "label": "Prominences / flares", "role": "magnetic activity", "color": "#ff8a2a", "size": "varies", "fact": "Loops of plasma guided by the Sun's magnetic field."},
    ],
    "cad": {"source": "cad_source/sun.py", "outputs": ["STEP", "GLB"], "prompt": "Stylised Sun: glowing photosphere with granules, bright core, faint corona, plasma loops. Educational, not to scale."},
    "geometry": {"builder": "buildStar", "params": {"radius": 1.25, "color": "#ffd24a", "coreColor": "#fff3c4", "coronaColor": "#ff8a2a", "flares": 7}},
})

T = lambda *p: ["Science", "Cosmos", "Solar System", *p]

new.append(planet("mercury", "Mercury", "#9c948c", "4,879 km diameter",
    "Smallest planet and closest to the Sun; a cratered, airless world with extreme temperature swings.",
    "A year on Mercury (88 Earth days) is shorter than two of its own days.",
    ["No substantial atmosphere, so heat escapes fast: ~430 °C day, -180 °C night.",
     "Heavily cratered surface resembling the Moon.",
     "Has a surprisingly large iron core for its size.",
     "Closest planet to the Sun at ~58 million km."],
    [SURFACE("#9c948c", "Rocky crust", "Ancient cratered surface, little geological renewal.")],
    {"radius": 0.42, "color": "#9c948c", "roughness": 0.95, "seed": 2},
    T("Terrestrial planets"), [-4.4, 0.4, -1.0], 0.7,
    {"complexity": 2, "components": 1, "moons": 0, "dayLengthHours": 4222.6, "diameterKm": 4879}))

new.append(planet("venus", "Venus", "#e6c88a", "12,104 km diameter",
    "Second planet; similar in size to Earth but wrapped in a thick CO2 atmosphere causing a runaway greenhouse effect.",
    "Venus is the hottest planet (~465 °C) even though Mercury is closer to the Sun.",
    ["Thick sulphuric-acid clouds reflect sunlight, making it very bright in our sky.",
     "Surface pressure is ~92× Earth's — like being 900 m underwater.",
     "Rotates backwards (retrograde) and very slowly.",
     "Often called Earth's 'sister planet' by size and mass."],
    [SURFACE("#e6c88a", "Cloud deck", "Sulphuric-acid clouds hide a volcanic rocky surface."),
     {"id": "atmosphere", "label": "Atmosphere", "role": "thick CO2 greenhouse", "color": "#fff0c0", "size": "~92 bar", "fact": "Traps heat in a runaway greenhouse effect."}],
    {"radius": 0.7, "color": "#e6c88a", "atmosphere": True, "atmosphereColor": "#fff0c0", "roughness": 0.7, "seed": 4},
    T("Terrestrial planets"), [-2.9, 0.6, -1.0], 0.85,
    {"complexity": 3, "components": 2, "moons": 0, "surfaceTempC": 465, "diameterKm": 12104}))

new.append(planet("earth", "Earth", "#5aa9e6", "12,742 km diameter",
    "Our home world: the only known planet with liquid surface water and life, with one large Moon.",
    "Earth is the only planet not named after a Greek or Roman deity.",
    ["~71% of the surface is covered by water.",
     "The atmosphere is ~78% nitrogen, ~21% oxygen.",
     "A protective magnetic field deflects harmful solar radiation.",
     "The Moon stabilises Earth's axial tilt and drives the tides."],
    [SURFACE("#5aa9e6", "Surface (oceans + land)", "Liquid water oceans and continental crust."),
     {"id": "atmosphere", "label": "Atmosphere", "role": "breathable gas envelope", "color": "#7fd0ff", "size": "~100 km", "fact": "Scatters blue light, giving the sky its colour."},
     {"id": "moon", "label": "The Moon", "role": "natural satellite", "color": "#cfcfcf", "size": "3,474 km", "fact": "Earth's only natural satellite, ~384,400 km away."}],
    {"radius": 0.72, "color": "#3a7bd5", "accentColor": "#6fcf6f", "atmosphere": True, "atmosphereColor": "#7fd0ff",
     "roughness": 0.6, "seed": 6, "moon": {"radius": 0.27, "color": "#cfcfcf", "dist": 2.1}},
    T("Terrestrial planets"), [-1.3, 0.7, -1.0], 0.9,
    {"complexity": 4, "components": 3, "moons": 1, "waterPct": 71, "diameterKm": 12742}))

new.append(planet("mars", "Mars", "#e0734a", "6,779 km diameter",
    "The 'Red Planet': a cold desert world with iron-oxide dust, polar ice caps, and the tallest volcano in the Solar System.",
    "Olympus Mons on Mars is ~22 km tall — about 2.5× the height of Mount Everest.",
    ["Red colour comes from iron oxide (rust) in the soil.",
     "Has two small moons: Phobos and Deimos.",
     "A Martian day ('sol') is about 24 hours 37 minutes.",
     "Evidence suggests it once had rivers and lakes of liquid water."],
    [SURFACE("#e0734a", "Dusty surface", "Iron-oxide regolith over a basaltic crust."),
     {"id": "atmosphere", "label": "Thin atmosphere", "role": "tenuous CO2", "color": "#e9a98a", "size": "~0.006 bar", "fact": "Too thin and cold for stable liquid water today."}],
    {"radius": 0.55, "color": "#e0734a", "atmosphere": True, "atmosphereColor": "#e9a98a", "roughness": 0.92, "seed": 8},
    T("Terrestrial planets"), [0.2, 0.6, -1.0], 0.8,
    {"complexity": 3, "components": 2, "moons": 2, "diameterKm": 6779, "tallestVolcanoKm": 22}))

new.append(planet("jupiter", "Jupiter", "#d9a066", "139,820 km diameter",
    "Largest planet: a gas giant of hydrogen and helium with banded clouds and the Great Red Spot storm.",
    "Jupiter is so massive it could contain all the other planets combined more than twice over.",
    ["The Great Red Spot is a storm wider than Earth, raging for centuries.",
     "Has at least 95 known moons, including the four large Galilean moons.",
     "Spins fastest of all planets — a day is under 10 hours.",
     "Its strong gravity helps shield inner planets from some comets."],
    [SURFACE("#d9a066", "Cloud tops", "Ammonia clouds in light zones and dark belts."),
     {"id": "bands", "label": "Cloud bands", "role": "jet-stream zones/belts", "color": "#c98b5a", "size": "global", "fact": "Strong east-west winds create the striped look."},
     {"id": "spot", "label": "Great Red Spot", "role": "giant storm", "color": "#c0492f", "size": "wider than Earth", "fact": "A high-pressure anticyclone persisting for centuries."}],
    {"radius": 1.1, "color": "#d9a066", "bands": True, "bandColor": "#a9774a", "accentColor": "#e8c79a", "spotColor": "#c0492f", "roughness": 0.7, "seed": 10},
    T("Gas giants"), [2.0, 0.8, -1.6], 1.0,
    {"complexity": 4, "components": 3, "moons": 95, "dayLengthHours": 9.9, "diameterKm": 139820}))

new.append(planet("saturn", "Saturn", "#e8d39a", "116,460 km diameter",
    "Gas giant famous for its bright, broad ring system of ice and rock particles.",
    "Saturn is the least dense planet — it would float in a (giant enough) bathtub of water.",
    ["Its rings span up to ~280,000 km but are only ~10-100 m thick in places.",
     "Has 140+ known moons, including Titan with its thick atmosphere.",
     "Made mostly of hydrogen and helium like Jupiter.",
     "The rings are made of countless ice and rock chunks."],
    [SURFACE("#e8d39a", "Cloud tops", "Pale ammonia haze over hydrogen/helium."),
     {"id": "bands", "label": "Cloud bands", "role": "atmospheric zones", "color": "#cbb474", "size": "global", "fact": "Fainter than Jupiter's but follow the same banded pattern."},
     {"id": "rings", "label": "Ring system", "role": "ice + rock debris", "color": "#d8c9a0", "size": "~280,000 km wide", "fact": "Named A-G rings; mostly water ice."}],
    {"radius": 0.95, "color": "#e8d39a", "bands": True, "bandColor": "#cbb474", "accentColor": "#f0e3b8", "rings": True, "ringColor": "#d8c9a0", "roughness": 0.7, "seed": 12},
    T("Gas giants"), [4.0, 0.9, -1.8], 1.0,
    {"complexity": 4, "components": 3, "moons": 146, "diameterKm": 116460, "ringSpanKm": 280000}))

new.append(planet("uranus", "Uranus", "#8fe3e0", "50,724 km diameter",
    "Ice giant tipped on its side, with a pale blue-green methane atmosphere and faint rings.",
    "Uranus rotates on its side (~98° tilt), so its poles take turns facing the Sun for ~21 years each.",
    ["Methane in the atmosphere absorbs red light, giving a cyan colour.",
     "Coldest planetary atmosphere in the Solar System (~-224 °C).",
     "Has 13 known faint rings and 28 known moons.",
     "Its extreme tilt may be the result of a giant ancient collision."],
    [SURFACE("#8fe3e0", "Methane haze", "Featureless pale cyan cloud layer."),
     {"id": "atmosphere", "label": "Atmosphere", "role": "hydrogen/helium/methane", "color": "#b5f0ee", "size": "deep", "fact": "Methane gives the blue-green tint."},
     {"id": "rings", "label": "Faint rings", "role": "dark debris", "color": "#7fa9a8", "size": "narrow", "fact": "Discovered in 1977; much darker than Saturn's."}],
    {"radius": 0.82, "color": "#8fe3e0", "atmosphere": True, "atmosphereColor": "#b5f0ee", "rings": True, "ringColor": "#7fa9a8", "roughness": 0.6, "seed": 14},
    T("Ice giants"), [6.0, 0.9, -2.0], 1.0,
    {"complexity": 3, "components": 3, "moons": 28, "axialTiltDeg": 98, "diameterKm": 50724}))

new.append(planet("neptune", "Neptune", "#4060d0", "49,244 km diameter",
    "Farthest planet from the Sun: a deep-blue ice giant with the fastest winds in the Solar System.",
    "Neptune was found through mathematics — predicted by gravity calculations before it was ever seen.",
    ["Supersonic winds reach ~2,100 km/h, the fastest known.",
     "Its vivid blue comes from atmospheric methane.",
     "Takes ~165 Earth years to orbit the Sun once.",
     "Has 16 known moons, the largest being Triton."],
    [SURFACE("#4060d0", "Methane atmosphere", "Deep-blue cloud tops with high-speed storms."),
     {"id": "atmosphere", "label": "Atmosphere", "role": "hydrogen/helium/methane", "color": "#5f7fe0", "size": "deep", "fact": "Hosts dark storm spots like the Great Dark Spot."}],
    {"radius": 0.8, "color": "#3a52c0", "atmosphere": True, "atmosphereColor": "#5f7fe0", "roughness": 0.6, "seed": 16},
    T("Ice giants"), [8.0, 0.9, -2.2], 1.0,
    {"complexity": 3, "components": 2, "moons": 16, "windSpeedKmh": 2100, "diameterKm": 49244}))

new.append(planet("moon", "The Moon", "#cfcfcf", "3,474 km diameter",
    "Earth's only natural satellite: a cratered, airless world whose phases and tides shape life on Earth.",
    "The same side of the Moon always faces Earth because its rotation is tidally locked.",
    ["Surface is covered in fine dust (regolith) and impact craters.",
     "Gravity is about 1/6 of Earth's.",
     "It is slowly drifting away from Earth at ~3.8 cm per year.",
     "Twelve humans have walked on it (Apollo, 1969-1972)."],
    [SURFACE("#cfcfcf", "Regolith surface", "Cratered dust over an ancient crust."),
     {"id": "bands", "label": "Maria (dark plains)", "role": "ancient lava basins", "color": "#8f8f96", "size": "regional", "fact": "Dark basaltic plains visible to the naked eye."}],
    {"radius": 0.5, "color": "#cfcfcf", "bands": False, "roughness": 0.97, "seed": 21},
    ["Science", "Cosmos", "Solar System", "Moons"], [-1.3, 1.9, -1.0], 0.7,
    {"complexity": 2, "components": 2, "parentBody": "Earth", "gravityG": 0.166, "diameterKm": 3474}))

# fix moon category/type
new[-1]["type"] = "moon"; new[-1]["category"] = "moons"

# --- Galaxies ---
new.append({
    "id": "milky-way", "label": "Milky Way", "kingdom": "Cosmos", "type": "galaxy",
    "category": "galaxies", "taxonomy": ["Science", "Cosmos", "Galaxies"],
    "atlasPosition": [-3.0, 2.6, -3.6], "scale": 1.0, "size": "~100,000 light-years across",
    "accent": ACCENT["milky-way"], "status": "online",
    "summary": "Our home barred spiral galaxy of 100-400 billion stars, with the Solar System on the Orion Arm.",
    "funFact": "It takes the Sun about 225-250 million years to orbit the Milky Way's centre once (a 'galactic year').",
    "facts": [
        "A supermassive black hole, Sagittarius A*, sits at its centre.",
        "Contains an estimated 100-400 billion stars.",
        "The Solar System lies ~27,000 light-years from the galactic core.",
        "It is on a collision course with Andromeda in ~4.5 billion years.",
    ],
    "stats": {"complexity": 5, "components": 3, "starsBillions": 250, "diameterLy": 100000, "armCount": 4},
    "components": [
        {"id": "core", "label": "Galactic core / bulge", "role": "dense star bulge + black hole", "color": "#fff2c2", "size": "~10,000 ly", "fact": "Home to Sagittarius A*, a 4-million-solar-mass black hole."},
        {"id": "arms", "label": "Spiral arms", "role": "star-forming lanes", "color": "#9fc6ff", "size": "tens of thousands of ly", "fact": "Density waves where new stars form."},
        {"id": "halo", "label": "Halo", "role": "old stars + dark matter", "color": "#9fc6ff", "size": "vast", "fact": "Contains globular clusters and most of the galaxy's dark matter."},
    ],
    "cad": {"source": "cad_source/milky_way.py", "outputs": ["GLB"], "prompt": "Stylised barred spiral galaxy: bright bulge, four spiral arms of point stars, faint halo. Educational point-cloud render."},
    "geometry": {"builder": "buildSpiralGalaxy", "params": {"radius": 2.4, "arms": 4, "starCount": 2600, "bar": True, "coreColor": "#fff2c2", "armColor": "#9fc6ff", "dustColor": "#ff9a6b", "cellId": "milky-way", "seed": 43}},
})

new.append({
    "id": "andromeda", "label": "Andromeda (M31)", "kingdom": "Cosmos", "type": "galaxy",
    "category": "galaxies", "taxonomy": ["Science", "Cosmos", "Galaxies"],
    "atlasPosition": [3.2, 2.6, -3.6], "scale": 1.0, "size": "~152,000 light-years across",
    "accent": ACCENT["andromeda"], "status": "online",
    "summary": "The nearest large spiral galaxy to the Milky Way and the most distant object visible to the naked eye.",
    "funFact": "Andromeda's light you see tonight left it about 2.5 million years ago.",
    "facts": [
        "Lies ~2.5 million light-years away in the constellation Andromeda.",
        "Roughly twice the diameter of the Milky Way, with ~1 trillion stars.",
        "Approaching the Milky Way at ~110 km/s.",
        "Catalogued as Messier 31 (M31).",
    ],
    "stats": {"complexity": 5, "components": 3, "starsBillions": 1000, "diameterLy": 152000, "distanceMly": 2.5},
    "components": [
        {"id": "core", "label": "Galactic core", "role": "dense bulge", "color": "#ffe6c2", "size": "large", "fact": "Hosts a supermassive black hole tens of millions of solar masses."},
        {"id": "arms", "label": "Spiral arms", "role": "star fields", "color": "#c7b3ff", "size": "vast", "fact": "Tightly wound arms rich with stars and dust lanes."},
        {"id": "halo", "label": "Halo", "role": "old stars + dark matter", "color": "#c7b3ff", "size": "vast", "fact": "Its extended halo may already touch the Milky Way's."},
    ],
    "cad": {"source": "cad_source/andromeda.py", "outputs": ["GLB"], "prompt": "Stylised grand-design spiral galaxy: bright bulge, tightly wound arms of point stars, faint violet halo."},
    "geometry": {"builder": "buildSpiralGalaxy", "params": {"radius": 2.6, "arms": 2, "starCount": 3000, "bar": False, "coreColor": "#ffe6c2", "armColor": "#c7b3ff", "dustColor": "#ff9a6b", "cellId": "andromeda", "seed": 71}},
})

added = 0
for c in new:
    if c["id"] in existing:
        continue
    atlas["cells"].append(c)
    added += 1

# scale-bridge links (only if not present)
have = {tuple(l[:2]) for l in atlas.get("links", [])}
extra_links = [
    ["hydrogen-atom", "sun", "scale bridge: atom to star"],
    ["earth", "moon", "host body / satellite"],
    ["sun", "milky-way", "scale bridge: star to galaxy"],
    ["milky-way", "andromeda", "neighbouring spiral galaxies"],
]
for l in extra_links:
    if tuple(l[:2]) not in have:
        atlas["links"].append(l)

atlas["atlasSubtitle"] = "Interactive local explorer from atoms to galaxies"
path.write_text(json.dumps(atlas, indent=2, ensure_ascii=False) + "\n")
print(f"added {added} cosmos specimens; total cells = {len(atlas['cells'])}")
