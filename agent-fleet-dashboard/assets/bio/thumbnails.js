// Thumbnail renderer — generates small PNGs for each cell using offscreen
// WebGL renders. Used by sidebar cell list and the compare-cells row.

import { buildCell, createMaterials } from "./geometry.js";

const THUMB_SIZE = 128;

export class ThumbnailFactory {
  constructor({ THREE, size = THUMB_SIZE }) {
    this.THREE = THREE;
    this.size = size;
    this.canvas = document.createElement("canvas");
    this.canvas.width = size;
    this.canvas.height = size;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, antialias: true, alpha: true, preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(size, size, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.setClearColor(0x0c0c0c, 1);

    this.scene = new THREE.Scene();
    this.scene.fog = null;

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.05, 60);

    // soft 3-point lighting
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(3, 4, 3);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x7df0d0, 0.7);
    rim.position.set(-3, 2, -2);
    this.scene.add(rim);
    const accent = new THREE.PointLight(0x00d4aa, 4, 8, 2);
    accent.position.set(-2, 1, 2);
    this.scene.add(accent);
  }

  render(cell) {
    const THREE = this.THREE;
    // Clear previous group
    if (this._currentGroup) {
      this.scene.remove(this._currentGroup);
      this._disposeGroup(this._currentGroup);
      this._currentGroup = null;
    }
    const materials = createMaterials(THREE, cell.accent || "#00d4aa");
    const group = buildCell(THREE, cell.geometry.builder, cell.geometry.params || {}, materials);
    group.scale.setScalar(cell.scale || 1);

    // Compute bounds and fit camera distance
    group.position.set(0, 0, 0);
    group.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(group);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bbox.getSize(size);
    bbox.getCenter(center);
    group.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const dist = maxDim * 1.7;
    this.camera.position.set(dist * 0.35, dist * 0.6, dist);
    this.camera.lookAt(0, 0, 0);

    this.scene.add(group);
    this._currentGroup = group;

    // small backdrop tinted by accent
    if (this._backdrop) {
      this.scene.remove(this._backdrop);
      this._backdrop.geometry.dispose();
      this._backdrop.material.dispose();
    }
    const backdrop = new THREE.Mesh(
      new THREE.CircleGeometry(maxDim * 1.6, 32),
      new THREE.MeshBasicMaterial({ color: cell.accent || "#00d4aa", transparent: true, opacity: 0.06 })
    );
    backdrop.position.set(0, -maxDim * 0.5, -maxDim * 0.7);
    this.scene.add(backdrop);
    this._backdrop = backdrop;

    this.renderer.render(this.scene, this.camera);
    return this.canvas.toDataURL("image/png");
  }

  _disposeGroup(group) {
    group.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    });
  }

  dispose() {
    if (this._currentGroup) this._disposeGroup(this._currentGroup);
    if (this._backdrop) {
      this._backdrop.geometry.dispose();
      this._backdrop.material.dispose();
    }
    this.renderer.dispose();
  }
}
