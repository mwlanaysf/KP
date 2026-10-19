# AUDIT_PROJECT.md
# Laporan Audit & Rencana Cleanup Project
## Sistem Informasi Manajemen Perpustakaan Sekolah
**Stack**: Laravel 12 | React 19 | Inertia.js v2 | TypeScript | Tailwind CSS v4 | SQLite  
**Waktu Audit**: 19 Oktober 2026  
**Status Audit**: TAHAP 1 — AUDIT SAJA (Tidak ada file aplikasi/database yang dihapus atau dimodifikasi)  
**Baseline Validasi**:
- Test Suite Backend (`php artisan test`): **67 Passed (147 assertions) — 100% Lulus**
- TypeScript Compiler (`tsc --noEmit`): **Clean (0 error)**
- Route Terdaftar (`php artisan route:list`): **90 routes**

---

## 1. PENDAHULUAN & PEMETAAN SISTEM

Project ini merupakan aplikasi Sistem Informasi Manajemen Perpustakaan Sekolah berbasis Monolith SPA (Laravel + React Inertia). Berdasarkan riwayat pengembangan, project telah mengalami beberapa kali iterasi dan refactoring menggunakan AI assistant, sehingga menyisakan berbagai skrip investigasi, file cadangan darurat, artefak ekstraksi, dan komponen starter-kit yang sudah tidak relevan dengan alur bisnis perpustakaan.

### 1.1. Arsitektur Inti
- **Backend Entry Point**: `bootstrap/app.php` & `public/index.php`
- **Frontend Entry Point**: `resources/js/app.tsx` & `resources/js/ssr.tsx`
- **Root Template Blade**: `resources/views/app.blade.php`
- **Protokol SPA**: Inertia.js v2 via middleware `App\Http\Middleware\HandleInertiaRequests`
- **Routing Helper**: Ziggy (`tightenco/ziggy` & `resources/js/ziggy.js`)
- **Database Aktif**: SQLite (`database/database.sqlite`)
- **Autentikasi**: Berbasis `username` + `password` (bukan email). Pendaftaran terbuka dinonaktifkan, akun dikelola terpusat oleh Super Admin.
- **Role Otorisasi**: `super_admin`, `admin`, `kepala_sekolah` melalui middleware `role` (`App\Http\Middleware\CheckRole`).
- **Status Akun**: Middleware `App\Http\Middleware\CheckStatus` memastikan akun non-aktif langsung di-logout otomatis.

---

## KATEGORI A: KANDIDAT AMAN DIHAPUS (SAFE TO DELETE)

File-file pada kategori ini adalah **file sementara (scratch scripts)**, **dump artefak AI sebelumnya**, **file backup ZIP cadangan**, serta **boilerplate kosong** yang tertinggal di folder kerja. Seluruh file ini dipastikan tidak memiliki relasi atau pemanggilan di runtime Laravel, Vite, Inertia, maupun Composer.

### 1. Skrip Ad-Hoc & Scanner Lapangan (Root)
* **`analyze.php`** (879 B)
  * **Alasan**: Skrip ad-hoc untuk memparsing file `audit_results.json` dari audit field sesi lampau.
  * **Bukti Referensi**: Tidak ada file controller, route, view, atau composer script yang memanggil file ini.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.
* **`analyze2.php`** (503 B)
  * **Alasan**: Skrip variasi ad-hoc untuk menyaring field tidak terpakai dari `audit_results.json`.
  * **Bukti Referensi**: Tidak ada referensi di seluruh project.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.
* **`audit_db.php`** (2.3 KB)
  * **Alasan**: Skrip ad-hoc koneksi langsung PDO MySQL untuk membaca skema tabel lokal (`SHOW TABLES`, `DESCRIBE`).
  * **Bukti Referensi**: Mengakses `.env` lokal via regex mentah untuk dump CLI, tidak terhubung dengan arsitektur Laravel.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.
* **`audit_fields.php`** (2.4 KB)
  * **Alasan**: Skrip CLI ad-hoc untuk mencocokkan nama kolom database terhadap file sumber (`app`, `resources`, `routes`).
  * **Bukti Referensi**: Hanya dijalankan manual via CLI tempo hari.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.
* **`audit_fields2.php`** (2.8 KB)
  * **Alasan**: Skrip ad-hoc lanjutan untuk pencarian teks kolom database.
  * **Bukti Referensi**: Tidak ada referensi dalam sistem aplikasi.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.
* **`audit_report_raw.md`** (2.1 KB)
  * **Alasan**: Output teks mentah hasil audit kolom dari sesi pemeriksaan terdahulu.
  * **Bukti Referensi**: File teks statis hasil dump.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.
* **`audit_results.json`** (149.5 KB)
  * **Alasan**: File JSON mentah penampung hasil pemindaian kolom database terhadap path file.
  * **Bukti Referensi**: Hanya dibaca oleh skrip `analyze*.php` dan `test*.php`.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.
