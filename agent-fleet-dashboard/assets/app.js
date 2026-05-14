// Cell Architecture Studio — frontend orchestrator.
// Wires DOM, scene, thumbnails, taxonomy, services polling, exports, and modes.

import { BioScene } from "./bio/scene.js";
import { ThumbnailFactory } from "./bio/thumbnails.js";
import { ApiPoller, probeApiHealth } from "./bio/poll.js";
import { t, applyTranslations, TRANSLATIONS } from "./bio/i18n.js";
import { manualSections } from "./bio/manual.js";

const PREFS_KEY = "cellstudio.prefs.v1";
const RECENTS_KEY = "cellstudio.recents.v1";
const RECENTS_MAX = 12;

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* ignore */ }
  return {};
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (_) { /* ignore */ }
}

function loadRecents() {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* ignore */ }
  return [];
}

function saveRecents(list) {
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(list));
  } catch (_) { /* ignore */ }
}

function loadBookmarks() {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* ignore */ }
  return [];
}

function saveBookmarks(list) {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(list));
  } catch (_) { /* ignore */ }
}

const initPrefs = loadPrefs();
const state = {
  atlas: null,
  services: null,
  selectedCellId: null,
  selectedComponentId: null,
  componentVisible: {},
  componentLabelOn: {},
  mode: "standalone",
  autoRotate: true,
  liveMode: true,
  liveApi: false,
  isolated: false,
  hideOthers: false,
  compareLeftId: null,
  compareRightId: null,
  readView: false,
  thumbnails: {},
  sectionOpen: false,
  sectionAxis: "y",
  sectionRatio: 1.0,
  processStage: 0,
  processPlaying: initPrefs.processAutoplay !== false,
  processTimer: null,
  // Settings/preferences
  theme: initPrefs.theme || "dark",
  lang: initPrefs.lang || "en",
  bloomEnabled: initPrefs.bloom !== false,
  // Top-tab panel state
  activePanel: null,
  recents: loadRecents(),
  librarySearch: "",
  // Search overlay state
  bookmarks: loadBookmarks(),
  searchQuery: "",
  searchActiveIndex: 0,
  searchOpen: false,
  avatarMenuOpen: false,
  projectMenuOpen: false,
  aboutOpen: false,
};

const dom = {
  canvas: document.getElementById("fleetCanvas"),
  fallback: document.getElementById("fallbackMap"),
  cellList: document.getElementById("cellList"),
  componentList: document.getElementById("componentList"),
  serviceList: document.getElementById("serviceList"),
  selectedTitle: document.getElementById("selectedTitle"),
  selectedRole: document.getElementById("selectedRole"),
  cellKingdom: document.getElementById("cellKingdom"),
  selectedSize: document.getElementById("selectedSize"),
  modePill: document.getElementById("modePill"),
  factsList: document.getElementById("factsList"),
  organelleCard: document.getElementById("organelleCard"),
  organelleDot: document.getElementById("organelleDot"),
  organelleName: document.getElementById("organelleName"),
  organelleRole: document.getElementById("organelleRole"),
  organelleSize: document.getElementById("organelleSize"),
  organelleFact: document.getElementById("organelleFact"),
  orgVisibleToggle: document.getElementById("orgVisibleToggle"),
  orgLabelToggle: document.getElementById("orgLabelToggle"),
  cadPrompt: document.getElementById("cadPrompt"),
  cadSource: document.getElementById("cadSource"),
  statsGrid: document.getElementById("statsGrid"),
  apiBadge: document.getElementById("apiBadge"),
  meshStatus: document.getElementById("meshStatus"),
  lastRefresh: document.getElementById("lastRefresh"),
  systemCpu: document.getElementById("systemCpu"),
  systemMem: document.getElementById("systemMem"),
  systemDisk: document.getElementById("systemDisk"),
  systemDot: document.getElementById("systemDot"),
  systemSummary: document.getElementById("systemSummary"),
  rotateBtn: document.getElementById("rotateBtn"),
  isolateBtn: document.getElementById("isolateBtn"),
  hideOthersBtn: document.getElementById("hideOthersBtn"),
  readViewBtn: document.getElementById("readViewBtn"),
  screenshotBtn: document.getElementById("screenshotBtn"),
  exportBtn: document.getElementById("exportBtn"),
  resetFocusBtn: document.getElementById("resetFocusBtn"),
  copyCadPromptBtn: document.getElementById("copyCadPrompt"),
  copyCadSourceBtn: document.getElementById("copyCadSource"),
  modeButtons: Array.from(document.querySelectorAll("[data-mode]")),
  topbarTabs: Array.from(document.querySelectorAll("[data-top-tab]")),
  taxonomyTree: document.getElementById("taxonomyTree"),
  viewportWrap: document.getElementById("viewportWrap"),
  axisCanvas: document.getElementById("axisCanvas"),
  readOverlay: document.getElementById("readOverlay"),
  compareLeft: document.getElementById("compareLeft"),
  compareRight: document.getElementById("compareRight"),
  compareToggle: document.getElementById("compareToggle"),
  exportSheet: document.getElementById("exportSheet"),
  exportClose: document.getElementById("exportClose"),
  exportCellLabel: document.getElementById("exportCellLabel"),
  newProjectBtn: document.getElementById("newProjectBtn"),
  sectionBtn: document.getElementById("sectionBtn"),
  sectionPanel: document.getElementById("sectionPanel"),
  sectionRange: document.getElementById("sectionRange"),
  sectionValue: document.getElementById("sectionValue"),
  sectionAxes: Array.from(document.querySelectorAll(".section-axis")),
  processOverlay: document.getElementById("processOverlay"),
  processStageNum: document.getElementById("processStageNum"),
  processStageTotal: document.getElementById("processStageTotal"),
  processStageLabel: document.getElementById("processStageLabel"),
  processStageNarration: document.getElementById("processStageNarration"),
  processStageDuration: document.getElementById("processStageDuration"),
  processDots: document.getElementById("processDots"),
  processPlayBtn: document.getElementById("processPlayBtn"),
  processNextBtn: document.getElementById("processNextBtn"),
  hoverTooltip: document.getElementById("hoverTooltip"),
  // Top-tab panels
  galleryPanel: document.getElementById("galleryPanel"),
  libraryPanel: document.getElementById("libraryPanel"),
  recentsPanel: document.getElementById("recentsPanel"),
  manualPanel: document.getElementById("manualPanel"),
  settingsPanel: document.getElementById("settingsPanel"),
  galleryGrid: document.getElementById("galleryGrid"),
  galleryPanelSubtitle: document.getElementById("galleryPanelSubtitle"),
  libraryCategories: document.getElementById("libraryCategories"),
  librarySearchInput: document.getElementById("librarySearchInput"),
  recentsList: document.getElementById("recentsList"),
  recentsClearBtn: document.getElementById("recentsClearBtn"),
  manualToc: document.getElementById("manualToc"),
  manualContent: document.getElementById("manualContent"),
  themeSelect: document.getElementById("themeSelect"),
  langSelect: document.getElementById("langSelect"),
  processAutoplayToggle: document.getElementById("processAutoplayToggle"),
  bloomToggle: document.getElementById("bloomToggle"),
  settingsResetBtn: document.getElementById("settingsResetBtn"),
  exportSubtitle: document.getElementById("exportSubtitle"),
  cadHelp: document.getElementById("cadHelp"),
  // Search overlay
  searchOverlay: document.getElementById("searchOverlay"),
  searchInput: document.getElementById("searchInput"),
  searchResults: document.getElementById("searchResults"),
  topbarSearchBtn: document.getElementById("topbarSearchBtn"),
  searchShortcut: document.getElementById("searchShortcut"),
  // Avatar menu
  topbarAvatarBtn: document.getElementById("topbarAvatarBtn"),
  avatarMenu: document.getElementById("avatarMenu"),
  // Project bookmarks menu
  projectMenu: document.getElementById("projectMenu"),
  projectBookmarksList: document.getElementById("projectBookmarksList"),
  // About dialog
  aboutDialog: document.getElementById("aboutDialog"),
  aboutClose: document.getElementById("aboutClose"),
};

let bioScene = null;
let thumbFactory = null;

// ---------- data loading -------------------------------------------------

