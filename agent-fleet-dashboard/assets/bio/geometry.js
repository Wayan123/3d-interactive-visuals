// BioCell Atlas 3D — procedural geometry library (pure Three.js, no external GLB).
// Each exported builder returns a THREE.Group with userData { cellId, componentMap }.
// Children carry userData.componentId so the scene layer can highlight by organelle.

// --- Tiny hash/noise helpers (deterministic per seed) ---------------------

function mulberry32(seed) {
  let t = seed >>> 0;
  return function rnd() {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hash3(x, y, z) {
  const n =
    Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

// Smooth cheap value-noise-ish displacement, enough for an organic feel.
function organicNoise(x, y, z, freq = 1.2) {
  const nx = x * freq;
  const ny = y * freq;
  const nz = z * freq;
  const a = hash3(nx, ny, nz);
  const b = hash3(nx + 1.3, ny - 0.7, nz + 2.1);
  const c = hash3(nx - 2.7, ny + 1.4, nz - 1.1);
  return (a + b + c) / 3 - 0.5; // [-0.5, 0.5]
}

function displaceGeometry(THREE, geometry, amp, freq, seed = 1) {
  const rnd = mulberry32(seed);
  const pos = geometry.attributes.position;
  const tmp = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    tmp.fromBufferAttribute(pos, i);
    const n = organicNoise(tmp.x + rnd(), tmp.y + rnd() * 0.3, tmp.z - rnd() * 0.2, freq);
    const len = tmp.length() || 1;
    const s = 1 + n * amp;
    tmp.multiplyScalar(s / len * len);
    pos.setXYZ(i, tmp.x, tmp.y, tmp.z);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

// --- Distributions --------------------------------------------------------

// Golden-spiral distribution on a unit sphere.
function fibonacciSphere(n) {
  const points = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1 || 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;
    points.push([Math.cos(theta) * r, y, Math.sin(theta) * r]);
  }
  return points;
}

// --- Shared curves + geometries ------------------------------------------

function helixCurve(THREE, { length, radius, turns, taper = 1, start = [0, 0, 0], axis = [1, 0, 0] }) {
  const pts = [];
  const segments = 48;
  const ax = new THREE.Vector3().fromArray(axis).normalize();
  const up = Math.abs(ax.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const side = new THREE.Vector3().crossVectors(ax, up).normalize();
  const bi = new THREE.Vector3().crossVectors(ax, side).normalize();
  const base = new THREE.Vector3().fromArray(start);
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = t * turns * Math.PI * 2;
    const r = radius * (1 - (1 - taper) * t);
    const p = base.clone()
      .addScaledVector(ax, t * length)
      .addScaledVector(side, Math.cos(angle) * r)
      .addScaledVector(bi, Math.sin(angle) * r);
    pts.push(p);
  }
  return new THREE.CatmullRomCurve3(pts);
}

function straightTaperTube(THREE, { start, end, startRadius, endRadius, radialSegments = 8, tubularSegments = 12 }) {
  // build a taper cylinder aligned to start->end
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();
  if (length === 0) return null;
  const geo = new THREE.CylinderGeometry(endRadius, startRadius, length, radialSegments, 1, false);
  geo.translate(0, length / 2, 0); // base at origin, length along +Y
  const mesh = new THREE.Mesh(geo);
  const up = new THREE.Vector3(0, 1, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
  mesh.quaternion.copy(q);
  mesh.position.copy(start);
  return mesh;
}

function noisySphere(THREE, radius, detail, noiseAmp, noiseFreq, seed) {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  displaceGeometry(THREE, geo, noiseAmp, noiseFreq, seed);
  return geo;
}

// A lathe-based cristae fold strip.
function cristaStripGeometry(THREE, { length, radius, amplitude, waves, steps = 48 }) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = -length / 2 + t * length;
    const y = Math.sin(t * Math.PI) * radius +
      Math.sin(t * waves * Math.PI) * amplitude;
    pts.push(new THREE.Vector2(Math.max(0.02, y), x));
  }
  return new THREE.LatheGeometry(pts, 24, 0, Math.PI);
}

// Capsule-like geometry (cylinder + hemispheres).
function capsuleGeometry(THREE, radius, length, radialSegments = 32, capSegments = 16) {
  return new THREE.CapsuleGeometry(radius, Math.max(0.0001, length - 2 * radius), capSegments, radialSegments);
}

// --- Material factory -----------------------------------------------------

export function createMaterials(THREE, accentHex = "#4cd5ff") {
  const accent = new THREE.Color(accentHex);
  const dim = accent.clone().multiplyScalar(0.55);
  const warm = new THREE.Color("#ffb85a");
  const violet = new THREE.Color("#9a7bff");
  const green = new THREE.Color("#38d86b");
  const pink = new THREE.Color("#ff6ea8");

  return {
    membrane: new THREE.MeshPhysicalMaterial({
      color: accent,
      roughness: 0.25,
      metalness: 0.0,
      transmission: 0.42,
      thickness: 0.5,
      ior: 1.2,
      clearcoat: 0.6,
      clearcoatRoughness: 0.35,
      emissive: dim,
      emissiveIntensity: 0.18,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    }),
    membraneOpaque: new THREE.MeshStandardMaterial({
      color: accent,
      roughness: 0.4,
      metalness: 0.08,
      emissive: dim,
      emissiveIntensity: 0.22,
      side: THREE.DoubleSide,
    }),
    cellwall: new THREE.MeshStandardMaterial({
      color: new THREE.Color("#a7ff8e"),
      roughness: 0.5,
      metalness: 0.02,
      emissive: new THREE.Color("#3a8a3a"),
      emissiveIntensity: 0.18,
      flatShading: true,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    nucleus: new THREE.MeshStandardMaterial({
      color: violet,
      roughness: 0.45,
      metalness: 0.15,
      emissive: violet,
      emissiveIntensity: 0.3,
    }),
    nucleolus: new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ff9f7b"),
      roughness: 0.5,
      emissive: new THREE.Color("#ff6a3a"),
      emissiveIntensity: 0.55,
    }),
    mito: new THREE.MeshStandardMaterial({
      color: warm,
      roughness: 0.4,
      metalness: 0.2,
      emissive: warm,
      emissiveIntensity: 0.35,
    }),
    cristae: new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ff8a4c"),
      roughness: 0.35,
      metalness: 0.15,
      emissive: new THREE.Color("#ff8a4c"),
      emissiveIntensity: 0.45,
      side: THREE.DoubleSide,
    }),
    vacuole: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#89c9ff"),
      roughness: 0.18,
      transmission: 0.75,
      thickness: 1.2,
      ior: 1.33,
      clearcoat: 0.8,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    }),
    chloroplast: new THREE.MeshStandardMaterial({
      color: green,
      roughness: 0.45,
      emissive: new THREE.Color("#107c3a"),
      emissiveIntensity: 0.55,
    }),
    er: new THREE.MeshStandardMaterial({
      color: new THREE.Color("#50e0b7"),
      roughness: 0.35,
      emissive: new THREE.Color("#1ea886"),
      emissiveIntensity: 0.4,
      side: THREE.DoubleSide,
    }),
    golgi: new THREE.MeshStandardMaterial({
      color: pink,
      roughness: 0.3,
      emissive: pink,
      emissiveIntensity: 0.45,
      side: THREE.DoubleSide,
    }),
    ribosome: new THREE.MeshStandardMaterial({
      color: new THREE.Color("#d7fff6"),
      roughness: 0.55,
      metalness: 0.05,
      emissive: new THREE.Color("#6ff5d5"),
      emissiveIntensity: 0.35,
    }),
    ribosomeSmall: new THREE.MeshStandardMaterial({
      color: new THREE.Color("#9dcfff"),
      roughness: 0.55,
      metalness: 0.08,
      emissive: new THREE.Color("#3c7fd6"),
      emissiveIntensity: 0.35,
    }),
    flagellum: new THREE.MeshStandardMaterial({
      color: new THREE.Color("#6ff5d5"),
      roughness: 0.35,
      emissive: new THREE.Color("#2dc4a0"),
      emissiveIntensity: 0.3,
    }),
    pili: new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ffbd4e"),
      roughness: 0.55,
      emissive: new THREE.Color("#ff8b1a"),
      emissiveIntensity: 0.2,
    }),
    dna: new THREE.MeshStandardMaterial({
      color: violet,
      roughness: 0.4,
      emissive: new THREE.Color("#6a3fd2"),
      emissiveIntensity: 0.55,
    }),
    axon: new THREE.MeshStandardMaterial({
      color: new THREE.Color("#d7fff6"),
      roughness: 0.45,
      emissive: new THREE.Color("#6eefff"),
      emissiveIntensity: 0.25,
    }),
    myelin: new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ffd98b"),
      roughness: 0.55,
      emissive: new THREE.Color("#ffbd4e"),
      emissiveIntensity: 0.2,
    }),
    terminal: new THREE.MeshStandardMaterial({
      color: new THREE.Color("#6eefff"),
      roughness: 0.35,
      emissive: new THREE.Color("#6eefff"),
      emissiveIntensity: 0.55,
    }),
    receptor: new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ffbd4e"),
      roughness: 0.35,
      emissive: new THREE.Color("#ff8a2a"),
      emissiveIntensity: 0.45,
    }),
    granule: new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ff5f7a"),
      roughness: 0.45,
      emissive: new THREE.Color("#ff5f7a"),
      emissiveIntensity: 0.45,
    }),
    spike: new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ff8a4c"),
      roughness: 0.35,
      metalness: 0.15,
      emissive: new THREE.Color("#ff5f1a"),
      emissiveIntensity: 0.5,
    }),
    rna: new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ff9f7b"),
      roughness: 0.45,
      emissive: new THREE.Color("#ff6a3a"),
      emissiveIntensity: 0.45,
    }),
  };
}

