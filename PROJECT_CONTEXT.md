# PROJECT_CONTEXT.md
# Sistem Informasi Manajemen Perpustakaan Sekolah

> **File ini adalah dokumentasi internal project.**
> AI lain harus memahami seluruh sistem hanya dengan membaca file ini.
> Diperbarui: 2026-07-04

---

## 1. TUJUAN PROJECT

Sistem Informasi Manajemen Perpustakaan Sekolah ini dibangun untuk mengotomatiskan dan menstandardisasi proses operasional perpustakaan sekolah menengah kejuruan (SMK). Sistem ini mencakup:

- Pengelolaan koleksi buku dan anggota perpustakaan
- Transaksi peminjaman dan pengembalian buku
- Penghitungan denda keterlambatan secara otomatis
- Laporan dan statistik perpustakaan
- Manajemen pengguna sistem (Admin dan Petugas)

---

## 2. ARSITEKTUR PROJECT

### Stack Teknologi

| Layer | Teknologi |
|-------|-----------|
| Framework Backend | Laravel 12 (PHP 8.2+) |
| Framework Frontend | React 19 (TypeScript) |
| Bridge SPA | Inertia.js v2 |
| Database | SQLite (development) |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI (via shadcn/ui pattern) |
| Build Tool | Vite 7 |
| HTTP Client (Frontend) | Ziggy (named routes) + fetch API |
| Export PDF | barryvdh/laravel-dompdf |
| Export Excel | phpoffice/phpspreadsheet |
| Toast Notification | react-hot-toast |
| Chart | recharts |
| Icons | lucide-react |

### Pola Arsitektur

- **Monolith SPA**: Laravel sebagai backend API + SSR entry point, React sebagai frontend SPA.
- **Inertia.js** sebagai protokol komunikasi antar Laravel dan React - **BUKAN REST API murni**. Data dikirim melalui Inertia::render(), bukan response()->json().
- Named routes dari Laravel diakses di frontend menggunakan **Ziggy** (route() helper tersedia di JS).
- Tidak ada state management global (Redux, Zustand, dsb.) - state dikelola per-komponen atau via Inertia props.

---

## 3. STRUKTUR FOLDER