async function loadAtlas() {
  try {
    const apiOk = await probeApiHealth("/api/health");
    if (apiOk) {
      const res = await fetch("/api/cells", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && data.cells) {
          state.liveApi = true;
          return data;
        }
      }
    }
  } catch (_) { /* fallthrough */ }
  const res = await fetch("data/cells.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`cells.json ${res.status}`);
  state.liveApi = false;
  return res.json();
}

async function loadThree() {
  const [threeModule, controlsModule] = await Promise.all([
    import("three"),
    import("three/addons/controls/OrbitControls.js"),
  ]);
  let postFx = null;
  try {
    const [composerMod, renderPassMod, bloomMod, outputPassMod] = await Promise.all([
      import("three/addons/postprocessing/EffectComposer.js"),
      import("three/addons/postprocessing/RenderPass.js"),
      import("three/addons/postprocessing/UnrealBloomPass.js"),
      import("three/addons/postprocessing/OutputPass.js").catch(() => ({})),
    ]);
    postFx = {
      EffectComposer: composerMod.EffectComposer,
      RenderPass: renderPassMod.RenderPass,
      UnrealBloomPass: bloomMod.UnrealBloomPass,
      OutputPass: outputPassMod.OutputPass || null,
    };
  } catch (err) {
    console.warn("post-fx unavailable", err?.message || err);
  }
  return { THREE: threeModule, OrbitControls: controlsModule.OrbitControls, postFx };
}

// ---------- helpers ------------------------------------------------------

function cellById(id) {
  return state.atlas.cells.find((c) => c.id === id) || null;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  }[ch]));
}