// --- Builder: E. coli -----------------------------------------------------

export function buildEcoli(THREE, params, M) {
  const p = {
    length: 1.7, radius: 0.42,
    flagellaCount: 4, flagellaLength: 1.5, flagellaTurns: 3,
    piliCount: 10, nucleoidLoops: 3,
    ...params,
  };
  const group = new THREE.Group();
  group.userData.cellId = "ecoli";

  // envelope (capsule)
  const bodyGeo = capsuleGeometry(THREE, p.radius, p.length, 32, 16);
  const body = new THREE.Mesh(bodyGeo, M.membrane);
  body.rotation.z = Math.PI / 2; // long axis along X
  body.userData.componentId = "membrane";
  group.add(body);

  // nucleoid as a twisty tube
  const nucleoid = new THREE.Group();
  nucleoid.userData.componentId = "nucleoid";
  const nucleoidCurve = helixCurve(THREE, {
    length: p.length * 0.9, radius: p.radius * 0.35, turns: p.nucleoidLoops,
    start: [-p.length * 0.45, 0, 0], axis: [1, 0, 0],
  });
  const nucleoidTube = new THREE.Mesh(
    new THREE.TubeGeometry(nucleoidCurve, 96, 0.05, 10, false),
    M.dna
  );
  nucleoid.add(nucleoidTube);
  group.add(nucleoid);

  // ribosomes scattered inside
  const ribo = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.035, 1), M.ribosome, 30);
  ribo.userData.componentId = "ribosomes";
  const m = new THREE.Matrix4();
  const rnd = mulberry32(7);
  for (let i = 0; i < 30; i++) {
    const x = (rnd() - 0.5) * p.length * 0.85;
    const y = (rnd() - 0.5) * p.radius * 1.4;
    const z = (rnd() - 0.5) * p.radius * 1.4;
    m.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    ribo.setMatrixAt(i, m);
  }
  ribo.instanceMatrix.needsUpdate = true;
  group.add(ribo);

  // flagella (helical tubes behind one pole)
  const flagGroup = new THREE.Group();
  flagGroup.userData.componentId = "flagella";
  for (let i = 0; i < p.flagellaCount; i++) {
    const angle = (i / p.flagellaCount) * Math.PI * 2;
    const anchor = new THREE.Vector3(
      -p.length / 2 - 0.02,
      Math.cos(angle) * p.radius * 0.4,
      Math.sin(angle) * p.radius * 0.4
    );
    const curve = helixCurve(THREE, {
      length: p.flagellaLength,
      radius: 0.06,
      turns: p.flagellaTurns,
      taper: 0.3,
      start: anchor.toArray(),
      axis: [-1, 0, 0],
    });
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 80, 0.02, 8, false),
      M.flagellum
    );
    tube.userData.componentId = "flagella";
    tube.userData.phase = Math.random() * Math.PI * 2;
    flagGroup.add(tube);
  }
  group.add(flagGroup);

  // pili (short straight tubes around body)
  const piliGroup = new THREE.Group();
  piliGroup.userData.componentId = "pili";
  for (let i = 0; i < p.piliCount; i++) {
    const a = (i / p.piliCount) * Math.PI * 2;
    const along = (Math.random() - 0.5) * p.length * 0.7;
    const start = new THREE.Vector3(along, Math.cos(a) * p.radius, Math.sin(a) * p.radius);
    const end = start.clone().add(new THREE.Vector3(0, Math.cos(a), Math.sin(a)).multiplyScalar(0.4 + Math.random() * 0.15));
    const pilus = straightTaperTube(THREE, { start, end, startRadius: 0.015, endRadius: 0.008 });
    if (pilus) {
      pilus.material = M.pili;
      pilus.userData.componentId = "pili";
      piliGroup.add(pilus);
    }
  }
  group.add(piliGroup);

  group.userData.componentMap = {
    membrane: body,
    nucleoid,
    ribosomes: ribo,
    flagella: flagGroup,
    pili: piliGroup,
  };
  return group;
}

// --- Builder: Animal cell -------------------------------------------------

export function buildAnimalCell(THREE, params, M) {
  const p = {
    radius: 1.4, nucleusRadius: 0.52,
    mitoCount: 8, ribosomeCount: 60,
    erSegments: 128, golgiStacks: 4,
    ...params,
  };
  const group = new THREE.Group();
  group.userData.cellId = "animal-cell";

  // plasma membrane
  const memGeo = noisySphere(THREE, p.radius, 4, 0.03, 1.5, 5);
  const membrane = new THREE.Mesh(memGeo, M.membrane);
  membrane.userData.componentId = "membrane";
  group.add(membrane);

  // nucleus + nucleolus
  const nucleus = new THREE.Mesh(noisySphere(THREE, p.nucleusRadius, 3, 0.02, 3, 9), M.nucleus);
  nucleus.position.set(0.1, 0.05, 0.05);
  nucleus.userData.componentId = "nucleus";
  group.add(nucleus);

  const nucleolus = new THREE.Mesh(new THREE.IcosahedronGeometry(p.nucleusRadius * 0.28, 2), M.nucleolus);
  nucleolus.position.copy(nucleus.position.clone().add(new THREE.Vector3(0.1, 0.08, 0.12)));
  nucleolus.userData.componentId = "nucleolus";
  group.add(nucleolus);

  // mitochondria ellipsoids
  const mitoGroup = new THREE.Group();
  mitoGroup.userData.componentId = "mitochondria";
  const mitoGeo = new THREE.SphereGeometry(1, 20, 14);
  mitoGeo.scale(0.28, 0.12, 0.12);
  for (let i = 0; i < p.mitoCount; i++) {
    const a = (i / p.mitoCount) * Math.PI * 2 + 0.3;
    const r = p.radius * 0.55;
    const mito = new THREE.Mesh(mitoGeo, M.mito);
    mito.position.set(Math.cos(a) * r, Math.sin(a * 1.3) * 0.3 + 0.15, Math.sin(a) * r * 0.7);
    mito.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    mito.userData.componentId = "mitochondria";
    mitoGroup.add(mito);
  }
  group.add(mitoGroup);

  // ER — organic tube network
  const erGroup = new THREE.Group();
  erGroup.userData.componentId = "er";
  const erPts = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const a = t * Math.PI * 6;
    const r = p.radius * (0.35 + 0.25 * Math.sin(t * Math.PI * 2));
    erPts.push(new THREE.Vector3(
      Math.cos(a) * r,
      Math.sin(a * 0.5) * 0.45 - 0.3,
      Math.sin(a) * r * 0.6
    ));
  }
  const erCurve = new THREE.CatmullRomCurve3(erPts, true);
  const erMesh = new THREE.Mesh(new THREE.TubeGeometry(erCurve, p.erSegments, 0.08, 10, true), M.er);
  erMesh.userData.componentId = "er";
  erGroup.add(erMesh);
  group.add(erGroup);

  // Golgi — stacked discs
  const golgiGroup = new THREE.Group();
  golgiGroup.userData.componentId = "golgi";
  golgiGroup.position.set(-0.65, -0.1, 0.55);
  golgiGroup.rotation.z = 0.25;
  for (let i = 0; i < p.golgiStacks; i++) {
    const radius = 0.32 - i * 0.04;
    const disc = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.045, 12, 64, Math.PI * 1.6),
      M.golgi
    );
    disc.position.y = -i * 0.1;
    disc.rotation.x = Math.PI / 2;
    disc.userData.componentId = "golgi";
    golgiGroup.add(disc);
  }
  group.add(golgiGroup);

  // ribosomes instanced on ER-ish surface
  const ribo = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.048, 1), M.ribosome, p.ribosomeCount);
  ribo.userData.componentId = "ribosomes";
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < p.ribosomeCount; i++) {
    const t = i / p.ribosomeCount;
    const pt = erCurve.getPointAt(t);
    const tn = erCurve.getTangentAt(t);
    const normal = new THREE.Vector3().crossVectors(tn, new THREE.Vector3(0, 1, 0)).normalize();
    const off = pt.clone().addScaledVector(normal, 0.12 * (Math.random() > 0.5 ? 1 : -1));
    matrix.compose(off, new THREE.Quaternion(), new THREE.Vector3(1, 1, 1).multiplyScalar(0.7 + Math.random() * 0.5));
    ribo.setMatrixAt(i, matrix);
  }
  ribo.instanceMatrix.needsUpdate = true;
  group.add(ribo);

  // cytoskeleton — sparse long lines
  const cytoGroup = new THREE.Group();
  cytoGroup.userData.componentId = "cytoskeleton";
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const start = new THREE.Vector3(Math.cos(a) * p.radius * 0.9, -p.radius * 0.7, Math.sin(a) * p.radius * 0.9);
    const end = new THREE.Vector3(Math.cos(a + 0.4) * p.radius * 0.4, p.radius * 0.85, Math.sin(a + 0.4) * p.radius * 0.4);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([start, new THREE.Vector3(0, 0, 0), end]), 24, 0.014, 6),
      M.axon
    );
    tube.userData.componentId = "cytoskeleton";
    cytoGroup.add(tube);
  }
  group.add(cytoGroup);

  group.userData.componentMap = {
    membrane, nucleus, nucleolus,
    mitochondria: mitoGroup, er: erGroup, golgi: golgiGroup,
    ribosomes: ribo, cytoskeleton: cytoGroup,
  };
  return group;
}

