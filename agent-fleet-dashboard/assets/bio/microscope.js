// Microscope overlay: simple CSS-layer mode that simulates a microscope view
// with vignette, scanlines, and optional grayscale. Toggleable by BioScene mode.

export class MicroscopeOverlay {
  constructor({ container }) {
    this.container = container;
    this.root = document.createElement("div");
    this.root.className = "microscope-overlay";
    this.root.setAttribute("aria-hidden", "true");
    this.root.innerHTML = `
      <div class="microscope-ring"></div>
      <div class="microscope-scanlines"></div>
      <div class="microscope-reticle">
        <span class="microscope-dot"></span>
        <span class="microscope-axis microscope-axis-x"></span>
        <span class="microscope-axis microscope-axis-y"></span>
      </div>
      <div class="microscope-readout">
        <div><span>MAG</span><strong>×4200</strong></div>
        <div><span>λ</span><strong>488 nm</strong></div>
        <div><span>MODE</span><strong>FLUO</strong></div>
      </div>
    `;
    container.appendChild(this.root);
    this.setActive(false);
  }

  setActive(on) {
    this.root.classList.toggle("is-active", !!on);
  }
}