* **`generate_report.php`** (2.5 KB)
  * **Alasan**: Skrip CLI ad-hoc untuk membuat laporan audit field ke markdown.
  * **Bukti Referensi**: Tidak ada referensi di Laravel.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.
* **`get_columns.php`** (472 B)
  * **Alasan**: Skrip bootstrap Laravel mini untuk mengekspor `Schema::getColumnListing()` ke JSON.
  * **Bukti Referensi**: Tidak terdaftar pada routes/console/artisan.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.

### 2. Skrip Percobaan & Manual Test Cepat (Root)
* **`test.php`** (120 B)
  * **Alasan**: Skrip 4 baris untuk mengecek indeks `users.email_verified_at` di `audit_results.json`.
  * **Bukti Referensi**: Scratch code non-produksi.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.
* **`test2.php`** (117 B)
  * **Alasan**: Skrip 4 baris untuk mengecek indeks `users.remember_token` di `audit_results.json`.
  * **Bukti Referensi**: Scratch code non-produksi.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.
* **`test3.php`** (108 B), **`test4.php`** (109 B), **`test5.php`** (115 B)
  * **Alasan**: Serangkaian skrip 4 baris pencarian cepat isi JSON hasil audit.
  * **Bukti Referensi**: Scratch code non-produksi.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.
* **`test_holiday.php`** (3.95 KB)
  * **Alasan**: Skrip manual pengujian logika penggeseran hari libur peminjaman. Masih menggunakan nama model usang `App\Models\Holiday` (sekarang `App\Models\HariLibur`). Pengujian resmi untuk logika ini sudah tercakup lengkap dalam Pest test suite (`tests/Unit/Services/DendaServiceTest.php` dan `tests/Unit/Models/HariLiburTest.php`).
  * **Bukti Referensi**: Tidak digunakan oleh suite `php artisan test`.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.
* **`test_update.php`** (388 B)
  * **Alasan**: Skrip percobaan mock request manual HTTP PUT `/jurusan/1`. Pengujian ini telah di-cover secara resmi oleh Pest Feature test.
  * **Bukti Referensi**: File ad-hoc standalone.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.

### 3. Artefak Pemulihan & Patch Skrip Python (Root)
* **`original_laporan.txt`** (4.1 KB)
  * **Alasan**: Dump teks mentah file `resources/js/pages/Laporan/Index.tsx` lama lengkap dengan nomor baris log tool AI.
  * **Bukti Referensi**: File sampah teks.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.
* **`restore.py`** (32.8 KB)
  * **Alasan**: Skrip Python darurat yang dulu dipakai untuk membuang nomor baris dan memulihkan kode komponen `Laporan/Index.tsx`.
  * **Bukti Referensi**: Skrip utilitas eksternal di luar runtime aplikasi.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.
* **`update_react.py`** (17.3 KB), **`update_react2.py`** (16.7 KB), **`update_react3.py`** (16.4 KB)
  * **Alasan**: Rangkaian skrip Python regex untuk menyuntikkan kode sub-komponen ke file `Laporan/Index.tsx`. Komponen React tujuan saat ini sudah selesai dimodifikasi secara permanen.
  * **Bukti Referensi**: Skrip patching eksternal.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.

### 4. File Cadangan Arsip ZIP
* **`resources/js.zip`** (157.2 KB)
  * **Alasan**: File arsip zip cadangan seluruh folder `resources/js` lama sebelum dilakukan refactoring.
  * **Bukti Referensi**: Tidak ada proses build Vite atau Laravel yang merujuk file ZIP ini.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.
* **`database/migrations.zip`** (13.2 KB)
  * **Alasan**: File arsip zip cadangan file migrasi sebelum rename skema tabel ke bahasa Indonesia (tabel `categories`, `majors`, `holidays`).
  * **Bukti Referensi**: Tidak dijalankan oleh artisan migrate.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.

### 5. Command Kosong & Halaman Welcome Bawaan
* **`app/Console/Commands/SyncLegacyData.php`** (501 B)
  * **Alasan**: File Artisan Command hasil scaffolding default yang method `handle()`-nya kosong (`//`) dengan deskripsi bawaan `'Command description'`.
  * **Bukti Referensi**: Tidak diregistrasikan di `routes/console.php`, tidak dijadwalkan di Task Scheduler, dan tidak memiliki implementasi logika.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.
* **`resources/js/pages/welcome.tsx`** (77 KB)
  * **Alasan**: Halaman landing page bawaan Laravel Breeze / Starter Kit (792 baris). Pada aplikasi ini, route root `/` di `routes/web.php` sudah diubah langsung me-redirect ke login (`return redirect()->route('login')`). Di dalamnya masih merujuk route `register` yang sudah tidak ada.
  * **Bukti Referensi**: Tidak ada controller atau closure yang merender `Inertia::render('welcome')`.
  * **Tingkat Risiko**: **Nol (Zero Risk)**
  * **Rekomendasi Tindakan**: Hapus.

---