// --- Builder: Plant cell --------------------------------------------------

export function buildPlantCell(THREE, params, M) {
  const p = {
    boxSize: 2.2, wallThickness: 0.12,
    vacuoleRadius: 0.75, chloroplastCount: 7,
    mitoCount: 5, nucleusRadius: 0.38,
    ...params,
  };
  const group = new THREE.Group();
  group.userData.cellId = "plant-cell";

  // cell wall: box with bevels (use RoundedBox via ExtrudeGeometry fallback, simple here)
  const wallGroup = new THREE.Group();
  wallGroup.userData.componentId = "cellwall";
  const outer = new THREE.Mesh(
    new THREE.BoxGeometry(p.boxSize, p.boxSize, p.boxSize, 4, 4, 4),
    M.cellwall
  );
  outer.userData.componentId = "cellwall";
  wallGroup.add(outer);
  const wallEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(p.boxSize, p.boxSize, p.boxSize)),
    new THREE.LineBasicMaterial({ color: 0x9dff8a, transparent: true, opacity: 0.6 })
  );
  wallEdges.userData.componentId = "cellwall";
  wallGroup.add(wallEdges);
  group.add(wallGroup);

  // inner plasma membrane
  const inner = new THREE.Mesh(
    new THREE.SphereGeometry(p.boxSize * 0.46, 48, 32),
    M.membrane
  );
  inner.userData.componentId = "membrane";
  group.add(inner);

  // central vacuole
  const vacuole = new THREE.Mesh(
    noisySphere(THREE, p.vacuoleRadius, 3, 0.02, 2.5, 12),
    M.vacuole
  );
  vacuole.userData.componentId = "vacuole";
  group.add(vacuole);

  // nucleus
  const nucleus = new THREE.Mesh(
    noisySphere(THREE, p.nucleusRadius, 3, 0.025, 3, 21),
    M.nucleus
  );
  nucleus.position.set(0.55, -0.3, 0.45);
  nucleus.userData.componentId = "nucleus";
  group.add(nucleus);

  // chloroplasts
  const chlGroup = new THREE.Group();
  chlGroup.userData.componentId = "chloroplasts";
  const chlGeo = new THREE.SphereGeometry(1, 20, 14);
  chlGeo.scale(0.28, 0.14, 0.18);
  const corners = fibonacciSphere(p.chloroplastCount);
  corners.forEach((c) => {
    const chl = new THREE.Mesh(chlGeo, M.chloroplast);
    const radius = p.boxSize * 0.42;
    chl.position.set(c[0] * radius, c[1] * radius * 0.7, c[2] * radius);
    chl.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    chl.userData.componentId = "chloroplasts";
    chlGroup.add(chl);
  });
  group.add(chlGroup);

  // mitochondria
  const mitoGroup = new THREE.Group();
  mitoGroup.userData.componentId = "mitochondria";
  const mitoGeo = new THREE.SphereGeometry(1, 18, 12);
  mitoGeo.scale(0.22, 0.1, 0.1);
  for (let i = 0; i < p.mitoCount; i++) {
    const a = (i / p.mitoCount) * Math.PI * 2 + 0.1;
    const mito = new THREE.Mesh(mitoGeo, M.mito);
    mito.position.set(Math.cos(a) * 0.9, -0.6 + Math.sin(a) * 0.15, Math.sin(a) * 0.9);
    mito.rotation.set(Math.random(), Math.random() * 2, Math.random());
    mito.userData.componentId = "mitochondria";
    mitoGroup.add(mito);
  }
  group.add(mitoGroup);

  // ribosomes instanced
  const ribo = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.04, 1), M.ribosome, 40);
  ribo.userData.componentId = "ribosomes";
  const matrix = new THREE.Matrix4();
  const rnd = mulberry32(33);
  for (let i = 0; i < 40; i++) {
    const u = fibonacciSphere(40)[i];
    const r = (p.boxSize * 0.38) * (0.7 + rnd() * 0.3);
    matrix.compose(new THREE.Vector3(u[0] * r, u[1] * r, u[2] * r), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    ribo.setMatrixAt(i, matrix);
  }
  ribo.instanceMatrix.needsUpdate = true;
  group.add(ribo);

  group.userData.componentMap = {
    cellwall: wallGroup, membrane: inner, vacuole, nucleus,
    chloroplasts: chlGroup, mitochondria: mitoGroup, ribosomes: ribo,
  };
  return group;
}

// --- Builder: Neuron ------------------------------------------------------