function escapeAttr(value) { return escapeHtml(value).replace(/`/g, "&#96;"); }

function formatStatKey(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())
    .replace("Mb", " MB").replace("Kb", " kb").replace("Per Sec", "/s");
}

function formatStatValue(value) {
  if (typeof value === "number") {
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return value.toLocaleString();
    return String(value);
  }
  return String(value);
}

function applyI18n() {
  applyTranslations(document, state.lang);
  document.documentElement.lang = state.lang;
  // Translated dynamic strings
  if (dom.exportSubtitle && state.atlas) {
    const cell = cellById(state.selectedCellId);
    dom.exportSubtitle.innerHTML = t("export.subtitle", state.lang, `<strong id="exportCellLabel">${escapeHtml(cell?.label || "--")}</strong>`);
    dom.exportCellLabel = document.getElementById("exportCellLabel");
  }
  if (dom.cadHelp) {
    dom.cadHelp.innerHTML = t("detail.cadHelp", state.lang, `<code id="cadSource">${escapeHtml(cellById(state.selectedCellId)?.cad?.source || "cad_source/...")}</code>`);
    dom.cadSource = document.getElementById("cadSource");
  }
  if (dom.galleryPanelSubtitle && state.atlas) {
    dom.galleryPanelSubtitle.textContent = t("panel.gallery.subtitle", state.lang, state.atlas.cells.length);
  }
  // Refresh dynamic UI
  renderDetail();
  renderApiBadge();
  renderActivePanel();
}

function applyTheme(theme) {
  state.theme = theme;
  document.body.dataset.theme = theme;
  if (dom.themeSelect) {
    dom.themeSelect.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b.dataset.theme === theme));
  }
  // Persist
  const prefs = loadPrefs();
  prefs.theme = theme;
  savePrefs(prefs);
}

function applyLang(lang) {
  if (!TRANSLATIONS[lang]) return;
  state.lang = lang;
  if (dom.langSelect) {
    dom.langSelect.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b.dataset.lang === lang));
  }
  applyI18n();
  const prefs = loadPrefs();
  prefs.lang = lang;
  savePrefs(prefs);
}

function modeLabel(mode) {
  const map = { standalone: "viewModes.standalone", microscope: "viewModes.microscope", electron: "viewModes.electron", atlas: "viewModes.atlas", compare: "compare.action", process: "viewModes.process" };
  return t(map[mode] || mode, state.lang);
}

// ---------- rendering ---------------------------------------------------

function renderCellList() {
  dom.cellList.innerHTML = "";
  const categories = state.atlas.categories || [];
  const seen = new Set();
  categories.forEach((cat) => {
    const heading = document.createElement("p");
    heading.className = "cell-category-label";
    heading.textContent = cat.label;
    dom.cellList.appendChild(heading);
    cat.cells.forEach((cellId) => {
      const cell = cellById(cellId);
      if (!cell) return;
      seen.add(cellId);
      dom.cellList.appendChild(makeCellItem(cell));
    });
  });
  // Cells without category
  state.atlas.cells.filter((c) => !seen.has(c.id)).forEach((cell) => {
    dom.cellList.appendChild(makeCellItem(cell));
  });
}

function makeCellItem(cell) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "cell-item";
  button.dataset.cellId = cell.id;
  button.innerHTML = `
    <span class="cell-thumb" data-cell-thumb-id="${escapeAttr(cell.id)}"></span>
    <span class="cell-meta">
      <strong>${escapeHtml(cell.label)}</strong>
      <small>${escapeHtml(cell.kingdom)} · ${escapeHtml(cell.size)}</small>
    </span>
  `;
  button.addEventListener("click", () => selectCell(cell.id, { focus: true }));
  if (cell.id === state.selectedCellId) button.classList.add("is-active");
  return button;
}

function applyCellThumbnails() {
  Object.entries(state.thumbnails).forEach(([cellId, dataUrl]) => {
    document.querySelectorAll(`[data-cell-thumb-id="${cellId}"]`).forEach((el) => {
      el.style.backgroundImage = `url(${dataUrl})`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
    });
  });
}

function applyCompareThumbnails() {
  [
    { id: state.compareLeftId, root: dom.compareLeft },
    { id: state.compareRightId, root: dom.compareRight },
  ].forEach(({ id, root }) => {
    if (!root) return;
    const cell = id ? cellById(id) : null;
    const thumb = root.querySelector("[data-cell-thumb]");
    const label = root.querySelector("strong");
    if (cell && state.thumbnails[id]) {
      thumb.style.backgroundImage = `url(${state.thumbnails[id]})`;
      thumb.style.backgroundSize = "cover";
      thumb.style.backgroundPosition = "center";
    } else {
      thumb.style.backgroundImage = "";
    }
    if (label) label.textContent = cell ? cell.label : "Pick cell";
  });
}

function renderDetail() {
  const cell = cellById(state.selectedCellId);
  if (!cell) return;
  if (state.mode === "compare") {
    const a = cellById(state.compareLeftId);
    const b = cellById(state.compareRightId);
    dom.selectedTitle.textContent = `${a?.label || "--"} · vs · ${b?.label || "--"}`;
    dom.selectedRole.textContent = "Side-by-side compare. Click left/right cards below to swap cells.";
    dom.cellKingdom.textContent = `${a?.kingdom || ""} ↔ ${b?.kingdom || ""}`;
    dom.selectedSize.textContent = `${a?.size || ""} ↔ ${b?.size || ""}`;
  } else {
    dom.selectedTitle.textContent = cell.label;
    dom.selectedRole.textContent = cell.summary;
    dom.cellKingdom.textContent = `${cell.kingdom} · ${cell.type}`;
    dom.selectedSize.textContent = cell.size;
  }
  dom.modePill.textContent = modeLabel(state.mode);
  dom.viewportWrap.style.setProperty("--cell-accent", cell.accent);

  dom.factsList.innerHTML = cell.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join("");
  dom.statsGrid.innerHTML = Object.entries(cell.stats || {}).map(([key, value]) => `
    <div><span>${escapeHtml(formatStatKey(key))}</span><strong>${escapeHtml(formatStatValue(value))}</strong></div>
  `).join("");

  // Component chips
  dom.componentList.innerHTML = "";
  cell.components.forEach((comp) => {
    const visible = state.componentVisible[comp.id] ?? true;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `component-chip ${comp.id === state.selectedComponentId ? "is-active" : ""} ${visible ? "" : "is-hidden"}`;
    btn.dataset.componentId = comp.id;
    btn.innerHTML = `<span class="dot" style="background:${comp.color}"></span><span class="label">${escapeHtml(comp.label)}</span>`;
    btn.title = comp.role;
    btn.addEventListener("click", () => {
      const nextId = comp.id === state.selectedComponentId ? null : comp.id;
      selectComponent(nextId);
    });
    dom.componentList.appendChild(btn);
  });

  // Organelle details card (selected component or first)
  const comp = cell.components.find((c) => c.id === state.selectedComponentId) || cell.components[0];
  if (comp) {
    dom.organelleDot.style.background = comp.color;
    dom.organelleDot.style.boxShadow = `0 0 10px ${comp.color}`;
    dom.organelleName.textContent = comp.label;
    dom.organelleRole.textContent = comp.role;
    dom.organelleSize.textContent = comp.size || "—";
    dom.organelleFact.textContent = comp.fact || cell.funFact || "";
    dom.orgVisibleToggle.checked = state.componentVisible[comp.id] ?? true;
    dom.orgLabelToggle.checked = state.componentLabelOn[comp.id] ?? false;
  } else {
    dom.organelleName.textContent = "—";
    dom.organelleRole.textContent = "Select an organelle";
    dom.organelleSize.textContent = "—";
    dom.organelleFact.textContent = cell.funFact || "";
  }

  // CAD bridge
  dom.cadPrompt.textContent = cell.cad?.prompt || "No CAD prompt available.";
  dom.cadSource.textContent = cell.cad?.source || "";

  // sidebar active state
  document.querySelectorAll(".cell-item").forEach((b) => b.classList.toggle("is-active", b.dataset.cellId === state.selectedCellId));

  // taxonomy tree
  renderTaxonomyTree(cell);
}

function renderTaxonomyTree(cell) {
  const tree = state.atlas.taxonomyTree;
  if (!tree) { dom.taxonomyTree.innerHTML = "—"; return; }
  const path = cell.taxonomy || [];
  // Walk tree, render nodes that are either ancestors of current or contain it
  const rows = [];
  const walk = (node, depth, ancestors) => {
    const inPath = path.includes(node.label);
    const containsCurrent = nodeContainsCell(node, cell.id);
    rows.push({
      label: node.label,
      depth,
      isCurrent: inPath && depth === path.length - 1,
      isAncestor: inPath && depth < path.length - 1,
      cellCount: node.cellIds ? node.cellIds.length : 0,
      cellIds: node.cellIds || [],
    });
    if (node.children && (containsCurrent || depth < 2)) {
      node.children.forEach((child) => walk(child, depth + 1, [...ancestors, node.label]));
    }
  };
  walk(tree, 0, []);
  dom.taxonomyTree.innerHTML = rows.map((r) => {
    const cls = `taxon-row depth-${r.depth} ${r.isCurrent ? "is-current" : ""} ${r.isAncestor ? "is-ancestor" : ""}`;
    const tail = r.cellCount ? `<span class="taxon-cells">${r.cellCount} cell${r.cellCount > 1 ? "s" : ""}</span>` : "";
    return `<div class="${cls}">${escapeHtml(r.label)}${tail}</div>`;
  }).join("");
}

function nodeContainsCell(node, cellId) {
  if (node.cellIds?.includes(cellId)) return true;
  if (!node.children) return false;
  return node.children.some((c) => nodeContainsCell(c, cellId));
}

function renderServices(payload) {
  if (!payload) {
    dom.serviceList.innerHTML = `<li class="muted">No live service probe.</li>`;
    dom.systemSummary.textContent = "static";
    return;
  }
  state.services = payload;
  if (payload.system) {
    const s = payload.system;
    dom.systemCpu.textContent = s.cpuPct != null ? `${s.cpuPct}%` : "--%";
    dom.systemMem.textContent = s.memory?.usedPct != null ? `${s.memory.usedPct}%` : "--%";
    dom.systemDisk.textContent = s.disk?.usedPct != null ? `${s.disk.usedPct}%` : "--%";
    dom.systemSummary.textContent = `CPU ${s.cpuPct ?? "–"}% · RAM ${s.memory?.usedPct ?? "–"}%`;
  }
  dom.serviceList.innerHTML = (payload.services || []).map((svc) => {
    const status = svc.status || "offline";
    const latency = svc.probe?.latencyMs != null ? `${svc.probe.latencyMs}ms` : "--";
    return `
      <li class="service-row ${escapeAttr(status)}">
        <span class="service-dot"></span>
        <div class="service-meta">
          <strong>${escapeHtml(svc.label)}</strong>
          <small>${escapeHtml(svc.probe?.url || "")}</small>
        </div>
        <span class="service-latency">${escapeHtml(latency)}</span>
      </li>`;
  }).join("");
  dom.lastRefresh.textContent = new Date(payload.updatedAt || Date.now()).toLocaleTimeString();
}

function renderHoverTooltip(info) {
  if (!info || !info.componentId) {
    dom.hoverTooltip.hidden = true;
    return;
  }
  const cell = cellById(info.cellId);
  const comp = cell?.components.find((c) => c.id === info.componentId);
  if (!comp) {
    dom.hoverTooltip.hidden = true;
    return;
  }
  dom.hoverTooltip.hidden = false;
  // Reposition (info.x/y are relative to canvas)
  const x = info.x + 14;
  const y = info.y + 14;
  dom.hoverTooltip.style.left = `${x}px`;
  dom.hoverTooltip.style.top = `${y}px`;
  if (info._moveOnly) return;
  dom.hoverTooltip.innerHTML = `<strong>${escapeHtml(comp.label)}</strong><small>${escapeHtml(comp.role || "")} · ${escapeHtml(comp.size || "")}</small>`;
}

function renderApiBadge() {
  dom.apiBadge.textContent = state.liveApi ? t("api.live", state.lang) : t("api.static", state.lang);
  dom.apiBadge.dataset.state = state.liveApi ? "live" : "static";
}

function renderMeshStatus(text, kind = "ok") {
  dom.meshStatus.textContent = text;
  dom.meshStatus.dataset.kind = kind;
}

// ---------- top-tab panels ----------------------------------------------

function openPanel(name) {
  state.activePanel = name;
  ["gallery", "library", "recents", "manual", "settings"].forEach((n) => {
    const el = dom[`${n}Panel`];
    if (el) el.hidden = (n !== name);
  });
  dom.topbarTabs.forEach((b) => b.classList.toggle("is-active", b.dataset.topTab === name));
  renderActivePanel();
}

function closePanel() {
  state.activePanel = null;
  [dom.galleryPanel, dom.libraryPanel, dom.recentsPanel, dom.manualPanel, dom.settingsPanel].forEach((el) => { if (el) el.hidden = true; });
  dom.topbarTabs.forEach((b) => b.classList.remove("is-active"));
}

function renderActivePanel() {
  if (!state.atlas) return;
  switch (state.activePanel) {
    case "gallery": renderGallery(); break;
    case "library": renderLibrary(); break;
    case "recents": renderRecents(); break;
    case "manual": renderManual(); break;
    case "settings": renderSettings(); break;
    default: break;
  }
}

function renderGallery() {
  if (!dom.galleryGrid) return;
  dom.galleryPanelSubtitle.textContent = t("panel.gallery.subtitle", state.lang, state.atlas.cells.length);
  // Group by category, but render flat grid with category badge per card.
  const cats = state.atlas.categories || [];
  const catById = {};
  cats.forEach((c) => c.cells.forEach((id) => { catById[id] = c.label; }));
  dom.galleryGrid.innerHTML = state.atlas.cells.map((cell) => {
    const thumb = state.thumbnails[cell.id];
    const bg = thumb ? `style="background-image:url(${thumb})"` : "";
    return `
      <button class="gallery-card" data-cell-id="${escapeAttr(cell.id)}">
        <span class="gallery-card-thumb" ${bg}></span>
        <span class="gallery-card-cat">${escapeHtml(catById[cell.id] || cell.kingdom)}</span>
        <span class="gallery-card-meta">
          <strong>${escapeHtml(cell.label)}</strong>
          <small>${escapeHtml(cell.kingdom)} · ${escapeHtml(cell.size)}</small>
        </span>
      </button>`;
  }).join("");
  dom.galleryGrid.querySelectorAll(".gallery-card").forEach((card) => {
    card.addEventListener("click", () => {
      selectCell(card.dataset.cellId, { focus: true });
      closePanel();
    });
  });
}

function renderLibrary() {
  if (!dom.libraryCategories) return;
  const search = state.librarySearch.toLowerCase();
  const cats = state.atlas.categories || [];
  let totalShown = 0;
  dom.libraryCategories.innerHTML = cats.map((cat) => {
    const cells = cat.cells
      .map((id) => cellById(id))
      .filter(Boolean)
      .filter((c) => !search || matchesSearch(c, search));
    if (!cells.length) return "";
    totalShown += cells.length;
    return `
      <div class="library-category">
        <div class="library-category-head">
          <strong>${escapeHtml(cat.label)}</strong>
          <span class="count">${cells.length}</span>
        </div>
        <div class="library-rows">
          ${cells.map((cell) => {
            const thumb = state.thumbnails[cell.id];
            const bg = thumb ? `style="background-image:url(${thumb})"` : "";
            return `
              <button class="library-row" data-cell-id="${escapeAttr(cell.id)}">
                <span class="thumb" ${bg}></span>
                <span>
                  <strong>${escapeHtml(cell.label)}</strong>
                  <small>${escapeHtml(cell.kingdom)} · ${escapeHtml(cell.size)}</small>
                </span>
              </button>`;
          }).join("")}
        </div>
      </div>`;
  }).join("");
  if (totalShown === 0) {
    dom.libraryCategories.innerHTML = `<p class="library-no-results">${escapeHtml(t("panel.library.noResults", state.lang))}</p>`;
  }
  dom.libraryCategories.querySelectorAll(".library-row").forEach((row) => {
    row.addEventListener("click", () => {
      selectCell(row.dataset.cellId, { focus: true });
      closePanel();
    });
  });
}

function matchesSearch(cell, search) {
  if (cell.label.toLowerCase().includes(search)) return true;
  if (cell.kingdom.toLowerCase().includes(search)) return true;
  if (cell.summary?.toLowerCase().includes(search)) return true;
  return cell.components.some((c) => c.label.toLowerCase().includes(search) || c.role?.toLowerCase().includes(search));
}

function renderRecents() {
  if (!dom.recentsList) return;
  if (!state.recents.length) {
    dom.recentsList.innerHTML = `<p class="recents-empty">${escapeHtml(t("panel.recents.empty", state.lang))}</p>`;
    return;
  }
  const lang = state.lang;
  dom.recentsList.innerHTML = state.recents.map((entry) => {
    const cell = cellById(entry.cellId);
    if (!cell) return "";
    const thumb = state.thumbnails[cell.id];
    const bg = thumb ? `style="background-image:url(${thumb})"` : "";
    const ago = formatRelative(entry.ts, lang);
    return `
      <button class="recents-row" data-cell-id="${escapeAttr(cell.id)}">
        <span class="thumb" ${bg}></span>
        <span>
          <strong>${escapeHtml(cell.label)}</strong>
          <small>${escapeHtml(cell.kingdom)} · ${escapeHtml(cell.size)}</small>
        </span>
        <span class="recents-time">${escapeHtml(ago)}</span>
      </button>`;
  }).join("");
  dom.recentsList.querySelectorAll(".recents-row").forEach((row) => {
    row.addEventListener("click", () => {
      selectCell(row.dataset.cellId, { focus: true });
      closePanel();
    });
  });
}

function formatRelative(ts, lang) {
  if (!ts) return "";
  const diff = (Date.now() - ts) / 1000;
  const fmt = (en, id) => lang === "id" ? id : en;
  if (diff < 60) return fmt("just now", "baru saja");
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return fmt(`${m} min ago`, `${m} mnt lalu`);
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return fmt(`${h} hr ago`, `${h} jam lalu`);
  }
  const d = Math.floor(diff / 86400);
  return fmt(`${d} d ago`, `${d} hr lalu`);
}

function renderSettings() {
  // Toggle states reflect current
  if (dom.processAutoplayToggle) dom.processAutoplayToggle.checked = state.processPlaying;
  if (dom.bloomToggle) dom.bloomToggle.checked = state.bloomEnabled;
  if (dom.themeSelect) dom.themeSelect.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b.dataset.theme === state.theme));
  if (dom.langSelect) dom.langSelect.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b.dataset.lang === state.lang));
}

function renderManual() {
  const sections = manualSections(state.lang);
  if (!sections.length) return;
  if (!state._manualSectionId || !sections.find((s) => s.id === state._manualSectionId)) {
    state._manualSectionId = sections[0].id;
  }
  if (dom.manualToc) {
    dom.manualToc.innerHTML = sections.map((s) => `
      <button data-manual-section="${escapeAttr(s.id)}" class="${s.id === state._manualSectionId ? "is-active" : ""}">
        ${escapeHtml(s.title)}
      </button>`).join("");
    dom.manualToc.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      state._manualSectionId = b.dataset.manualSection;
      renderManual();
    }));
  }
  const current = sections.find((s) => s.id === state._manualSectionId);
  if (dom.manualContent && current) {
    dom.manualContent.innerHTML = `<h3>${escapeHtml(current.title)}</h3>${current.body}`;
    dom.manualContent.scrollTop = 0;
  }
}

function pushRecent(cellId) {
  if (!cellId) return;
  state.recents = state.recents.filter((r) => r.cellId !== cellId);
  state.recents.unshift({ cellId, ts: Date.now() });
  state.recents = state.recents.slice(0, RECENTS_MAX);
  saveRecents(state.recents);
}

function renderReadOverlay(labels) {
  if (!state.readView) {
    dom.readOverlay.hidden = true;
    dom.readOverlay.innerHTML = "";
    return;
  }
  dom.readOverlay.hidden = false;
  const cell = cellById(state.selectedCellId);
  if (!cell) { dom.readOverlay.innerHTML = ""; return; }
  const compById = Object.fromEntries(cell.components.map((c) => [c.id, c]));

  const w = dom.readOverlay.clientWidth || dom.canvas.clientWidth;
  const h = dom.readOverlay.clientHeight || dom.canvas.clientHeight;

  // Distribute labels around the perimeter on either side
  const side = labels.map((l) => ({ ...l, side: l.x > w / 2 ? "right" : "left" }));
  const left = side.filter((l) => l.side === "left").sort((a, b) => a.y - b.y);
  const right = side.filter((l) => l.side === "right").sort((a, b) => a.y - b.y);
  const padding = 18;
  const leftX = padding + 100;
  const rightX = w - padding - 100;
  const lineSpace = h / Math.max(left.length + right.length + 2, 6);
  left.forEach((l, i) => {
    l.lx = leftX;
    l.ly = padding + (i + 1) * (h - 2 * padding) / (left.length + 1);
  });
  right.forEach((l, i) => {
    l.lx = rightX;
    l.ly = padding + (i + 1) * (h - 2 * padding) / (right.length + 1);
  });

  const all = [...left, ...right];
  const svgPaths = all.map((l) => `<path d="M ${l.x} ${l.y} L ${l.lx} ${l.ly}" stroke="#00d4aa" stroke-width="1" fill="none" stroke-dasharray="2 3" opacity="0.7"/>`).join("");
  const labelHtml = all.map((l) => {
    const comp = compById[l.id];
    if (!comp) return "";
    return `<div class="read-label" data-component-id="${escapeAttr(l.id)}" style="left:${l.lx}px;top:${l.ly}px"><small>${escapeHtml(comp.role)}</small>${escapeHtml(comp.label)}</div>`;
  }).join("");
  dom.readOverlay.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${svgPaths}</svg>${labelHtml}`;
  dom.readOverlay.querySelectorAll(".read-label").forEach((el) => {
    el.addEventListener("click", () => selectComponent(el.dataset.componentId));
  });
}

// ---------- selection ----------------------------------------------------

function selectCell(id, { focus = true } = {}) {
  if (!cellById(id)) return;
  state.selectedCellId = id;
  state.selectedComponentId = null;
  state.componentVisible = {};
  state.componentLabelOn = {};
  if (bioScene) bioScene.setSelected(id, { focus });
  pushRecent(id);
  renderDetail();
}

function selectComponent(id) {
  state.selectedComponentId = id;
  if (bioScene) {
    if (id && state.isolated) bioScene.isolateComponent(id);
    else bioScene.isolateComponent(id);
  }
  renderDetail();
}

function setMode(mode) {
  state.mode = mode;
  dom.modeButtons.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.mode === mode));
  dom.viewportWrap.classList.toggle("is-microscope", mode === "microscope");
  dom.viewportWrap.classList.toggle("is-electron", mode === "electron");
  dom.viewportWrap.classList.toggle("is-compare", mode === "compare");
  dom.viewportWrap.classList.toggle("is-process", mode === "process");
  dom.processOverlay.hidden = mode !== "process";
  if (mode === "process") setupProcessForCell();
  else if (state.processTimer) { clearInterval(state.processTimer); state.processTimer = null; }
  if (bioScene) bioScene.setMode(mode);
  renderCompareLabels();
  renderDetail();
}

