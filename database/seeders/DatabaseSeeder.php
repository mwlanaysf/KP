<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 0. MASTER DATA
        $this->call(KategoriBukuSeeder::class);
        $this->call(JurusanSeeder::class);
        $this->call(HariLiburSeeder::class);
        $this->call(PengaturanSeeder::class);

        // 1. AKUN DEFAULT (SUPER ADMIN, PETUGAS, KEPALA SEKOLAH)
        $defaultUsers = [
            [
                'username' => 'admin',
                'name'     => 'Ahmad Doni',
                'password' => Hash::make('admin'),
                'role'     => 'super_admin',
                'status'   => 'aktif',
            ],
            [
                'username' => 'petugas',
                'name'     => 'Nur Hidayah',
                'password' => Hash::make('petugas'),
                'role'     => 'admin',
                'status'   => 'aktif',
            ],
            [
                'username' => 'kepsek',
                'name'     => 'Kepala Sekolah',
                'password' => Hash::make('kepsek'),
                'role'     => 'kepala_sekolah',
                'status'   => 'aktif',
            ],
        ];

        foreach ($defaultUsers as $u) {
            DB::table('users')->updateOrInsert(
                ['username' => $u['username']],
                array_merge($u, ['created_at' => now(), 'updated_at' => now()])
            );
        }

        // 2. DATA CONTOH ANGGOTA (30 siswa, tanpa transaksi dummy)
        if (DB::table('anggota')->count() === 0) {
            $kelasList = ['X', 'XI', 'XII'];
            $namaDepan = [
                'Ahmad','Budi','Citra','Dewi','Eko','Fajar','Gita','Hana','Irfan','Joko',
                'Kartika','Lestari','Maulana','Nadia','Oki','Putri','Qori','Rizky','Sari','Tegar',
                'Umar','Vina','Wahyu','Xenia','Yudi','Zahra','Anisa','Bagas','Candra','Dita',
            ];
            $namaBelakang = [
                'Pratama','Santoso','Rahayu','Wijaya','Kusuma','Hidayat','Setiawan','Nugroho','Laksono','Purnomo',
                'Agustina','Hasanah','Saputra','Permatasari','Febrianto','Andriani','Haryadi','Sukamto','Novitasari','Firmansyah',
                'Suryadi','Hartono','Mulyono','Ardiansyah','Prasetyo','Wulandari','Indrawati','Susanto','Ningsih','Cahyono',
            ];
            $majorIds = DB::table('jurusan')->pluck('id')->toArray();
            $alamatIndonesia = [
                'Jl. Sudirman No. 12, Pemalang','Jl. Gatot Subroto No. 45, Pemalang','Jl. Pemuda No. 7, Pemalang',
                'Jl. Diponegoro No. 33, Pemalang','Jl. Ahmad Yani No. 18, Pemalang','Jl. Veteran No. 56, Pemalang',
                'Jl. Kartini No. 22, Pemalang','Jl. Imam Bonjol No. 88, Pemalang','Jl. Sulawesi No. 15, Pemalang',
                'Jl. Jawa No. 3, Pemalang','Jl. Kalimantan No. 67, Pemalang','Jl. Sumatera No. 9, Pemalang',
                'Jl. Maluku No. 41, Pemalang','Jl. Bali No. 77, Pemalang','Jl. Nusa Indah No. 55, Pemalang',
                'Jl. Melati No. 28, Pemalang','Jl. Mawar No. 14, Pemalang','Jl. Kenanga No. 39, Pemalang',
                'Jl. Anggrek No. 5, Pemalang','Jl. Dahlia No. 102, Pemalang','Jl. Flamboyan No. 17, Pemalang',
                'Jl. Cempaka No. 64, Pemalang','Jl. Teratai No. 31, Pemalang','Jl. Seruni No. 8, Pemalang',
                'Jl. Kamboja No. 50, Pemalang','Jl. Bougenville No. 23, Pemalang','Jl. Kemuning No. 11, Pemalang',
                'Jl. Tanjung No. 6, Pemalang','Jl. Merpati No. 44, Pemalang','Jl. Garuda No. 29, Pemalang',
            ];

            $anggotas = [];
            for ($i = 1; $i <= 30; $i++) {
                $anggotas[] = [
                    'kode_anggota' => 'AG' . str_pad((string) $i, 3, '0', STR_PAD_LEFT),
                    'nama'         => $namaDepan[$i - 1] . ' ' . $namaBelakang[$i - 1],
                    'jurusan_id'   => $majorIds[array_rand($majorIds)],
                    'kelas'        => $kelasList[array_rand($kelasList)],
                    'no_hp'        => '08' . rand(100000000, 999999999),
                    'alamat'       => $alamatIndonesia[$i - 1],
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ];
            }
            DB::table('anggota')->insert($anggotas);
        }

        // 3. DATA CONTOH KOLEKSI BUKU (50 judul)
        if (DB::table('buku')->count() === 0) {
            $catId = DB::table('kategori_buku')->pluck('id', 'nama')->toArray();
            $penerbitList = ['Gramedia', 'Erlangga', 'Mizan', 'Balai Pustaka', 'Bentang Pustaka', 'GPU', 'Grasindo', 'Rajawali'];
            $dataBuku = [
                ['Laskar Pelangi', 'Andrea Hirata', 'Novel', 2010],
                ['Bumi Manusia', 'Pramoedya Ananta Toer', 'Novel', 2005],
                ['Ayat-Ayat Cinta', 'Habiburrahman El Shirazy', 'Novel', 2004],
                ['Supernova', 'Dee Lestari', 'Novel', 2001],
                ['Ketika Cinta Bertasbih', 'Habiburrahman El Shirazy', 'Novel', 2007],
                ['Negeri 5 Menara', 'Ahmad Fuadi', 'Novel', 2009],
                ['Cantik Itu Luka', 'Eka Kurniawan', 'Novel', 2002],
                ['Laut Bercerita', 'Leila S. Chudori', 'Novel', 2017],
                ['Saman', 'Ayu Utami', 'Novel', 1998],
                ['Pulang', 'Tere Liye', 'Novel', 2015],
                ['Tenggelamnya Kapal Van der Wijck', 'Hamka', 'Novel', 1979],
                ['Ronggeng Dukuh Paruk', 'Ahmad Tohari', 'Novel', 1982],
                ['Di Bawah Lindungan Kabah', 'Hamka', 'Agama', 1938],
                ['Orang-Orang Bloomington', 'Budi Darma', 'Cerpen', 1980],
                ['Perempuan di Titik Nol', 'Nawal el-Saadawi', 'Novel', 1975],
                ['Pengantar Ilmu Komputer', 'Rinaldi Munir', 'Teknologi', 2016],
                ['Algoritma dan Pemrograman', 'Rinaldi Munir', 'Teknologi', 2019],
                ['Basis Data Modern', 'Fathansyah', 'Teknologi', 2018],
                ['Jaringan Komputer', 'Forouzan', 'Teknologi', 2017],
                ['Keamanan Sistem Informasi', 'William Stallings', 'Teknologi', 2020],
                ['Pemrograman Web dengan PHP', 'Luke Welling', 'Teknologi', 2021],
                ['Machine Learning Dasar', 'Aurelien Geron', 'Teknologi', 2022],
                ['Sistem Operasi Modern', 'Andrew Tanenbaum', 'Teknologi', 2015],
                ['Rekayasa Perangkat Lunak', 'Roger Pressman', 'Teknologi', 2014],
                ['Cloud Computing Essentials', 'Thomas Erl', 'Teknologi', 2020],
                ['Matematika Diskrit', 'Kenneth Rosen', 'Pelajaran', 2012],
                ['Fisika Dasar', 'Halliday & Resnick', 'Pelajaran', 2013],
                ['Kimia Organik', 'John McMurry', 'Pelajaran', 2016],
                ['Biologi Sel', 'Bruce Alberts', 'Pelajaran', 2014],
                ['Statistika Terapan', 'Walpole', 'Pelajaran', 2012],
                ['Kamus Besar Bahasa Indonesia', 'Badan Bahasa', 'Referensi', 2016],
                ['Ensiklopedia Sains', 'Tim Penulis DK', 'Referensi', 2018],
                ['Atlas Sejarah Dunia', 'Tim National Geographic', 'Referensi', 2019],
                ['Panduan EYD Terbaru', 'Badan Bahasa', 'Referensi', 2022],
                ['Kamus Inggris-Indonesia', 'John Echols', 'Referensi', 2014],
                ['Sejarah Indonesia Modern', 'M.C. Ricklefs', 'Sejarah', 2007],
                ['Revolusi Nasional Indonesia', 'Sutan Sjahrir', 'Sejarah', 2004],
                ['Perang Dunia II', 'Antony Beevor', 'Sejarah', 2012],
                ['Sejarah Peradaban Islam', 'Philip K. Hitti', 'Sejarah', 2010],
                ['Nusantara Zaman Dahulu', 'Bernard Vlekke', 'Sejarah', 2008],
                ['Biografi Soekarno', 'Cindy Adams', 'Biografi', 2011],
                ['Biografi Hatta', 'Deliar Noer', 'Biografi', 2012],
                ['Steve Jobs', 'Walter Isaacson', 'Biografi', 2011],
                ['Elon Musk', 'Ashlee Vance', 'Biografi', 2015],
                ['Nelson Mandela', 'Nelson Mandela', 'Biografi', 1995],
                ['Tafsir Al-Mishbah', 'M. Quraish Shihab', 'Agama', 2002],
                ['Fiqih Prioritas', 'Yusuf Qardhawi', 'Agama', 2008],
                ['Laskar Cinta', 'Asma Nadia', 'Cerpen', 2009],
                ['Manajemen Bisnis Modern', 'Stephen Robbins', 'Referensi', 2017],
                ['Kewirausahaan Kreatif', 'Zimmerer & Scarborough', 'Referensi', 2016],
            ];

            $buku = [];
            foreach ($dataBuku as $idx => [$judul, $pengarang, $namaKategori, $tahun]) {
                $buku[] = [
                    'kode_buku'    => 'BK' . str_pad((string) ($idx + 1), 4, '0', STR_PAD_LEFT),
                    'judul'        => $judul,
                    'pengarang'    => $pengarang,
                    'kategori_id'  => $catId[$namaKategori] ?? array_values($catId)[0],
                    'penerbit'     => $penerbitList[$idx % count($penerbitList)],
                    'tahun_terbit' => $tahun,
                    'stok'         => rand(5, 20),
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ];
            }
            DB::table('buku')->insert($buku);
        }
    }
}
