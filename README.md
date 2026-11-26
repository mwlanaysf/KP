# Sistem Informasi Perpustakaan Sekolah

Aplikasi berbasis web untuk mengelola operasional perpustakaan sekolah, mulai dari pendataan koleksi buku dan anggota, transaksi peminjaman dan pengembalian, perhitungan denda keterlambatan otomatis (melewati akhir pekan & hari libur), riwayat transaksi, hingga pencetakan laporan dalam format PDF dan Excel.

---

## Fitur Utama

- **Dashboard Interaktif** — Ringkasan KPI, grafik tren peminjaman, anggota teraktif, buku terpopuler, daftar keterlambatan, dan aktivitas terbaru.
- **Multi-Role Pengguna**:
  - **Super Admin** — Akses penuh seluruh fitur, kelola pengguna (Petugas & Kepala Sekolah), pengaturan durasi peminjaman, tarif denda, dan hari libur.
  - **Petugas (`admin`)** — Operasional harian (kelola buku, kategori, anggota, jurusan, peminjaman, pengembalian, denda, riwayat, dan laporan).
  - **Kepala Sekolah** — Akses pantau (*read-only*) untuk dashboard, data koleksi/anggota, riwayat transaksi, dan cetak laporan.
- **Manajemen Data Master** — CRUD Buku, Kategori Buku, Anggota, dan Jurusan (dilengkapi *soft delete* dan pembuatan kode urut otomatis).
- **Peminjaman, Pengembalian & Denda Otomatis** — Stok buku berkurang/bertambah secara atomik, tanggal jatuh tempo otomatis bergeser jika bertepatan dengan Sabtu, Minggu, atau hari libur terdaftar, serta perhitungan keterlambatan hanya menghitung hari kerja buka.
- **Riwayat Transaksi Terpadu** — Menggabungkan riwayat peminjaman, pengembalian, dan pelunasan denda secara kronologis dari yang terbaru.
- **Laporan & Ekspor Data** — Cetak laporan buku, anggota, peminjaman, pengembalian, denda, dan statistik dalam format **PDF** maupun **Excel (`.xlsx`)**.

---

## Teknologi yang Digunakan

- **Backend:** PHP 8.2+, Laravel 12
- **Frontend:** React 19, TypeScript, Inertia.js v2, Tailwind CSS v4, Radix UI, Lucide Icons, Recharts
- **Database:** MySQL / MariaDB
- **Ekspor Dokumen:** `barryvdh/laravel-dompdf` (PDF) & `phpoffice/phpspreadsheet` (Excel)

---

## Komponen & Prasyarat Sistem

Pastikan perangkat Anda telah terpasang komponen berikut sebelum melakukan instalasi:

1. **PHP >= 8.2** beserta ekstensi standar Laravel (`pdo_mysql`, `mbstring`, `openssl`, `xml`, `ctype`, `fileinfo`, `gd`, `zip`) — *sudah termasuk di paket XAMPP versi terbaru*.
2. **MySQL / MariaDB** (misalnya melalui **XAMPP** atau **Laragon**).
3. **Composer** >= 2.x *(diperlukan jika menginstal dari repositori GitHub)*.
4. **Node.js** >= 18.x & **NPM** *(diperlukan untuk mem-build aset frontend jika menginstal dari GitHub)*.
5. **Git** *(opsional, untuk melakukan clone repositori)*.

---

## Panduan Instalasi (Clone dari GitHub)

Ikuti langkah-langkah berikut di terminal (PowerShell / CMD / Bash):

### 1. Clone Repositori
```bash
git clone https://github.com/mwlanaysf/KP.git
cd KP
```

### 2. Instal Dependency PHP & JavaScript
```bash
composer install
npm install
```

### 3. Konfigurasi Environment (`.env`)
Salin file `.env.example` menjadi `.env`, lalu buat `APP_KEY`:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
php artisan key:generate
```

**Linux / macOS / Git Bash:**
```bash
cp .env.example .env
php artisan key:generate
```

Pastikan konfigurasi database di file `.env` sesuai dengan pengaturan MySQL Anda (default XAMPP):
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_perpus
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Siapkan Database MySQL
1. Nyalakan **MySQL** (dan **Apache** jika menggunakan phpMyAdmin) di XAMPP Control Panel.
2. Buka `http://localhost/phpmyadmin`, lalu buat database baru bernama **`db_perpus`**.
3. Jalankan migrasi tabel beserta data awal (*seeder*):
   ```bash
   php artisan migrate --seed
   php artisan storage:link
   ```

### 5. Build Aset Frontend & Jalankan Server
Untuk pemakaian normal / produksi (lebih ringan):
```bash
npm run build
php artisan serve
```

*(Atau jika sedang mengedit kode tampilan React, jalankan `npm run dev` di terminal terpisah bersamaan dengan `php artisan serve`.)*

Buka browser dan akses: **`http://127.0.0.1:8000`**

---

## Menjalankan dari Paket Siap Jalan (File ZIP)

Jika Anda menggunakan paket arsip `.zip` siap jalan (yang sudah menyertakan `vendor/`, `public/build/`, dan `.env`), Anda **tidak perlu** menjalankan `composer install` maupun `npm install`:

1. Ekstrak arsip `.zip`, lalu nyalakan **MySQL** di XAMPP.
2. Buat database bernama **`db_perpus`** di phpMyAdmin.
3. Jalankan `php artisan migrate --seed` di terminal dalam folder proyek *(atau import file `db_perpus.sql` melalui phpMyAdmin jika disertakan)*.
4. Jalankan `php artisan serve` dan buka **`http://127.0.0.1:8000`**.

---

## Akun Login Default

Setelah menjalankan `php artisan migrate --seed`, Anda dapat langsung masuk menggunakan akun bawaan berikut:

| Peran | Username | Password |
|---|---|---|
| **Super Admin** | `admin` | `admin` |
| **Petugas** | `petugas` | `petugas` |
| **Kepala Sekolah** | `kepsek` | `kepsek` |