perpustakaan/
  app/
    Console/                    # Artisan commands
    Exports/                    # (Kosong - export via LaporanController langsung)
    Http/
      Controllers/              # Semua controller
        Auth/                   # AuthenticatedSessionController, dll.
        Settings/               # ProfileController, PasswordController
        AnggotaController.php
        BukuController.php
        CategoryController.php
        DashboardController.php
        DendaController.php
        HolidayController.php
        LaporanController.php
        MajorController.php
        PeminjamanController.php
        PengaturanPeminjamanController.php
        PengembalianController.php
        PetugasController.php
        RiwayatTransaksiController.php
      Middleware/
        CheckRole.php           # RBAC middleware - role:super_admin | admin | kepala_sekolah
        CheckStatus.php         # Blokir akun inactive, auto-logout
        HandleAppearance.php    # Cookie dark/light mode
        HandleInertiaRequests.php # Shared data Inertia
      Requests/
        Auth/                   # FormRequest auth
        Settings/               # FormRequest settings
    Models/                     # 10 Eloquent models
    Providers/                  # AppServiceProvider
    Services/
      DendaService.php          # Helper kalkulasi denda & keterlambatan
  bootstrap/
    app.php                     # Registrasi middleware global
  database/
    migrations/                 # 24 migration files
    seeders/
      DatabaseSeeder.php        # Master seeder (30 anggota, 50 buku, dummy transaksi)
      CategorySeeder.php
      HolidaySeeder.php
      MajorSeeder.php
      PeminjamanDummySeeder.php
    database.sqlite
  resources/
    css/                        # app.css (Tailwind v4)
    js/
      app.tsx                   # Inertia root / React entry point
      ssr.tsx                   # SSR entry point
      ziggy.js                  # Generated Ziggy route manifest
      components/               # Komponen bersama
        ui/                     # shadcn/ui components (29 files)
        app-sidebar.tsx         # Sidebar utama (role-aware)
        app-header.tsx          # Header top (breadcrumb + user menu)
        app-shell.tsx           # Shell wrapper
        app-content.tsx         # Content area wrapper
        nav-main.tsx            # Navigasi sidebar dengan collapsible
        nav-user.tsx            # User info di sidebar footer
        nav-footer.tsx          # Footer sidebar
        ConfirmModal.tsx        # Modal konfirmasi (delete, logout)
        searchable-book-select.tsx # Combobox pencarian buku (custom)
      hooks/
        use-appearance.tsx      # Dark/Light mode
        use-initials.tsx        # Avatar initials generator
        use-mobile.tsx          # Responsive hook
        use-mobile-navigation.ts
      layouts/
        app-layout.tsx          # LAYOUT UTAMA (semua halaman authenticated)
        auth-layout.tsx         # Layout halaman login
        app/                    # Sub-layout (sidebar layout)
        auth/                   # Sub-layout auth
        settings/               # Sub-layout settings
      lib/
        utils.ts                # cn() helper (clsx + twMerge)
      pages/                    # Semua halaman Inertia
        dashboard.tsx
        Anggota/                # Create, Edit, Index
        Buku/                   # Create, Edit, Index
        Category/               # (inline management)
        Denda/                  # Index, Show
        Laporan/                # Index (PDF & Excel)
        Major/                  # (inline management)
        Peminjaman/             # Create, Index, Show, Pengaturan
        Pengembalian/           # Create, Index, Show
        Petugas/                # Create, Edit, Index
        RiwayatTransaksi/       # Index, Show
        auth/                   # Login
        settings/               # Profile, Password, Appearance
      types/
        index.d.ts              # Auth, User, NavItem, SharedData, dll.
        global.d.ts
        vite-env.d.ts
    views/
      app.blade.php             # Root Blade template (Inertia entry)
      laporan/                  # Blade templates untuk PDF
        pdf.blade.php           # Layout dasar PDF
        anggota.blade.php
        buku.blade.php
        peminjaman.blade.php
        pengembalian.blade.php
        denda.blade.php
        statistik_anggota_teraktif.blade.php
        statistik_anggota_terlambat.blade.php
        statistik_buku_terpopuler.blade.php
  routes/
    web.php                     # SELURUH route web
    auth.php                    # Route autentikasi
    settings.php                # Route settings profil
    console.php                 # Artisan commands

---

## 4. STRUKTUR FRONTEND (React + TypeScript)

### Entry Point
- app.tsx: createInertiaApp() dengan React hydrateRoot/createRoot.
- ssr.tsx: Server-side rendering entry point.

### Layout Hierarchy
AppLayout (app-layout.tsx)
  AppLayoutTemplate (layouts/app/app-sidebar-layout)
    AppShell (app-shell.tsx)
      AppSidebar (app-sidebar.tsx)
      main content area
    Toaster (react-hot-toast, position: top-right)

Flash messages (flash.success, flash.error) dibaca dari Inertia shared props di app-layout.tsx
via useEffect dan dikirim ke toast.success()/toast.error().

### Pola Halaman (Pages)
Setiap halaman mengikuti pola:
1. Import AppLayout dari @/layouts/app-layout
2. Definisi breadcrumbs sebagai konstanta BreadcrumbItem[]
3. Komponen default function dengan props dari Inertia
4. Wrap konten dalam <AppLayout breadcrumbs={breadcrumbs}> + <Head title="..." />

### Shared Data dari Inertia (HandleInertiaRequests.php::share())
Menyediakan data global ke semua halaman:
  auth.user { id, name, username, email, avatar, role }
  flash { success, error }
  ziggy { ... Ziggy route manifest }
  sidebarOpen (boolean, dari cookie)
  server_time (ISO 8601)
  name (app name dari config)
  quote { message, author }

---

## 5. STRUKTUR BACKEND (Laravel)

