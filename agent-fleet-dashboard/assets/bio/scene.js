// Cell Architecture Studio — scene orchestrator.
// Owns Three.js scene, camera, lighting, cell groups, modes (standalone /
// atlas / microscope / electron / compare), bloom post-FX, read-view label
// projection, axis gizmo painter, and animation loop. Procedural rendering
// only, no external GLB.

import { buildCell, createMaterials } from "./geometry.js";

const ATLAS_RADIUS = 4.3;

// Compare layout offsets (used when mode === "compare").
const COMPARE_OFFSETS = {
  left: -2.4,
  right: 2.4,
};

export class BioScene {
  constructor({ THREE, OrbitControls, canvas, postFx = null, axisCanvas = null }) {
    this.THREE = THREE;
    this.OrbitControls = OrbitControls;
    this.canvas = canvas;
    this.postFx = postFx;
    this.axisCanvas = axisCanvas;
    this.axisCtx = axisCanvas ? axisCanvas.getContext("2d") : null;

    this.cells = new Map();
    this.links = [];
    this.selectedId = null;
    this.compareLeftId = null;
    this.compareRightId = null;
    this.focusedComponentId = null;
    this.mode = "standalone";
    this.autoRotate = true;
    this.liveMode = true;
    this.readView = false;
    this._readViewTarget = null;
    this._readViewCallback = null;
    this._disposed = false;
    this._electronMaterial = null;
    this.processStage = 0;
    this._processHostMembrane = null;
    this._hoverCallback = null;
    this._lastHoverId = null;
    this._clipAxis = "y";
    this._clipRatio = 1.0; // 1 = no clipping
    this._clipPlane = null;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);
    this.scene.fog = new THREE.FogExp2(0x070707, 0.05);

    const aspect = (canvas.clientWidth || 800) / (canvas.clientHeight || 600);
    this.camera = new THREE.PerspectiveCamera(46, aspect, 0.05, 200);
    this.camera.position.set(0, 1.6, 6.5);

    this.renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    this.renderer.setClearColor(0x0a0a0a, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.localClippingEnabled = true;

    this._clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 100);

