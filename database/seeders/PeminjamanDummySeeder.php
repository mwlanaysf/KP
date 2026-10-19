<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Peminjaman;
use App\Models\DetailPeminjaman;
use App\Models\Anggota;
use App\Models\Buku;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;

class PeminjamanDummySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $petugas = User::whereIn('role', ['admin', 'super_admin', 'petugas'])->first();
        if (!$petugas) {
            $this->command->info('Tidak ada user admin/petugas, skip seeding.');
            return;
        }

        $anggotaIds = Anggota::pluck('id')->toArray();
        $bukuIds = Buku::pluck('id')->toArray();

        if (empty($anggotaIds) || empty($bukuIds)) {
            $this->command->info('Data anggota atau buku kosong, skip seeding.');
            return;
        }

        $startDate = Carbon::now()->subMonths(3)->startOfMonth();
        $endDate = Carbon::now()->endOfDay();



        $currentDate = $startDate->copy();

        $totalPeminjamanCreated = 0;

        while ($currentDate <= $endDate) {
            $isWeekend = $currentDate->isWeekend();
            $numTransactions = 0;
            
            if ($isWeekend) {
                // Weekend lebih sepi
                $rand = rand(1, 100);
                if ($rand <= 30) {
                    $numTransactions = 0;
                } else if ($rand <= 80) {
                    $numTransactions = rand(1, 2);
                } else {
                    $numTransactions = rand(3, 4);
                }
            } else {
                // Weekday lebih ramai
                $rand = rand(1, 100);
                
                if ($rand <= 15) {
                    $numTransactions = 0; // 15% chance kosong
                } else if ($rand <= 50) {
                    $numTransactions = rand(1, 4); // 35% chance normal sepi
                } else if ($rand <= 85) {
                    $numTransactions = rand(5, 12); // 35% chance normal ramai
                } else {
                    $numTransactions = rand(15, 25); // 15% chance spike
                }
            }

            for ($i = 0; $i < $numTransactions; $i++) {
                // Waktu random di jam buka perpus
                $time = $currentDate->copy()->addHours(rand(8, 16))->addMinutes(rand(0, 59));
                
                $peminjaman = Peminjaman::create([
                    'kode_peminjaman' => 'PJ-' . $time->timestamp . '-' . Str::random(4) . '-' . $i,
                    'anggota_id' => $anggotaIds[array_rand($anggotaIds)],
                    'tanggal_pinjam' => $time->format('Y-m-d'),
                    'tanggal_kembali' => $time->copy()->addDays(7)->format('Y-m-d'),
                    'status' => 'Dikembalikan',
                    'created_at' => $time,
                    'updated_at' => $time,
                ]);

                \App\Models\Pengembalian::create([
                    'peminjaman_id' => $peminjaman->id,
                    'tanggal_dikembalikan' => $time->copy()->addDays(rand(1, 6))->format('Y-m-d'),
                    'terlambat' => 0,
                    'created_at' => $time,
                    'updated_at' => $time,
                ]);

                // Create detail (1-3 books per transaction)
                $numBooks = rand(1, 3);
                $selectedBooks = (array) array_rand(array_flip($bukuIds), min($numBooks, count($bukuIds)));
                
                foreach ($selectedBooks as $bukuId) {
                    DetailPeminjaman::create([
                        'peminjaman_id' => $peminjaman->id,
                        'buku_id' => $bukuId,
                        'created_at' => $time,
                        'updated_at' => $time,
                    ]);
                }

                $totalPeminjamanCreated++;
            }

            $currentDate->addDay();
        }

        $this->command->info("Berhasil menambahkan {$totalPeminjamanCreated} transaksi dummy peminjaman.");
    }
}