### Bootstrap Middleware Stack (bootstrap/app.php)
- HandleAppearance - Membaca cookie appearance untuk dark/light mode
- HandleInertiaRequests - Inject shared data Inertia
- AddLinkHeadersForPreloadedAssets - Preload assets
- CheckStatus - Blokir akun inactive (dijalankan di SEMUA request web)

### Middleware Alias
- role -> CheckRole: digunakan sebagai middleware(['role:super_admin']) atau middleware(['role:admin,super_admin'])

### Controller Pattern
Semua controller:
- Extend App\Http\Controllers\Controller (kosong, base class)
- Mengembalikan Inertia::render('PageName/Index', [...props]) untuk halaman
- Mengembalikan redirect()->route('...')->with('success/error', '...') untuk actions
- Menggunakan response()->json() HANYA untuk endpoint search (AJAX)
- Menggunakan DB::transaction() untuk operasi multi-tabel
- Validasi dilakukan inline di controller dengan ->validate([...])

### Cache Usage
- Cache::get('durasi_peminjaman', 7) - Durasi pinjam default (hari)
- Cache::get('tarif_denda', 2000) - Tarif denda per hari (Rupiah)
- Cache::forever(...) untuk menyimpan perubahan konfigurasi

---

## 6. STRUKTUR DATABASE

### Tabel Utama
| Tabel | Model | Keterangan |
|-------|-------|-----------|
| users | User | Pengguna sistem (super_admin, admin, kepala_sekolah) |
| anggotas | Anggota | Anggota perpustakaan (siswa) |
| buku | Buku | Koleksi buku |
| categories | Category | Kategori buku |
| majors | Major | Jurusan SMK |
| peminjaman | Peminjaman | Header transaksi peminjaman |
| detail_peminjaman | DetailPeminjaman | Line item per buku dalam peminjaman |
| pengembalian | Pengembalian | Transaksi pengembalian buku |
| denda | Denda | Record denda keterlambatan |
| holidays | Holiday | Hari libur (nasional & sekolah) |

### Skema Kolom Penting

users:
  id, name, username (unique), email, password, avatar (nullable)
  role ENUM: super_admin | admin | kepala_sekolah
  status ENUM: active | inactive
  deleted_at (SoftDeletes)

anggotas:
  id, kode_anggota (format: AG001), nama, major_id (FK majors)
  kelas ENUM: X | XI | XII, email, no_hp, alamat
  deleted_at (SoftDeletes)

buku:
  id, kode_buku (format: BK001), judul, pengarang, category_id (FK categories)
  penerbit, tahun_terbit, stok
  deleted_at (SoftDeletes)

peminjaman:
  id, kode_peminjaman (format: PMJyymmddNNN), anggota_id (FK), user_id (FK users = petugas)
  tanggal_pinjam, tanggal_kembali (jatuh tempo)
  status ENUM: Dipinjam | Dikembalikan

detail_peminjaman:
  id, peminjaman_id (FK), buku_id (FK)

pengembalian:
  id, peminjaman_id (FK), user_id (FK users = petugas yang proses)
  tanggal_dikembalikan, terlambat (integer: jumlah hari keterlambatan)

denda:
  id, peminjaman_id (FK), anggota_id (FK), pengembalian_id (FK)
  nominal_per_hari, total_denda, status_bayar ENUM: Belum Lunas | Lunas

holidays:
  id, date (unique), description, type ENUM: nasional | sekolah

---

## 7. HUBUNGAN ANTAR MODEL (Relasi Eloquent)

User (super_admin / admin / kepala_sekolah)
  hasMany Peminjaman (via user_id - petugas yang input)
  hasMany Pengembalian (via user_id - petugas yang proses)

Major
  hasMany Anggota

Category
  hasMany Buku

Anggota (SoftDeletes)
  belongsTo Major
  hasMany Peminjaman

Buku (SoftDeletes)
  belongsTo Category
  hasMany DetailPeminjaman
  hasManyThrough Buku (via DetailPeminjaman)

