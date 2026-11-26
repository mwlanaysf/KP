# Sistem Informasi Perpustakaan Sekolah

Aplikasi berbasis web untuk membantu pengelolaan perpustakaan sekolah secara digital, mulai dari pendataan buku dan anggota, pencatatan peminjaman dan pengembalian, perhitungan denda keterlambatan otomatis (melewati akhir pekan & hari libur nasional), hingga pencetakan laporan dalam bentuk PDF dan Excel.

---

## Fitur Utama

- **Dashboard Ringkas** — Menampilkan ringkasan jumlah buku, anggota, grafik peminjaman, buku terpopuler, serta daftar siswa yang terlambat mengembalikan buku.
- **3 Hak Akses Pengguna**:
  - **Super Admin** — Akses penuh seluruh sistem, mengelola akun petugas & kepala sekolah, mengatur lama peminjaman, tarif denda per hari, serta daftar hari libur.
  - **Petugas (`admin`)** — Mengelola operasional harian (tambah/edit buku, kategori, anggota, jurusan, proses peminjaman, pengembalian, denda, dan cetak laporan).
  - **Kepala Sekolah** — Akses pantau (*hanya baca*) untuk melihat dashboard, daftar buku, anggota, riwayat transaksi, dan mengunduh laporan.
- **Perhitungan Jatuh Tempo & Denda Otomatis** — Stok buku otomatis berkurang saat dipinjam dan bertambah saat dikembalikan. Jika tanggal jatuh tempo bertepatan dengan hari Sabtu, Minggu, atau hari libur terdaftar, sistem otomatis menggesernya ke hari masuk sekolah berikutnya.
- **Laporan PDF & Excel** — Rekap data buku, anggota, peminjaman, pengembalian, dan denda dapat langsung diunduh dalam format **PDF** maupun **Excel (`.xlsx`)**.

---

## Aplikasi yang Harus Terpasang di Komputer

Sebelum memasang website ini, pastikan komputer/laptop Anda sudah terinstal aplikasi berikut:

1. **XAMPP** (versi terbaru dengan PHP 8.2 ke atas) — *digunakan sebagai server lokal dan tempat penyimpanan database (MySQL).*
2. **Composer** — *digunakan untuk mengunduh komponen/library PHP yang dibutuhkan Laravel.*
3. **Node.js** — *digunakan untuk memproses tampilan antarmuka website.*
4. **Git** *(opsional)* — *digunakan untuk mengunduh proyek langsung lewat terminal (bisa juga diunduh manual lewat tombol hijau **Code -> Download ZIP** di halaman GitHub ini).*

---

## Cara Instalasi & Menjalankan Website (Langkah demi Langkah)

### Langkah 1: Unduh Kode Proyek
* **Cara Mudah (Tanpa Git):** Klik tombol hijau **`<> Code`** di bagian atas halaman GitHub ini -> pilih **`Download ZIP`** -> ekstrak file ZIP tersebut ke folder pilihan Anda (misalnya di `D:\perpustakaan`).
* **Cara via Terminal (Menggunakan Git):**
  ```bash
  git clone [https://github.com/mwlanaysf/KP.git](https://github.com/mwlanaysf/KP.git)
  cd KP
  ```

### Langkah 2: Buka Folder Proyek di Terminal
Buka aplikasi **VS Code** (atau **Command Prompt / PowerShell**), lalu arahkan ke dalam folder proyek yang baru saja Anda unduh/ekstrak.

### Langkah 3: Instal Komponen Pendukung
Jalankan dua perintah berikut secara berurutan di terminal dan tunggu hingga selesai (pastikan komputer terhubung ke internet):
```bash
composer install
npm install
```

### Langkah 4: Siapkan File Pengaturan (`.env`)
Salin file pengaturan contoh bernama `.env.example` menjadi `.env`, lalu buat kunci keamanan aplikasi dengan menjalankan perintah berikut:

* **Jika menggunakan PowerShell (Windows):**
  ```powershell
  Copy-Item .env.example .env
  php artisan key:generate
  ```
* **Jika menggunakan CMD / Git Bash / Terminal Mac/Linux:**
  ```bash
  cp .env.example .env
  php artisan key:generate
  ```

Buka file **`.env`** yang baru dibuat, lalu pastikan bagian pengaturan database tertulis seperti berikut (standar bawaan XAMPP):
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_perpus
DB_USERNAME=root
DB_PASSWORD=
```

### Langkah 5: Buat Database di phpMyAdmin
1. Buka **XAMPP Control Panel**, lalu klik tombol **Start** pada **Apache** dan **MySQL**.
2. Buka browser (Chrome/Edge) dan kunjungi alamat: **`http://localhost/phpmyadmin`**.
3. Klik menu **Baru / New** di sisi kiri, ketik nama database **`db_perpus`**, lalu klik **Buat / Create** *(biarkan isinya kosong)*.

### Langkah 6: Isi Struktur Tabel & Data Awal Otomatis
Kembali ke terminal di dalam folder proyek, lalu jalankan dua perintah ini:
```bash
php artisan migrate --seed
php artisan storage:link
```
*(Perintah pertama akan membuatkan seluruh tabel database sekaligus mengisi data awal yang diperlukan, sedangkan perintah kedua menghubungkan folder penyimpanan gambar/foto).*

### Langkah 7: Siapkan Tampilan & Jalankan Website
Jalankan perintah berikut di terminal:
```bash
npm run build
php artisan serve
```
Setelah muncul tulisan `Server running on [http://127.0.0.1:8000]`, buka browser dan ketik alamat:
👉 **`http://127.0.0.1:8000`**

*(Catatan: Jangan tutup jendela terminal selama website sedang digunakan. Jika ingin menghentikan website, tekan `Ctrl + C` di terminal).*

---

## Akun Login Bawaan

Website ini tidak memiliki halaman pendaftaran umum demi keamanan data perpustakaan. Setelah menjalankan perintah instalasi di atas, Anda dapat langsung masuk menggunakan salah satu dari 3 akun berikut:

| Jabatan / Peran | Username | Password |
|---|---|---|
| **Super Admin** | `admin` | `admin` |
| **Petugas Perpustakaan** | `petugas` | `petugas` |
| **Kepala Sekolah** | `kepalasekolah` | `kepalasekolah` |

> **Catatan Kondisi Data Awal:**
> Saat pertama kali berhasil login, daftar **Buku**, **Anggota**, dan **Transaksi Peminjaman** memang sengaja dalam keadaan **kosong (0)** agar siap diisi dengan data asli sekolah Anda. Sementara itu, data referensi dasar seperti **Kategori Buku**, **Jurusan**, **Hari Libur**, dan **3 Akun Login** di atas sudah terisi secara otomatis.