    this.composer = null;
    if (postFx?.EffectComposer && postFx?.RenderPass && postFx?.UnrealBloomPass) {
      const { EffectComposer, RenderPass, UnrealBloomPass, OutputPass } = postFx;
      const composer = new EffectComposer(this.renderer);
      composer.setPixelRatio(this.renderer.getPixelRatio());
      composer.setSize(canvas.clientWidth, canvas.clientHeight);
      composer.addPass(new RenderPass(this.scene, this.camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(canvas.clientWidth, canvas.clientHeight), 0.45, 0.6, 0.25);
      composer.addPass(bloom);
      if (OutputPass) composer.addPass(new OutputPass());
      this.composer = composer;
      this.bloomPass = bloom;
    }

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;
    this.controls.minDistance = 1.0;
    this.controls.maxDistance = 28;

    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this._onClick = null;
    this._pointerStart = null;

    this._setupLights();
    this._setupBackdrop();
    this._setupElectronMaterial();

    canvas.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      this._pointerStart = { x: event.clientX, y: event.clientY };
    });
    canvas.addEventListener("pointerup", (event) => {
      if (event.button !== 0 || !this._pointerStart) return;
      const dx = event.clientX - this._pointerStart.x;
      const dy = event.clientY - this._pointerStart.y;
      this._pointerStart = null;
      if (Math.hypot(dx, dy) > 4) return;
      this._handlePointer(event);
    });
    canvas.addEventListener("pointermove", (event) => this._handleHover(event));
    canvas.addEventListener("pointerleave", () => {
      if (this._lastHoverId && this._hoverCallback) {
        this._hoverCallback(null);
        this._lastHoverId = null;
      }
    });
    window.addEventListener("resize", () => this.onResize());
  }

  _setupLights() {
    const THREE = this.THREE;
    this.lights = {
      ambient: new THREE.AmbientLight(0x9bd7ff, 0.55),
      hemi: new THREE.HemisphereLight(0x9bd7ff, 0x0a0a0a, 0.55),
      key: new THREE.DirectionalLight(0xffffff, 1.55),
      rim: new THREE.DirectionalLight(0x7df0d0, 0.85),
      accent: new THREE.PointLight(0x00d4aa, 6, 12, 2),
      warm: new THREE.PointLight(0xffaa66, 3.5, 10, 2),
    };
    this.lights.key.position.set(5, 6, 4);
    this.lights.rim.position.set(-6, 3, -4);
    this.lights.accent.position.set(-3, 2, 2);
    this.lights.warm.position.set(3, -1, 2);
    Object.values(this.lights).forEach((l) => this.scene.add(l));
  }

  _setupBackdrop() {
    const THREE = this.THREE;
    // Subtle floor grid (visible only in atlas mode)
    this.grid = new THREE.GridHelper(20, 40, 0x00d4aa, 0x222222);
    this.grid.position.y = -2.5;
    this.grid.material.transparent = true;
    this.grid.material.opacity = 0.25;
    this.scene.add(this.grid);

    // Starfield (very subtle)
    const starCount = 320;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 32 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ size: 0.06, color: 0x666666, transparent: true, opacity: 0.6, sizeAttenuation: true, depthWrite: false })
    );
    this.scene.add(this.stars);

    // Atlas ring
    this.atlasRing = new THREE.Mesh(
      new THREE.TorusGeometry(ATLAS_RADIUS, 0.008, 8, 220),
      new THREE.MeshBasicMaterial({ color: 0x00d4aa, transparent: true, opacity: 0.0 })
    );
    this.atlasRing.rotation.x = Math.PI / 2;
    this.atlasRing.position.y = -0.6;
    this.scene.add(this.atlasRing);

    // soft pedestal disc beneath standalone cell
    this.pedestal = new THREE.Mesh(
      new THREE.RingGeometry(1.2, 1.32, 64),
      new THREE.MeshBasicMaterial({ color: 0x00d4aa, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
    );
    this.pedestal.rotation.x = -Math.PI / 2;
    this.pedestal.position.y = -1.0;
    this.scene.add(this.pedestal);
  }

  _setupElectronMaterial() {
    const THREE = this.THREE;
    // Single override material gives the SEM/TEM monochrome look.
    this._electronMaterial = new THREE.MeshStandardMaterial({
      color: 0xb6b6b6,
      roughness: 0.78,
      metalness: 0.04,
      emissive: 0x000000,
      flatShading: true,
    });
  }

  populate(atlas) {
    const THREE = this.THREE;
    this.atlas = atlas;

    atlas.cells.forEach((cell) => {
      const materials = createMaterials(THREE, cell.accent || "#00d4aa");
      const group = buildCell(THREE, cell.geometry.builder, cell.geometry.params || {}, materials);
      group.userData.cellDef = cell;
      group.userData.materials = materials;
      const [x, y, z] = cell.atlasPosition;
      const origin = new THREE.Vector3(x, y, z);
      group.position.copy(origin);
      group.scale.setScalar(cell.scale || 1);

      group.position.set(0, 0, 0);
      group.updateMatrixWorld(true);
      const bbox = new THREE.Box3().setFromObject(group);
      const sizeVec = new THREE.Vector3();
      bbox.getSize(sizeVec);
      const footprint = Math.max(sizeVec.x, sizeVec.z) * 0.55 + 0.18;
      const heightOffset = sizeVec.y * 0.5 + 0.2;

      group.position.copy(origin);

      const statusRing = new THREE.Mesh(
        new THREE.TorusGeometry(footprint, 0.014, 8, 72),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(cell.accent || "#00d4aa"),
          transparent: true, opacity: 0.55,
        })
      );
      statusRing.rotation.x = Math.PI / 2;
      statusRing.position.y = -heightOffset + 0.05;
      statusRing.userData.role = "status-ring";
      group.add(statusRing);

      this.scene.add(group);
      group.visible = false;

      this.cells.set(cell.id, {
        cell, group, materials, statusRing,
        origin, footprint, heightOffset,
      });
    });

    atlas.links?.forEach(([from, to, tag]) => {
      const a = this.cells.get(from);
      const b = this.cells.get(to);
      if (!a || !b) return;
      const geo = new THREE.BufferGeometry().setFromPoints([
        a.group.position.clone(),
        b.group.position.clone(),
      ]);
      const line = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({ color: 0x00d4aa, transparent: true, opacity: 0.0 })
      );
      line.userData.role = "link";
      line.userData.from = from;
      line.userData.to = to;
      line.userData.tag = tag;
      line.visible = false;
      this.scene.add(line);
      this.links.push(line);
    });
  }

  // --- mode + selection -------------------------------------------------

  setSelected(id, { focus = true } = {}) {
    if (!this.cells.has(id)) return;
    this.selectedId = id;
    this.focusedComponentId = null;
    this._refreshVisibility();
    if (focus) this._focusOnSelected();
  }

  setMode(mode) {
    this.mode = mode;
    this._refreshVisibility();
    if (mode === "compare") {
      // pick defaults if not set
      if (!this.compareLeftId) this.compareLeftId = this.selectedId;
      if (!this.compareRightId) {
        const others = [...this.cells.keys()].filter((k) => k !== this.compareLeftId);
        this.compareRightId = others[0] || null;
      }
      this._tweenCamera(new this.THREE.Vector3(0, 1.6, 7.5), new this.THREE.Vector3(0, 0.0, 0), 700);
    } else if (mode === "atlas") {
      this._tweenCamera(new this.THREE.Vector3(0, 3.4, 10.8), new this.THREE.Vector3(0, 0, 0), 700);
    } else if (mode === "process") {
      this._tweenCamera(new this.THREE.Vector3(0, 1.0, 4.6), new this.THREE.Vector3(0, 0, 0), 700);
      this._buildProcessScaffold();
      this.applyProcessStage(this.processStage);
    } else {
      this._focusOnSelected();
    }
    if (mode !== "process") this._removeProcessScaffold();
    // Clipping is only meaningful for single-cell modes
    this._applyClipping();
    this.controls.autoRotate = (mode === "atlas" || mode === "standalone" || mode === "microscope") && this.autoRotate;
  }

  setCompareCells(leftId, rightId) {
    if (leftId && this.cells.has(leftId)) this.compareLeftId = leftId;
    if (rightId && this.cells.has(rightId)) this.compareRightId = rightId;
    if (this.mode === "compare") this._refreshVisibility();
  }

  setAutoRotate(on) {
    this.autoRotate = on;
    this.controls.autoRotate = on && this.mode !== "compare";
  }

  setLiveMode(on) {
    this.liveMode = on;
  }

  setReadView(on) {
    this.readView = on;
  }

  setReadViewCallback(cb) {
    this._readViewCallback = cb;
  }

  // --- hover -----------------------------------------------------------

  setHoverCallback(cb) {
    this._hoverCallback = cb;
  }

  _handleHover(event) {
    if (!this._hoverCallback) return;
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const groups = [...this.cells.values()].filter((e) => e.group.visible).map((e) => e.group);
    if (!groups.length) {
      if (this._lastHoverId) { this._hoverCallback(null); this._lastHoverId = null; }
      return;
    }
    const hits = this.raycaster.intersectObjects(groups, true);
    if (hits.length === 0) {
      if (this._lastHoverId) { this._hoverCallback(null); this._lastHoverId = null; }
      return;
    }
    const componentId = hits[0].object.userData?.componentId || null;
    let cellObj = hits[0].object;
    while (cellObj && !cellObj.userData?.cellId) cellObj = cellObj.parent;
    const cellId = cellObj?.userData?.cellId || null;
    const key = `${cellId}/${componentId}`;
    if (key !== this._lastHoverId) {
      this._hoverCallback({ cellId, componentId, x: event.clientX - rect.left, y: event.clientY - rect.top });
      this._lastHoverId = key;
    } else if (this._hoverCallback) {
      // still update position
      this._hoverCallback({ cellId, componentId, x: event.clientX - rect.left, y: event.clientY - rect.top, _moveOnly: true });
    }
  }

  // --- section view (clipping) ----------------------------------------

  setClipping(axis, ratio) {
    this._clipAxis = axis;
    this._clipRatio = ratio;
    this._applyClipping();
  }

  _applyClipping() {
    const THREE = this.THREE;
    if (!this._clipPlane) this._clipPlane = new THREE.Plane();
    const ratio = this._clipRatio;
    // ratio 1 = no clip; ratio < 1 means cut a fraction off positive side of axis
    const normal = new THREE.Vector3(0, 0, 0);
    if (this._clipAxis === "x") normal.x = 1;
    else if (this._clipAxis === "z") normal.z = 1;
    else normal.y = 1;
    // Use bbox of selected cell to scale offset
    let extent = 1.5;
    const entry = this.cells.get(this.selectedId);
    if (entry) extent = (entry.footprint || 1) * 1.4;
    const offset = -((1 - ratio) * 2 - 1) * extent; // map [0,1] to [-extent, extent]
    this._clipPlane.setFromNormalAndCoplanarPoint(normal.clone().negate(), normal.clone().multiplyScalar(offset));
    const enabled = ratio < 0.999 && this.mode !== "compare" && this.mode !== "atlas" && this.mode !== "process";
    this.renderer.clippingPlanes = enabled ? [this._clipPlane] : [];
  }

  // --- process view (virus lifecycle) ---------------------------------

  applyProcessStage(stageIndex) {
    this.processStage = stageIndex;
    const entry = this.cells.get(this.selectedId);
    if (!entry) return;
    const lifecycle = entry.cell.lifecycle;
    if (!lifecycle || !lifecycle.length) return;
    const idx = Math.max(0, Math.min(lifecycle.length - 1, stageIndex));
    const t = idx / Math.max(lifecycle.length - 1, 1);

    // Position virus relative to host membrane based on stage
    const group = entry.group;
    const THREE = this.THREE;
    // Stages: 0=attachment (touching host), 1=entry (entering), 2=replication (deep inside), 3=assembly (multiple), 4=release (above host)
    const positions = [
      [0, 0.45, 0],   // attachment: just above membrane
      [0, 0.0, 0],    // entry: at membrane level
      [0, -0.6, 0],   // replication: below membrane (inside host)
      [0, -0.45, 0],  // assembly: still inside, slightly higher
      [0, 0.85, 0],   // release: above membrane (budded off)
    ];
    const stagePos = positions[idx] || [0, 0, 0];
    group.position.set(stagePos[0], stagePos[1], stagePos[2]);
    group.scale.setScalar(entry.cell.scale || 1);

    // Show progeny copies during assembly + release
    this._removeProcessProgeny();
    if (idx >= 3) {
      this._spawnProcessProgeny(entry, idx === 4 ? 5 : 3);
    }
  }

  _buildProcessScaffold() {
    const THREE = this.THREE;
    if (this._processHostMembrane) return;
    // wide host-membrane plate beneath
    const geo = new THREE.PlaneGeometry(8, 8, 32, 32);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setZ(i, Math.sin(pos.getX(i) * 1.6) * 0.04 + Math.cos(pos.getY(i) * 1.4) * 0.04);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x4cd5ff, transparent: true, opacity: 0.35,
      transmission: 0.2, ior: 1.3, roughness: 0.4,
      side: THREE.DoubleSide, emissive: 0x1a4a64, emissiveIntensity: 0.3,
    });
    const plate = new THREE.Mesh(geo, mat);
    plate.rotation.x = -Math.PI / 2;
    plate.position.y = -0.3;
    plate.userData.role = "process-host";
    this.scene.add(plate);
    this._processHostMembrane = plate;

    // glowing receptors on host membrane (small dots)
    const receptorGroup = new THREE.Group();
    receptorGroup.userData.role = "process-host";
    for (let i = 0; i < 12; i++) {
      const dot = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.05, 0),
        new THREE.MeshStandardMaterial({ color: 0xff6ea8, emissive: 0xff6ea8, emissiveIntensity: 0.7 })
      );
      const a = (i / 12) * Math.PI * 2;
      dot.position.set(Math.cos(a) * 1.1, -0.27, Math.sin(a) * 1.1);
      receptorGroup.add(dot);
    }
    this.scene.add(receptorGroup);
    this._processReceptors = receptorGroup;
  }

  _removeProcessScaffold() {
    if (this._processHostMembrane) {
      this.scene.remove(this._processHostMembrane);
      this._processHostMembrane.geometry.dispose();
      this._processHostMembrane.material.dispose();
      this._processHostMembrane = null;
    }
    if (this._processReceptors) {
      this.scene.remove(this._processReceptors);
      this._processReceptors.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
      this._processReceptors = null;
    }
    this._removeProcessProgeny();
  }

  _spawnProcessProgeny(entry, count) {
    if (!entry || !entry.cell.lifecycle) return;
    const THREE = this.THREE;
    if (this._processProgeny) this._removeProcessProgeny();
    this._processProgeny = new THREE.Group();
    this._processProgeny.userData.role = "process-progeny";
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const r = 1.0 + Math.random() * 0.4;
      const child = entry.group.clone(true);
      // strip status ring + heavy bits, keep meshes
      child.traverse((o) => {
        if (o.userData?.role === "status-ring") o.visible = false;
      });
      child.scale.multiplyScalar(0.4);
      child.position.set(Math.cos(a) * r, -0.05 + Math.sin(a * 2) * 0.1, Math.sin(a) * r);
      this._processProgeny.add(child);
    }
    this.scene.add(this._processProgeny);
  }

  _removeProcessProgeny() {
    if (this._processProgeny) {
      this.scene.remove(this._processProgeny);
      this._processProgeny = null;
    }
  }

  // --- visibility -------------------------------------------------------

  _refreshVisibility() {
    const sel = this.selectedId;
    const isAtlas = this.mode === "atlas";
    const isCompare = this.mode === "compare";
    const isProcess = this.mode === "process";

    this.cells.forEach((entry, id) => {
      let visible = false;
      if (isAtlas) {
        visible = true;
        entry.group.position.copy(entry.origin);
      } else if (isCompare) {
        if (id === this.compareLeftId) {
          visible = true;
          entry.group.position.set(COMPARE_OFFSETS.left, 0, 0);
        } else if (id === this.compareRightId) {
          visible = true;
          entry.group.position.set(COMPARE_OFFSETS.right, 0, 0);
        }
      } else {
        visible = id === sel;
        entry.group.position.set(0, 0, 0);
      }
      entry.group.visible = visible;
      entry.statusRing.visible = visible && !isCompare && !isProcess;
    });

    this.links.forEach((ln) => {
      ln.visible = isAtlas;
      ln.material.opacity = isAtlas ? 0.3 : 0.0;
    });
    this.atlasRing.material.opacity = isAtlas ? 0.32 : 0.0;
    this.atlasRing.visible = isAtlas;
    this.grid.material.opacity = isAtlas ? 0.25 : 0.08;
    this.pedestal.visible = !isAtlas && !isCompare && !isProcess;
    this.stars.material.opacity = (this.mode === "microscope" || this.mode === "electron") ? 0.15 : 0.55;

    // Reset component highlighting when changing selection
    this.cells.forEach((entry) => {
      const map = entry.group.userData.componentMap || {};
      Object.values(map).forEach((obj) => setOpacity(obj, 1.0));
    });

    // Ambient/light tuning per mode
    const electron = this.mode === "electron";
    this.lights.ambient.intensity = electron ? 0.85 : 0.55;
    this.lights.hemi.intensity = electron ? 0.2 : 0.55;
    this.lights.accent.intensity = electron ? 0.0 : 6;
    this.lights.warm.intensity = electron ? 0.0 : 3.5;
    this.lights.rim.intensity = electron ? 0.4 : 0.85;
    this.lights.key.intensity = electron ? 1.9 : 1.55;

    // override material toggle
    this.scene.overrideMaterial = electron ? this._electronMaterial : null;
    if (this.bloomPass) this.bloomPass.enabled = !electron;

    // background tuning
    if (electron) {
      this.scene.background.setHex(0x1a1a1a);
      this.scene.fog.color.setHex(0x1a1a1a);
    } else if (this.mode === "microscope") {
      this.scene.background.setHex(0x040806);
      this.scene.fog.color.setHex(0x040806);
    } else if (this.mode === "process") {
      this.scene.background.setHex(0x070b14);
      this.scene.fog.color.setHex(0x070b14);
    } else {
      this.scene.background.setHex(0x0a0a0a);
      this.scene.fog.color.setHex(0x070707);
    }

    this.renderer.toneMappingExposure = electron ? 1.0 : (this.mode === "microscope" ? 0.85 : 1.05);
  }

  setOrganelleVisible(componentId, visible) {
    const entry = this.cells.get(this.selectedId);
    if (!entry) return;
    const obj = entry.group.userData.componentMap?.[componentId];
    if (!obj) return;
    obj.visible = visible;
  }

  isolateComponent(componentId) {
    this.focusedComponentId = componentId;
    const entry = this.cells.get(this.selectedId);
    if (!entry) return;
    const map = entry.group.userData.componentMap || {};
    Object.entries(map).forEach(([cid, obj]) => {
      const wantFull = componentId == null || cid === componentId;
      setOpacity(obj, wantFull ? 1.0 : 0.18);
    });
  }

  _focusOnSelected() {
    const entry = this.cells.get(this.selectedId);
    if (!entry) return;
    const target = new this.THREE.Vector3(0, 0, 0);
    const r = (entry.footprint || 1) * 3.4;
    const camDir = new this.THREE.Vector3(0.5, 0.4, 1.0).normalize();
    const destCam = target.clone().addScaledVector(camDir, r);
    this._tweenCamera(destCam, target, 700);
  }

  _tweenCamera(destPos, destTarget, duration = 700) {
    const startPos = this.camera.position.clone();
    const startTgt = this.controls.target.clone();
    const startTime = performance.now();
    const tick = () => {
      const t = Math.min(1, (performance.now() - startTime) / duration);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      this.camera.position.copy(startPos.clone().lerp(destPos, ease));
      this.controls.target.copy(startTgt.clone().lerp(destTarget, ease));
      this.controls.update();
      if (t < 1 && !this._disposed) requestAnimationFrame(tick);
    };
    tick();
  }

  // --- click handling ---------------------------------------------------

  onCellClick(callback) { this._onClick = callback; }

  _handlePointer(event) {
    if (!this._onClick) return;
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const groups = [...this.cells.values()].filter((e) => e.group.visible).map((e) => e.group);
    if (!groups.length) return;
    const hits = this.raycaster.intersectObjects(groups, true);
    if (hits.length === 0) return;
    let obj = hits[0].object;
    while (obj && !obj.userData?.cellId) obj = obj.parent;
    if (obj?.userData?.cellId) {
      this._onClick({
        cellId: obj.userData.cellId,
        componentId: hits[0].object.userData?.componentId || null,
      });
    }
  }

  // --- read view label projection ---------------------------------------

  collectReadViewLabels() {
    const entry = this.cells.get(this.selectedId);
    if (!entry || !this.readView) return [];
    const map = entry.group.userData.componentMap || {};
    const labels = [];
    const tmp = new this.THREE.Vector3();
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || this.canvas.width;
    const h = rect.height || this.canvas.height;
    Object.entries(map).forEach(([cid, obj]) => {
      if (!obj.visible) return;
      const bbox = new this.THREE.Box3().setFromObject(obj);
      if (!isFinite(bbox.min.x)) return;
      bbox.getCenter(tmp);
      tmp.project(this.camera);
      const x = (tmp.x * 0.5 + 0.5) * w;
      const y = (-tmp.y * 0.5 + 0.5) * h;
      if (tmp.z < -1 || tmp.z > 1) return;
      labels.push({ id: cid, x, y, z: tmp.z });
    });
    return labels;
  }

  // --- axis gizmo -------------------------------------------------------

  _drawAxisGizmo() {
    if (!this.axisCtx) return;
    const ctx = this.axisCtx;
    const w = this.axisCanvas.width;
    const h = this.axisCanvas.height;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const len = Math.min(w, h) * 0.36;

    // Build basis vectors using camera matrix world
    const m = this.camera.matrixWorldInverse.elements;
    // Take rotation columns from the inverse view (= world->view)
    // axis vectors in view space:
    const axes = [
      { v: [m[0], m[1], m[2]],  label: "X", color: "#ff7a8a" },
      { v: [m[4], m[5], m[6]],  label: "Y", color: "#7df0d0" },
      { v: [m[8], m[9], m[10]], label: "Z", color: "#7da6ff" },
    ];

    // Sort by Z so back axes draw first
    axes.sort((a, b) => a.v[2] - b.v[2]);

    // background
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.arc(cx, cy, len + 8, 0, Math.PI * 2);
    ctx.fill();

    axes.forEach((a) => {
      const x = cx + a.v[0] * len;
      const y = cy - a.v[1] * len;
      const alpha = 0.55 + a.v[2] * 0.45;
      ctx.globalAlpha = Math.max(0.35, alpha);

      ctx.strokeStyle = a.color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.fillStyle = a.color;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#0f0f0f";
      ctx.font = "700 9px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(a.label, x, y);
    });
    ctx.globalAlpha = 1;
  }

  // --- export utilities -------------------------------------------------

  async exportSelectedAsGLB() {
    const entry = this.cells.get(this.selectedId);
    if (!entry) return null;
    let GLTFExporter;
    try {
      const mod = await import("three/addons/exporters/GLTFExporter.js");
      GLTFExporter = mod.GLTFExporter;
    } catch (err) {
      console.error("GLTFExporter unavailable", err);
      return null;
    }
    return new Promise((resolve) => {
      const exp = new GLTFExporter();
      const root = entry.group.clone(true);
      // remove status ring from export
      const cleaned = new this.THREE.Group();
      root.children.forEach((child) => {
        if (child.userData?.role !== "status-ring") cleaned.add(child.clone(true));
      });
      cleaned.position.set(0, 0, 0);
      cleaned.rotation.set(0, 0, 0);
      cleaned.scale.copy(root.scale);
      exp.parse(cleaned, (result) => resolve(result), (err) => {
        console.error("GLB export error", err);
        resolve(null);
      }, { binary: true });
    });
  }

  screenshot(filename = "biocell-capture.png") {
    if (this.composer && this.bloomPass?.enabled !== false) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
    const a = document.createElement("a");
    a.href = this.renderer.domElement.toDataURL("image/png");
    a.download = filename;
    a.click();
  }

  onResize() {
    if (!this.renderer) return;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    if (this.composer) {
      this.composer.setSize(w, h);
      if (this.bloomPass) this.bloomPass.setSize(w, h);
    }
  }

  start() {
    const loop = () => {
      if (this._disposed) return;
      this.rafId = requestAnimationFrame(loop);
      const t = this.clock.getElapsedTime();
      this.controls.update();

      this.cells.forEach((entry, id) => {
        if (!entry.group.visible) return;
        const selected = id === this.selectedId;
        const spinSpeed = (this.mode === "atlas") ? (selected ? 0.28 : 0.12) : 0.08;
        if (this.autoRotate) {
          entry.group.rotation.y += spinSpeed * 0.016;
        }
        const pulse = 1 + Math.sin(t * 2.2 + entry.origin.x * 1.5) * 0.03;
        entry.statusRing.scale.setScalar(pulse);

        const base = entry.cell.scale || 1;
        if (selected && this.mode !== "atlas") {
          const breathe = 1 + Math.sin(t * 1.6) * 0.012;
          entry.group.scale.setScalar(base * breathe);
        } else {
          entry.group.scale.setScalar(base);
        }
        if (id === "ecoli" && this.liveMode) {
          const map = entry.group.userData.componentMap;
          if (map?.flagella) map.flagella.rotation.x = Math.sin(t * 4) * 0.4;
        }
        if (this.liveMode && this.mode === "atlas") {
          const o = entry.origin;
          entry.group.position.y = o.y + Math.sin(t * 0.9 + o.x * 2.1) * 0.04;
        }
      });

      this.stars.rotation.y += 0.0002;

      // pedestal subtle pulse
      if (this.pedestal.visible) {
        this.pedestal.material.opacity = 0.16 + Math.sin(t * 1.4) * 0.04;
      }

      if (this.composer && this.bloomPass?.enabled !== false) {
        this.composer.render();
      } else {
        this.renderer.render(this.scene, this.camera);
      }

      this._drawAxisGizmo();
      if (this.readView && this._readViewCallback) {
        const labels = this.collectReadViewLabels();
        this._readViewCallback(labels);
      }
    };
    loop();
  }

  dispose() {
    this._disposed = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.renderer.dispose();
  }
}

function setOpacity(obj, opacity) {
  const applyMat = (mat) => {
    if (!mat || Array.isArray(mat)) return;
    if (mat.__originalOpacity == null) {
      mat.__originalOpacity = mat.opacity ?? 1;
      mat.__originalTransparent = mat.transparent === true;
    }
    const next = opacity * (mat.__originalOpacity ?? 1);
    mat.opacity = next;
    mat.transparent = next < 0.999 || mat.__originalTransparent;
    mat.depthWrite = next > 0.85 ? !mat.__originalTransparent : false;
    mat.needsUpdate = true;
  };
  const visit = (o) => {
    if ((o.isMesh || o.isInstancedMesh) && o.material) applyMat(o.material);
    o.children?.forEach(visit);
  };
  visit(obj);
}