Peminjaman
  belongsTo Anggota (withTrashed - anggota bisa sudah dihapus)
  belongsTo User (petugas)
  hasMany DetailPeminjaman
  hasManyThrough Buku (via DetailPeminjaman)
  hasOne Pengembalian
  hasOne Denda

DetailPeminjaman
  belongsTo Peminjaman
  belongsTo Buku (withTrashed - buku bisa sudah dihapus)

Pengembalian
  belongsTo Peminjaman
  belongsTo User (petugas)
  hasOne Denda

Denda
  belongsTo Peminjaman
  belongsTo Anggota (withTrashed)
  belongsTo Pengembalian

Holiday (standalone - tidak ada relasi Eloquent)

POLA PENTING: Model yang menggunakan withTrashed() pada relasi:
- Peminjaman->anggota()
- DetailPeminjaman->buku()
- Denda->anggota()
Ini memastikan data historis tetap bisa diakses meskipun anggota/buku sudah di-soft-delete.

---

## 8. FLOW BISNIS

### Alur Umum
Login -> Dashboard -> (Pilih modul sesuai role)

### Alur Peminjaman Buku
1. Petugas buka /peminjaman/create
2. Sistem auto-generate kode_peminjaman (format PMJyymmddNNN)
3. Sistem hitung tanggal_kembali = today + durasi_peminjaman (dari Cache, default 7 hari)
4. Jika tanggal_kembali jatuh pada hari libur -> digeser maju sampai bukan hari libur (shiftIfHoliday(), max 60 iterasi)
5. Petugas memilih anggota (via AsyncCombobox -> AJAX ke anggota.search)
6. Petugas memilih buku 1-3 (via AsyncCombobox -> AJAX ke buku.search, cek stok)
7. Submit -> peminjaman.store -> DB::transaction:
   - Validasi stok buku
   - Buat record Peminjaman (status: Dipinjam)
   - Buat records DetailPeminjaman per buku
   - Decrement stok setiap buku
8. Redirect ke /peminjaman + flash success

### Alur Pengembalian Buku
1. Petugas buka /pengembalian/create
2. Petugas input peminjaman_id dari peminjaman aktif
3. Submit -> pengembalian.store -> DB::transaction:
   - Hitung keterlambatan: tanggal_dikembalikan - tanggal_kembali
   - Buat record Pengembalian (field terlambat = jumlah hari, 0 jika tepat waktu)
   - Increment stok setiap buku
   - Update Peminjaman.status = Dikembalikan
   - Jika terlambat > 0: Buat record Denda otomatis (total = terlambat x tarif_per_hari x jumlah_buku)
4. Redirect ke back() + flash success

### Alur Denda
- Denda dibuat otomatis saat pengembalian terlambat (di PengembalianController::store)
- Denda juga dikerjakan ulang di PengembalianController::show (recalculate saat halaman detail dibuka)
- Denda dapat di-sync ulang via POST /pengembalian/sync-denda (syncDenda())
- Petugas bayar denda -> PUT /pengembalian/{id}/bayar-denda -> update status_bayar = Lunas
- Tarif denda disimpan di Cache: Cache::forever('tarif_denda', nilai) via DendaController::setting

---

## 9. FLOW TRANSAKSI (Database)

### Peminjaman Baru
BEGIN TRANSACTION;
INSERT INTO peminjaman (kode_peminjaman, anggota_id, user_id, tanggal_pinjam, tanggal_kembali, status)
  VALUES ('PMJ...', ?, ?, now(), ?, 'Dipinjam');
INSERT INTO detail_peminjaman (peminjaman_id, buku_id) VALUES (?, ?); -- per buku
UPDATE buku SET stok = stok - 1 WHERE id = ?; -- per buku
COMMIT;

### Pengembalian
BEGIN TRANSACTION;
INSERT INTO pengembalian (peminjaman_id, user_id, tanggal_dikembalikan, terlambat)
  VALUES (?, ?, today(), hitung_hari_terlambat);