function setupProcessForCell() {
  const cell = cellById(state.selectedCellId);
  if (!cell || !cell.lifecycle || !cell.lifecycle.length) {
    // no lifecycle for this cell — fall back to first virus
    const firstVirus = state.atlas.cells.find((c) => c.lifecycle && c.lifecycle.length);
    if (firstVirus) {
      selectCell(firstVirus.id, { focus: false });
    }
  }
  state.processStage = 0;
  renderProcessOverlay();
  if (state.processPlaying) startProcessTimer();
}

function startProcessTimer() {
  if (state.processTimer) clearInterval(state.processTimer);
  state.processTimer = setInterval(() => {
    if (!state.processPlaying) return;
    const cell = cellById(state.selectedCellId);
    if (!cell || !cell.lifecycle) return;
    state.processStage = (state.processStage + 1) % cell.lifecycle.length;
    renderProcessOverlay();
    bioScene?.applyProcessStage(state.processStage);
  }, 4000);
}

function renderProcessOverlay() {
  const cell = cellById(state.selectedCellId);
  if (!cell || !cell.lifecycle) return;
  const stage = cell.lifecycle[state.processStage];
  if (!stage) return;
  dom.processStageNum.textContent = state.processStage + 1;
  dom.processStageTotal.textContent = cell.lifecycle.length;
  dom.processStageLabel.textContent = stage.label;
  dom.processStageNarration.textContent = stage.narration;
  dom.processStageDuration.textContent = `⏱ ${stage.durationMin}`;
  dom.processDots.innerHTML = cell.lifecycle.map((s, i) => {
    const cls = i === state.processStage ? "dot is-current" : (i < state.processStage ? "dot is-passed" : "dot");
    return `<span class="${cls}" data-stage-index="${i}" title="${escapeAttr(s.label)}"></span>`;
  }).join("");
  dom.processDots.querySelectorAll(".dot").forEach((el) => {
    el.addEventListener("click", () => {
      state.processStage = +el.dataset.stageIndex;
      renderProcessOverlay();
      bioScene?.applyProcessStage(state.processStage);
    });
  });
  dom.processPlayBtn.innerHTML = state.processPlaying
    ? `<svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor"><rect x="3" y="2" width="2" height="8"/><rect x="7" y="2" width="2" height="8"/></svg>`
    : `<svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor"><polygon points="3,2 10,6 3,10"/></svg>`;
}