export function buildNeuron(THREE, params, M) {
  const p = {
    somaRadius: 0.65, dendriteCount: 7, dendriteBranches: 3,
    axonLength: 2.6, myelinSegments: 6, terminalCount: 5,
    ...params,
  };
  const group = new THREE.Group();
  group.userData.cellId = "neuron";

  // soma
  const soma = new THREE.Mesh(noisySphere(THREE, p.somaRadius, 3, 0.04, 2.5, 44), M.membraneOpaque);
  soma.userData.componentId = "soma";
  group.add(soma);

  const nucleus = new THREE.Mesh(new THREE.IcosahedronGeometry(p.somaRadius * 0.45, 2), M.nucleus);
  nucleus.userData.componentId = "soma";
  group.add(nucleus);

  // dendrites
  const dendGroup = new THREE.Group();
  dendGroup.userData.componentId = "dendrites";
  for (let i = 0; i < p.dendriteCount; i++) {
    const a = (i / p.dendriteCount) * Math.PI * 2 + 0.1 * i;
    const dir = new THREE.Vector3(Math.cos(a), 0.5 + Math.random() * 0.8, Math.sin(a)).normalize();
    const start = dir.clone().multiplyScalar(p.somaRadius * 0.95);
    const pts = [start];
    let last = start;
    for (let b = 0; b < p.dendriteBranches; b++) {
      const ext = dir.clone().multiplyScalar(0.25 + Math.random() * 0.2)
        .add(new THREE.Vector3((Math.random() - 0.5) * 0.35, (Math.random() - 0.3) * 0.25, (Math.random() - 0.5) * 0.35));
      last = last.clone().add(ext);
      pts.push(last);
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 32, 0.045, 8, false),
      M.axon
    );
    tube.userData.componentId = "dendrites";
    dendGroup.add(tube);

    // dendritic spines
    for (let s = 0; s < 4; s++) {
      const t = 0.2 + Math.random() * 0.7;
      const cp = curve.getPointAt(t);
      const spine = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), M.terminal);
      spine.position.copy(cp.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.1, Math.random() * 0.1, (Math.random() - 0.5) * 0.1)));
      spine.userData.componentId = "dendrites";
      dendGroup.add(spine);
    }
  }
  group.add(dendGroup);

  // axon straight line down
  const axonStart = new THREE.Vector3(0, -p.somaRadius * 0.95, 0);
  const axonEnd = new THREE.Vector3(0.15, -p.somaRadius - p.axonLength, 0.05);
  const axonCurve = new THREE.CatmullRomCurve3([
    axonStart,
    axonStart.clone().lerp(axonEnd, 0.3).add(new THREE.Vector3(-0.06, 0, 0.04)),
    axonStart.clone().lerp(axonEnd, 0.7).add(new THREE.Vector3(0.04, 0, -0.03)),
    axonEnd,
  ]);
  const axon = new THREE.Mesh(new THREE.TubeGeometry(axonCurve, 80, 0.045, 8, false), M.axon);
  axon.userData.componentId = "axon";
  group.add(axon);

  // myelin segments
  const myelinGroup = new THREE.Group();
  myelinGroup.userData.componentId = "myelin";
  for (let i = 0; i < p.myelinSegments; i++) {
    const t = (i + 0.5) / p.myelinSegments;
    const pos = axonCurve.getPointAt(t);
    const tn = axonCurve.getTangentAt(t);
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, p.axonLength / p.myelinSegments * 0.82, 16, 1, false),
      M.myelin
    );
    seg.position.copy(pos);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tn);
    seg.quaternion.copy(q);
    seg.userData.componentId = "myelin";
    myelinGroup.add(seg);
  }
  group.add(myelinGroup);

  // Nodes of Ranvier markers (between myelin)
  const nodesGroup = new THREE.Group();
  nodesGroup.userData.componentId = "nodes";
  for (let i = 1; i < p.myelinSegments; i++) {
    const t = i / p.myelinSegments;
    const pos = axonCurve.getPointAt(t);
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), M.terminal);
    node.position.copy(pos);
    node.userData.componentId = "nodes";
    nodesGroup.add(node);
  }
  group.add(nodesGroup);

  // terminal bouton tree
  const termGroup = new THREE.Group();
  termGroup.userData.componentId = "terminals";
  for (let i = 0; i < p.terminalCount; i++) {
    const a = (i / p.terminalCount) * Math.PI * 2;
    const pos = axonEnd.clone().add(new THREE.Vector3(Math.cos(a) * 0.2, -0.12, Math.sin(a) * 0.2));
    const bouton = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), M.terminal);
    bouton.position.copy(pos);
    bouton.userData.componentId = "terminals";
    termGroup.add(bouton);
    const connector = straightTaperTube(THREE, {
      start: axonEnd, end: pos, startRadius: 0.028, endRadius: 0.014,
    });
    if (connector) {
      connector.material = M.axon;
      connector.userData.componentId = "terminals";
      termGroup.add(connector);
    }
  }
  group.add(termGroup);

  group.userData.componentMap = {
    soma, dendrites: dendGroup, axon, myelin: myelinGroup, nodes: nodesGroup, terminals: termGroup,
  };
  return group;
}

// --- Builder: T-cell ------------------------------------------------------

export function buildTCell(THREE, params, M) {
  const p = {
    radius: 0.85, nucleusRadius: 0.52,
    receptorCount: 70, granuleCount: 7, mitoCount: 4,
    ...params,
  };
  const group = new THREE.Group();
  group.userData.cellId = "tcell";

  const membrane = new THREE.Mesh(noisySphere(THREE, p.radius, 3, 0.035, 3.2, 66), M.membrane);
  membrane.userData.componentId = "membrane";
  group.add(membrane);

  const nucleus = new THREE.Mesh(noisySphere(THREE, p.nucleusRadius, 3, 0.025, 4, 88), M.nucleus);
  nucleus.position.set(0.12, 0.05, -0.05);
  nucleus.userData.componentId = "nucleus";
  group.add(nucleus);

  // TCR microspikes on surface via InstancedMesh
  const tcrGeo = new THREE.ConeGeometry(0.028, 0.12, 6);
  tcrGeo.translate(0, 0.06, 0);
  const tcr = new THREE.InstancedMesh(tcrGeo, M.receptor, p.receptorCount);
  tcr.userData.componentId = "tcr";
  const pts = fibonacciSphere(p.receptorCount);
  const matrix = new THREE.Matrix4();
  const upVec = new THREE.Vector3(0, 1, 0);
  pts.forEach((u, i) => {
    const dir = new THREE.Vector3(u[0], u[1], u[2]).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(upVec, dir);
    const pos = dir.clone().multiplyScalar(p.radius);
    matrix.compose(pos, q, new THREE.Vector3(1, 1, 1));
    tcr.setMatrixAt(i, matrix);
  });
  tcr.instanceMatrix.needsUpdate = true;
  group.add(tcr);

  // granules
  const granGroup = new THREE.Group();
  granGroup.userData.componentId = "granules";
  for (let i = 0; i < p.granuleCount; i++) {
    const u = pts[(i * 7) % pts.length];
    const pos = new THREE.Vector3(u[0], u[1], u[2]).multiplyScalar(p.radius * 0.45);
    const gran = new THREE.Mesh(new THREE.IcosahedronGeometry(0.065, 1), M.granule);
    gran.position.copy(pos);
    gran.userData.componentId = "granules";
    granGroup.add(gran);
  }
  group.add(granGroup);

  // mitochondria
  const mitoGroup = new THREE.Group();
  mitoGroup.userData.componentId = "mitochondria";
  const mGeo = new THREE.SphereGeometry(1, 16, 12);
  mGeo.scale(0.18, 0.08, 0.08);
  for (let i = 0; i < p.mitoCount; i++) {
    const a = (i / p.mitoCount) * Math.PI * 2;
    const mito = new THREE.Mesh(mGeo, M.mito);
    mito.position.set(Math.cos(a) * 0.55, -0.25 + Math.sin(a) * 0.1, Math.sin(a) * 0.55);
    mito.rotation.set(Math.random(), Math.random(), Math.random());
    mito.userData.componentId = "mitochondria";
    mitoGroup.add(mito);
  }
  group.add(mitoGroup);

  group.userData.componentMap = {
    membrane, nucleus, tcr, granules: granGroup, mitochondria: mitoGroup,
  };
  return group;
}

// --- Builder: SARS-CoV-2 virus --------------------------------------------

export function buildVirus(THREE, params, M) {
  const p = {
    radius: 0.55, spikeCount: 40, spikeLength: 0.22, spikeHeadRadius: 0.07, rnaLoops: 5,
    ...params,
  };
  const group = new THREE.Group();
  group.userData.cellId = "virus";

  // envelope
  const env = new THREE.Mesh(noisySphere(THREE, p.radius, 3, 0.02, 4, 11), M.membrane);
  env.userData.componentId = "envelope";
  group.add(env);

  // membrane proteins (M/E) as small bumps
  const mpGeo = new THREE.IcosahedronGeometry(0.05, 1);
  const mp = new THREE.InstancedMesh(mpGeo, M.membraneOpaque, 25);
  mp.userData.componentId = "membrane-prot";
  const mpPts = fibonacciSphere(25);
  const mat = new THREE.Matrix4();
  mpPts.forEach((u, i) => {
    const pos = new THREE.Vector3(u[0], u[1], u[2]).multiplyScalar(p.radius + 0.01);
    mat.compose(pos, new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    mp.setMatrixAt(i, mat);
  });
  mp.instanceMatrix.needsUpdate = true;
  group.add(mp);

  // spikes — cone tube + rounded head
  const spikeGroup = new THREE.Group();
  spikeGroup.userData.componentId = "spike";
  const spikePts = fibonacciSphere(p.spikeCount);
  spikePts.forEach((u) => {
    const dir = new THREE.Vector3(u[0], u[1], u[2]).normalize();
    const base = dir.clone().multiplyScalar(p.radius);
    const tip = dir.clone().multiplyScalar(p.radius + p.spikeLength);
    const stalk = straightTaperTube(THREE, { start: base, end: tip, startRadius: 0.022, endRadius: 0.045 });
    if (stalk) {
      stalk.material = M.spike;
      stalk.userData.componentId = "spike";
      spikeGroup.add(stalk);
    }
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(p.spikeHeadRadius, 1), M.spike);
    head.position.copy(tip);
    head.userData.componentId = "spike";
    spikeGroup.add(head);
  });
  group.add(spikeGroup);

  // RNA helical coil inside
  const rnaCurve = helixCurve(THREE, {
    length: p.radius * 1.4, radius: p.radius * 0.35, turns: p.rnaLoops,
    start: [-p.radius * 0.7, 0, 0], axis: [1, 0, 0],
  });
  const rna = new THREE.Mesh(new THREE.TubeGeometry(rnaCurve, 96, 0.035, 8, false), M.rna);
  rna.userData.componentId = "rna";
  group.add(rna);

  group.userData.componentMap = {
    envelope: env,
    spike: spikeGroup,
    "membrane-prot": mp,
    rna,
  };
  return group;
}

// --- Builder: Mitochondrion ----------------------------------------------