UPDATE buku SET stok = stok + 1 WHERE id = ?; -- per buku
UPDATE peminjaman SET status = 'Dikembalikan' WHERE id = ?;
-- Jika terlambat > 0:
INSERT INTO denda (peminjaman_id, anggota_id, pengembalian_id, nominal_per_hari, total_denda, status_bayar)
  VALUES (?, ?, ?, tarif, tarif x hari x jumlah_buku, 'Belum Lunas');
COMMIT;

### Pembatalan Pengembalian (destroy)
BEGIN TRANSACTION;
UPDATE peminjaman SET status = 'Dipinjam' WHERE id = ?;
UPDATE buku SET stok = stok - 1 WHERE id = ?; -- per buku (rollback stok)
DELETE FROM denda WHERE pengembalian_id = ?;
DELETE FROM pengembalian WHERE id = ?;
COMMIT;

---

## 10. STRUKTUR ROLE

### Tiga Role Sistem
| Role | Value di DB | Keterangan |
|------|------------|-----------|
| Super Admin | super_admin | Akses penuh + kelola petugas + pengaturan sistem |
| Admin/Petugas | admin | Operasional perpustakaan (CRUD transaksi + master data) |
| Kepala Sekolah | kepala_sekolah | Read-only (dashboard, riwayat, laporan, master data) |

### Sidebar per Role
- super_admin: Dashboard, Peminjaman, Pengembalian, Denda, Riwayat Transaksi, Master Data, Laporan, Petugas
- admin: Dashboard, Peminjaman, Pengembalian, Denda, Riwayat Transaksi, Master Data, Laporan
- kepala_sekolah: Dashboard, Master Data (read-only), Riwayat Transaksi, Laporan

---

## 11. AUTHORIZATION

### Middleware Hierarchy di Routes
auth -> verified -> role:super_admin       (Petugas CRUD, Pengaturan Peminjaman, Hari Libur)
auth -> verified -> role:admin,super_admin (Transaksi CRUD, Master Data CRUD)
auth -> verified                          (Dashboard, Read-only views, Laporan)

### Proteksi Level Controller
- PetugasController: Super Admin tidak bisa dinonaktifkan/dihapus
- PetugasController: Hanya Super Admin yang bisa membuat/mengubah role Super Admin
- HolidayController: Hari libur tipe nasional tidak bisa diubah/dihapus
- AnggotaController::destroy: Cek peminjaman aktif & denda belum lunas sebelum hapus
- BukuController::destroy: Cek buku sedang dipinjam sebelum hapus

### Frontend Role Check (React)
  const { auth } = usePage<SharedData>().props;
  const role = auth.user?.role;
  const canEdit = ['admin', 'super_admin'].includes(role);

---

## 12. STRUKTUR SERVICE

### DendaService (app/Services/DendaService.php)
Static methods:

DendaService::hitungKeterlambatan(,  = null): int
  // Hitung hari keterlambatan berdasarkan jatuh tempo vs dikembalikan

DendaService::hitungDenda(int , int  = 1): float|int
  // Hitung total denda: hari x tarif (dari Cache) x jumlah buku

DendaService::sisaHari(): int
  // Cek sisa hari sebelum jatuh tempo (positif = belum jatuh tempo, negatif = terlambat)

DashboardController menggunakan service ini untuk estimasi denda di widget keterlambatan.

---

## 13. STRUKTUR EXPORT PDF

Library: barryvdh/laravel-dompdf
Route: GET /laporan/pdf/{modul} -> LaporanController::cetakPdf()
Output: inline (ditampilkan di browser, bukan download)

Modul yang tersedia:
- anggota           -> laporan.anggota                      -> laporan_anggota.pdf
- buku              -> laporan.buku                         -> laporan_buku.pdf
- peminjaman        -> laporan.peminjaman                   -> laporan_peminjaman.pdf
- pengembalian      -> laporan.pengembalian                 -> laporan_pengembalian.pdf
- denda             -> laporan.denda                        -> laporan_denda.pdf
- statistik_anggota_teraktif    -> laporan.statistik_anggota_teraktif
- statistik_buku_terpopuler     -> laporan.statistik_buku_terpopuler
- statistik_anggota_terlambat   -> laporan.statistik_anggota_terlambat