function renderCompareLabels() {
  // remove any existing
  dom.viewportWrap.querySelectorAll(".compare-side-label").forEach((el) => el.remove());
  if (state.mode !== "compare") return;
  const left = cellById(state.compareLeftId);
  const right = cellById(state.compareRightId);
  if (left) {
    const l = document.createElement("div");
    l.className = "compare-side-label left";
    l.innerHTML = `<small>${escapeHtml(left.kingdom)}</small>${escapeHtml(left.label)}`;
    dom.viewportWrap.appendChild(l);
  }
  if (right) {
    const r = document.createElement("div");
    r.className = "compare-side-label right";
    r.innerHTML = `<small>${escapeHtml(right.kingdom)}</small>${escapeHtml(right.label)}`;
    dom.viewportWrap.appendChild(r);
  }
}

function toggleAutoRotate() {
  state.autoRotate = !state.autoRotate;
  dom.rotateBtn.classList.toggle("is-active", state.autoRotate);
  bioScene?.setAutoRotate(state.autoRotate);
}

function toggleIsolate() {
  state.isolated = !state.isolated;
  dom.isolateBtn.classList.toggle("is-active", state.isolated);
  if (state.isolated && state.selectedComponentId) {
    bioScene?.isolateComponent(state.selectedComponentId);
  } else {
    bioScene?.isolateComponent(null);
  }
}

function toggleSection() {
  state.sectionOpen = !state.sectionOpen;
  dom.sectionBtn.classList.toggle("is-active", state.sectionOpen);
  dom.sectionPanel.hidden = !state.sectionOpen;
  if (!state.sectionOpen) {
    state.sectionRatio = 1.0;
    dom.sectionRange.value = 100;
    dom.sectionValue.textContent = "100%";
    bioScene?.setClipping(state.sectionAxis, 1.0);
  }
}

function toggleHideOthers() {
  state.hideOthers = !state.hideOthers;
  dom.hideOthersBtn.classList.toggle("is-active", state.hideOthers);
  // Hide all organelles except the selected one. Reset visibility otherwise.
  const cell = cellById(state.selectedCellId);
  if (!cell) return;
  if (state.hideOthers && !state.selectedComponentId) {
    // No component selected — fall back to membrane/outermost as the survivor.
    state.selectedComponentId = cell.components[0]?.id || null;
  }
  cell.components.forEach((comp) => {
    if (state.hideOthers && comp.id !== state.selectedComponentId) {
      state.componentVisible[comp.id] = false;
      bioScene?.setOrganelleVisible(comp.id, false);
    } else {
      state.componentVisible[comp.id] = true;
      bioScene?.setOrganelleVisible(comp.id, true);
    }
  });
  renderDetail();
}

function toggleReadView() {
  state.readView = !state.readView;
  dom.readViewBtn.classList.toggle("is-active", state.readView);
  bioScene?.setReadView(state.readView);
  if (!state.readView) {
    dom.readOverlay.hidden = true;
    dom.readOverlay.innerHTML = "";
  }
}

// ---------- export -------------------------------------------------------

function showExportSheet() {
  const cell = cellById(state.selectedCellId);
  dom.exportCellLabel.textContent = cell?.label || "atlas";
  dom.exportSheet.hidden = false;
}

function hideExportSheet() { dom.exportSheet.hidden = true; }

async function handleExport(kind) {
  const cell = cellById(state.selectedCellId);
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  if (kind === "json") {
    download(JSON.stringify(state.atlas, null, 2), `cellatlas-${ts}.json`, "application/json");
  } else if (kind === "cell-json") {
    download(JSON.stringify(cell, null, 2), `cell-${cell?.id || "unknown"}-${ts}.json`, "application/json");
  } else if (kind === "glb") {
    const buffer = await bioScene?.exportSelectedAsGLB();
    if (buffer) {
      const blob = new Blob([buffer], { type: "model/gltf-binary" });
      downloadBlob(blob, `cell-${cell?.id || "selected"}-${ts}.glb`);
    } else {
      alert("GLB export gagal — periksa console.");
    }
  } else if (kind === "step-instructions") {
    const inst = `# Generate STEP for "${cell?.label || ""}" via build123d\n\n` +
      `# 1. From the project root:\n` +
      `python3.11 -m venv .venv\n` +
      `./.venv/bin/pip install -r requirements-optional.txt\n\n` +
      `# 2. Run the CAD generator:\n` +
      `./.venv/bin/python ${cell?.cad?.source || "cad_source/your_cell.py"}\n\n` +
      `# Output will be written to: cad_source/out/${cell?.id || "cell"}.step`;
    download(inst, `step-instructions-${cell?.id || "cell"}.txt`, "text/plain");
  }
  hideExportSheet();
}

function download(text, filename, mime = "text/plain") {
  const blob = new Blob([text], { type: mime });
  downloadBlob(blob, filename);
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

async function copyText(text, button) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return;
  try { await navigator.clipboard.writeText(trimmed); }
  catch (_) {
    const box = document.createElement("textarea");
    box.value = trimmed; box.style.position = "fixed"; box.style.opacity = "0";
    document.body.appendChild(box); box.select(); document.execCommand("copy"); box.remove();
  }
  if (!button) return;
  const previous = button.textContent;
  button.textContent = "Copied"; setTimeout(() => { button.textContent = previous; }, 1200);
}

