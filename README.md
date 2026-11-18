📚 Sistem Informasi Manajemen Perpustakaan - SMK Merdeka Ulujami

Aplikasi Sistem Informasi Manajemen Perpustakaan berbasis web yang dirancang khusus untuk membantu operasional dan administrasi perpustakaan di SMK Merdeka Ulujami. Sistem ini menggantikan pencatatan manual menjadi sistem digital yang terintegrasi, mulai dari pengelolaan koleksi buku, data anggota, sirkulasi peminjaman dan pengembalian, perhitungan denda otomatis (termasuk penyesuaian hari libur), hingga pembuatan laporan.

✨ Fitur Utama

🔐 Manajemen Pengguna & Hak Akses (Multi-Role)

Sistem memiliki 3 tingkatan hak akses pengguna:

Admin: Akses penuh ke seluruh fitur sistem, termasuk manajemen pengguna, konfigurasi durasi peminjaman, dan pengaturan hari libur.

Petugas: Mengelola master data (buku, kategori, anggota, jurusan), transaksi peminjaman, pengembalian, pembayaran denda, serta mencetak laporan.

Kepala Sekolah: Akses read-only untuk memantau dashboard statistik, data master, riwayat transaksi, dan mencetak laporan perpustakaan.

📦 Modul & Fungsionalitas

Dashboard Statistik: Menampilkan ringkasan total anggota, total koleksi buku, peminjaman aktif, denda belum lunas, serta grafik tren peminjaman harian.

Manajemen Master Data: Pengelolaan CRUD (Create, Read, Update, Delete) untuk Data Buku, Kategori Buku, Data Anggota (Siswa), dan Jurusan (TJKT, AKL, TBSM).

Transaksi Peminjaman: Pencatatan peminjaman buku dengan pengurangan stok buku otomatis dan validasi batas maksimal peminjaman.

Pengaturan Hari Libur Cerdas: Konfigurasi durasi peminjaman serta daftar hari libur nasional/sekolah. Tanggal jatuh tempo otomatis bergeser ke hari kerja berikutnya jika bertepatan dengan hari libur.

Transaksi Pengembalian & Denda Otomatis: Pemrosesan pengembalian buku yang otomatis mengembalikan stok buku dan menghitung nominal denda jika melewati tanggal jatuh tempo.

Riwayat Transaksi: Pencatatan log seluruh aktivitas peminjaman, pengembalian, dan pembayaran denda lengkap dengan fitur filter dan pencarian.

Cetak & Ekspor Laporan: Pembuatan laporan Anggota, Buku, Peminjaman, Pengembalian, dan Denda yang dapat diunduh dalam format PDF maupun Excel.

🛠️ Teknologi & Persyaratan Sistem (Prerequisites)

Pastikan lingkungan pengembangan (local environment) Anda telah terpasang komponen berikut sebelum menjalankan proyek ini:

PHP >= 8.1 / 8.2 (dengan ekstensi standar Laravel: BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML, GD / Imagick)

Composer (Dependency Manager untuk PHP)

Node.js >= 18.x & NPM (untuk kompilasi aset frontend / Vite / Tailwind CSS)

Database: MySQL >= 8.0 atau MariaDB >= 10.4

Web Server / Local Environment: Laragon, XAMPP, atau Laravel Herd

🚀 Panduan Instalasi (Local Setup)

Ikuti langkah-langkah berikut untuk menjalankan aplikasi di komputer lokal Anda:

1. Clone Repositori

git clone https://github.com/username-anda/nama-repositori-anda.git
cd nama-repositori-anda


2. Instal Dependensi Backend (PHP)

composer install


3. Instal Dependensi Frontend (JavaScript/CSS)

npm install


4. Konfigurasi File Environment (.env)

Salin file .env.example menjadi .env:

cp .env.example .env


Buka file .env dan sesuaikan konfigurasi database Anda (misalnya nama database db_perpus):

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_perpus
DB_USERNAME=root
DB_PASSWORD=


5. Generate Application Key

php artisan key:generate


6. Migrasi Database (dan Seeder jika tersedia)

Pastikan Anda sudah membuat database kosong bernama db_perpus di MySQL/phpMyAdmin, lalu jalankan perintah:

php artisan migrate --seed


(Gunakan php artisan migrate saja apabila belum membuat file seeder)

7. Build Aset Frontend & Jalankan Server

Buka dua terminal atau jalankan secara berurutan:

# Untuk mode development (hot reload)
npm run dev

# Atau untuk build produksi
npm run build


Jalankan server lokal Laravel:

php artisan serve


Akses aplikasi melalui browser di alamat: http://127.0.0.1:8000

🗄️ Struktur Basis Data (db_perpus)

Sistem ini menggunakan 11 tabel utama yang saling berelasi:

users — Menyimpan data akun dan peran (Admin, Petugas, Kepala Sekolah).

jurusan — Data master jurusan sekolah.

anggota — Data siswa yang terdaftar sebagai anggota perpustakaan.

kategori_buku — Klasifikasi kategori koleksi buku.

buku — Data inventaris dan stok buku.

peminjaman & detail_peminjaman — Data header dan rincian buku per transaksi peminjaman.

pengembalian — Data transaksi pengembalian dan jumlah hari keterlambatan.

denda — Data tagihan dan status pembayaran denda keterlambatan.

pengaturan_peminjaman — Konfigurasi durasi pinjam, maksimal pinjam, dan tarif denda per hari.

hari_libur — Kalender hari libur nasional dan sekolah.

👨‍💻 Informasi Pengembang

Proyek ini dikembangkan sebagai bagian dari Laporan Kerja Praktek (KP):

Nama: M. Maulana Yusuf

NIM: 2022150047

Program Studi: Teknik Informatika

Fakultas: Fakultas Teknik dan Ilmu Komputer

Institusi: Universitas Sains Al-Qur'an (UNSIQ) Jawa Tengah di Wonosobo

Lokasi Kerja Praktek: SMK Merdeka Ulujami, Kabupaten Pemalang

📄 Lisensi

Proyek ini dikembangkan untuk keperluan akademik dan operasional internal SMK Merdeka Ulujami.