Query Parameter filter: filter_type (semua|bulan|rentang), bulan, tahun, start_date, end_date, status

---

## 14. STRUKTUR EXPORT EXCEL

Library: phpoffice/phpspreadsheet
Route: GET /laporan/excel/{modul} -> LaporanController::cetakExcel()
Output: download (attachment)

Struktur Excel yang Dihasilkan (konsisten di semua modul):
- Baris 1: Judul laporan (bold, size 18) + label dokumen di kanan
- Baris 2: Tanggal cetak di kanan
- Baris 4-5: Ringkasan statistik (summary data)
- Baris 7: Header tabel (bold, background dark, teks putih)
- Baris 8+: Data rows
- Baris terakhir+1: Footer kiri + kanan

Kolom diformat sebagai string eksplisit untuk mencegah konversi:
No HP, Kode Anggota, Kode Buku, Kode Peminjaman, Kode

---

## 15. STRUKTUR REUSABLE COMPONENT

### UI Components (components/ui/) - JANGAN DIMODIFIKASI
Semua komponen Radix UI-based: button, input, label, card, table, dialog, select, badge,
avatar, sidebar (~700 baris), async-combobox, combobox, dan lainnya.

### ConfirmModal.tsx (components/ConfirmModal.tsx)
Modal konfirmasi universal. 3 varian:
- default: icon HelpCircle, warna emerald
- destructive: icon Trash2, warna red (untuk delete)
- logout: icon LogOut, warna amber

Props: open, title, description, confirmLabel, cancelLabel, variant, loading, onConfirm, onCancel

### searchable-book-select.tsx
Custom combobox pencarian buku:
- Fetch saat dropdown dibuka
- Debounce 300ms saat mengetik
- Keyboard navigation (Arrow, Enter, Escape)
- Format: [kode_buku] judul - pengarang - kategori - tahun
- prop excludeIds untuk mencegah duplikat
- Badge Stok Habis untuk stok 0

### AsyncCombobox (ui/async-combobox.tsx)
Kombobox universal berbasis Radix Popover + Command:
- Props: value, onChange, searchUrl, placeholder, excludeIds
- Fetch by ?id=value untuk mendapatkan label item terpilih
- Digunakan di form peminjaman untuk cari anggota & buku

---

## 16. STRUKTUR SIDEBAR

### File Terkait
- app-sidebar.tsx: Komponen utama, menentukan menu per role
- nav-main.tsx: Render item menu (collapsible untuk sub-menu)
- nav-user.tsx: Info user + dropdown di footer sidebar
- nav-footer.tsx: Footer sidebar

### Role-based Navigation
  generalItems: Dashboard + semua transaksi + Master Data + Laporan
  kepalaSekolahItems: Dashboard + Master Data read-only + Riwayat + Laporan
  adminItems: [Petugas management] (hanya untuk super_admin)

  if (role === 'kepala_sekolah') items = kepalaSekolahItems;
  else { items = [...generalItems]; if (role === 'super_admin') items.push(...adminItems); }

### Fitur Sidebar
- Collapsible sidebar (dapat diciutkan menjadi ikon saja)
- State sidebar tersimpan di cookie sidebar_state
- Active state detection berdasarkan page.url.startsWith(item.href)
- Sub-menu Master Data menggunakan Radix Collapsible
- Warna aktif: emerald (bg-emerald-600 text-white)

---

## 17. CODING CONVENTION

### PHP (Laravel)
- Penamaan Controller: {Entity}Controller.php (PascalCase)
- Penamaan Model: Singular PascalCase - Anggota, Buku, Peminjaman
- Penamaan Tabel pengecualian: anggotas, buku, peminjaman, pengembalian, denda
- Redirect pattern: redirect()->route('...')->with('success/error', '...')
- Inertia render: Inertia::render('ModulName/Page', [...props])
- Validasi: inline di controller, tidak ada FormRequest untuk CRUD utama
- Transaksi DB: DB::transaction(function() use (...) { ... })
- SoftDeletes: digunakan di User, Anggota, Buku