export function buildMitochondrion(THREE, params, M) {
  const p = {
    length: 1.5, radius: 0.55, cristaeCount: 7, cristaeDepth: 0.38, mtdnaLoops: 2,
    ...params,
  };
  const group = new THREE.Group();
  group.userData.cellId = "mitochondrion";

  // outer membrane
  const outerGeo = new THREE.SphereGeometry(1, 48, 28);
  outerGeo.scale(p.length, p.radius, p.radius);
  const outer = new THREE.Mesh(outerGeo, M.membrane);
  outer.userData.componentId = "outer";
  group.add(outer);

  // inner membrane (slightly smaller)
  const innerGeo = new THREE.SphereGeometry(1, 40, 24);
  innerGeo.scale(p.length * 0.92, p.radius * 0.88, p.radius * 0.88);
  const inner = new THREE.Mesh(innerGeo, M.membraneOpaque);
  inner.userData.componentId = "inner";
  inner.material = M.membraneOpaque.clone();
  inner.material.opacity = 0.5;
  inner.material.transparent = true;
  group.add(inner);

  // cristae — toroidal folds arranged along the long axis, scaled by local
  // ellipsoid radius so they sit inside the inner membrane.
  const cristaeGroup = new THREE.Group();
  cristaeGroup.userData.componentId = "cristae";
  for (let i = 0; i < p.cristaeCount; i++) {
    const t = (i + 0.5) / p.cristaeCount;
    const xNorm = (t - 0.5) * 2; // [-1, 1]
    const envelope = Math.sqrt(Math.max(0.05, 1 - xNorm * xNorm));
    const x = xNorm * (p.length * 0.82);
    const radialHere = p.radius * envelope * 0.82;
    const phase = (i / p.cristaeCount) * Math.PI * 2;
    const crista = new THREE.Mesh(
      new THREE.TorusGeometry(radialHere, 0.028, 10, 56),
      M.cristae
    );
    crista.rotation.y = Math.PI / 2;
    crista.rotation.z = Math.sin(phase) * 0.35;
    crista.position.set(x, 0, 0);
    crista.userData.componentId = "cristae";
    cristaeGroup.add(crista);
    // thin secondary fold offset for depth
    const rib = new THREE.Mesh(
      new THREE.TorusGeometry(radialHere * 0.72, 0.02, 8, 40),
      M.cristae
    );
    rib.rotation.y = Math.PI / 2;
    rib.rotation.z = Math.cos(phase) * 0.35;
    rib.position.set(x + 0.03, 0, 0);
    rib.userData.componentId = "cristae";
    cristaeGroup.add(rib);
  }
  group.add(cristaeGroup);

  // matrix (subtle haze — thin sphere)
  const matrix = new THREE.Mesh(
    new THREE.SphereGeometry(1, 24, 16).scale(p.length * 0.8, p.radius * 0.7, p.radius * 0.7),
    new THREE.MeshStandardMaterial({ color: "#ffe2b0", transparent: true, opacity: 0.14, emissive: "#ffaf52", emissiveIntensity: 0.2 })
  );
  matrix.userData.componentId = "matrix";
  group.add(matrix);

  // mtDNA circular loop
  const dnaGroup = new THREE.Group();
  dnaGroup.userData.componentId = "mtdna";
  for (let i = 0; i < p.mtdnaLoops; i++) {
    const loop = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.018, 8, 64),
      M.dna
    );
    loop.position.set(-0.3 + i * 0.3, 0, 0);
    loop.rotation.x = Math.PI / 2 + i * 0.15;
    loop.userData.componentId = "mtdna";
    dnaGroup.add(loop);
  }
  group.add(dnaGroup);

  group.userData.componentMap = {
    outer, inner, cristae: cristaeGroup, matrix, mtdna: dnaGroup,
  };
  return group;
}

// --- Builder: Ribosome ----------------------------------------------------

export function buildRibosome(THREE, params, M) {
  const p = { largeRadius: 0.36, smallRadius: 0.24, craterCount: 14, mrnaLength: 1.2, ...params };
  const group = new THREE.Group();
  group.userData.cellId = "ribosome";

  // large subunit (lumpy sphere) — big displacement for cratered look
  const largeGeo = new THREE.IcosahedronGeometry(p.largeRadius, 3);
  displaceGeometry(THREE, largeGeo, 0.08, 5.2, 101);
  const large = new THREE.Mesh(largeGeo, M.ribosome);
  large.position.y = 0.08;
  large.userData.componentId = "large";
  group.add(large);

  // small subunit (smaller lumpy)
  const smallGeo = new THREE.IcosahedronGeometry(p.smallRadius, 3);
  displaceGeometry(THREE, smallGeo, 0.07, 5.5, 202);
  const small = new THREE.Mesh(smallGeo, M.ribosomeSmall);
  small.position.y = -0.18;
  small.userData.componentId = "small";
  group.add(small);

  // mRNA passing through the cleft
  const mrnaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-p.mrnaLength / 2, -0.1, 0),
    new THREE.Vector3(-0.15, -0.18, 0),
    new THREE.Vector3(0, -0.2, 0),
    new THREE.Vector3(0.15, -0.18, 0),
    new THREE.Vector3(p.mrnaLength / 2, -0.1, 0),
  ]);
  const mrna = new THREE.Mesh(new THREE.TubeGeometry(mrnaCurve, 48, 0.03, 8, false), M.rna);
  mrna.userData.componentId = "mrna";
  group.add(mrna);

  group.userData.componentMap = { large, small, mrna };
  return group;
}

// --- Builder: Epithelial cell --------------------------------------------

export function buildEpithelial(THREE, params, M) {
  const p = {
    width: 1.2, depth: 1.2, height: 1.6,
    microvilliCount: 36, neighborCount: 4,
    nucleusRadius: 0.32, mitoCount: 6,
    ...params,
  };
  const group = new THREE.Group();
  group.userData.cellId = "epithelial";

  // cuboidal columnar shape (slightly tapered, top wider)
  const cellGeo = new THREE.BoxGeometry(p.width, p.height, p.depth, 6, 8, 6);
  // taper the bottom slightly
  const pos = cellGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const taper = y < 0 ? (1 + y / p.height * 0.2) : 1;
    pos.setX(i, pos.getX(i) * taper);
    pos.setZ(i, pos.getZ(i) * taper);
  }
  pos.needsUpdate = true;
  cellGeo.computeVertexNormals();
  const cell = new THREE.Mesh(cellGeo, M.membrane);
  cell.userData.componentId = "membrane";
  group.add(cell);

  // microvilli on top (apical surface)
  const microvilli = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.012, 0.018, 0.18, 6),
    M.flagellum,
    p.microvilliCount
  );
  microvilli.userData.componentId = "microvilli";
  const m = new THREE.Matrix4();
  const rnd = mulberry32(444);
  for (let i = 0; i < p.microvilliCount; i++) {
    const u = (i % 6) / 5 - 0.5;
    const v = Math.floor(i / 6) / 5 - 0.5;
    const x = u * p.width * 0.85 + (rnd() - 0.5) * 0.05;
    const z = v * p.depth * 0.85 + (rnd() - 0.5) * 0.05;
    const y = p.height / 2 + 0.09;
    m.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    microvilli.setMatrixAt(i, m);
  }
  microvilli.instanceMatrix.needsUpdate = true;
  group.add(microvilli);

  // tight junctions ring near top
  const junctionRing = new THREE.Mesh(
    new THREE.TorusGeometry(p.width * 0.55, 0.025, 8, 32),
    M.receptor
  );
  junctionRing.position.y = p.height * 0.36;
  junctionRing.rotation.x = Math.PI / 2;
  junctionRing.scale.set(1, 1, p.depth / p.width);
  junctionRing.userData.componentId = "junctions";
  group.add(junctionRing);

  // basement membrane plate underneath
  const basement = new THREE.Mesh(
    new THREE.BoxGeometry(p.width * 1.6, 0.06, p.depth * 1.6),
    M.cellwall
  );
  basement.position.y = -p.height / 2 - 0.05;
  basement.userData.componentId = "basement";
  group.add(basement);

  // nucleus near base
  const nucleus = new THREE.Mesh(
    noisySphere(THREE, p.nucleusRadius, 3, 0.025, 3.6, 71),
    M.nucleus
  );
  nucleus.position.set(0, -p.height * 0.1, 0);
  nucleus.userData.componentId = "nucleus";
  group.add(nucleus);

  // mitochondria scattered
  const mitoGroup = new THREE.Group();
  mitoGroup.userData.componentId = "mitochondria";
  const mitoGeo = new THREE.SphereGeometry(1, 16, 12);
  mitoGeo.scale(0.12, 0.06, 0.06);
  for (let i = 0; i < p.mitoCount; i++) {
    const a = (i / p.mitoCount) * Math.PI * 2;
    const mito = new THREE.Mesh(mitoGeo, M.mito);
    mito.position.set(Math.cos(a) * 0.32, 0.18 + Math.sin(a) * 0.18, Math.sin(a) * 0.32);
    mito.rotation.set(Math.random(), Math.random(), Math.random());
    mito.userData.componentId = "mitochondria";
    mitoGroup.add(mito);
  }
  group.add(mitoGroup);

  group.userData.componentMap = {
    membrane: cell,
    microvilli,
    junctions: junctionRing,
    basement,
    nucleus,
    mitochondria: mitoGroup,
  };
  return group;
}

