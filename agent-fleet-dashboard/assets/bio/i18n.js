// Cell Architecture Studio — i18n / translations.
// Two languages: English (en) and Indonesian (id). The `t()` helper falls
// back to the key name if the translation is missing so that missing
// translations are visible during development.

export const TRANSLATIONS = {
  en: {
    // App / brand
    "brand.title": "Cell Architecture Studio",
    "brand.subtitle": "Local 3D Biology Explorer",

    // Top bar
    "topbar.tab.gallery": "Gallery",
    "topbar.tab.library": "Library",
    "topbar.tab.recents": "Recents",
    "topbar.tab.settings": "Settings",
    "topbar.tab.manual": "Manual",
    "topbar.search": "Search cells…",

    // Sidebar
    "sidebar.eyebrow": "Cell library",
    "sidebar.newProject": "New project",

    // Stage controls
    "controls.rotate": "Rotate",
    "controls.isolate": "Isolate",
    "controls.hideOthers": "Hide others",
    "controls.section": "Section",
    "controls.readView": "Read View",
    "controls.screenshot": "Screenshot",
    "controls.export": "3D Export",
    "controls.allVisible": "All visible",
    "controls.crossSection": "Cross-section",

    // View modes
    "viewModes.label": "View modes",
    "viewModes.standalone": "Standalone",
    "viewModes.standalone.sub": "Single cell stage",
    "viewModes.microscope": "Microscope",
    "viewModes.microscope.sub": "Vignette + scanlines",
    "viewModes.electron": "Electron Microscope",
    "viewModes.electron.sub": "Greyscale + edges",
    "viewModes.process": "Process",
    "viewModes.process.sub": "Virus replication timeline",
    "viewModes.atlas": "Atlas",
    "viewModes.atlas.sub": "All cells together",

    // Compare
    "compare.label": "Compare cells",
    "compare.left": "Left cell",
    "compare.right": "Right cell",
    "compare.action": "Open compare",
    "compare.close": "Close compare",
    "compare.pick": "Pick cell",
    "compare.subtitle": "Side-by-side compare. Click left/right cards below to swap cells.",

    // Detail panel
    "detail.organelleDetails": "Organelle details",
    "detail.whereItOccurs": "Where it occurs",
    "detail.keyFacts": "Key facts",
    "detail.stats": "Stats",
    "detail.localServices": "Local services",
    "detail.cadBridge": "Text-to-CAD bridge",
    "detail.size": "Size",
    "detail.visible": "Visible",
    "detail.label": "Label",
    "detail.lastRefresh": "Last",
    "detail.cadHelp": "build123d source lives in {0}. Browser doesn't need build123d for runtime rendering.",
    "detail.copyPath": "Copy path",
    "detail.copyPrompt": "Copy prompt",
    "detail.selectOrganelle": "Select an organelle.",
    "detail.allOrganelles": "All organelles",

    // Process overlay
    "process.stage": "Stage",
    "process.of": "of",

    // API
    "api.live": "LIVE",
    "api.static": "STATIC",
    "api.noLive": "No live service probe.",
    "api.noLiveError": "no live ({0})",

    // Mesh status
    "mesh.online": "three.js online",
    "mesh.fallback": "2D fallback ({0})",

    // Tabs / panels
    "panel.gallery.title": "Gallery",
    "panel.gallery.subtitle": "All {0} specimens at a glance.",
    "panel.gallery.openCell": "Open cell",
    "panel.library.title": "Library",
    "panel.library.subtitle": "Browse by category, search by name or property.",
    "panel.library.searchPlaceholder": "Search by label, kingdom, or component…",
    "panel.library.noResults": "No specimens match the current filter.",
    "panel.recents.title": "Recents",
    "panel.recents.subtitle": "Your recently viewed specimens.",
    "panel.recents.empty": "No recents yet — pick a cell to start.",
    "panel.recents.clear": "Clear history",
    "panel.recents.viewedAt": "Last viewed",
    "panel.settings.title": "Settings",
    "panel.settings.subtitle": "Preferences are saved to your browser only.",
    "panel.manual.title": "User Manual",
    "panel.manual.subtitle": "Everything you need to explore the 26 specimens.",
    "panel.settings.theme": "Theme",
    "panel.settings.theme.dark": "Dark",
    "panel.settings.theme.light": "Light",
    "panel.settings.theme.system": "System",
    "panel.settings.language": "Language",
    "panel.settings.language.en": "English",
    "panel.settings.language.id": "Indonesian",
    "panel.settings.processAutoplay": "Process auto-play",
    "panel.settings.processAutoplay.help": "Auto-advance virus lifecycle stages every 4 seconds.",
    "panel.settings.bloom": "Post-FX bloom",
    "panel.settings.bloom.help": "Subtle glow on emissive surfaces. Disable for lower-end GPUs.",
    "panel.settings.reset": "Reset to defaults",
    "panel.close": "Close",

    // Export sheet
    "export.title": "3D Export",
    "export.subtitle": "Pick an export format for {0}.",
    "export.json": "Atlas JSON",
    "export.json.sub": "Full atlas with every cell + organelle",
    "export.cellJson": "Cell JSON",
    "export.cellJson.sub": "Just this cell + organelle metadata",
    "export.glb": "GLB (procedural)",
    "export.glb.sub": "Three.js scene serialised via GLTFExporter",
    "export.step": "STEP via build123d",
    "export.step.sub": "Copy-paste python instructions for cad_source/*.py",
  },
  id: {
    "brand.title": "Cell Architecture Studio",
    "brand.subtitle": "Eksplorer Biologi 3D Lokal",

    "topbar.tab.gallery": "Galeri",
    "topbar.tab.library": "Pustaka",
    "topbar.tab.recents": "Terbaru",
    "topbar.tab.settings": "Pengaturan",
    "topbar.tab.manual": "Panduan",
    "topbar.search": "Cari sel…",

    "sidebar.eyebrow": "Pustaka sel",
    "sidebar.newProject": "Proyek baru",

    "controls.rotate": "Putar",
    "controls.isolate": "Isolasi",
    "controls.hideOthers": "Sembunyikan",
    "controls.section": "Penampang",
    "controls.readView": "Mode Baca",
    "controls.screenshot": "Tangkapan",
    "controls.export": "Ekspor 3D",
    "controls.allVisible": "Tampilkan semua",
    "controls.crossSection": "Penampang lintang",

    "viewModes.label": "Mode tampilan",
    "viewModes.standalone": "Tunggal",
    "viewModes.standalone.sub": "Satu sel utama",
    "viewModes.microscope": "Mikroskop",
    "viewModes.microscope.sub": "Vignette + scanline",
    "viewModes.electron": "Mikroskop Elektron",
    "viewModes.electron.sub": "Monokrom + tepi",
    "viewModes.process": "Proses",
    "viewModes.process.sub": "Timeline replikasi virus",
    "viewModes.atlas": "Atlas",
    "viewModes.atlas.sub": "Semua sel bersamaan",

    "compare.label": "Bandingkan sel",
    "compare.left": "Sel kiri",
    "compare.right": "Sel kanan",
    "compare.action": "Buka pembanding",
    "compare.close": "Tutup pembanding",
    "compare.pick": "Pilih sel",
    "compare.subtitle": "Tampilan berdampingan. Klik kartu kiri/kanan di bawah untuk mengganti sel.",

    "detail.organelleDetails": "Detail organel",
    "detail.whereItOccurs": "Lokasi keberadaan",
    "detail.keyFacts": "Fakta penting",
    "detail.stats": "Statistik",
    "detail.localServices": "Layanan lokal",
    "detail.cadBridge": "Jembatan Text-to-CAD",
    "detail.size": "Ukuran",
    "detail.visible": "Terlihat",
    "detail.label": "Label",
    "detail.lastRefresh": "Terakhir",
    "detail.cadHelp": "Sumber build123d ada di {0}. Browser tidak butuh build123d untuk render runtime.",
    "detail.copyPath": "Salin path",
    "detail.copyPrompt": "Salin prompt",
    "detail.selectOrganelle": "Pilih organel.",
    "detail.allOrganelles": "Semua organel",

    "process.stage": "Tahap",
    "process.of": "dari",

    "api.live": "AKTIF",
    "api.static": "STATIS",
    "api.noLive": "Tidak ada probe layanan langsung.",
    "api.noLiveError": "tidak aktif ({0})",

    "mesh.online": "three.js aktif",
    "mesh.fallback": "Cadangan 2D ({0})",

    "panel.gallery.title": "Galeri",
    "panel.gallery.subtitle": "Semua {0} spesimen sekilas.",
    "panel.gallery.openCell": "Buka sel",
    "panel.library.title": "Pustaka",
    "panel.library.subtitle": "Telusuri per kategori, cari berdasarkan nama atau properti.",
    "panel.library.searchPlaceholder": "Cari berdasarkan label, kingdom, atau komponen…",
    "panel.library.noResults": "Tidak ada spesimen yang cocok dengan filter saat ini.",
    "panel.recents.title": "Terbaru",
    "panel.recents.subtitle": "Spesimen yang baru saja Anda lihat.",
    "panel.recents.empty": "Belum ada riwayat — pilih sel untuk memulai.",
    "panel.recents.clear": "Bersihkan riwayat",
    "panel.recents.viewedAt": "Dilihat",
    "panel.settings.title": "Pengaturan",
    "panel.settings.subtitle": "Preferensi disimpan hanya di browser Anda.",
    "panel.manual.title": "Panduan Pengguna",
    "panel.manual.subtitle": "Semua yang perlu Anda ketahui untuk menjelajahi 26 spesimen.",
    "panel.settings.theme": "Tema",
    "panel.settings.theme.dark": "Gelap",
    "panel.settings.theme.light": "Terang",
    "panel.settings.theme.system": "Sistem",
    "panel.settings.language": "Bahasa",
    "panel.settings.language.en": "Inggris",
    "panel.settings.language.id": "Indonesia",
    "panel.settings.processAutoplay": "Putar otomatis Proses",
    "panel.settings.processAutoplay.help": "Lanjutkan tahap siklus virus otomatis tiap 4 detik.",
    "panel.settings.bloom": "Efek bloom",
    "panel.settings.bloom.help": "Cahaya halus pada permukaan emissive. Matikan untuk GPU lebih lemah.",
    "panel.settings.reset": "Setel ulang",
    "panel.close": "Tutup",

    "export.title": "Ekspor 3D",
    "export.subtitle": "Pilih format ekspor untuk {0}.",
    "export.json": "JSON Atlas",
    "export.json.sub": "Atlas lengkap dengan setiap sel + organel",
    "export.cellJson": "JSON Sel",
    "export.cellJson.sub": "Hanya sel ini + metadata organel",
    "export.glb": "GLB (procedural)",
    "export.glb.sub": "Scene Three.js diserialisasi lewat GLTFExporter",
    "export.step": "STEP via build123d",
    "export.step.sub": "Instruksi python untuk cad_source/*.py",
  },
};

export function t(key, lang = "en", ...args) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  let s = dict[key] ?? TRANSLATIONS.en[key] ?? key;
  args.forEach((arg, i) => {
    s = s.replace(new RegExp(`\\{${i}\\}`, "g"), arg);
  });
  return s;
}

// Apply translations to all elements with data-i18n="key" or data-i18n-attr="attr:key"
export function applyTranslations(root, lang) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    el.textContent = t(key, lang);
  });
  root.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const spec = el.dataset.i18nAttr;
    spec.split(";").forEach((pair) => {
      const [attr, key] = pair.split(":");
      if (attr && key) el.setAttribute(attr.trim(), t(key.trim(), lang));
    });
  });
}