### TypeScript / React
- Path alias: @/ -> resources/js/
- Pages: PascalCase.tsx (Index.tsx, Create.tsx, Show.tsx)
- Components: kebab-case.tsx (app-sidebar.tsx, nav-main.tsx)
- Import pattern:
    import AppLayout from '@/layouts/app-layout'
    import { type BreadcrumbItem } from '@/types'
    import { Head, useForm, router, usePage } from '@inertiajs/react'
    import { Button } from '@/components/ui/button'
- Form handling: useForm() dari Inertia untuk POST/PUT, router.get() untuk navigasi/filter
- Sort/Search: router.get(route(...), { search, sortBy, sortDir }, { preserveScroll: true })
- cn() helper: selalu gunakan cn() dari @/lib/utils untuk class merging

### Tailwind CSS
- Primary color: emerald (emerald-600, emerald-700)
- Dark mode: Mendukung dark mode via class/cookie
- Card pattern: rounded-xl border border-border/60 shadow-sm
- Table: gunakan komponen Table dari @/components/ui/table

---

## 18. POLA IMPLEMENTASI DEVELOPER SEBELUMNYA

### Pola 1: Tabel Index dengan Sort & Search
Semua halaman Index:
  const [search, setSearch] = useState(props.search || '')
  const [sortBy, setSortBy] = useState(props.sortBy || 'id')
  const [sortDir, setSortDir] = useState(props.sortDir || 'desc')

  handleSort -> router.get(route(...), { sortBy, sortDir, search }, { preserveState: true })
  getSortIcon -> ArrowUpDown | ArrowUp | ArrowDown (emerald-600 jika aktif)

### Pola 2: Delete dengan ConfirmModal
  const [confirmItem, setConfirmItem] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { delete: destroy } = useForm()
  handleDelete(id, nama) -> setConfirmItem({ id, nama })
  doDelete() -> destroy(route('entity.destroy', confirmItem.id), { onSuccess, onError })

### Pola 3: Flash Message
  Flash dari controller via ->with('success/error', '...') dibaca app-layout.tsx -> toast otomatis

### Pola 4: Kode Generate Otomatis
  Buku: BK + 3 digit (BK001, BK002, ...)
  Anggota: AG + 3 digit (AG001, AG002, ...)
  Peminjaman: PMJ + yymmdd + 3 digit (PMJ260704001)
  Semua generate di controller::create(), dikirim ke frontend sebagai prop readonly.

### Pola 5: SoftDelete + withTrashed
  Buku dan Anggota dihapus via SoftDelete.
  Relasi menggunakan ->withTrashed() agar data historis tetap tampil.
  Di frontend: "Anggota nonaktif" atau "Buku sudah dihapus".

### Pola 6: Pagination Laravel Standard
  type PaginatedData = { data, current_page, last_page, per_page, total, from, to, links }
  Navigasi: tombol First/Prev/Next/Last secara manual.

### Pola 7: AJAX Search Endpoint
  GET /buku/search?q=&exclude=&id=&kode_buku=
  GET /anggota/search?q=&id=
  Mengembalikan JSON (bukan Inertia). Digunakan oleh AsyncCombobox.

---

## 19. BAGIAN PROJECT YANG PALING SENSITIF

### KRITIS - Jangan Diubah Sembarangan

1. bootstrap/app.php - Urutan middleware global. CheckStatus harus di posisi terakhir web middleware.

2. HandleInertiaRequests.php - Shared data ke semua halaman. Perubahan mempengaruhi seluruh frontend.

3. CheckRole.php & CheckStatus.php - Logic keamanan utama.

4. PengembalianController::store() - Logika transaksi paling kompleks:
   hitung keterlambatan + update status + restore stok + buat denda (satu DB transaction).

5. PengembalianController::destroy() - Rollback pengembalian: restore status, rollback stok, hapus denda.

6. LaporanController::cetakPdf() dan cetakExcel() - Logic match/switch untuk 8 modul laporan.
   Perubahan struktur data di model harus disinkronkan di sini.