// ---------- bindings -----------------------------------------------------

function bindControls() {
  dom.rotateBtn.addEventListener("click", toggleAutoRotate);
  dom.isolateBtn.addEventListener("click", toggleIsolate);
  dom.hideOthersBtn.addEventListener("click", toggleHideOthers);
  dom.readViewBtn.addEventListener("click", toggleReadView);
  dom.sectionBtn.addEventListener("click", toggleSection);
  dom.screenshotBtn.addEventListener("click", () => {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    bioScene?.screenshot(`cellstudio-${state.selectedCellId}-${state.mode}-${ts}.png`);
  });
  dom.exportBtn.addEventListener("click", showExportSheet);
  dom.exportClose.addEventListener("click", hideExportSheet);
  dom.exportSheet.addEventListener("click", (e) => { if (e.target === dom.exportSheet) hideExportSheet(); });
  document.querySelectorAll(".export-option").forEach((b) => {
    b.addEventListener("click", () => handleExport(b.dataset.export));
  });

  dom.modeButtons.forEach((btn) => btn.addEventListener("click", () => setMode(btn.dataset.mode)));

  // Section panel controls
  dom.sectionRange.addEventListener("input", (e) => {
    state.sectionRatio = +e.target.value / 100;
    dom.sectionValue.textContent = `${e.target.value}%`;
    bioScene?.setClipping(state.sectionAxis, state.sectionRatio);
  });
  dom.sectionAxes.forEach((b) => b.addEventListener("click", () => {
    dom.sectionAxes.forEach((x) => x.classList.toggle("is-active", x === b));
    state.sectionAxis = b.dataset.axis;
    bioScene?.setClipping(state.sectionAxis, state.sectionRatio);
  }));

  // Process timeline controls
  dom.processPlayBtn.addEventListener("click", () => {
    state.processPlaying = !state.processPlaying;
    if (state.processPlaying) startProcessTimer();
    else if (state.processTimer) { clearInterval(state.processTimer); state.processTimer = null; }
    renderProcessOverlay();
  });
  dom.processNextBtn.addEventListener("click", () => {
    const cell = cellById(state.selectedCellId);
    if (!cell || !cell.lifecycle) return;
    state.processStage = (state.processStage + 1) % cell.lifecycle.length;
    renderProcessOverlay();
    bioScene?.applyProcessStage(state.processStage);
  });

  dom.resetFocusBtn.addEventListener("click", () => {
    state.selectedComponentId = null;
    state.isolated = false;
    state.hideOthers = false;
    dom.isolateBtn.classList.remove("is-active");
    dom.hideOthersBtn.classList.remove("is-active");
    bioScene?.isolateComponent(null);
    // Restore visibility for all components
    const cell = cellById(state.selectedCellId);
    cell?.components.forEach((c) => {
      state.componentVisible[c.id] = true;
      bioScene?.setOrganelleVisible(c.id, true);
    });
    renderDetail();
  });

  dom.copyCadPromptBtn.addEventListener("click", () => copyText(dom.cadPrompt.textContent, dom.copyCadPromptBtn));
  dom.copyCadSourceBtn.addEventListener("click", () => copyText(dom.cadSource.textContent, dom.copyCadSourceBtn));

  dom.orgVisibleToggle.addEventListener("change", (e) => {
    if (!state.selectedComponentId) return;
    state.componentVisible[state.selectedComponentId] = e.target.checked;
    bioScene?.setOrganelleVisible(state.selectedComponentId, e.target.checked);
    renderDetail();
  });
  dom.orgLabelToggle.addEventListener("change", (e) => {
    if (!state.selectedComponentId) return;
    state.componentLabelOn[state.selectedComponentId] = e.target.checked;
    const cell = cellById(state.selectedCellId);
    const comp = cell?.components.find((c) => c.id === state.selectedComponentId);
    bioScene?.setOrganelleLabel(state.selectedComponentId, comp?.label || state.selectedComponentId, comp?.color || "#00d4aa", e.target.checked);
  });

  dom.compareLeft.addEventListener("click", () => assignCompareSlot("left"));
  dom.compareRight.addEventListener("click", () => assignCompareSlot("right"));
  dom.compareToggle.addEventListener("click", () => {
    setMode(state.mode === "compare" ? "standalone" : "compare");
  });

  dom.topbarTabs.forEach((b) => b.addEventListener("click", () => {
    const name = b.dataset.topTab;
    if (state.activePanel === name) closePanel();
    else openPanel(name);
  }));
  document.querySelectorAll("[data-close-panel]").forEach((b) => b.addEventListener("click", closePanel));
  // ESC closes panel/menu/search/about
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (state.searchOpen) { closeSearch(); return; }
    if (state.aboutOpen) { closeAbout(); return; }
    if (state.avatarMenuOpen) { closeAvatarMenu(); return; }
    if (state.projectMenuOpen) { closeProjectMenu(); return; }
    if (state.activePanel) closePanel();
  });
  // Library search
  dom.librarySearchInput?.addEventListener("input", (e) => {
    state.librarySearch = e.target.value;
    renderLibrary();
  });
  // Recents clear
  dom.recentsClearBtn?.addEventListener("click", () => {
    state.recents = [];
    saveRecents(state.recents);
    renderRecents();
  });
  // Theme + Language + Settings toggles
  dom.themeSelect?.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => applyTheme(b.dataset.theme)));
  dom.langSelect?.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => applyLang(b.dataset.lang)));
  dom.processAutoplayToggle?.addEventListener("change", (e) => {
    state.processPlaying = e.target.checked;
    const prefs = loadPrefs(); prefs.processAutoplay = state.processPlaying; savePrefs(prefs);
    if (state.mode === "process") {
      if (state.processPlaying) startProcessTimer();
      else if (state.processTimer) { clearInterval(state.processTimer); state.processTimer = null; }
    }
  });
  dom.bloomToggle?.addEventListener("change", (e) => {
    state.bloomEnabled = e.target.checked;
    const prefs = loadPrefs(); prefs.bloom = state.bloomEnabled; savePrefs(prefs);
    if (bioScene?.bloomPass) bioScene.bloomPass.enabled = state.bloomEnabled && state.mode !== "electron";
  });
  dom.settingsResetBtn?.addEventListener("click", () => {
    localStorage.removeItem(PREFS_KEY);
    applyTheme("dark");
    applyLang("en");
    state.processPlaying = true;
    state.bloomEnabled = true;
    if (bioScene?.bloomPass) bioScene.bloomPass.enabled = true;
    renderSettings();
  });

  dom.newProjectBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleProjectMenu();
  });
  dom.projectMenu?.querySelectorAll("[data-project-action]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      handleProjectAction(b.dataset.projectAction);
    });
  });

  // Search overlay
  dom.topbarSearchBtn?.addEventListener("click", openSearch);
  dom.searchInput?.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    state.searchActiveIndex = 0;
    renderSearchResults();
  });
  dom.searchInput?.addEventListener("keydown", handleSearchKey);
  dom.searchOverlay?.addEventListener("click", (e) => {
    if (e.target === dom.searchOverlay) closeSearch();
  });

  // Avatar menu
  dom.topbarAvatarBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleAvatarMenu();
  });
  dom.avatarMenu?.querySelectorAll("[data-avatar-action]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      handleAvatarAction(b.dataset.avatarAction);
    });
  });

  // About dialog
  dom.aboutClose?.addEventListener("click", closeAbout);
  dom.aboutDialog?.addEventListener("click", (e) => {
    if (e.target === dom.aboutDialog) closeAbout();
  });

  // Click outside any menu to close it
  document.addEventListener("click", () => {
    if (state.avatarMenuOpen) closeAvatarMenu();
    if (state.projectMenuOpen) closeProjectMenu();
  });

  // Keyboard: Cmd/Ctrl + K opens search
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      if (state.searchOpen) closeSearch();
      else openSearch();
    }
  });
}

