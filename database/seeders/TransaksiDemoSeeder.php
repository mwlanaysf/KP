<?php

namespace Database\Seeders;

use App\Models\Anggota;
use App\Models\Buku;
use App\Models\Denda;
use App\Models\DetailPeminjaman;
use App\Models\HariLibur;
use App\Models\Peminjaman;
use App\Models\Pengaturan;
use App\Models\Pengembalian;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransaksiDemoSeeder extends Seeder
{
    /**
     * Hapus semua transaksi lama lalu isi ulang data dummy 3 bulan ke belakang
     * dengan jumlah peminjaman aktif, keterlambatan, dan denda yang rapi untuk demo.
     */
    public function run(): void
    {
        $petugasIds = User::whereIn('role', ['admin', 'super_admin'])
            ->where('status', 'aktif')
            ->pluck('id')
            ->all();

        if (empty($petugasIds)) {
            $petugasIds = User::pluck('id')->all();
        }

        $anggotaIds = Anggota::pluck('id')->all();
        $bukuIds    = Buku::pluck('id')->all();

        if (empty($petugasIds) || empty($anggotaIds) || empty($bukuIds)) {
            $this->command->error('Master data (users / anggota / buku) kosong. Seeder dibatalkan tanpa menghapus data.');
            return;
        }

        $pengaturan = Pengaturan::first();
        $durasi     = $pengaturan ? max(1, (int) $pengaturan->durasi_peminjaman) : 7;
        $maksPinjam = $pengaturan ? max(1, (int) $pengaturan->maksimal_pinjam) : 3;
        $tarifDenda = $pengaturan ? max(0, (int) $pengaturan->denda_per_hari) : 2000;

        $liburSet = HariLibur::pluck('tanggal')
            ->map(fn ($d) => Carbon::parse($d)->toDateString())
            ->flip()
            ->all();

        $shiftLibur = function (Carbon $date) use ($liburSet): Carbon {
            $d = $date->copy()->startOfDay();
            for ($i = 0; $i < 60 && isset($liburSet[$d->toDateString()]); $i++) {
                $d->addDay();
            }
            return $d;
        };

        $now   = Carbon::now();
        $today = $now->copy()->startOfDay();

        $dailySeq = [];
        $nextKode = function (Carbon $tanggalPinjam) use (&$dailySeq): string {
            $ymd = $tanggalPinjam->format('ymd');
            $dailySeq[$ymd] = ($dailySeq[$ymd] ?? 0) + 1;
            return 'PMJ' . $ymd . str_pad((string) $dailySeq[$ymd], 3, '0', STR_PAD_LEFT);
        };

        $makeTimestamp = function (Carbon $date, int $minHour = 8, int $maxHour = 15) use ($now): Carbon {
            $t = $date->copy()->startOfDay()->setTime(rand($minHour, $maxHour), rand(0, 59), rand(0, 59));
            if ($t->gt($now)) {
                $t = $now->copy()->subMinutes(rand(5, 45));
                if ($t->lt($date->copy()->startOfDay())) {
                    $t = $now->copy()->subMinutes(1);
                }
            }
            return $t;
        };

        $pickBooks = function (int $min, int $max, array $pool) use ($maksPinjam): array {
            $count = min(rand($min, min($max, $maksPinjam)), count($pool));
            if ($count <= 0) {
                return [];
            }
            $keys = (array) array_rand($pool, $count);
            return array_map(fn ($k) => $pool[$k], $keys);
        };

        $stats = [
            'dikembalikan_tepat'   => 0,
            'dikembalikan_lunas'   => 0,
            'dikembalikan_belum'   => 0,
            'dipinjam_tepat'       => 0,
            'dipinjam_terlambat'   => 0,
            'min_denda'            => null,
            'max_denda'            => 0,
        ];

        DB::transaction(function () use (
            $petugasIds,
            $anggotaIds,
            $bukuIds,
            $durasi,
            $tarifDenda,
            $shiftLibur,
            $now,
            $today,
            $nextKode,
            $makeTimestamp,
            $pickBooks,
            &$stats
        ) {
            // 1. Kembalikan stok buku untuk peminjaman yang statusnya masih Dipinjam
            $activeDetails = DetailPeminjaman::whereHas('peminjaman', fn ($q) => $q->where('status', 'Dipinjam'))->get();
            foreach ($activeDetails as $detail) {
                Buku::withTrashed()->where('id', $detail->buku_id)->increment('stok');
            }

            // 2. Hapus semua transaksi lama sesuai urutan foreign key
            Denda::query()->delete();
            Pengembalian::query()->delete();
            DetailPeminjaman::query()->delete();
            Peminjaman::query()->delete();

            $recordDendaRange = function (int $total) use (&$stats): void {
                $stats['min_denda'] = $stats['min_denda'] === null ? $total : min($stats['min_denda'], $total);
                $stats['max_denda'] = max($stats['max_denda'], $total);
            };

            $createReturned = function (Carbon $pinjamDate, Carbon $kembaliDate, Carbon $dikembalikanDate, array $books, ?string $statusBayar) use (
                $petugasIds,
                $anggotaIds,
                $tarifDenda,
                $now,
                $nextKode,
                $makeTimestamp,
                $recordDendaRange
            ): void {
                $pinjamAt  = $makeTimestamp($pinjamDate, 8, 14);
                $kembaliAt = $makeTimestamp($dikembalikanDate, 9, 16);
                if ($kembaliAt->lt($pinjamAt)) {
                    $kembaliAt = $pinjamAt->copy()->addMinutes(rand(15, 90));
                    if ($kembaliAt->gt($now)) {
                        $kembaliAt = $now->copy();
                    }
                }

                $peminjaman = Peminjaman::create([
                    'kode_peminjaman' => $nextKode($pinjamDate),
                    'anggota_id'      => $anggotaIds[array_rand($anggotaIds)],
                    'user_id'         => $petugasIds[array_rand($petugasIds)],
                    'tanggal_pinjam'  => $pinjamDate->toDateString(),
                    'tanggal_kembali' => $kembaliDate->toDateString(),
                    'status'          => 'Dikembalikan',
                    'created_at'      => $pinjamAt,
                    'updated_at'      => $kembaliAt,
                ]);

                foreach ($books as $bukuId) {
                    DetailPeminjaman::create([
                        'peminjaman_id' => $peminjaman->id,
                        'buku_id'       => $bukuId,
                        'created_at'    => $pinjamAt,
                        'updated_at'    => $pinjamAt,
                    ]);
                }

                $terlambat = $dikembalikanDate->gt($kembaliDate)
                    ? (int) $kembaliDate->diffInDays($dikembalikanDate)
                    : 0;

                $pengembalian = Pengembalian::create([
                    'peminjaman_id'        => $peminjaman->id,
                    'user_id'              => $petugasIds[array_rand($petugasIds)],
                    'tanggal_dikembalikan' => $dikembalikanDate->toDateString(),
                    'terlambat'            => $terlambat,
                    'created_at'           => $kembaliAt,
                    'updated_at'           => $kembaliAt,
                ]);

                if ($terlambat > 0 && $statusBayar !== null) {
                    $totalDenda = $terlambat * $tarifDenda * count($books);
                    $updatedAt  = $kembaliAt->copy();
                    if ($statusBayar === 'Lunas') {
                        $bayarAt   = $kembaliAt->copy()->addHours(rand(1, 24));
                        $updatedAt = $bayarAt->gt($now) ? $now->copy()->subMinutes(rand(1, 10)) : $bayarAt;
                    }

                    Denda::create([
                        'pengembalian_id'  => $pengembalian->id,
                        'nominal_per_hari' => $tarifDenda,
                        'total_denda'      => $totalDenda,
                        'status_bayar'     => $statusBayar,
                        'created_at'       => $kembaliAt,
                        'updated_at'       => $updatedAt,
                    ]);
                    $recordDendaRange($totalDenda);
                }
            };

            // 3. 114 peminjaman selesai & tepat waktu tersebar 3 bulan terakhir (lebih ramai di bulan berjalan)
            for ($i = 0; $i < 114; $i++) {
                $daysAgo     = $i < 50 ? rand(1, 30) : rand(31, 90);
                $pinjamDate  = $today->copy()->subDays($daysAgo);
                $kembaliDate = $shiftLibur($pinjamDate->copy()->addDays($durasi));

                $maxReturnDate = $kembaliDate->lt($today) ? $kembaliDate : $today;
                $maxHoldDays   = max(1, (int) $pinjamDate->diffInDays($maxReturnDate));
                $holdDays      = rand(1, $maxHoldDays);
                $dikembalikan  = $pinjamDate->copy()->addDays($holdDays);
                if ($dikembalikan->gt($maxReturnDate)) {
                    $dikembalikan = $maxReturnDate->copy();
                }

                $books = $pickBooks(1, 3, $bukuIds);
                $createReturned($pinjamDate, $kembaliDate, $dikembalikan, $books, null);
                $stats['dikembalikan_tepat']++;
            }

            // Helper cari tanggal pinjam agar (tanggal_kembali + terlambat) jatuh di tanggal target (<= today)
            $buildLateDates = function (int $terlambatHari, int $minTargetDaysAgo, int $maxTargetDaysAgo) use ($today, $durasi, $shiftLibur): array {
                $targetReturn = $today->copy()->subDays(rand($minTargetDaysAgo, $maxTargetDaysAgo));
                $kembaliDate  = $targetReturn->copy()->subDays($terlambatHari);
                $pinjamDate   = $kembaliDate->copy()->subDays($durasi);

                $actualKembali = $shiftLibur($pinjamDate->copy()->addDays($durasi));
                $actualReturn  = $actualKembali->copy()->addDays($terlambatHari);

                for ($g = 0; $g < 60 && $actualReturn->gt($today); $g++) {
                    $pinjamDate->subDay();
                    $actualKembali = $shiftLibur($pinjamDate->copy()->addDays($durasi));
                    $actualReturn  = $actualKembali->copy()->addDays($terlambatHari);
                }

                return [$pinjamDate, $actualKembali, $actualReturn];
            };

            // 4. 10 peminjaman terlambat (1-12 hari) dengan denda LUNAS (untuk Riwayat Pembayaran Denda & Aktivitas Terbaru)
            for ($i = 0; $i < 10; $i++) {
                $terlambat = rand(1, 12);
                $minAgo    = $i < 4 ? 0 : 11;
                $maxAgo    = $i < 4 ? 10 : 75;
                [$pinjamDate, $kembaliDate, $dikembalikan] = $buildLateDates($terlambat, $minAgo, $maxAgo);

                $books = $pickBooks(1, 2, $bukuIds);
                $createReturned($pinjamDate, $kembaliDate, $dikembalikan, $books, 'Lunas');
                $stats['dikembalikan_lunas']++;
            }

            // 5. TEPAT 10 peminjaman terlambat (1-14 hari) dengan denda BELUM LUNAS
            for ($i = 0; $i < 10; $i++) {
                $terlambat = rand(1, 14);
                $minAgo    = $i < 5 ? 0 : 15;
                $maxAgo    = $i < 5 ? 12 : 45;
                [$pinjamDate, $kembaliDate, $dikembalikan] = $buildLateDates($terlambat, $minAgo, $maxAgo);

                $books = $pickBooks(1, 2, $bukuIds);
                $createReturned($pinjamDate, $kembaliDate, $dikembalikan, $books, 'Belum Lunas');
                $stats['dikembalikan_belum']++;
            }

            // Helper buat peminjaman aktif (Dipinjam) sambil mengurangi stok buku secara aman
            $createActive = function (Carbon $pinjamDate, Carbon $kembaliDate) use (
                $petugasIds,
                $anggotaIds,
                $nextKode,
                $makeTimestamp
            ): void {
                $availableIds = Buku::where('stok', '>', 0)->pluck('id')->all();
                if (empty($availableIds)) {
                    throw new \RuntimeException('Stok seluruh buku 0, tidak bisa membuat transaksi Dipinjam.');
                }

                $count = min(rand(1, 2), count($availableIds));
                $keys  = (array) array_rand($availableIds, $count);
                $books = array_map(fn ($k) => $availableIds[$k], $keys);

                $pinjamAt = $makeTimestamp($pinjamDate, 8, 15);

                $peminjaman = Peminjaman::create([
                    'kode_peminjaman' => $nextKode($pinjamDate),
                    'anggota_id'      => $anggotaIds[array_rand($anggotaIds)],
                    'user_id'         => $petugasIds[array_rand($petugasIds)],
                    'tanggal_pinjam'  => $pinjamDate->toDateString(),
                    'tanggal_kembali' => $kembaliDate->toDateString(),
                    'status'          => 'Dipinjam',
                    'created_at'      => $pinjamAt,
                    'updated_at'      => $pinjamAt,
                ]);

                foreach ($books as $bukuId) {
                    $affected = Buku::where('id', $bukuId)->where('stok', '>', 0)->decrement('stok');
                    if ($affected === 0) {
                        throw new \RuntimeException("Gagal mengurangi stok buku ID {$bukuId}.");
                    }
                    DetailPeminjaman::create([
                        'peminjaman_id' => $peminjaman->id,
                        'buku_id'       => $bukuId,
                        'created_at'    => $pinjamAt,
                        'updated_at'    => $pinjamAt,
                    ]);
                }
            };

            // 6. 8 peminjaman masih Dipinjam & BELUM jatuh tempo
            for ($i = 0; $i < 8; $i++) {
                $pinjamDate  = $today->copy()->subDays(rand(0, max(0, $durasi - 1)));
                $kembaliDate = $shiftLibur($pinjamDate->copy()->addDays($durasi));
                for ($g = 0; $g < 30 && $kembaliDate->lt($today); $g++) {
                    $pinjamDate->addDay();
                    $kembaliDate = $shiftLibur($pinjamDate->copy()->addDays($durasi));
                }

                $createActive($pinjamDate, $kembaliDate);
                $stats['dipinjam_tepat']++;
            }

            // 7. 8 peminjaman masih Dipinjam & SUDAH TERLAMBAT (1-14 hari lewat jatuh tempo)
            for ($i = 0; $i < 8; $i++) {
                $targetTerlambat = rand(1, 14);
                $pinjamDate      = $today->copy()->subDays($durasi + $targetTerlambat);
                $kembaliDate     = $shiftLibur($pinjamDate->copy()->addDays($durasi));

                for ($g = 0; $g < 30 && $kembaliDate->gte($today); $g++) {
                    $pinjamDate->subDay();
                    $kembaliDate = $shiftLibur($pinjamDate->copy()->addDays($durasi));
                }
                for ($g = 0; $g < 30 && (int) $kembaliDate->diffInDays($today) > 14; $g++) {
                    $pinjamDate->addDay();
                    $kembaliDate = $shiftLibur($pinjamDate->copy()->addDays($durasi));
                }

                $createActive($pinjamDate, $kembaliDate);
                $stats['dipinjam_terlambat']++;
            }
        });

        $totalPinjam = $stats['dikembalikan_tepat'] + $stats['dikembalikan_lunas'] + $stats['dikembalikan_belum']
            + $stats['dipinjam_tepat'] + $stats['dipinjam_terlambat'];
        $totalDipinjam = $stats['dipinjam_tepat'] + $stats['dipinjam_terlambat'];
        $minRp = number_format((int) ($stats['min_denda'] ?? 0), 0, ',', '.');
        $maxRp = number_format((int) $stats['max_denda'], 0, ',', '.');

        $this->command->info('Transaksi lama dibersihkan dan data dummy baru berhasil dibuat:');
        $this->command->info("- Total Peminjaman : {$totalPinjam} transaksi (3 bulan terakhir)");
        $this->command->info("- Masih Dipinjam   : {$totalDipinjam} ({$stats['dipinjam_tepat']} tepat waktu, {$stats['dipinjam_terlambat']} terlambat 1-14 hari)");
        $this->command->info("- Dikembalikan     : " . ($stats['dikembalikan_tepat'] + $stats['dikembalikan_lunas'] + $stats['dikembalikan_belum']) . " ({$stats['dikembalikan_tepat']} tepat waktu)");
        $this->command->info("- Denda Belum Lunas: {$stats['dikembalikan_belum']} (tampil di menu Denda & KPI)");
        $this->command->info("- Denda Lunas      : {$stats['dikembalikan_lunas']} (tampil di Riwayat Pembayaran Denda)");
        $this->command->info("- Rentang Denda    : Rp {$minRp} - Rp {$maxRp}");
    }
}
