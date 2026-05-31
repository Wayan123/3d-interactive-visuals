// Scale Explorer — i18n / translations.
// Two languages: English (en) and Indonesian (id). The `t()` helper falls
// back to the key name if the translation is missing so that missing
// translations are visible during development.

export const TRANSLATIONS = {
  en: {
    // App / brand
    "brand.title": "Scale Explorer",
    "brand.subtitle": "Atom → Galaxy · Local 3D",

    // Top bar
    "topbar.tab.gallery": "Gallery",
    "topbar.tab.library": "Library",
    "topbar.tab.recents": "Recents",
    "topbar.tab.settings": "Settings",
    "topbar.tab.manual": "Manual",
    "topbar.search": "Search specimens...",

    // Sidebar
    "sidebar.eyebrow": "Science library",
    "sidebar.newProject": "New project",

    "search.placeholder": "Search by name, domain, or component...",
    "search.empty": "No specimens match.",
    "search.hintNav": "navigate",
    "search.hintOpen": "open",
    "search.hintClose": "close",

    "avatar.about": "About this app",
    "avatar.github": "GitHub repository",
    "avatar.toggleTheme": "Toggle theme",
    "avatar.toggleLang": "Toggle language (EN ↔ ID)",

    "project.title": "Sessions",
    "project.reset": "Reset to home view",
    "project.save": "Save current view as bookmark",
    "project.bookmarks": "Bookmarks",
    "project.empty": "No bookmarks yet.",
    "project.clear": "Clear all bookmarks",
    "project.savedAt": "Saved",
    "project.savePrompt": "Bookmark name (any label)",

    "about.title": "About Scale Explorer",
    "about.tagline": "Local 3D explorer for 39 specimens across every scale — from a hydrogen atom to spiral galaxies.",
    "about.specimens": "Specimens",
    "about.rendering": "Rendering",
    "about.backend": "Backend",
    "about.license": "License",
    "about.credits": "Built procedural-first with Three.js + build123d. Inspired by The AI Leverage's \u201cFull Build Guide: 3D Interactive Visuals\u201d.",
    "about.viewSource": "View source on GitHub",
    "about.inspiration": "Inspiration article",

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
    "viewModes.standalone.sub": "Single specimen stage",
    "viewModes.microscope": "Microscope",
    "viewModes.microscope.sub": "Vignette + scanlines",
    "viewModes.electron": "Electron Microscope",
    "viewModes.electron.sub": "Greyscale + edges",
    "viewModes.process": "Process",
    "viewModes.process.sub": "Virus replication timeline",
    "viewModes.atlas": "Atlas",
    "viewModes.atlas.sub": "All specimens together",

    // Compare
    "compare.label": "Compare specimens",
    "compare.left": "Left specimen",
    "compare.right": "Right specimen",
    "compare.action": "Open compare",
    "compare.close": "Close compare",
    "compare.pick": "Pick specimen",
    "compare.subtitle": "Side-by-side compare. Click left/right cards below to swap specimens.",

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
    "panel.gallery.openCell": "Open specimen",
    "panel.library.title": "Library",
    "panel.library.subtitle": "Browse by category, search by name or property.",
    "panel.library.searchPlaceholder": "Search by label, domain, or component...",
    "panel.library.noResults": "No specimens match the current filter.",
    "panel.recents.title": "Recents",
    "panel.recents.subtitle": "Your recently viewed specimens.",
    "panel.recents.empty": "No recents yet — pick a cell to start.",
    "panel.recents.clear": "Clear history",
    "panel.recents.viewedAt": "Last viewed",
    "panel.settings.title": "Settings",
    "panel.settings.subtitle": "Preferences are saved to your browser only.",
    "panel.manual.title": "User Manual",
    "panel.manual.subtitle": "Everything you need to explore the 39 specimens.",
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
    "brand.title": "Scale Explorer",
    "brand.subtitle": "Atom → Galaksi · 3D Lokal",

    "topbar.tab.gallery": "Galeri",
    "topbar.tab.library": "Pustaka",
    "topbar.tab.recents": "Terbaru",
    "topbar.tab.settings": "Pengaturan",
    "topbar.tab.manual": "Panduan",
    "topbar.search": "Cari spesimen...",

    "sidebar.eyebrow": "Pustaka sains",
    "sidebar.newProject": "Sesi baru",

    "search.placeholder": "Cari berdasarkan nama, domain, atau komponen...",
    "search.empty": "Tidak ada spesimen yang cocok.",
    "search.hintNav": "navigasi",
    "search.hintOpen": "buka",
    "search.hintClose": "tutup",

    "avatar.about": "Tentang aplikasi",
    "avatar.github": "Repositori GitHub",
    "avatar.toggleTheme": "Ganti tema",
    "avatar.toggleLang": "Ganti bahasa (EN ↔ ID)",

    "project.title": "Sesi",
    "project.reset": "Reset ke tampilan awal",
    "project.save": "Simpan tampilan saat ini sebagai bookmark",
    "project.bookmarks": "Bookmark",
    "project.empty": "Belum ada bookmark.",
    "project.clear": "Hapus semua bookmark",
    "project.savedAt": "Disimpan",
    "project.savePrompt": "Nama bookmark (label bebas)",

    "about.title": "Tentang Scale Explorer",
    "about.tagline": "Eksplorer 3D lokal untuk 39 spesimen di segala skala — dari atom hidrogen hingga galaksi spiral.",
    "about.specimens": "Spesimen",
    "about.rendering": "Render",
    "about.backend": "Backend",
    "about.license": "Lisensi",
    "about.credits": "Dibangun procedural dengan Three.js + build123d. Terinspirasi dari artikel The AI Leverage \u201cFull Build Guide: 3D Interactive Visuals\u201d.",
    "about.viewSource": "Lihat kode di GitHub",
    "about.inspiration": "Artikel inspirasi",

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
    "viewModes.standalone.sub": "Satu spesimen utama",
    "viewModes.microscope": "Mikroskop",
    "viewModes.microscope.sub": "Vignette + scanline",
    "viewModes.electron": "Mikroskop Elektron",
    "viewModes.electron.sub": "Monokrom + tepi",
    "viewModes.process": "Proses",
    "viewModes.process.sub": "Timeline replikasi virus",
    "viewModes.atlas": "Atlas",
    "viewModes.atlas.sub": "Semua spesimen bersamaan",

    "compare.label": "Bandingkan spesimen",
    "compare.left": "Spesimen kiri",
    "compare.right": "Spesimen kanan",
    "compare.action": "Buka pembanding",
    "compare.close": "Tutup pembanding",
    "compare.pick": "Pilih spesimen",
    "compare.subtitle": "Tampilan berdampingan. Klik kartu kiri/kanan di bawah untuk mengganti spesimen.",

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
    "panel.gallery.openCell": "Buka spesimen",
    "panel.library.title": "Pustaka",
    "panel.library.subtitle": "Telusuri per kategori, cari berdasarkan nama atau properti.",
    "panel.library.searchPlaceholder": "Cari berdasarkan label, domain, atau komponen...",
    "panel.library.noResults": "Tidak ada spesimen yang cocok dengan filter saat ini.",
    "panel.recents.title": "Terbaru",
    "panel.recents.subtitle": "Spesimen yang baru saja Anda lihat.",
    "panel.recents.empty": "Belum ada riwayat — pilih sel untuk memulai.",
    "panel.recents.clear": "Bersihkan riwayat",
    "panel.recents.viewedAt": "Dilihat",
    "panel.settings.title": "Pengaturan",
    "panel.settings.subtitle": "Preferensi disimpan hanya di browser Anda.",
    "panel.manual.title": "Panduan Pengguna",
    "panel.manual.subtitle": "Semua yang perlu Anda ketahui untuk menjelajahi 39 spesimen.",
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