function assignCompareSlot(slot) {
  // Cycle to next cell
  const cells = state.atlas.cells.map((c) => c.id);
  const otherSlot = slot === "left" ? state.compareRightId : state.compareLeftId;
  const current = slot === "left" ? state.compareLeftId : state.compareRightId;
  let nextIdx = (cells.indexOf(current) + 1) % cells.length;
  while (cells[nextIdx] === otherSlot && cells.length > 1) {
    nextIdx = (nextIdx + 1) % cells.length;
  }
  if (slot === "left") state.compareLeftId = cells[nextIdx];
  else state.compareRightId = cells[nextIdx];
  bioScene?.setCompareCells(state.compareLeftId, state.compareRightId);
  applyCompareThumbnails();
  renderCompareLabels();
  renderDetail();
}

// ---------- fallback -----------------------------------------------------

function renderFallback(error) {
  dom.canvas.hidden = true;
  dom.fallback.hidden = false;
  renderMeshStatus(`2D fallback (${error?.message || "unknown"})`, "warn");
  const grid = state.atlas.cells.map((cell, i) => {
    const x = 12 + (i % 4) * 22;
    const y = 18 + Math.floor(i / 4) * 32;
    return `<button class="fallback-node" data-cell-id="${escapeAttr(cell.id)}" style="left:${x}%;top:${y}%">${escapeHtml(cell.label)}</button>`;
  }).join("");
  dom.fallback.innerHTML = grid;
  dom.fallback.querySelectorAll("button").forEach((btn) =>
    btn.addEventListener("click", () => selectCell(btn.dataset.cellId, { focus: false })));
}

// ---------- search overlay ----------------------------------------------

function openSearch() {
  state.searchOpen = true;
  state.searchQuery = "";
  state.searchActiveIndex = 0;
  if (dom.searchInput) dom.searchInput.value = "";
  dom.searchOverlay.hidden = false;
  setTimeout(() => dom.searchInput?.focus(), 30);
  renderSearchResults();
}

function closeSearch() {
  state.searchOpen = false;
  dom.searchOverlay.hidden = true;
}

function renderSearchResults() {
  if (!dom.searchResults) return;
  const q = state.searchQuery.trim().toLowerCase();
  const cats = state.atlas.categories || [];
  const catById = {};
  cats.forEach((c) => c.cells.forEach((id) => { catById[id] = c.label; }));
  let cells = state.atlas.cells.slice();
  if (q) {
    cells = cells.filter((c) => matchesSearch(c, q));
  }
  // limit to ~30 to avoid huge dropdowns
  cells = cells.slice(0, 30);
  if (!cells.length) {
    dom.searchResults.innerHTML = `<p class="search-empty">${escapeHtml(t("search.empty", state.lang))}</p>`;
    return;
  }
  if (state.searchActiveIndex >= cells.length) state.searchActiveIndex = 0;
  dom.searchResults.innerHTML = cells.map((cell, i) => {
    const thumb = state.thumbnails[cell.id];
    const bg = thumb ? `style="background-image:url(${thumb})"` : "";
    const cat = catById[cell.id] || cell.kingdom;
    return `
      <button class="search-result ${i === state.searchActiveIndex ? "is-active" : ""}" data-cell-id="${escapeAttr(cell.id)}" data-search-index="${i}" role="option">
        <span class="thumb" ${bg}></span>
        <span class="meta">
          <strong>${escapeHtml(cell.label)}</strong>
          <small>${escapeHtml(cell.kingdom)} · ${escapeHtml(cell.size)}</small>
        </span>
        <span class="cat-pill">${escapeHtml(cat)}</span>
      </button>`;
  }).join("");
  dom.searchResults.querySelectorAll(".search-result").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      state.searchActiveIndex = +el.dataset.searchIndex;
      dom.searchResults.querySelectorAll(".search-result").forEach((x) => x.classList.toggle("is-active", x === el));
    });
    el.addEventListener("click", () => {
      selectCell(el.dataset.cellId, { focus: true });
      closeSearch();
    });
  });
}

function handleSearchKey(e) {
  if (!state.searchOpen) return;
  const items = dom.searchResults.querySelectorAll(".search-result");
  if (e.key === "Escape") { e.preventDefault(); closeSearch(); return; }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    state.searchActiveIndex = Math.min(items.length - 1, state.searchActiveIndex + 1);
    renderSearchResults();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    state.searchActiveIndex = Math.max(0, state.searchActiveIndex - 1);
    renderSearchResults();
  } else if (e.key === "Enter") {
    e.preventDefault();
    const active = items[state.searchActiveIndex];
    if (active) {
      selectCell(active.dataset.cellId, { focus: true });
      closeSearch();
    }
  }
}

// ---------- avatar menu --------------------------------------------------

function toggleAvatarMenu() {
  state.avatarMenuOpen = !state.avatarMenuOpen;
  dom.avatarMenu.hidden = !state.avatarMenuOpen;
  dom.topbarAvatarBtn?.setAttribute("aria-expanded", state.avatarMenuOpen);
}

function closeAvatarMenu() {
  state.avatarMenuOpen = false;
  dom.avatarMenu.hidden = true;
  dom.topbarAvatarBtn?.setAttribute("aria-expanded", "false");
}

function handleAvatarAction(action) {
  closeAvatarMenu();
  if (action === "about") openAbout();
  else if (action === "github") window.open("https://github.com/Wayan123/3d-interactive-visuals", "_blank", "noopener");
  else if (action === "toggle-theme") {
    const order = ["dark", "light", "system"];
    const next = order[(order.indexOf(state.theme) + 1) % order.length];
    applyTheme(next);
  } else if (action === "toggle-lang") {
    applyLang(state.lang === "en" ? "id" : "en");
  }
}

// ---------- about dialog -------------------------------------------------

function openAbout() {
  state.aboutOpen = true;
  dom.aboutDialog.hidden = false;
}

function closeAbout() {
  state.aboutOpen = false;
  dom.aboutDialog.hidden = true;
}

// ---------- project / bookmarks menu -------------------------------------

function toggleProjectMenu() {
  state.projectMenuOpen = !state.projectMenuOpen;
  dom.projectMenu.hidden = !state.projectMenuOpen;
  dom.newProjectBtn?.setAttribute("aria-expanded", state.projectMenuOpen);
  if (state.projectMenuOpen) renderBookmarks();
}

function closeProjectMenu() {
  state.projectMenuOpen = false;
  dom.projectMenu.hidden = true;
  dom.newProjectBtn?.setAttribute("aria-expanded", "false");
}

function renderBookmarks() {
  if (!dom.projectBookmarksList) return;
  if (!state.bookmarks.length) {
    dom.projectBookmarksList.innerHTML = `<li class="project-empty">${escapeHtml(t("project.empty", state.lang))}</li>`;
    return;
  }
  dom.projectBookmarksList.innerHTML = state.bookmarks.map((b, i) => {
    const cell = cellById(b.cellId);
    const sub = `${cell?.label || b.cellId} · ${b.mode}${b.componentId ? " · " + b.componentId : ""}`;
    return `
      <li class="project-bookmark-row">
        <button class="project-bookmark-load" data-bookmark-index="${i}" type="button">
          <strong>${escapeHtml(b.name)}</strong>
          <small>${escapeHtml(sub)}</small>
        </button>
        <button class="project-bookmark-del" data-bookmark-del="${i}" type="button" aria-label="Delete">×</button>
      </li>`;
  }).join("");
  dom.projectBookmarksList.querySelectorAll(".project-bookmark-load").forEach((el) => {
    el.addEventListener("click", () => applyBookmark(+el.dataset.bookmarkIndex));
  });
  dom.projectBookmarksList.querySelectorAll(".project-bookmark-del").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      removeBookmark(+el.dataset.bookmarkDel);
    });
  });
}

