// Cell Architecture Studio — user manual content.
// Bilingual (English + Indonesian). Each language has an ordered list of
// sections; each section has an id, title, and HTML body. The panel renders
// the ToC on the left and the active section on the right.

export const MANUAL = {
  en: [
    {
      id: "getting-started",
      title: "Getting Started",
      body: `
        <p>Cell Architecture Studio is a local 3D explorer for <strong>16 biological specimens</strong>: tissue cells, bacteria, viruses, blood cells, and standalone organelles. Everything is rendered procedurally in your browser — no external models, no cloud.</p>
        <h3>Open the app</h3>
        <ol>
          <li>Make sure the local server is running (<code>./run.sh</code> or via tmux).</li>
          <li>Open <a href="http://127.0.0.1:8877/" target="_blank" rel="noreferrer"><code>http://127.0.0.1:8877/</code></a> in any modern browser (Chrome, Firefox, Safari).</li>
          <li>You'll land on the <strong>Plant Cell</strong> in Standalone mode.</li>
        </ol>
        <h3>Requirements</h3>
        <ul>
          <li>WebGL-capable browser (Chrome 90+, Firefox 90+, Safari 15+).</li>
          <li>Python 3.10+ for the local backend (no pip deps needed).</li>
          <li>Internet only for first load (Three.js from CDN) — then fully offline.</li>
        </ul>`,
    },
    {
      id: "interface-tour",
      title: "Interface Tour",
      body: `
        <h3>Top bar</h3>
        <p>Five tabs — <strong>Gallery</strong>, <strong>Library</strong>, <strong>Recents</strong>, <strong>Manual</strong>, <strong>Settings</strong> — plus a live/static API badge, search, and avatar.</p>
        <h3>Left sidebar</h3>
        <p>Scrollable cell library grouped into 6 categories: <em>Tissue cells</em>, <em>Specialised</em>, <em>Blood cells</em>, <em>Bacteria</em>, <em>Viruses</em>, <em>Standalone organelles</em>. Each item shows a live 3D thumbnail.</p>
        <h3>Main viewport</h3>
        <p>Procedural 3D render of the selected specimen. <strong>Drag</strong> to rotate, <strong>scroll</strong> to zoom, <strong>right-drag</strong> to pan. The top-right XYZ gizmo shows current orientation.</p>
        <h3>Right panel</h3>
        <p>Organelle details card (with Visible / Label toggles per organelle), component chips, Where It Occurs taxonomy tree, Key Facts, Stats, Local Services probe, and Text-to-CAD bridge.</p>`,
    },
    {
      id: "view-modes",
      title: "View Modes",
      body: `
        <p>Below the viewport there are 5 view-mode tiles. Click to switch.</p>
        <dl>
          <dt>Standalone</dt>
          <dd>Default. One cell at the centre of the stage with soft glow.</dd>
          <dt>Microscope</dt>
          <dd>Light-microscope look with vignette, scanlines, and boosted contrast.</dd>
          <dt>Electron Microscope</dt>
          <dd>True monochrome SEM/TEM render — material override + flat shading, bloom off.</dd>
          <dt>Process</dt>
          <dd>Virus lifecycle timeline (only for the 5 viruses). Auto-plays 5 stages with per-stage narration.</dd>
          <dt>Atlas</dt>
          <dd>All 16 specimens orbit on a shared ring with link lines.</dd>
        </dl>
        <p>Tip: <code>?mode=electron</code> deep-link opens directly in that mode.</p>`,
    },
    {
      id: "controls",
      title: "Viewport Controls",
      body: `
        <p>The floating control pill at the bottom of the viewport contains 7 tools:</p>
        <dl>
          <dt>Rotate</dt>
          <dd>Toggle auto-rotate (slow continuous spin).</dd>
          <dt>Isolate</dt>
          <dd>Fade every organelle to 18% opacity except the selected one. Turn off to restore.</dd>
          <dt>Hide Others</dt>
          <dd>Completely hide every organelle except the selected one (stronger than Isolate).</dd>
          <dt>Section</dt>
          <dd>Opens a cross-section panel with XYZ axis picker + slider. Cuts the cell open to reveal the interior.</dd>
          <dt>Read View</dt>
          <dd>Projects every visible organelle to the screen and shows labels with dashed leader lines. Perfect for teaching.</dd>
          <dt>Screenshot</dt>
          <dd>Downloads the current viewport as a PNG.</dd>
          <dt>3D Export</dt>
          <dd>Opens a sheet with 4 options: Atlas JSON, Cell JSON, GLB (via GLTFExporter), or STEP-via-build123d instructions.</dd>
        </dl>`,
    },
    {
      id: "top-panels",
      title: "Top-bar Panels",
      body: `
        <h3>Gallery</h3>
        <p>Grid view of all 16 specimens with rendered thumbnails + category badges. Click any card to open that cell.</p>
        <h3>Library</h3>
        <p>Categorised list with a live search box. Search matches label, kingdom, summary, and organelle names.</p>
        <h3>Recents</h3>
        <p>Your last 12 viewed specimens, stored in browser localStorage. Relative time stamps ("2 min ago", "1 hr ago"). <strong>Clear history</strong> wipes it.</p>
        <h3>Manual</h3>
        <p>This panel.</p>
        <h3>Settings</h3>
        <p>Theme selector (Dark / Light / System), Language (English / Indonesian), Process auto-play toggle, Post-FX bloom toggle, Reset to defaults.</p>
        <p>Press <kbd>Esc</kbd> to close any open panel.</p>`,
    },
    {
      id: "virus-lifecycle",
      title: "Virus Lifecycle (Process mode)",
      body: `
        <p>Each of the 5 viruses has a 5-stage lifecycle. Switch to <strong>Process</strong> mode to play through it.</p>
        <dl>
          <dt>Stage 1 — Attachment</dt>
          <dd>Virus binds host-cell receptors (ACE2, CD4, CAR, sialic acid, LPS…).</dd>
          <dt>Stage 2 — Entry</dt>
          <dd>Membrane fusion (enveloped) or tail contraction (phage) or endocytosis (adenovirus).</dd>
          <dt>Stage 3 — Replication</dt>
          <dd>Host machinery copies the viral genome and makes structural proteins.</dd>
          <dt>Stage 4 — Assembly</dt>
          <dd>New virions self-assemble; progeny copies appear in the viewport.</dd>
          <dt>Stage 5 — Release</dt>
          <dd>Budding, lysis, or exocytosis. Virus exits above the host membrane.</dd>
        </dl>
        <p>Use the <strong>play/pause</strong> button to stop auto-advance. Click any dot on the timeline to jump to a specific stage. The HUD shows the stage label, narration, and duration (seconds → hours → days).</p>`,
    },
    {
      id: "cross-section",
      title: "Cross-Section",
      body: `
        <p>Click <strong>Section</strong> in the viewport control pill. A panel appears with:</p>
        <ul>
          <li><strong>Axis picker</strong>: Y (horizontal slice), X (side), Z (front).</li>
          <li><strong>Slider</strong>: 100% = no cut, 0% = full cut from the positive side.</li>
        </ul>
        <p>The clip plane is computed from the cell's own bounding box so 50% always slices through the centre. Works great on animal cells (see nucleus + mitochondria) and viruses (see internal capsid + RNA).</p>
        <p>Section is disabled in Atlas, Compare, and Process modes.</p>`,
    },
    {
      id: "deep-links",
      title: "Deep-links (URL parameters)",
      body: `
        <p>Build a shareable URL by combining these query parameters:</p>
        <pre><code>?cell=&lt;id&gt;
&mode=standalone|microscope|electron|process|atlas|compare
&component=&lt;organelle-id&gt;
&read=1
&section=&lt;axis:percent&gt;       e.g. y:60
&theme=dark|light|system
&lang=en|id
&panel=gallery|library|recents|manual|settings</code></pre>
        <p>Examples:</p>
        <ul>
          <li><code>?cell=bacteriophage&amp;mode=process</code> — play T4 phage lifecycle</li>
          <li><code>?cell=hiv&amp;mode=standalone&amp;section=y:50</code> — sliced HIV virion</li>
          <li><code>?theme=light&amp;lang=id</code> — light theme + Indonesian</li>
          <li><code>?panel=gallery</code> — open Gallery directly</li>
        </ul>`,
    },
    {
      id: "keyboard-shortcuts",
      title: "Keyboard Shortcuts",
      body: `
        <dl>
          <dt><kbd>Esc</kbd></dt>
          <dd>Close any active top-bar panel (Gallery / Library / Recents / Manual / Settings / Export sheet).</dd>
          <dt><kbd>Click</kbd> on canvas</dt>
          <dd>Select the organelle under the pointer.</dd>
          <dt><kbd>Drag</kbd> on canvas</dt>
          <dd>Orbit camera around the cell (left button) or pan (right button).</dd>
          <dt><kbd>Scroll</kbd> on canvas</dt>
          <dd>Zoom in / out.</dd>
        </dl>`,
    },
    {
      id: "tips",
      title: "Tips & Tricks",
      body: `
        <ul>
          <li><strong>Read View + Screenshot</strong> gives you a publication-ready annotated image in one click.</li>
          <li><strong>Electron Microscope</strong> view looks exactly like a real SEM — perfect for textbook illustrations.</li>
          <li><strong>Section at 50% Y</strong> reveals most cells' interior beautifully.</li>
          <li>Use <strong>Compare</strong> for side-by-side teaching (Plant Cell vs Animal Cell is classic).</li>
          <li>The <strong>Atlas</strong> ring shows link lines — e.g. T-cell → SARS-CoV-2 (antigen recognition).</li>
          <li>Your preferences (theme, language, recents) are stored in <code>localStorage</code> and survive reloads.</li>
          <li>Low-end GPU? Turn off bloom in Settings for a noticeable FPS boost.</li>
        </ul>`,
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      body: `
        <dl>
          <dt>Canvas shows "2D fallback"</dt>
          <dd>WebGL context creation failed. Check GPU blacklists or try another browser.</dd>
          <dt>"STATIC FALLBACK" badge in top bar</dt>
          <dd>Backend server is not running or /api/health returned an error. Run <code>./run.sh</code> in the project folder.</dd>
          <dt>Cells load but no thumbnails in sidebar</dt>
          <dd>Offscreen WebGL may be disabled. The app still works; thumbnails will show as empty boxes.</dd>
          <dt>Process view doesn't advance</dt>
          <dd>Open Settings and make sure <em>Process auto-play</em> is ON, or use the <strong>Next</strong> arrow in the HUD.</dd>
        </dl>`,
    },
  ],
  id: [
    {
      id: "getting-started",
      title: "Memulai",
      body: `
        <p>Cell Architecture Studio adalah eksplorer 3D lokal untuk <strong>16 spesimen biologi</strong>: sel jaringan, bakteri, virus, sel darah, dan organel berdiri sendiri. Semua dirender procedural di browser Anda — tanpa model eksternal, tanpa cloud.</p>
        <h3>Buka aplikasi</h3>
        <ol>
          <li>Pastikan server lokal jalan (<code>./run.sh</code> atau via tmux).</li>
          <li>Buka <a href="http://127.0.0.1:8877/" target="_blank" rel="noreferrer"><code>http://127.0.0.1:8877/</code></a> di browser modern (Chrome, Firefox, Safari).</li>
          <li>Anda akan mendarat di <strong>Plant Cell</strong> dalam mode Tunggal.</li>
        </ol>
        <h3>Kebutuhan</h3>
        <ul>
          <li>Browser dengan dukungan WebGL (Chrome 90+, Firefox 90+, Safari 15+).</li>
          <li>Python 3.10+ untuk backend lokal (tidak butuh pip dep).</li>
          <li>Internet hanya saat load pertama (Three.js dari CDN) — setelah itu full offline.</li>
        </ul>`,
    },
    {
      id: "interface-tour",
      title: "Tur Antarmuka",
      body: `
        <h3>Bilah atas</h3>
        <p>Lima tab — <strong>Galeri</strong>, <strong>Pustaka</strong>, <strong>Terbaru</strong>, <strong>Panduan</strong>, <strong>Pengaturan</strong> — ditambah lencana API aktif/statis, pencarian, dan avatar.</p>
        <h3>Sidebar kiri</h3>
        <p>Pustaka sel yang bisa di-scroll, dikelompokkan jadi 6 kategori: <em>Tissue cells</em>, <em>Specialised</em>, <em>Blood cells</em>, <em>Bacteria</em>, <em>Viruses</em>, <em>Standalone organelles</em>. Setiap item punya thumbnail 3D asli.</p>
        <h3>Viewport utama</h3>
        <p>Render 3D procedural untuk spesimen terpilih. <strong>Drag</strong> untuk memutar, <strong>scroll</strong> untuk zoom, <strong>drag kanan</strong> untuk geser. Gizmo XYZ di kanan atas menunjukkan orientasi kamera.</p>
        <h3>Panel kanan</h3>
        <p>Kartu detail organel (dengan toggle Terlihat/Label per organel), chip komponen, pohon taksonomi "Lokasi keberadaan", Fakta penting, Statistik, probe Layanan lokal, dan jembatan Text-to-CAD.</p>`,
    },
    {
      id: "view-modes",
      title: "Mode Tampilan",
      body: `
        <p>Di bawah viewport ada 5 ubin mode. Klik untuk beralih.</p>
        <dl>
          <dt>Tunggal</dt>
          <dd>Default. Satu sel di tengah panggung dengan glow halus.</dd>
          <dt>Mikroskop</dt>
          <dd>Tampilan mikroskop cahaya dengan vignette, scanline, dan kontras tinggi.</dd>
          <dt>Mikroskop Elektron</dt>
          <dd>Render SEM/TEM monokrom asli — material override + flat shading, bloom mati.</dd>
          <dt>Proses</dt>
          <dd>Timeline siklus virus (hanya untuk 5 virus). Auto-play 5 tahap dengan narasi per-tahap.</dd>
          <dt>Atlas</dt>
          <dd>Semua 16 spesimen mengorbit pada cincin bersama dengan garis link.</dd>
        </dl>
        <p>Tip: deep-link <code>?mode=electron</code> langsung membuka mode tersebut.</p>`,
    },
    {
      id: "controls",
      title: "Kontrol Viewport",
      body: `
        <p>Pil kontrol mengambang di bawah viewport berisi 7 alat:</p>
        <dl>
          <dt>Putar</dt>
          <dd>Aktifkan/matikan auto-rotate (putaran lambat terus-menerus).</dd>
          <dt>Isolasi</dt>
          <dd>Redupkan setiap organel ke opasitas 18% kecuali yang terpilih. Matikan untuk kembali normal.</dd>
          <dt>Sembunyikan</dt>
          <dd>Sembunyikan sepenuhnya setiap organel kecuali yang terpilih (lebih kuat dari Isolasi).</dd>
          <dt>Penampang</dt>
          <dd>Membuka panel penampang lintang dengan pemilih sumbu XYZ + slider. Memotong sel untuk memperlihatkan bagian dalam.</dd>
          <dt>Mode Baca</dt>
          <dd>Memproyeksikan setiap organel yang terlihat ke layar dan menampilkan label dengan leader line putus-putus. Cocok untuk mengajar.</dd>
          <dt>Tangkapan</dt>
          <dd>Mengunduh viewport saat ini sebagai PNG.</dd>
          <dt>Ekspor 3D</dt>
          <dd>Membuka sheet dengan 4 opsi: JSON Atlas, JSON Sel, GLB (via GLTFExporter), atau instruksi STEP-via-build123d.</dd>
        </dl>`,
    },
    {
      id: "top-panels",
      title: "Panel Bilah Atas",
      body: `
        <h3>Galeri</h3>
        <p>Tampilan grid semua 16 spesimen dengan thumbnail + lencana kategori. Klik kartu apapun untuk membuka sel tersebut.</p>
        <h3>Pustaka</h3>
        <p>Daftar terkategori dengan kotak pencarian langsung. Pencarian cocok dengan label, kingdom, ringkasan, dan nama organel.</p>
        <h3>Terbaru</h3>
        <p>12 spesimen terakhir yang Anda lihat, disimpan di localStorage browser. Timestamp relatif ("2 mnt lalu", "1 jam lalu"). <strong>Bersihkan riwayat</strong> menghapusnya.</p>
        <h3>Panduan</h3>
        <p>Panel ini.</p>
        <h3>Pengaturan</h3>
        <p>Pemilih Tema (Gelap / Terang / Sistem), Bahasa (Inggris / Indonesia), toggle Putar otomatis Proses, toggle Efek bloom, Setel ulang.</p>
        <p>Tekan <kbd>Esc</kbd> untuk menutup panel yang terbuka.</p>`,
    },
    {
      id: "virus-lifecycle",
      title: "Siklus Virus (Mode Proses)",
      body: `
        <p>Masing-masing dari 5 virus punya siklus hidup 5 tahap. Beralih ke mode <strong>Proses</strong> untuk memutar.</p>
        <dl>
          <dt>Tahap 1 — Pelekatan</dt>
          <dd>Virus mengikat reseptor sel inang (ACE2, CD4, CAR, asam sialat, LPS…).</dd>
          <dt>Tahap 2 — Masuk</dt>
          <dd>Fusi membran (berkulit) atau kontraksi ekor (fag) atau endositosis (adenovirus).</dd>
          <dt>Tahap 3 — Replikasi</dt>
          <dd>Mesin sel inang menyalin genom virus dan membuat protein struktural.</dd>
          <dt>Tahap 4 — Perakitan</dt>
          <dd>Virion baru merakit sendiri; salinan progeni muncul di viewport.</dd>
          <dt>Tahap 5 — Pelepasan</dt>
          <dd>Budding, lisis, atau eksositosis. Virus keluar di atas membran inang.</dd>
        </dl>
        <p>Gunakan tombol <strong>play/jeda</strong> untuk menghentikan auto-advance. Klik titik mana saja pada timeline untuk melompat ke tahap tertentu. HUD menampilkan label tahap, narasi, dan durasi (detik → jam → hari).</p>`,
    },
    {
      id: "cross-section",
      title: "Penampang Lintang",
      body: `
        <p>Klik <strong>Penampang</strong> di pil kontrol viewport. Panel muncul dengan:</p>
        <ul>
          <li><strong>Pemilih sumbu</strong>: Y (slice horizontal), X (samping), Z (depan).</li>
          <li><strong>Slider</strong>: 100% = tanpa potongan, 0% = potongan penuh dari sisi positif.</li>
        </ul>
        <p>Bidang potong dihitung dari kotak pembatas sel sendiri, jadi 50% selalu memotong tepat di tengah. Sangat bagus pada sel hewan (lihat nukleus + mitokondria) dan virus (lihat kapsid + RNA internal).</p>
        <p>Penampang dinonaktifkan di mode Atlas, Compare, dan Proses.</p>`,
    },
    {
      id: "deep-links",
      title: "Deep-link (parameter URL)",
      body: `
        <p>Buat URL yang bisa dibagikan dengan menggabung parameter berikut:</p>
        <pre><code>?cell=&lt;id&gt;
&mode=standalone|microscope|electron|process|atlas|compare
&component=&lt;id-organel&gt;
&read=1
&section=&lt;sumbu:persen&gt;     contoh: y:60
&theme=dark|light|system
&lang=en|id
&panel=gallery|library|recents|manual|settings</code></pre>
        <p>Contoh:</p>
        <ul>
          <li><code>?cell=bacteriophage&amp;mode=process</code> — putar siklus fag T4</li>
          <li><code>?cell=hiv&amp;mode=standalone&amp;section=y:50</code> — virion HIV teriris</li>
          <li><code>?theme=light&amp;lang=id</code> — tema terang + Indonesia</li>
          <li><code>?panel=gallery</code> — buka Galeri langsung</li>
        </ul>`,
    },
    {
      id: "keyboard-shortcuts",
      title: "Pintasan Keyboard",
      body: `
        <dl>
          <dt><kbd>Esc</kbd></dt>
          <dd>Tutup panel bilah atas yang aktif (Galeri / Pustaka / Terbaru / Panduan / Pengaturan / sheet Ekspor).</dd>
          <dt><kbd>Klik</kbd> pada canvas</dt>
          <dd>Pilih organel di bawah kursor.</dd>
          <dt><kbd>Drag</kbd> pada canvas</dt>
          <dd>Putar kamera di sekitar sel (tombol kiri) atau geser (tombol kanan).</dd>
          <dt><kbd>Scroll</kbd> pada canvas</dt>
          <dd>Zoom masuk / keluar.</dd>
        </dl>`,
    },
    {
      id: "tips",
      title: "Tips & Trik",
      body: `
        <ul>
          <li><strong>Mode Baca + Tangkapan</strong> menghasilkan gambar beranotasi siap-publikasi dalam satu klik.</li>
          <li>Tampilan <strong>Mikroskop Elektron</strong> terlihat persis seperti SEM asli — sempurna untuk ilustrasi buku ajar.</li>
          <li><strong>Penampang pada 50% Y</strong> memperlihatkan bagian dalam sebagian besar sel dengan indah.</li>
          <li>Gunakan <strong>Bandingkan</strong> untuk pengajaran berdampingan (Plant Cell vs Animal Cell adalah klasik).</li>
          <li>Cincin <strong>Atlas</strong> menunjukkan garis link — misal T-cell → SARS-CoV-2 (pengenalan antigen).</li>
          <li>Preferensi Anda (tema, bahasa, terbaru) disimpan di <code>localStorage</code> dan bertahan antar reload.</li>
          <li>GPU lemah? Matikan bloom di Pengaturan untuk peningkatan FPS yang terasa.</li>
        </ul>`,
    },
    {
      id: "troubleshooting",
      title: "Pemecahan Masalah",
      body: `
        <dl>
          <dt>Canvas menampilkan "Cadangan 2D"</dt>
          <dd>Pembuatan konteks WebGL gagal. Periksa blacklist GPU atau coba browser lain.</dd>
          <dt>Lencana "STATIS" di bilah atas</dt>
          <dd>Server backend tidak jalan atau /api/health error. Jalankan <code>./run.sh</code> di folder proyek.</dd>
          <dt>Sel termuat tetapi tidak ada thumbnail di sidebar</dt>
          <dd>Offscreen WebGL mungkin dinonaktifkan. Aplikasi tetap jalan; thumbnail jadi kotak kosong.</dd>
          <dt>Mode Proses tidak maju</dt>
          <dd>Buka Pengaturan dan pastikan <em>Putar otomatis Proses</em> ON, atau gunakan panah <strong>Berikutnya</strong> di HUD.</dd>
        </dl>`,
    },
  ],
};

export function manualSections(lang) {
  return MANUAL[lang] || MANUAL.en;
}