// --- Builder: Stem cell ---------------------------------------------------

export function buildStemCell(THREE, params, M) {
  const p = {
    radius: 0.7, nucleusRatio: 0.62, daughterCount: 4,
    surfaceMarkerCount: 28, ...params,
  };
  const group = new THREE.Group();
  group.userData.cellId = "stem";

  // outer membrane (lightly noised, mostly smooth)
  const membrane = new THREE.Mesh(
    noisySphere(THREE, p.radius, 4, 0.018, 4, 122),
    M.membrane
  );
  membrane.userData.componentId = "membrane";
  group.add(membrane);

  // very large nucleus characteristic of stem cells
  const nucleus = new THREE.Mesh(
    noisySphere(THREE, p.radius * p.nucleusRatio, 3, 0.025, 4.5, 133),
    M.nucleus
  );
  nucleus.userData.componentId = "nucleus";
  group.add(nucleus);

  // chromatin patches inside nucleus (lighter spots)
  const chromatinGroup = new THREE.Group();
  chromatinGroup.userData.componentId = "chromatin";
  for (let i = 0; i < 6; i++) {
    const u = fibonacciSphere(6)[i];
    const r = p.radius * p.nucleusRatio * 0.55;
    const ch = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.06, 1),
      M.nucleolus
    );
    ch.position.set(u[0] * r, u[1] * r, u[2] * r);
    ch.userData.componentId = "chromatin";
    chromatinGroup.add(ch);
  }
  group.add(chromatinGroup);

  // surface markers (CD34/CD133 etc.) as small spikes
  const markerGeo = new THREE.IcosahedronGeometry(0.022, 0);
  const markers = new THREE.InstancedMesh(markerGeo, M.receptor, p.surfaceMarkerCount);
  markers.userData.componentId = "markers";
  const matrix = new THREE.Matrix4();
  fibonacciSphere(p.surfaceMarkerCount).forEach((u, i) => {
    const pos = new THREE.Vector3(u[0], u[1], u[2]).multiplyScalar(p.radius * 1.02);
    matrix.compose(pos, new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    markers.setMatrixAt(i, matrix);
  });
  markers.instanceMatrix.needsUpdate = true;
  group.add(markers);

  // potential daughter cell buds (tiny attached spheres) — self-renewal motif
  const daughterGroup = new THREE.Group();
  daughterGroup.userData.componentId = "daughters";
  for (let i = 0; i < p.daughterCount; i++) {
    const a = (i / p.daughterCount) * Math.PI * 2 + 0.7;
    const d = new THREE.Mesh(
      noisySphere(THREE, p.radius * 0.18, 2, 0.04, 5, 200 + i),
      M.granule
    );
    d.position.set(Math.cos(a) * (p.radius + 0.18), -0.05, Math.sin(a) * (p.radius + 0.18));
    d.userData.componentId = "daughters";
    daughterGroup.add(d);
  }
  group.add(daughterGroup);

  // mitochondria few
  const mitoGroup = new THREE.Group();
  mitoGroup.userData.componentId = "mitochondria";
  const mitoGeo = new THREE.SphereGeometry(1, 16, 12);
  mitoGeo.scale(0.14, 0.07, 0.07);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.3;
    const mito = new THREE.Mesh(mitoGeo, M.mito);
    mito.position.set(Math.cos(a) * 0.55, Math.sin(a) * 0.18, Math.sin(a) * 0.4);
    mito.rotation.set(Math.random(), Math.random(), Math.random());
    mito.userData.componentId = "mitochondria";
    mitoGroup.add(mito);
  }
  group.add(mitoGroup);

  group.userData.componentMap = {
    membrane, nucleus, chromatin: chromatinGroup,
    markers, daughters: daughterGroup, mitochondria: mitoGroup,
  };
  return group;
}

// --- Builder: Muscle (skeletal myocyte) ----------------------------------

export function buildMuscleCell(THREE, params, M) {
  const p = {
    length: 3.6, radius: 0.42,
    sarcomereCount: 14, myofibrilCount: 5,
    nucleiCount: 5, ...params,
  };
  const group = new THREE.Group();
  group.userData.cellId = "muscle";

  // sarcolemma (capsule along X axis)
  const sarcolemma = new THREE.Mesh(
    capsuleGeometry(THREE, p.radius, p.length, 32, 16),
    M.membrane
  );
  sarcolemma.rotation.z = Math.PI / 2;
  sarcolemma.userData.componentId = "sarcolemma";
  group.add(sarcolemma);

  // myofibrils — long thin tubes parallel to long axis
  const myofibrilGroup = new THREE.Group();
  myofibrilGroup.userData.componentId = "myofibrils";
  for (let i = 0; i < p.myofibrilCount; i++) {
    const a = (i / p.myofibrilCount) * Math.PI * 2;
    const yOff = Math.cos(a) * p.radius * 0.55;
    const zOff = Math.sin(a) * p.radius * 0.55;
    const fibrilGeo = new THREE.CylinderGeometry(0.045, 0.045, p.length * 0.94, 12, 1);
    const fibril = new THREE.Mesh(fibrilGeo, M.axon);
    fibril.rotation.z = Math.PI / 2;
    fibril.position.set(0, yOff, zOff);
    fibril.userData.componentId = "myofibrils";
    myofibrilGroup.add(fibril);
  }
  group.add(myofibrilGroup);

  // sarcomere bands — thin discs perpendicular to long axis (visual striations)
  const sarcomereGroup = new THREE.Group();
  sarcomereGroup.userData.componentId = "sarcomeres";
  for (let i = 0; i < p.sarcomereCount; i++) {
    const t = (i + 0.5) / p.sarcomereCount;
    const x = -p.length * 0.45 + t * p.length * 0.9;
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(p.radius * 0.85, 0.015, 8, 36),
      M.cristae
    );
    band.rotation.y = Math.PI / 2;
    band.position.x = x;
    band.userData.componentId = "sarcomeres";
    sarcomereGroup.add(band);
  }
  group.add(sarcomereGroup);

  // peripheral nuclei (multinucleated)
  const nucleiGroup = new THREE.Group();
  nucleiGroup.userData.componentId = "nuclei";
  for (let i = 0; i < p.nucleiCount; i++) {
    const t = (i + 0.5) / p.nucleiCount;
    const x = -p.length * 0.4 + t * p.length * 0.8;
    const angle = (i % 2 === 0) ? Math.PI * 0.5 : -Math.PI * 0.5;
    const yOff = Math.cos(angle) * p.radius * 0.65;
    const zOff = Math.sin(angle) * p.radius * 0.65;
    const nuc = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 16, 12),
      M.nucleus
    );
    nuc.scale.set(1.6, 0.7, 0.7);
    nuc.position.set(x, yOff, zOff);
    nuc.userData.componentId = "nuclei";
    nucleiGroup.add(nuc);
  }
  group.add(nucleiGroup);

  // mitochondria scattered between fibrils
  const mitoGroup = new THREE.Group();
  mitoGroup.userData.componentId = "mitochondria";
  const mitoGeo = new THREE.SphereGeometry(1, 16, 12);
  mitoGeo.scale(0.18, 0.07, 0.07);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x = (Math.random() - 0.5) * p.length * 0.7;
    const yOff = Math.cos(a) * p.radius * 0.32;
    const zOff = Math.sin(a) * p.radius * 0.32;
    const mito = new THREE.Mesh(mitoGeo, M.mito);
    mito.position.set(x, yOff, zOff);
    mito.userData.componentId = "mitochondria";
    mitoGroup.add(mito);
  }
  group.add(mitoGroup);

  group.userData.componentMap = {
    sarcolemma,
    myofibrils: myofibrilGroup,
    sarcomeres: sarcomereGroup,
    nuclei: nucleiGroup,
    mitochondria: mitoGroup,
  };
  return group;
}

// --- Builder: Bacteriophage T4 -------------------------------------------
// Iconic T4 phage: icosahedral head, contractile tail tube + sheath, base
// plate, six tail fibers. Lands on bacterial wall like a lunar lander.