function handleProjectAction(action) {
  if (action === "reset") {
    state.compareLeftId = null;
    state.compareRightId = null;
    setMode("standalone");
    selectCell(state.atlas.cells[0]?.id, { focus: true });
    closeProjectMenu();
  } else if (action === "save") {
    const cell = cellById(state.selectedCellId);
    const defaultName = `${cell?.label || ""} — ${state.mode}${state.selectedComponentId ? " · " + state.selectedComponentId : ""}`;
    const name = prompt(t("project.savePrompt", state.lang), defaultName);
    if (!name) return;
    const entry = {
      name: name.trim(),
      cellId: state.selectedCellId,
      mode: state.mode,
      componentId: state.selectedComponentId,
      readView: state.readView,
      ts: Date.now(),
    };
    state.bookmarks.unshift(entry);
    state.bookmarks = state.bookmarks.slice(0, BOOKMARKS_MAX);
    saveBookmarks(state.bookmarks);
    renderBookmarks();
  } else if (action === "clear") {
    if (state.bookmarks.length && confirm(t("project.clear", state.lang) + " ?")) {
      state.bookmarks = [];
      saveBookmarks(state.bookmarks);
      renderBookmarks();
    }
  }
}

function applyBookmark(index) {
  const b = state.bookmarks[index];
  if (!b) return;
  if (b.cellId) selectCell(b.cellId, { focus: true });
  if (b.mode) setMode(b.mode);
  if (b.componentId) selectComponent(b.componentId);
  if (b.readView !== state.readView) toggleReadView();
  closeProjectMenu();
}

function removeBookmark(index) {
  state.bookmarks.splice(index, 1);
  saveBookmarks(state.bookmarks);
  renderBookmarks();
}

// ---------- platform shortcut hint ---------------------------------------

function updateShortcutHint() {
  if (!dom.searchShortcut) return;
  const isMac = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent || "");
  dom.searchShortcut.textContent = isMac ? "⌘ K" : "Ctrl K";
}

// ---------- startup ------------------------------------------------------

async function main() {
  // Apply persisted theme + lang BEFORE rendering DOM-dependent UI
  // URL params can override for testing/screenshots: ?theme=light&lang=id&panel=settings
  const earlyParams = new URLSearchParams(window.location.search);
  const themeOverride = earlyParams.get("theme");
  if (themeOverride && ["dark", "light", "system"].includes(themeOverride)) state.theme = themeOverride;
  const langOverride = earlyParams.get("lang");
  if (langOverride && TRANSLATIONS[langOverride]) state.lang = langOverride;
  applyTheme(state.theme);
  // Note: applyLang() needs DOM elements to be present and translations to apply

  state.atlas = await loadAtlas();
  const params = new URLSearchParams(window.location.search);
  const wantCell = params.get("cell");
  const wantMode = params.get("mode");
  const wantComp = params.get("component");
  state.selectedCellId = (wantCell && cellById(wantCell)) ? wantCell : (state.atlas.cells[0]?.id || null);
  // Default compare picks: pick first that's different from selected
  state.compareLeftId = state.selectedCellId;
  const others = state.atlas.cells.filter((c) => c.id !== state.selectedCellId);
  state.compareRightId = others[0]?.id || null;
  if (wantMode && ["standalone", "microscope", "electron", "atlas", "compare", "process"].includes(wantMode)) {
    state.mode = wantMode;
  }
  if (params.get("read") === "1") state.readView = true;
  const sectionParam = params.get("section");
  if (sectionParam) {
    const [axis, ratio] = sectionParam.includes(":") ? sectionParam.split(":") : ["y", sectionParam];
    const r = parseFloat(ratio);
    if (!Number.isNaN(r)) {
      state.sectionOpen = true;
      state.sectionAxis = (axis === "x" || axis === "z") ? axis : "y";
      state.sectionRatio = Math.max(0, Math.min(1, r / (r > 1 ? 100 : 1)));
    }
  }

  renderApiBadge();
  renderCellList();
  renderDetail();
  applyCompareThumbnails();
  bindControls();
  // Now that DOM is wired and atlas loaded, apply translations
  applyLang(state.lang);
  updateShortcutHint();

  try {
    const { THREE, OrbitControls, postFx } = await loadThree();
    bioScene = new BioScene({
      THREE, OrbitControls, canvas: dom.canvas, postFx, axisCanvas: dom.axisCanvas,
    });
    bioScene.populate(state.atlas);
    bioScene.setSelected(state.selectedCellId, { focus: true });
    bioScene.setMode(state.mode);
    bioScene.setAutoRotate(state.autoRotate);
    bioScene.setLiveMode(state.liveMode);
    bioScene.setReadViewCallback((labels) => renderReadOverlay(labels));
    bioScene.setHoverCallback((info) => renderHoverTooltip(info));
    if (bioScene.bloomPass) bioScene.bloomPass.enabled = state.bloomEnabled && state.mode !== "electron";
    bioScene.start();
    bioScene.onCellClick(({ cellId, componentId }) => {
      if (cellId !== state.selectedCellId) selectCell(cellId, { focus: true });
      if (componentId) selectComponent(componentId);
    });
    renderMeshStatus("three.js online", "ok");

    // build thumbnails async (don't block)
    setTimeout(async () => {
      try {
        thumbFactory = new ThumbnailFactory({ THREE });
        for (const cell of state.atlas.cells) {
          state.thumbnails[cell.id] = thumbFactory.render(cell);
        }
        applyCellThumbnails();
        applyCompareThumbnails();
      } catch (err) {
        console.warn("thumbnail factory failed", err);
      }
    }, 80);

    if (wantComp) selectComponent(wantComp);
    if (state.readView) {
      dom.readViewBtn.classList.add("is-active");
      bioScene.setReadView(true);
    }
    // Deep-link helpers for new features (test/demo)
    if (params.get("openSearch") === "1") setTimeout(openSearch, 250);
    if (params.get("openAvatar") === "1") setTimeout(toggleAvatarMenu, 250);
    if (params.get("openProject") === "1") setTimeout(toggleProjectMenu, 250);
    if (params.get("openAbout") === "1") setTimeout(openAbout, 250);
    if (params.get("showLabel") === "1" && state.selectedComponentId) {
      setTimeout(() => {
        const cell = cellById(state.selectedCellId);
        const comp = cell?.components.find((c) => c.id === state.selectedComponentId);
        bioScene?.setOrganelleLabel(state.selectedComponentId, comp?.label || state.selectedComponentId, comp?.color || "#00d4aa", true);
        state.componentLabelOn[state.selectedComponentId] = true;
        if (dom.orgLabelToggle) dom.orgLabelToggle.checked = true;
      }, 400);
    }
    if (state.sectionOpen) {
      dom.sectionBtn.classList.add("is-active");
      dom.sectionPanel.hidden = false;
      dom.sectionAxes.forEach((b) => b.classList.toggle("is-active", b.dataset.axis === state.sectionAxis));
      dom.sectionRange.value = String(Math.round(state.sectionRatio * 100));
      dom.sectionValue.textContent = `${Math.round(state.sectionRatio * 100)}%`;
      bioScene?.setClipping(state.sectionAxis, state.sectionRatio);
    }
    setMode(state.mode);
    // Allow ?panel=gallery|library|recents|manual|settings for deep-link
    const panelParam = params.get("panel");
    if (panelParam && ["gallery", "library", "recents", "manual", "settings"].includes(panelParam)) {
      // Wait a tick so thumbnails can start rendering then open panel
      const wantSection = params.get("manualSection");
      if (panelParam === "manual" && wantSection) {
        state._manualSectionId = wantSection;
      }
      setTimeout(() => openPanel(panelParam), 200);
    }
  } catch (error) {
    console.error("Three.js init failed", error);
    renderFallback(error);
  }

  // poll services
  new ApiPoller({
    endpoint: "/api/services", interval: 8000,
    onUpdate: (payload) => {
      state.liveApi = true;
      renderApiBadge();
      renderServices(payload);
    },
    onError: (err) => {
      state.liveApi = false;
      renderApiBadge();
      renderServices(null);
      dom.lastRefresh.textContent = `no live (${err?.message || "error"})`;
    },
  }).start();

  new ApiPoller({
    endpoint: "/api/cells", interval: 60000,
    onUpdate: (atlas) => { if (atlas?.cells) state.atlas = atlas; },
    onError: () => {},
  }).start();
}

main().catch((error) => {
  console.error(error);
  const banner = document.createElement("div");
  banner.style.cssText = "position:fixed;left:14px;right:14px;bottom:14px;background:#260d14;border:1px solid #ff5f7a;color:#ffd6df;padding:12px;border-radius:10px;z-index:60";
  banner.textContent = `Gagal memuat Cell Architecture Studio: ${error.message}`;
  document.body.appendChild(banner);
});