## KATEGORI B: KANDIDAT DUPLIKAT ATAU IMPLEMENTASI LAMA

File-file pada kategori ini adalah komponen atau layout yang **fungsinya telah digantikan secara superior oleh implementasi baru** atau merupakan varian template starter kit yang tidak digunakan oleh antarmuka sistem.

* **`resources/js/components/ui/icon.tsx`** (323 B)
  * **Pengganti**: `resources/js/components/icon.tsx` (403 B)
  * **Alasan**: Duplikat wrapper komponen ikon Lucide. Komponen aktif (`app-header.tsx`, `nav-footer.tsx`) secara eksplisit mengimpor `@/components/icon`. File di dalam subfolder `components/ui/icon.tsx` tidak diimpor sama sekali oleh file mana pun.
  * **Bukti Referensi**: Grep `ui/icon` menghasilkan 0 referensi.
  * **Tingkat Risiko**: **Sangat Rendah**
  * **Rekomendasi Tindakan**: Hapus `resources/js/components/ui/icon.tsx`.

* **`resources/js/components/ui/combobox.tsx`** (6.58 KB)
  * **Pengganti**: `resources/js/components/ui/async-combobox.tsx` (5.13 KB)
  * **Alasan**: Komponen dropdown pencarian statis custom lama. Seluruh form transaksi aktif (`Peminjaman/Create.tsx` dan `Pengembalian/Create.tsx`) sekarang menggunakan `AsyncCombobox` berbasis shadcn + `cmdk` yang terintegrasi langsung dengan AJAX endpoint (`route('buku.search')`).
  * **Bukti Referensi**: Grep `/combobox` menghasilkan 0 referensi impor di seluruh `resources/js`.
  * **Tingkat Risiko**: **Sangat Rendah**
  * **Rekomendasi Tindakan**: Hapus.

* **`resources/js/components/searchable-book-select.tsx`** (8.51 KB)
  * **Pengganti**: `resources/js/components/ui/async-combobox.tsx`
  * **Alasan**: Komponen pencarian buku khusus yang dibuat di awal. Di dalamnya masih menggunakan skema kolom buku lama (`kategori: string`). Sekarang form peminjaman menggunakan generic `AsyncCombobox`.
  * **Bukti Referensi**: Grep `searchable-book-select` menghasilkan 0 referensi impor.
  * **Tingkat Risiko**: **Sangat Rendah**
  * **Rekomendasi Tindakan**: Hapus.

* **`resources/js/components/delete-user.tsx`** (4.07 KB)
  * **Pengganti**: Dikelola terpusat oleh Super Admin di modul Petugas
  * **Alasan**: Komponen modal dialog hapus akun mandiri bawaan starter kit. Pada halaman profil pengguna (`resources/js/pages/settings/profile.tsx`), opsi penghapusan akun mandiri sengaja ditiadakan karena dalam konteks perpustakaan sekolah, akun petugas tidak boleh dihapus sendiri tanpa wewenang Super Admin.
  * **Bukti Referensi**: Komponen tidak diimpor di `profile.tsx` maupun file lainnya.
  * **Tingkat Risiko**: **Sangat Rendah**
  * **Rekomendasi Tindakan**: Hapus.

* **`resources/js/components/appearance-dropdown.tsx`** (2.34 KB)
  * **Pengganti**: `resources/js/components/appearance-tabs.tsx`
  * **Alasan**: Komponen dropdown pemilih tema (Light/Dark/System). Sistem saat ini mengadopsi navigasi berbasis tab di halaman pengaturan tema (`settings/appearance.tsx`), sehingga dropdown ini menjadi kode mati.
  * **Bukti Referensi**: Grep `appearance-dropdown` menghasilkan 0 referensi.
  * **Tingkat Risiko**: **Sangat Rendah**
  * **Rekomendasi Tindakan**: Hapus.

* **`resources/js/components/ui/placeholder-pattern.tsx`** (648 B)
  * **Pengganti**: Komponen kartu metrik statistik dan visualisasi grafik nyata
  * **Alasan**: Komponen SVG pola garis abu-abu placeholder bawaan dashboard starter kit. Dashboard perpustakaan saat ini telah memiliki visualisasi metrik nyata (total buku, anggota, transaksi aktif, denda tertunggak) serta grafik Recharts.
  * **Bukti Referensi**: Grep `placeholder-pattern` menghasilkan 0 referensi.
  * **Tingkat Risiko**: **Sangat Rendah**
  * **Rekomendasi Tindakan**: Hapus.

* **`resources/js/layouts/app/app-header-layout.tsx`** (554 B)
  * **Pengganti**: `resources/js/layouts/app/app-sidebar-layout.tsx`
  * **Alasan**: Template alternatif layout berbasis header navigasi atas. Arsitektur aplikasi saat ini secara ketat menggunakan layout sidebar (`app-sidebar-layout.tsx`) yang dibungkus oleh `resources/js/layouts/app-layout.tsx`.
  * **Bukti Referensi**: Grep `app-header-layout` menghasilkan 0 referensi.
  * **Tingkat Risiko**: **Sangat Rendah**
  * **Rekomendasi Tindakan**: Hapus.