export function buildBacteriophage(THREE, params, M) {
  const p = {
    headRadius: 0.55, headHeight: 0.7,
    tailLength: 0.85, tailRadius: 0.085,
    fiberCount: 6, fiberLength: 0.7,
    ...params,
  };
  const group = new THREE.Group();
  group.userData.cellId = "bacteriophage";

  // icosahedral head (capsid) elongated along Y
  const headGeo = new THREE.IcosahedronGeometry(p.headRadius, 1);
  headGeo.scale(1, p.headHeight / p.headRadius * 0.85, 1);
  displaceGeometry(THREE, headGeo, 0.015, 5.2, 51);
  const head = new THREE.Mesh(headGeo, M.spike);
  head.position.y = p.tailLength * 0.5 + p.headHeight * 0.5;
  head.userData.componentId = "capsid";
  group.add(head);

  // collar (small ring)
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(p.tailRadius * 1.6, 0.025, 8, 24),
    M.cristae
  );
  collar.position.y = p.tailLength * 0.5;
  collar.rotation.x = Math.PI / 2;
  collar.userData.componentId = "collar";
  group.add(collar);

  // tail sheath (outer, contractile)
  const sheath = new THREE.Mesh(
    new THREE.CylinderGeometry(p.tailRadius * 1.25, p.tailRadius * 1.25, p.tailLength, 18, 8),
    M.cristae
  );
  sheath.userData.componentId = "sheath";
  group.add(sheath);

  // tail tube (inner)
  const tube = new THREE.Mesh(
    new THREE.CylinderGeometry(p.tailRadius * 0.55, p.tailRadius * 0.55, p.tailLength * 1.05, 12),
    M.flagellum
  );
  tube.userData.componentId = "tail";
  group.add(tube);

  // base plate (hexagon disc)
  const basePlate = new THREE.Mesh(
    new THREE.CylinderGeometry(p.tailRadius * 2.6, p.tailRadius * 1.8, 0.06, 6),
    M.golgi
  );
  basePlate.position.y = -p.tailLength * 0.5 - 0.03;
  basePlate.userData.componentId = "baseplate";
  group.add(basePlate);

  // tail fibers (bent tubes, kinked at midpoint)
  const fiberGroup = new THREE.Group();
  fiberGroup.userData.componentId = "fibers";
  for (let i = 0; i < p.fiberCount; i++) {
    const a = (i / p.fiberCount) * Math.PI * 2;
    const baseY = -p.tailLength * 0.5 - 0.06;
    const baseX = Math.cos(a) * p.tailRadius * 2.4;
    const baseZ = Math.sin(a) * p.tailRadius * 2.4;
    const midX = Math.cos(a) * (p.tailRadius * 2.4 + 0.18);
    const midZ = Math.sin(a) * (p.tailRadius * 2.4 + 0.18);
    const tipX = Math.cos(a) * (p.tailRadius * 2.4 + 0.32);
    const tipZ = Math.sin(a) * (p.tailRadius * 2.4 + 0.32);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(baseX, baseY, baseZ),
      new THREE.Vector3(midX, baseY - p.fiberLength * 0.4, midZ),
      new THREE.Vector3(tipX, baseY - p.fiberLength * 0.95, tipZ),
    ]);
    const fiber = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 24, 0.022, 6, false),
      M.flagellum
    );
    fiber.userData.componentId = "fibers";
    fiberGroup.add(fiber);
  }
  group.add(fiberGroup);

  // genome inside head (DNA double-helix coil)
  const dnaCurve = helixCurve(THREE, {
    length: p.headHeight * 0.9, radius: p.headRadius * 0.45, turns: 4,
    start: [0, head.position.y - p.headHeight * 0.4, 0], axis: [0, 1, 0],
  });
  const dna = new THREE.Mesh(
    new THREE.TubeGeometry(dnaCurve, 80, 0.025, 6, false),
    M.dna
  );
  dna.userData.componentId = "dna";
  group.add(dna);

  group.userData.componentMap = {
    capsid: head, collar, sheath, tail: tube, baseplate: basePlate, fibers: fiberGroup, dna,
  };
  return group;
}

// --- Builder: HIV virion --------------------------------------------------
// Spherical envelope, conical capsid inside, gp120/gp41 spikes, RNA + RT.

export function buildHIV(THREE, params, M) {
  const p = {
    radius: 0.55, capsidLength: 0.5,
    spikeCount: 22, ...params,
  };
  const group = new THREE.Group();
  group.userData.cellId = "hiv";

  // envelope (lipid bilayer with subtle noise)
  const envelope = new THREE.Mesh(
    noisySphere(THREE, p.radius, 3, 0.018, 4, 132),
    M.membrane
  );
  envelope.userData.componentId = "envelope";
  group.add(envelope);

  // gp120/gp41 spike trimers — club shape (stalk + 3-ball head)
  const spikeGroup = new THREE.Group();
  spikeGroup.userData.componentId = "spike";
  const pts = fibonacciSphere(p.spikeCount);
  pts.forEach((u) => {
    const dir = new THREE.Vector3(u[0], u[1], u[2]).normalize();
    const base = dir.clone().multiplyScalar(p.radius);
    const stalkTip = dir.clone().multiplyScalar(p.radius + 0.13);
    const stalk = straightTaperTube(THREE, { start: base, end: stalkTip, startRadius: 0.022, endRadius: 0.03 });
    if (stalk) { stalk.material = M.spike; stalk.userData.componentId = "spike"; spikeGroup.add(stalk); }
    // 3 head balls (trimer)
    for (let i = 0; i < 3; i++) {
      const angle = i * (Math.PI * 2 / 3);
      const tangent1 = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
      const tangent2 = new THREE.Vector3().crossVectors(dir, tangent1).normalize();
      const offset = tangent1.clone().multiplyScalar(Math.cos(angle) * 0.04)
        .add(tangent2.clone().multiplyScalar(Math.sin(angle) * 0.04));
      const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 1), M.spike);
      head.position.copy(stalkTip.clone().add(offset));
      head.userData.componentId = "spike";
      spikeGroup.add(head);
    }
  });
  group.add(spikeGroup);

  // conical capsid inside (HIV's signature feature)
  const capsidShape = new THREE.Shape();
  capsidShape.moveTo(0, 0);
  capsidShape.lineTo(0.18, 0);
  capsidShape.lineTo(0.06, p.capsidLength);
  capsidShape.lineTo(0, p.capsidLength);
  capsidShape.lineTo(0, 0);
  const capsidGeo = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.001, -p.capsidLength * 0.5),
      new THREE.Vector2(0.18, -p.capsidLength * 0.4),
      new THREE.Vector2(0.16, 0),
      new THREE.Vector2(0.07, p.capsidLength * 0.5),
      new THREE.Vector2(0.001, p.capsidLength * 0.55),
    ],
    24
  );
  const capsid = new THREE.Mesh(capsidGeo, M.granule);
  capsid.userData.componentId = "capsid";
  capsid.rotation.x = 0.18;
  group.add(capsid);

  // two RNA strands inside the capsid
  const rnaCurveA = helixCurve(THREE, {
    length: p.capsidLength * 0.7, radius: 0.04, turns: 2.5,
    start: [0, -p.capsidLength * 0.3, 0], axis: [0, 1, 0],
  });
  const rnaA = new THREE.Mesh(new THREE.TubeGeometry(rnaCurveA, 60, 0.014, 6, false), M.rna);
  rnaA.userData.componentId = "rna";
  group.add(rnaA);

  // reverse transcriptase markers (small spheres clinging to RNA)
  for (let i = 0; i < 3; i++) {
    const t = (i + 0.5) / 3;
    const pt = rnaCurveA.getPointAt(t);
    const rt = new THREE.Mesh(new THREE.IcosahedronGeometry(0.04, 1), M.receptor);
    rt.position.copy(pt);
    rt.userData.componentId = "rt";
    group.add(rt);
  }

  group.userData.componentMap = {
    envelope, spike: spikeGroup, capsid, rna: rnaA,
  };
  return group;
}

// --- Builder: Influenza virion -------------------------------------------
// Spherical/pleomorphic envelope with HA (hemagglutinin) trimers and NA
// (neuraminidase) tetramer mushrooms.

