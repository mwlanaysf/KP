<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─────────────────────────────────────────
        // 0. MASTER DATA
        // ─────────────────────────────────────────
        $this->call(KategoriBukuSeeder::class);
        $this->call(JurusanSeeder::class);
        $this->call(HariLiburSeeder::class);
        $this->call(PengaturanSeeder::class);

        // ─────────────────────────────────────────
        // 1. ADMIN USER & SUPER ADMIN USER
        // ─────────────────────────────────────────
        DB::table('users')->insert([
            [
                'name' => 'Ahmad Doni',
                'username'          => 'admin',
                'email'             => 'superadmin@gmail.com',
                'email_verified_at' => now(),
                'password'          => Hash::make('admin'),
                'role'              => 'super_admin',
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'name' => 'Nur Hidayah',
                'username'          => 'petugas',
                'email'             => 'admin@gmail.com',
                'email_verified_at' => now(),
                'password'          => Hash::make('petugas'),
                'role'              => 'admin',
                'created_at'        => now(),
                'updated_at'        => now(),
            ]
        ]);

        // ─────────────────────────────────────────
        // 2. 30 ANGGOTA
        // ─────────────────────────────────────────
        // Kelas format SMK: X, XI, XII + jurusan singkatan
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

        // Ambil ID semua jurusan dari tabel majors
        $majorIds = DB::table('jurusan')->pluck('id')->toArray();

        // Alamat Indonesia nyata (jalan + kelurahan + kota)
        $alamatIndonesia = [
            'Jl. Sudirman No. 12, Kel. Bendungan Hilir, Jakarta Pusat',
            'Jl. Gatot Subroto No. 45, Kel. Kuningan, Jakarta Selatan',
            'Jl. Pemuda No. 7, Kel. Rawamangun, Jakarta Timur',
            'Jl. Diponegoro No. 33, Kel. Menteng, Jakarta Pusat',
            'Jl. Asia Afrika No. 18, Kel. Braga, Bandung',
            'Jl. Dago No. 56, Kel. Lebak Siliwangi, Bandung',
            'Jl. Riau No. 22, Kel. Citarum, Bandung',
            'Jl. Pemuda No. 88, Kel. Sekayu, Semarang',
            'Jl. Pandanaran No. 15, Kel. Mugassari, Semarang',
            'Jl. Malioboro No. 3, Kel. Sosromenduran, Yogyakarta',
            'Jl. Parangtritis No. 67, Kel. Brontokusuman, Yogyakarta',
            'Jl. Tunjungan No. 9, Kel. Genteng, Surabaya',
            'Jl. Darmo No. 41, Kel. Darmo, Surabaya',
            'Jl. Basuki Rahmat No. 77, Kel. Embong Kaliasin, Surabaya',
            'Jl. Imam Bonjol No. 55, Kel. Petisah Tengah, Medan',
            'Jl. Sisingamangaraja No. 28, Kel. Teladan Barat, Medan',
            'Jl. Ratulangi No. 14, Kel. Mamajang, Makassar',
            'Jl. AP Pettarani No. 39, Kel. Tamamaung, Makassar',
            'Jl. Gajah Mada No. 5, Kel. Pontianak Kota, Pontianak',
            'Jl. Ahmad Yani No. 102, Kel. Karang Tengah, Banjarmasin',
            'Jl. Martadinata No. 17, Kel. Bungkuk, Samarinda',
            'Jl. Sudirman No. 64, Kel. Pekanbaru Kota, Pekanbaru',
            'Jl. Jenderal Ahmad Yani No. 31, Kel. Padang Barat, Padang',
            'Jl. A. Rivai No. 8, Kel. Bukit Lama, Palembang',
            'Jl. Soekarno-Hatta No. 50, Kel. Sungai Andai, Banjarmasin',
            'Jl. Veteran No. 23, Kel. Lowokwaru, Malang',
            'Jl. Ijen No. 11, Kel. Oro-Oro Dowo, Malang',
            'Jl. Hayam Wuruk No. 6, Kel. Dauh Puri, Denpasar',
            'Jl. Teuku Umar No. 44, Kel. Dauh Puri Kaja, Denpasar',
            'Jl. Pejanggik No. 29, Kel. Cakranegara, Mataram',
        ];

        $anggotas = [];
        for ($i = 1; $i <= 30; $i++) {
            $majorId   = $majorIds[array_rand($majorIds)];
            $tingkat   = $kelasList[array_rand($kelasList)];
            $anggotas[] = [
                'kode_anggota' => 'AG' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'nama'         => $namaDepan[$i - 1] . ' ' . $namaBelakang[$i - 1],
                'jurusan_id'     => $majorId,
                'kelas'        => $tingkat,
                'email'        => strtolower($namaDepan[$i - 1]) . $i . '@gmail.com',
                'no_hp'        => '08' . rand(100000000, 999999999),
                'alamat'       => $alamatIndonesia[$i - 1],
                'created_at'   => now(),
                'updated_at'   => now(),
            ];
        }
        DB::table('anggota')->insert($anggotas);

        // Ambil kategori_id berdasarkan nama kategori yang sudah di-seed
        $catId = DB::table('kategori_buku')->pluck('id', 'nama')->toArray();
        // Mapping: id kategori → Pelajaran=1, Novel=2, Komik=3, Referensi=4,
        //                        Majalah=5, Agama=6, Teknologi=7, Biografi=8, Sejarah=9, Cerpen=10

        $penerbitList = ['Gramedia', 'Erlangga', 'Mizan', 'Balai Pustaka', 'Bentang Pustaka', 'GPU', 'Grasindo', 'Rajawali'];

        // Data buku dengan pemetaan judul & kategori yang benar
        $dataBuku = [
            // Novel Sastra Indonesia
            ['Laskar Pelangi',                  'Andrea Hirata',              'Novel',     2010],
            ['Bumi Manusia',                    'Pramoedya Ananta Toer',      'Novel',     2005],
            ['Ayat-Ayat Cinta',                 'Habiburrahman El Shirazy',   'Novel',     2004],
            ['Supernova',                        'Dee Lestari',                'Novel',     2001],
            ['Ketika Cinta Bertasbih',           'Habiburrahman El Shirazy',   'Novel',     2007],
            ['Negeri 5 Menara',                  'Ahmad Fuadi',                'Novel',     2009],
            ['Cantik Itu Luka',                  'Eka Kurniawan',              'Novel',     2002],
            ['Laut Bercerita',                   'Leila S. Chudori',           'Novel',     2017],
            ['Saman',                            'Ayu Utami',                  'Novel',     1998],
            ['Pulang',                           'Tere Liye',                  'Novel',     2015],
            ['Tenggelamnya Kapal Van der Wijck', 'Hamka',                      'Novel',     1979],
            ['Ronggeng Dukuh Paruk',             'Ahmad Tohari',               'Novel',     1982],
            ['Di Bawah Lindungan Kabah',         'Hamka',                      'Agama',     1938],
            ['Orang-Orang Bloomington',          'Budi Darma',                 'Cerpen',    1980],
            ['Perempuan di Titik Nol',           'Nawal el-Saadawi',           'Novel',     1975],
            // Teknologi & Komputer
            ['Pengantar Ilmu Komputer',          'Rinaldi Munir',              'Teknologi', 2016],
            ['Algoritma dan Pemrograman',        'Rinaldi Munir',              'Teknologi', 2019],
            ['Basis Data Modern',                'Fathansyah',                 'Teknologi', 2018],
            ['Jaringan Komputer',                'Forouzan',                   'Teknologi', 2017],
            ['Keamanan Sistem Informasi',        'William Stallings',          'Teknologi', 2020],
            ['Pemrograman Web dengan PHP',       'Luke Welling',               'Teknologi', 2021],
            ['Machine Learning Dasar',           'Aurelien Geron',             'Teknologi', 2022],
            ['Sistem Operasi Modern',            'Andrew Tanenbaum',           'Teknologi', 2015],
            ['Rekayasa Perangkat Lunak',         'Roger Pressman',             'Teknologi', 2014],
            ['Cloud Computing Essentials',       'Thomas Erl',                 'Teknologi', 2020],
            // Pelajaran & Referensi
            ['Matematika Diskrit',               'Kenneth Rosen',              'Pelajaran', 2012],
            ['Fisika Dasar',                     'Halliday & Resnick',         'Pelajaran', 2013],
            ['Kimia Organik',                    'John McMurry',               'Pelajaran', 2016],
            ['Biologi Sel',                      'Bruce Alberts',              'Pelajaran', 2014],
            ['Statistika Terapan',               'Walpole',                    'Pelajaran', 2012],
            ['Kamus Besar Bahasa Indonesia',     'Badan Bahasa',               'Referensi', 2016],
            ['Ensiklopedia Sains',               'Tim Penulis DK',             'Referensi', 2018],
            ['Atlas Sejarah Dunia',              'Tim National Geographic',     'Referensi', 2019],
            ['Panduan EYD Terbaru',              'Badan Bahasa',               'Referensi', 2022],
            ['Kamus Inggris-Indonesia',          'John Echols',                'Referensi', 2014],
            // Sejarah
            ['Sejarah Indonesia Modern',         'M.C. Ricklefs',              'Sejarah',  2007],
            ['Revolusi Nasional Indonesia',      'Sutan Sjahrir',              'Sejarah',  2004],
            ['Perang Dunia II',                  'Antony Beevor',              'Sejarah',  2012],
            ['Sejarah Peradaban Islam',          'Philip K. Hitti',            'Sejarah',  2010],
            ['Nusantara Zaman Dahulu',           'Bernard Vlekke',             'Sejarah',  2008],
            // Biografi
            ['Biografi Soekarno',                'Cindy Adams',                'Biografi', 2011],
            ['Biografi Hatta',                   'Deliar Noer',                'Biografi', 2012],
            ['Steve Jobs',                       'Walter Isaacson',            'Biografi', 2011],
            ['Elon Musk',                        'Ashlee Vance',               'Biografi', 2015],
            ['Nelson Mandela',                   'Nelson Mandela',             'Biografi', 1995],
            // Agama & Cerpen
            ['Tafsir Al-Mishbah',                'M. Quraish Shihab',          'Agama',    2002],
            ['Fiqih Prioritas',                  'Yusuf Qardhawi',             'Agama',    2008],
            ['Laskar Cinta',                     'Asma Nadia',                 'Cerpen',   2009],
            ['Manajemen Bisnis Modern',          'Stephen Robbins',            'Referensi',2017],
            ['Kewirausahaan Kreatif',            'Zimmerer & Scarborough',     'Referensi',2016],
        ];

        $buku = [];
        foreach ($dataBuku as $idx => $item) {
            [$judul, $pengarang, $namaKategori, $tahun] = $item;
            $buku[] = [
                'kode_buku'    => 'BK' . str_pad($idx + 1, 4, '0', STR_PAD_LEFT),
                'judul'        => $judul,
                'pengarang'    => $pengarang,
                'kategori_id'  => $catId[$namaKategori] ?? 1,
                'penerbit'     => $penerbitList[$idx % count($penerbitList)],
                'tahun_terbit' => $tahun,
                'stok'         => rand(5, 20),
                'created_at'   => now(),
                'updated_at'   => now(),
            ];
        }
        DB::table('buku')->insert($buku);

        $anggotaIds = DB::table('anggota')->pluck('id')->toArray();
        $bukuIds    = DB::table('buku')->pluck('id')->toArray();

        // ─────────────────────────────────────────
        // 4a. 10 PEMINJAMAN AKTIF (status = Dipinjam)
        //     → akan muncul di halaman Peminjaman
        // ─────────────────────────────────────────
        for ($i = 1; $i <= 10; $i++) {
            $tanggalPinjam  = Carbon::now()->subDays(rand(1, 10));
            $tanggalKembali = (clone $tanggalPinjam)->addDays(7);

            $peminjamanId = DB::table('peminjaman')->insertGetId([
                'kode_peminjaman' => 'PMJ' . now()->format('ymd') . str_pad($i, 3, '0', STR_PAD_LEFT),
                'anggota_id'      => $anggotaIds[array_rand($anggotaIds)],
                'tanggal_pinjam'  => $tanggalPinjam->toDateString(),
                'tanggal_kembali' => $tanggalKembali->toDateString(),
                'status'          => 'Dipinjam',
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);

            // 1–2 buku per peminjaman
            $jumlahBuku  = rand(1, 2);
            $pilihanBuku = array_slice($bukuIds, ($i - 1) * 2, $jumlahBuku);
            foreach ($pilihanBuku as $bukuId) {
                DB::table('detail_peminjaman')->insert([
                    'peminjaman_id' => $peminjamanId,
                    'buku_id'       => $bukuId,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);
            }
        }

        // ─────────────────────────────────────────
        // 4b. 10 PEMINJAMAN SELESAI (status = Dikembalikan)
        //     → dipakai untuk data pengembalian & denda
        // ─────────────────────────────────────────
        $peminjamanReturnIds = [];
        for ($i = 1; $i <= 10; $i++) {
            $tanggalPinjam  = Carbon::now()->subDays(rand(20, 50));
            $tanggalKembali = (clone $tanggalPinjam)->addDays(7);

            $peminjamanId = DB::table('peminjaman')->insertGetId([
                'kode_peminjaman' => 'PMJ' . Carbon::now()->subMonth()->format('ymd') . str_pad($i, 3, '0', STR_PAD_LEFT),
                'anggota_id'      => $anggotaIds[array_rand($anggotaIds)],
                'tanggal_pinjam'  => $tanggalPinjam->toDateString(),
                'tanggal_kembali' => $tanggalKembali->toDateString(),
                'status'          => 'Dikembalikan',
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);

            // 1–2 buku per peminjaman
            $jumlahBuku  = rand(1, 2);
            $offset      = 20 + ($i - 1) * 2;
            $pilihanBuku = array_slice($bukuIds, $offset, $jumlahBuku);
            foreach ($pilihanBuku as $bukuId) {
                DB::table('detail_peminjaman')->insert([
                    'peminjaman_id' => $peminjamanId,
                    'buku_id'       => $bukuId,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);
            }

            $peminjamanReturnIds[] = ['id' => $peminjamanId, 'tanggal_kembali' => $tanggalKembali->toDateString()];
        }
        // ─────────────────────────────────────────
        // 4c. 50 TRANSAKSI DUMMY 30 HARI TERAKHIR (UNTUK CHART)
        // ─────────────────────────────────────────
        for ($i = 1; $i <= 50; $i++) {
            // Randomize past 30 days
            $tanggalPinjam  = Carbon::now()->subDays(rand(0, 29));
            $tanggalKembali = (clone $tanggalPinjam)->addDays(7);

            $peminjamanId = DB::table('peminjaman')->insertGetId([
                'kode_peminjaman' => 'PMJ' . $tanggalPinjam->format('ymd') . str_pad($i + 50, 3, '0', STR_PAD_LEFT),
                'anggota_id'      => $anggotaIds[array_rand($anggotaIds)],
                'tanggal_pinjam'  => $tanggalPinjam->toDateString(),
                'tanggal_kembali' => $tanggalKembali->toDateString(),
                'status'          => 'Dikembalikan', // just set to returned so it doesn't clutter active
                'created_at'      => $tanggalPinjam, // set created_at to simulate past records
                'updated_at'      => $tanggalKembali,
            ]);

            // 1 buku per peminjaman
            $bukuId = $bukuIds[array_rand($bukuIds)];
            DB::table('detail_peminjaman')->insert([
                'peminjaman_id' => $peminjamanId,
                'buku_id'       => $bukuId,
                'created_at'    => $tanggalPinjam,
                'updated_at'    => $tanggalKembali,
            ]);
        }

        // ─────────────────────────────────────────
        // 5. 10 PENGEMBALIAN & DENDA
        // ─────────────────────────────────────────
        for ($i = 0; $i < 10; $i++) {
            $terlambat           = rand(1, 14);
            $tanggalDikembalikan = Carbon::parse($peminjamanReturnIds[$i]['tanggal_kembali'])->addDays($terlambat);

            $pengembalianId = DB::table('pengembalian')->insertGetId([
                'peminjaman_id'        => $peminjamanReturnIds[$i]['id'],
                'tanggal_dikembalikan' => $tanggalDikembalikan->toDateString(),
                'terlambat'            => $terlambat,
                'created_at'           => now(),
                'updated_at'           => now(),
            ]);

            $nominalPerHari = 1000.00;
            $totalDenda     = $nominalPerHari * $terlambat;
            $statusBayar    = ($i < 6) ? 'Lunas' : 'Belum Lunas';

            DB::table('denda')->insert([
                'peminjaman_id'    => $peminjamanReturnIds[$i]['id'],
                'anggota_id'       => DB::table('peminjaman')->where('id', $peminjamanReturnIds[$i]['id'])->value('anggota_id'),
                'pengembalian_id'  => $pengembalianId,
                'nominal_per_hari' => $nominalPerHari,
                'total_denda'      => $totalDenda,
                'status_bayar'     => $statusBayar,
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);
        }

        // ─────────────────────────────────────────
        // 7. TRANSAKSI DUMMY BULANAN (PeminjamanDummySeeder)
        // ─────────────────────────────────────────
        $this->call(PeminjamanDummySeeder::class);
    }
}