* **`resources/js/layouts/auth/auth-card-layout.tsx`** (1.5 KB) & **`resources/js/layouts/auth/auth-split-layout.tsx`** (2.27 KB)
  * **Pengganti**: `resources/js/layouts/auth/auth-simple-layout.tsx`
  * **Alasan**: Varian layout autentikasi bawaan starter kit. Halaman `auth/login.tsx` menggunakan `auth-layout.tsx` yang secara baku mengimpor `auth-simple-layout.tsx`. Kedua varian (card layout & split layout) tidak pernah dipanggil.
  * **Bukti Referensi**: Grep `auth-card-layout` dan `auth-split-layout` menghasilkan 0 referensi.
  * **Tingkat Risiko**: **Sangat Rendah**
  * **Rekomendasi Tindakan**: Hapus kedua file layout tersebut.

---

## KATEGORI C: FILE YANG PERLU VERIFIKASI MANUAL (MANUAL REVIEW NEEDED)

Kategori ini mencakup file atau modul yang **saat ini tidak aktif dalam alur utama**, namun penghapusannya membutuhkan keputusan desain atau kehati-hatian khusus terkait riwayat database dan rencana jangka panjang.

### 1. Database Mentah & Backup SQL Lokal
* **`db_perpus`** (di root project, 176 KB)
  * **Alasan**: Merupakan file database SQLite mentah tanpa ekstensi `.sqlite`. Di dalamnya tersimpan tabel lama perpustakaan (skema di mana kategori buku masih bertipe varchar sebelum dibuatkan tabel relasi `kategori_buku`).
  * **Konsekuensi**: Bukan database yang aktif dibaca oleh Laravel (`database/database.sqlite`), namun berpotensi memuat catatan data lama.
  * **Rekomendasi**: Pindahkan ke penyimpanan cadangan lokal di luar folder project, lalu masukkan `db_perpus` ke `.gitignore`. Jangan diunggah ke GitHub.
* **`database/db_perpus.sql`** (208.4 KB)
  * **Alasan**: Dump phpMyAdmin MariaDB bertanggal 19 Oktober 2026 pukul 16:49.
  * **Konsekuensi**: Merupakan cadangan data MySQL/MariaDB. Bukan bagian dari runtime Laravel SQLite saat ini.
  * **Rekomendasi**: Amankan file dump ini ke tempat penyimpanan lokal Anda jika merupakan data penting sekolah, lalu hapus dari direktori git atau masukkan ke `.gitignore`. Hindari mengunggah dump SQL riil ke GitHub publik.

### 2. Migration Kosong Berstatus [Ran]
* **`database/migrations/2026_04_07_154111_add_avatar_to_users_table.php`** (558 B)
* **`database/migrations/2026_04_07_155546_add_avatar_to_users_table.php`** (558 B)
  * **Alasan**: Kedua file migration ini memiliki fungsi `up()` dan `down()` yang kosong melompong (`Schema::table('users', function (Blueprint $table) { // });`). Kolom avatar yang sesungguhnya baru ditambahkan pada migrasi ketiga (`2026_04_12_121757_add_avatar_to_users_table.php`).
  * **Pertimbangan Khusus**: Pada database lokal yang ada, kedua nama migrasi ini sudah tercatat di tabel `migrations` dengan status `[Ran]`. Jika file dihapus sekarang tanpa me-reset database lokal, perintah `php artisan migrate:rollback` di masa depan bisa memunculkan peringatan file migrasi hilang. Namun, untuk instalasi baru dari clone GitHub (`php artisan migrate:fresh --seed`), ketiadaan kedua file ini justru membuat repositori jauh lebih bersih.
  * **Rekomendasi**: 
    - Opsi 1 (Disarankan untuk GitHub bersih): Hapus kedua file migrasi kosong tersebut, lalu jalankan `php artisan migrate:fresh --seed` untuk menyegarkan database lokal.
    - Opsi 2: Biarkan tetap ada jika Anda tidak ingin menyentuh database lokal saat ini.

### 3. Modul Autentikasi Tambahan Starter Kit (Registrasi & Reset Password)
* **Backend Controllers**:
  - `app/Http/Controllers/Auth/RegisteredUserController.php`
  - `app/Http/Controllers/Auth/PasswordResetLinkController.php`
  - `app/Http/Controllers/Auth/NewPasswordController.php`
* **Frontend Pages & Komponen**:
  - `resources/js/pages/auth/register.tsx`
  - `resources/js/pages/auth/forgot-password.tsx`
  - `resources/js/pages/auth/reset-password.tsx`
  - `resources/js/components/text-link.tsx` (hanya digunakan oleh halaman-halaman auth di atas)