export function buildInfluenza(THREE, params, M) {
  const p = {
    radius: 0.55, haCount: 28, naCount: 10, ...params,
  };
  const group = new THREE.Group();
  group.userData.cellId = "influenza";

  // envelope
  const envelope = new THREE.Mesh(
    noisySphere(THREE, p.radius, 3, 0.025, 5, 191),
    M.membrane
  );
  envelope.userData.componentId = "envelope";
  group.add(envelope);

  // HA spikes (taller club-shaped)
  const haGroup = new THREE.Group();
  haGroup.userData.componentId = "ha";
  const haPts = fibonacciSphere(p.haCount + p.naCount).slice(0, p.haCount);
  haPts.forEach((u) => {
    const dir = new THREE.Vector3(u[0], u[1], u[2]).normalize();
    const base = dir.clone().multiplyScalar(p.radius);
    const tip = dir.clone().multiplyScalar(p.radius + 0.16);
    const stalk = straightTaperTube(THREE, { start: base, end: tip, startRadius: 0.018, endRadius: 0.03 });
    if (stalk) { stalk.material = M.spike; stalk.userData.componentId = "ha"; haGroup.add(stalk); }
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 1), M.spike);
    head.position.copy(tip);
    head.userData.componentId = "ha";
    haGroup.add(head);
  });
  group.add(haGroup);

  // NA tetramer mushrooms (shorter, mushroom shape)
  const naGroup = new THREE.Group();
  naGroup.userData.componentId = "na";
  const naPts = fibonacciSphere(p.haCount + p.naCount).slice(p.haCount);
  naPts.forEach((u) => {
    const dir = new THREE.Vector3(u[0], u[1], u[2]).normalize();
    const base = dir.clone().multiplyScalar(p.radius);
    const stalkTip = dir.clone().multiplyScalar(p.radius + 0.1);
    const headPos = dir.clone().multiplyScalar(p.radius + 0.12);
    const stalk = straightTaperTube(THREE, { start: base, end: stalkTip, startRadius: 0.018, endRadius: 0.022 });
    if (stalk) { stalk.material = M.receptor; stalk.userData.componentId = "na"; naGroup.add(stalk); }
    const headGeo = new THREE.SphereGeometry(0.05, 12, 8);
    headGeo.scale(1, 0.5, 1);
    const head = new THREE.Mesh(headGeo, M.receptor);
    head.position.copy(headPos);
    // orient flat top facing outward
    const upVec = new THREE.Vector3(0, 1, 0);
    head.quaternion.setFromUnitVectors(upVec, dir);
    head.userData.componentId = "na";
    naGroup.add(head);
  });
  group.add(naGroup);

  // 8 RNA segments inside
  const rnaGroup = new THREE.Group();
  rnaGroup.userData.componentId = "rna";
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const dir = new THREE.Vector3(Math.cos(a), 0.3 - i * 0.07, Math.sin(a)).normalize();
    const start = dir.clone().multiplyScalar(-p.radius * 0.55);
    const end = dir.clone().multiplyScalar(p.radius * 0.55);
    const seg = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([start, dir.clone().multiplyScalar(0).add(new THREE.Vector3((Math.random() - 0.5) * 0.05, 0, 0)), end]),
        18, 0.022, 6, false
      ),
      M.rna
    );
    seg.userData.componentId = "rna";
    rnaGroup.add(seg);
  }
  group.add(rnaGroup);

  group.userData.componentMap = {
    envelope, ha: haGroup, na: naGroup, rna: rnaGroup,
  };
  return group;
}

// --- Builder: Adenovirus -------------------------------------------------
// Icosahedral capsid (20 faces, 12 vertices) with one long fiber per vertex,
// each terminating in a knob.

export function buildAdenovirus(THREE, params, M) {
  const p = {
    radius: 0.55, fiberLength: 0.32, ...params,
  };
  const group = new THREE.Group();
  group.userData.cellId = "adenovirus";

  // icosahedral capsid (sharper geometry, low subdivision so faces visible)
  const capsidGeo = new THREE.IcosahedronGeometry(p.radius, 1);
  const capsid = new THREE.Mesh(capsidGeo, M.spike);
  capsid.userData.componentId = "capsid";
  group.add(capsid);

  // hexon faces highlight (slight inset on each face) — use vertex colors
  // skip for simplicity; flat shading from icosahedron handles it.

  // 12 fibers — from each vertex of icosahedron
  // Vertices of icosahedron unit sphere
  const phi = (1 + Math.sqrt(5)) / 2;
  const verts = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
  ];
  const fiberGroup = new THREE.Group();
  fiberGroup.userData.componentId = "fibers";
  verts.forEach((v) => {
    const dir = new THREE.Vector3(v[0], v[1], v[2]).normalize();
    const base = dir.clone().multiplyScalar(p.radius);
    const tip = dir.clone().multiplyScalar(p.radius + p.fiberLength);
    const fiber = straightTaperTube(THREE, { start: base, end: tip, startRadius: 0.025, endRadius: 0.014 });
    if (fiber) { fiber.material = M.flagellum; fiber.userData.componentId = "fibers"; fiberGroup.add(fiber); }
    // knob at tip
    const knob = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 1), M.granule);
    knob.position.copy(tip);
    knob.userData.componentId = "fibers";
    fiberGroup.add(knob);
  });
  group.add(fiberGroup);

  // dsDNA core (helical inside)
  const dnaCurve = helixCurve(THREE, {
    length: p.radius * 1.3, radius: p.radius * 0.4, turns: 4,
    start: [-p.radius * 0.65, 0, 0], axis: [1, 0, 0],
  });
  const dna = new THREE.Mesh(new THREE.TubeGeometry(dnaCurve, 80, 0.025, 6, false), M.dna);
  dna.userData.componentId = "dna";
  group.add(dna);

  group.userData.componentMap = {
    capsid, fibers: fiberGroup, dna,
  };
  return group;
}

// --- Builder: Erythrocyte (red blood cell) -------------------------------
// Biconcave disc — disc with central depression on both sides. No nucleus.

export function buildErythrocyte(THREE, params, M) {
  const p = { radius: 1.0, thickness: 0.32, indent: 0.5, ...params };
  const group = new THREE.Group();
  group.userData.cellId = "erythrocyte";

  // create biconcave disc by displacing sphere with cosine indent on poles
  const geo = new THREE.SphereGeometry(p.radius, 64, 32);
  const pos = geo.attributes.position;
  const tmp = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    tmp.fromBufferAttribute(pos, i);
    // squash along Y
    tmp.y *= p.thickness;
    // create indent on top + bottom (radial gradient)
    const r = Math.sqrt(tmp.x * tmp.x + tmp.z * tmp.z);
    const radialNorm = r / p.radius;
    if (radialNorm < 0.85) {
      const dimple = (1 - radialNorm / 0.85) ** 2 * p.indent;
      tmp.y *= 1 - dimple;
    }
    pos.setXYZ(i, tmp.x, tmp.y, tmp.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  const cell = new THREE.Mesh(geo, M.granule);
  cell.userData.componentId = "membrane";
  group.add(cell);

  // hemoglobin grain inside (instanced spheres)
  const hbGeo = new THREE.IcosahedronGeometry(0.04, 0);
  const hb = new THREE.InstancedMesh(hbGeo, M.mito, 80);
  hb.userData.componentId = "hemoglobin";
  const matrix = new THREE.Matrix4();
  const rnd = mulberry32(13);
  for (let i = 0; i < 80; i++) {
    const r = rnd() * p.radius * 0.8;
    const theta = rnd() * Math.PI * 2;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    const y = (rnd() - 0.5) * p.thickness * 0.8 * (1 - r / p.radius * 0.6);
    matrix.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    hb.setMatrixAt(i, matrix);
  }
  hb.instanceMatrix.needsUpdate = true;
  group.add(hb);

  // surface blood-group antigen markers
  const antigenGeo = new THREE.IcosahedronGeometry(0.025, 0);
  const antigens = new THREE.InstancedMesh(antigenGeo, M.receptor, 30);
  antigens.userData.componentId = "antigens";
  fibonacciSphere(30).forEach((u, i) => {
    const surface = new THREE.Vector3(u[0], u[1] * p.thickness * 0.9, u[2]).multiplyScalar(p.radius);
    matrix.compose(surface, new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    antigens.setMatrixAt(i, matrix);
  });
  antigens.instanceMatrix.needsUpdate = true;
  group.add(antigens);

  group.userData.componentMap = {
    membrane: cell, hemoglobin: hb, antigens,
  };
  return group;
}

// --- Registry -------------------------------------------------------------

export const BUILDERS = {
  buildEcoli,
  buildAnimalCell,
  buildPlantCell,
  buildNeuron,
  buildTCell,
  buildVirus,
  buildMitochondrion,
  buildRibosome,
  buildEpithelial,
  buildStemCell,
  buildMuscleCell,
  buildBacteriophage,
  buildHIV,
  buildInfluenza,
  buildAdenovirus,
  buildErythrocyte,
};

export function buildCell(THREE, builderName, params, materials) {
  const fn = BUILDERS[builderName];
  if (!fn) throw new Error(`Unknown cell builder: ${builderName}`);
  return fn(THREE, params, materials);
}