7. Stok Buku - Stok diincrement/decrement langsung di tabel buku.
   Race condition bisa terjadi jika tidak dijaga dalam transaction.

8. Route naming - Semua route memiliki nama terstandarisasi. Perubahan nama akan merusak Ziggy.

9. DendaService logic - Penghitungan denda menggunakan tarif dari Cache.

10. shiftIfHoliday() di PeminjamanController - Algoritma geser tanggal, max 60 iterasi safety.

### HATI-HATI

- app-sidebar.tsx: Navigasi berbasis role. Penambahan menu harus mempertimbangkan semua role.
- types/index.d.ts: User.role masih 'super_admin' | 'admin' (belum termasuk 'kepala_sekolah').
- Migrasi database: Jangan modify migration lama, selalu buat migration baru.
- Cache keys: 'durasi_peminjaman' dan 'tarif_denda'. Jika key berubah, semua referensi harus diupdate.

---

## 20. REKOMENDASI CARA MENGEMBANGKAN PROJECT

### Prinsip Utama
1. Ikuti pola yang sudah ada - Lihat controller atau halaman yang mirip sebelum membuat yang baru.
2. Jangan buat arsitektur baru - Tidak perlu Service baru kecuali ada logika bisnis kompleks yang berulang.
3. Selalu gunakan DB::transaction untuk operasi yang menyentuh lebih dari satu tabel.
4. Gunakan komponen yang sudah ada: ConfirmModal, AsyncCombobox, shadcn/ui components.

### Checklist Menambah Fitur Baru
Sebelum implementasi:
  - Identifikasi route pattern yang diperlukan (resource atau custom)
  - Tentukan middleware yang diperlukan (role, auth)
  - Buat migration baru (JANGAN edit yang lama)
  - Ikuti naming convention model, controller, halaman
  - Tambahkan menu di app-sidebar.tsx jika diperlukan (perhatikan role)

Saat implementasi:
  - Controller method harus mengembalikan Inertia::render(...) atau redirect()->route(...)
  - Flash message via ->with('success/error', '...')
  - Validasi inline di controller
  - Frontend: gunakan useForm() untuk POST/PUT, router.get() untuk filter
  - Gunakan ConfirmModal untuk semua aksi delete
  - Tambah breadcrumbs sebagai konstanta di halaman

### Cara Menambah Modul Laporan Baru
1. Tambah case baru di LaporanController::cetakPdf() (match expression)
2. Tambah case baru di LaporanController::cetakExcel() (switch statement)
3. Buat blade view di resources/views/laporan/
4. Tambah card laporan di pages/Laporan/Index.tsx

### Cara Menambah Role Baru
Jangan tambah role baru tanpa:
1. Migrasi untuk update ENUM di users.role
2. Update CheckRole jika ada middleware baru
3. Update sidebar logic di app-sidebar.tsx
4. Update types/index.d.ts untuk tipe User.role
5. Review semua route apakah role baru perlu akses

---

## RINGKASAN AKSES CEPAT

| Kebutuhan | File yang Dibuka |
|-----------|-----------------|
| Tambah route | routes/web.php |
| Tambah middleware | bootstrap/app.php + app/Http/Middleware/ |
| Ubah shared data Inertia | app/Http/Middleware/HandleInertiaRequests.php |
| Tambah model baru | app/Models/ + database/migrations/ |
| Ubah logika peminjaman | app/Http/Controllers/PeminjamanController.php |
| Ubah logika denda | app/Services/DendaService.php + PengembalianController.php |
| Ubah menu sidebar | resources/js/components/app-sidebar.tsx |
| Tambah laporan PDF | LaporanController::cetakPdf() + blade di resources/views/laporan/ |
| Tambah laporan Excel | LaporanController::cetakExcel() |
| Ubah tampilan halaman | resources/js/pages/{Modul}/{Page}.tsx |
| Ubah tipe TypeScript | resources/js/types/index.d.ts |
| Seed data | database/seeders/DatabaseSeeder.php |