* **Alasan & Bukti**:
  - Di `routes/auth.php`, rute registrasi (`register`), lupa sandi (`forgot-password`), dan reset sandi (`reset-password`) telah dikomentari/dihapus secara sengaja.
  - Alur bisnis perpustakaan menggunakan pendaftaran tertutup: hanya Super Admin yang berhak mendaftarkan petugas/admin baru melalui menu manajemen `Petugas`. Petugas tidak mendaftar sendiri.
* **Pertimbangan**:
  - Jika Anda **tidak akan pernah** membutuhkan fitur registrasi publik atau lupa password via email: **Hapus seluruh 4 controller dan 4 file React terkait** agar repo benar-benar ramping.
  - Jika Anda berencana mengaktifkan fitur lupa kata sandi via email di masa depan: **Pertahankan file-file ini**.

### 4. Modul Verifikasi Email & Konfirmasi Password
* **Backend Controllers**:
  - `app/Http/Controllers/Auth/EmailVerificationPromptController.php`
  - `app/Http/Controllers/Auth/EmailVerificationNotificationController.php`
  - `app/Http/Controllers/Auth/VerifyEmailController.php`
  - `app/Http/Controllers/Auth/ConfirmablePasswordController.php`
* **Frontend Pages**:
  - `resources/js/pages/auth/verify-email.tsx`
  - `resources/js/pages/auth/confirm-password.tsx`
* **Alasan & Bukti**:
  - Rute untuk file ini masih tercantum di `routes/auth.php`.
  - Namun, model `App\Models\User` **tidak mengimplementasikan interface `MustVerifyEmail`**.
  - Sistem tidak pernah memicu pengiriman email verifikasi ke pengguna.
* **Rekomendasi**: Pertahankan jika ingin menjaga kompatibilitas standar Laravel Breeze, atau hapus rute dan filenya jika ingin arsitektur autentikasi yang 100% murni sesuai kebutuhan perpustakaan sekolah.

### 5. Komponen UI Cadangan Shadcn yang Belum Terpakai
* **`resources/js/components/ui/alert.tsx`**
* **`resources/js/components/ui/toggle.tsx`**
* **`resources/js/components/ui/toggle-group.tsx`**
  * **Alasan**: Ketiga komponen UI shadcn standar ini saat ini tidak diimpor oleh halaman aktif mana pun.
  * **Rekomendasi**: Boleh dipertahankan sebagai pustaka komponen UI (design system) untuk kebutuhan penambahan fitur di masa depan, atau dihapus jika menginginkan bundle sekecil mungkin.

### 6. Dokumentasi Internal Project
* **`PROJECT_CONTEXT.md`** (28.1 KB)
  * **Alasan**: Berisi dokumentasi sistem dan arsitektur perpustakaan.
  * **Rekomendasi**: Sangat direkomendasikan untuk dipertahankan di GitHub agar tim pengembang lain dapat memahami konteks sistem dengan cepat.

---

## KATEGORI D: FILE WAJIB YANG HARUS DIPERTAHANKAN (CORE ARCHITECTURE)

File-file di bawah ini telah diverifikasi sebagai komponen operasional aktif dan **DILARANG DIHAPUS**:

### 1. Rute & Konfigurasi Inti
- `routes/web.php` (90 rute utama: Master Buku, Anggota, Peminjaman, Pengembalian, Denda, Riwayat Transaksi, Laporan PDF/Excel, Pengaturan Peminjaman, Hari Libur).
- `routes/auth.php` (rute login dan logout aktif).
- `routes/settings.php` (rute manajemen profil, update avatar, ganti kata sandi, preferensi tema).
- `routes/console.php` (definisi perintah artisan internal).
- `bootstrap/app.php` (registrasi middleware global & alias role).
- `config/` (seluruh 12 file konfigurasi: `app.php`, `auth.php`, `cache.php`, `database.php`, `dompdf.php`, `filesystems.php`, `inertia.php`, `logging.php`, `mail.php`, `queue.php`, `services.php`, `session.php`).

### 2. Backend Controllers (14 Controller Operasional)
- `app/Http/Controllers/Controller.php` (base class)
- `app/Http/Controllers/DashboardController.php` (kalkulasi statistik ringkasan, grafik bulanan, aktivitas terbaru)
- `app/Http/Controllers/BukuController.php` (CRUD buku & AJAX search)
- `app/Http/Controllers/AnggotaController.php` (CRUD anggota & AJAX search)
- `app/Http/Controllers/KategoriBukuController.php` (CRUD master kategori)
- `app/Http/Controllers/JurusanController.php` (CRUD master jurusan)
- `app/Http/Controllers/HariLiburController.php` (CRUD kalender libur nasional & sekolah)
- `app/Http/Controllers/PengaturanPeminjamanController.php` (pengaturan durasi peminjaman default)
- `app/Http/Controllers/PeminjamanController.php` (transaksi peminjaman multi-buku, generator kode otomatis, geser tanggal jika hari libur)
- `app/Http/Controllers/PengembalianController.php` (transaksi pengembalian, deteksi keterlambatan, penambahan kembali stok buku, sinkronisasi denda)
- `app/Http/Controllers/DendaController.php` (rekap denda, pembayaran denda, pengaturan tarif denda per hari)
- `app/Http/Controllers/RiwayatTransaksiController.php` (rekap gabungan riwayat transaksi peminjaman & pengembalian)
- `app/Http/Controllers/LaporanController.php` (generator laporan komprehensif, ekspor PDF via Dompdf, ekspor Excel via PhpSpreadsheet)
- `app/Http/Controllers/PetugasController.php` (manajemen pengguna sistem, toggle status aktif/non-aktif)
- `app/Http/Controllers/Settings/ProfileController.php` (update profil & upload foto avatar)
- `app/Http/Controllers/Settings/PasswordController.php` (update password terenkripsi)
- `app/Http/Controllers/Auth/AuthenticatedSessionController.php` (proses autentikasi login & logout)

### 3. Model Eloquent (11 Model)
- `app/Models/User.php` (user sistem, peran, relasi avatar, status aktif)
- `app/Models/Anggota.php` (data anggota, relasi jurusan, relasi peminjaman & denda)
- `app/Models/Buku.php` (katalog buku, stok, relasi kategori buku)
- `app/Models/KategoriBuku.php` (kategori buku)
- `app/Models/Jurusan.php` (jurusan SMK)
- `app/Models/HariLibur.php` (kalender libur)
- `app/Models/Peminjaman.php` (header transaksi pinjam)
- `app/Models/DetailPeminjaman.php` (baris koleksi buku yang dipinjam)
- `app/Models/Pengembalian.php` (transaksi pengembalian buku)
- `app/Models/Denda.php` (kalkulasi nominal & status pelunasan)
- `app/Models/Pengaturan.php` (konfigurasi durasi pinjam & tarif denda)

### 4. Middleware & Layanan Bisnis
- `app/Http/Middleware/CheckRole.php` (RBAC: `super_admin`, `admin`, `kepala_sekolah`)
- `app/Http/Middleware/CheckStatus.php` (auto-logout akun nonaktif)
- `app/Http/Middleware/HandleAppearance.php` (sinkronisasi tema dark/light mode)
- `app/Http/Middleware/HandleInertiaRequests.php` (shared data auth, flash toast, server time, ziggy)
- `app/Services/DendaService.php` (service perhitungan hari terlambat & denda otomatis)
- `app/Http/Requests/Auth/LoginRequest.php` (validasi login username & rate limiter)
- `app/Http/Requests/Settings/ProfileUpdateRequest.php` (validasi update profil)

### 5. Frontend Pages (10 Modul Antarmuka Inertia)
- `resources/js/pages/dashboard.tsx`
- `resources/js/pages/Anggota/` (`Create.tsx`, `Edit.tsx`, `Index.tsx`)
- `resources/js/pages/Buku/` (`Create.tsx`, `Edit.tsx`, `Index.tsx`)
- `resources/js/pages/Denda/` (`Index.tsx`, `Show.tsx`)
- `resources/js/pages/Jurusan/` (`Index.tsx`)
- `resources/js/pages/KategoriBuku/` (`Index.tsx`)
- `resources/js/pages/Laporan/` (`Index.tsx`)
- `resources/js/pages/Peminjaman/` (`Create.tsx`, `Pengaturan.tsx`, `Show.tsx`)
- `resources/js/pages/Pengembalian/` (`Create.tsx`, `Index.tsx`, `Show.tsx`)
- `resources/js/pages/Petugas/` (`Create.tsx`, `Edit.tsx`, `Index.tsx`)
- `resources/js/pages/RiwayatTransaksi/` (`Index.tsx`)
- `resources/js/pages/auth/login.tsx`
- `resources/js/pages/settings/` (`appearance.tsx`, `password.tsx`, `profile.tsx`)

### 6. Komponen UI, Shell, & Layout Inti
- `resources/js/layouts/app-layout.tsx` & `resources/js/layouts/app/app-sidebar-layout.tsx`
- `resources/js/layouts/auth-layout.tsx` & `resources/js/layouts/auth/auth-simple-layout.tsx`
- `resources/js/layouts/settings/layout.tsx`
- `resources/js/components/Pagination.tsx` (komponen pagination yang dipakai di 8 modul)
- `resources/js/components/ConfirmModal.tsx` (dialog konfirmasi aksi penting)
- `resources/js/components/ui/async-combobox.tsx` & `resources/js/components/ui/command.tsx` (combobox buku)
- Komponen Shell: `app-shell.tsx`, `app-header.tsx`, `app-sidebar.tsx`, `nav-main.tsx`, `nav-user.tsx`, `nav-footer.tsx`, `breadcrumbs.tsx`, `app-logo.tsx`, `app-logo-icon.tsx`.
- Komponen UI Aktif: `avatar.tsx`, `badge.tsx`, `breadcrumb.tsx`, `button.tsx`, `card.tsx`, `checkbox.tsx`, `collapsible.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `input.tsx`, `label.tsx`, `navigation-menu.tsx`, `popover.tsx`, `select.tsx`, `separator.tsx`, `sheet.tsx`, `sidebar.tsx`, `skeleton.tsx`, `table.tsx`, `textarea.tsx`, `tooltip.tsx`.

### 7. View Blade & Laporan PDF (9 Template)
- `resources/views/app.blade.php` (Inertia root HTML)
- `resources/views/laporan/pdf.blade.php` (layout induk PDF)
- `resources/views/laporan/anggota.blade.php`
- `resources/views/laporan/buku.blade.php`
- `resources/views/laporan/peminjaman.blade.php`
- `resources/views/laporan/pengembalian.blade.php`
- `resources/views/laporan/denda.blade.php`
- `resources/views/laporan/statistik_anggota_teraktif.blade.php`
- `resources/views/laporan/statistik_anggota_terlambat.blade.php`
- `resources/views/laporan/statistik_buku_terpopuler.blade.php`

### 8. Database Seeders & Factories
- `database/seeders/DatabaseSeeder.php` (master seeder)
- `database/seeders/HariLiburSeeder.php`
- `database/seeders/JurusanSeeder.php`
- `database/seeders/KategoriBukuSeeder.php`
- `database/seeders/PengaturanSeeder.php`
- `database/seeders/PeminjamanDummySeeder.php`
- Seluruh 10 file di folder `database/factories/`

### 9. Test Suites (Pest PHP)
- Seluruh test di `tests/Feature/` dan `tests/Unit/` (total 67 test yang memastikan keandalan sistem CRUD, role, auth, denda, dan tanggal libur).

---

## KATEGORI E: ANALISIS DEPENDENCY (COMPOSER & NPM)

Audit silang antara dependensi terdaftar terhadap pemakaian aktual dalam kode:

### 1. Dependensi NPM (`package.json`)
* **`@headlessui/react`**: **AKTIF DIGUNAKAN**  
  *Bukti*: Diimpor di `resources/js/pages/settings/profile.tsx` (baris 2) dan `password.tsx` (baris 5) untuk transisi animasi notifikasi tersimpan (`<Transition show={recentlySuccessful}>`). Pertahankan.
* **`cmdk`**: **AKTIF DIGUNAKAN**  
  *Bukti*: Menjadi inti logika pencarian pada `resources/js/components/ui/command.tsx` yang dibungkus oleh `async-combobox.tsx`. Pertahankan.
* **`recharts`**: **AKTIF DIGUNAKAN**  
  *Bukti*: Digunakan untuk merender grafik statistik di `dashboard.tsx` dan `Laporan/Index.tsx`. Pertahankan.
* **`react-hot-toast`**: **AKTIF DIGUNAKAN**  
  *Bukti*: Menangani seluruh pesan notifikasi flash (sukses/gagal) di `app-layout.tsx` dan aksi transaksi. Pertahankan.
* **`tailwindcss-animate`**: **AKTIF DIGUNAKAN**  
  *Bukti*: Diimpor via `@plugin 'tailwindcss-animate';` di `resources/css/app.css` baris 3. Pertahankan.
* **`@radix-ui/react-toggle` & `@radix-ui/react-toggle-group`**: **KANDIDAT DIHAPUS (OPSIONAL)**  
  *Bukti*: Hanya dipakai di `toggle.tsx` dan `toggle-group.tsx` yang tidak diimpor modul mana pun. Jika kedua komponen UI tersebut dihapus, paket ini bisa di-uninstall via `npm uninstall @radix-ui/react-toggle @radix-ui/react-toggle-group`.
* **`optionalDependencies` (Binary Linux x64 Statis)**: **HARUS DIHAPUS DARI PACKAGE.JSON**  
  *Paket*: `@rollup/rollup-linux-x64-gnu: 4.9.5`, `@tailwindcss/oxide-linux-x64-gnu: ^4.0.1`, `lightningcss-linux-x64-gnu: ^1.29.1`.  
  *Alasan*: Mematok versi rollup platform Linux statis (4.9.5) berpotensi memicu kegagalan build pada platform lain atau CI/CD, karena npm modern secara otomatis mengunduh binary native yang sesuai dengan OS target.

### 2. Dependensi Composer (`composer.json`)
* **`barryvdh/laravel-dompdf`**: **AKTIF DIGUNAKAN**  
  *Bukti*: Dipakai di `LaporanController.php` untuk ekspor 9 modul laporan PDF via `Pdf::loadView()`. Pertahankan.
* **`phpoffice/phpspreadsheet`**: **AKTIF DIGUNAKAN**  
  *Bukti*: Dipakai di `LaporanController.php` untuk ekspor laporan data ke file Excel (`.xlsx`). Pertahankan.
* **`tightenco/ziggy`**: **AKTIF DIGUNAKAN**  
  *Bukti*: Menyediakan fungsi helper `route('nama.route')` di TypeScript/React. Pertahankan.
* **`laravel-lang/common`**: **AKTIF DIGUNAKAN**  
  *Bukti*: Menyediakan file kamus lokalisasi pesan validasi berbahasa Indonesia di folder `lang/id`. Pertahankan.
* **`laravel/sail`**: **KANDIDAT DIHAPUS (OPSIONAL DEV)**  
  *Bukti*: Tidak ada file `docker-compose.yml` di project. Bersifat dev-only. Boleh dicopot via `composer remove --dev laravel/sail`.
* **`barryvdh/laravel-ide-helper`**: **PERTAHANKAN PACKAGE, ABAIKAN FILE HASILNYA**  
  *Bukti*: Bermanfaat untuk autocompletion IDE PHP, namun file outputnya (`_ide_helper.php` dan `_ide_helper_models.php`) wajib diabaikan oleh `.gitignore`.

---

## KATEGORI F: REKOMENDASI `.GITIGNORE` & KESIAPAN GITHUB

Sebelum melakukan commit pertama (`git add .`) untuk diunggah ke GitHub, file `.gitignore` saat ini **harus diperbarui** karena belum mengabaikan beberapa file cache build, file bantu IDE besar, serta dump database mentah.

### 1. Daftar File yang TIDAK BOLEH Diunggah ke GitHub
1. `.env` (memuat informasi rahasia kredensial sistem — sudah di-ignore).
2. `_ide_helper.php` (912 KB) & `_ide_helper_models.php` (10.8 KB) (file autogenerate IDE).
3. `tsconfig.tsbuildinfo` (68.2 KB) (cache build kompilator TypeScript).
4. `database/database.sqlite` (database lokal yang berisi data dummy/transaksi lokal).
5. `database/db_perpus.sql` & `db_perpus` (dump database mentah).
6. File arsip cadangan: `resources/js.zip` & `database/migrations.zip`.
7. Seluruh skrip investigasi/scratch code: `analyze*.php`, `audit_*.php`, `test*.php`, `restore.py`, `update_react*.py`.

### 2. Rekomendasi Isi Lengkap `.gitignore` yang Bersih

```gitignore
/.phpunit.cache
/bootstrap/ssr
/node_modules
/public/build
/public/hot
/public/storage
/storage/*.key
/storage/pail
/vendor

.env
.env.*
!.env.example

.phpactor.json
.phpunit.result.cache
Homestead.json
Homestead.yaml
npm-debug.log
yarn-error.log
/auth.json
/.fleet
/.idea
/.nova
/.vscode
/.zed

# IDE Helper
_ide_helper.php
_ide_helper_models.php
.phpstorm.meta.php

# TypeScript Build Artifacts
tsconfig.tsbuildinfo

# SQLite Database & Dumps
*.sqlite
*.sqlite-journal
*.sqlite-shm
*.sqlite-wal
db_perpus
*.sql
*.sql.gz

# Archive Backups & Temporary Artifacts
*.zip
*.tar.gz
*.bak
```

---

## RENCANA TINDAKAN CLEANUP (TAHAP 2 ROADMAP)

Pembersihan disarankan dieksekusi secara bertahap dan terukur:

1. **Fase 1: Pembersihan File Sementara (Kategori A)**
   Menghapus 25 file sementara di root dan subfolder (`analyze*.php`, `audit_*.php`, `test*.php`, `restore.py`, `update_react*.py`, `SyncLegacyData.php`, `welcome.tsx`, `resources/js.zip`, `database/migrations.zip`).
2. **Fase 2: Pembersihan Komponen Duplikat & Obsolete (Kategori B)**
   Menghapus `components/ui/icon.tsx`, `components/ui/combobox.tsx`, `searchable-book-select.tsx`, `delete-user.tsx`, `appearance-dropdown.tsx`, `placeholder-pattern.tsx`, serta layout yang tidak terpakai (`app-header-layout.tsx`, `auth-card-layout.tsx`, `auth-split-layout.tsx`).
3. **Fase 3: Keputusan Modul Kategori C (Review Manual)**
   Mengonfirmasi keputusan user mengenai apakah controller auth yang tidak aktif (`register`, `forgot-password`) ingin dibersihkan atau dipertahankan sebagai cadangan.
4. **Fase 4: Optimasi Dependensi & `.gitignore`**
   - Menghapus blok `optionalDependencies` statis dari `package.json`.
   - Memperbarui file `.gitignore` sesuai rekomendasi Kategori F.
5. **Fase 5: Validasi Kualitas Penuh (Verification Gate)**
   - Menjalankan `npm run types` (wajib 0 error TypeScript).
   - Menjalankan `npm run build` (memastikan bundle Vite sukses 100%).
   - Menjalankan `php artisan test` (memastikan ke-67 test PHP tetap PASS tanpa regresi).
   - Memeriksa status git dengan `git status` untuk memastikan repositori bersih dan siap untuk inisialisasi repositori GitHub (`git init` / `git commit`).
