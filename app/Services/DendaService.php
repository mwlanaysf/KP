<?php

namespace App\Services;

use App\Models\HariLibur;
use Carbon\Carbon;

class DendaService
{
    /**
     * Aturan hari tutup perpustakaan: Sabtu, Minggu, dan tanggal yang terdaftar di tabel hari_libur.
     */

    /**
     * Ambil himpunan tanggal hari libur (format Y-m-d) pada rentang tertentu.
     *
     * @return array<string,int>
     */
    public static function hariLiburSet(Carbon $dari, Carbon $sampai): array
    {
        return HariLibur::whereBetween('tanggal', [$dari->toDateString(), $sampai->toDateString()])
            ->pluck('tanggal')
            ->map(fn ($d) => Carbon::parse($d)->toDateString())
            ->flip()
            ->all();
    }

    /**
     * Apakah tanggal tersebut hari tutup (Sabtu/Minggu atau hari libur terdaftar)?
     */
    public static function isHariTutup($tanggal, ?array $liburSet = null): bool
    {
        $d = Carbon::parse($tanggal)->startOfDay();

        if ($d->isWeekend()) {
            return true;
        }

        $set = $liburSet ?? self::hariLiburSet($d, $d);

        return isset($set[$d->toDateString()]);
    }

    /**
     * Kembalikan tanggal itu sendiri jika hari buka; jika hari tutup, geser ke hari buka berikutnya.
     */
    public static function hariBukaBerikutnya($tanggal): Carbon
    {
        $d = Carbon::parse($tanggal)->startOfDay();
        $set = self::hariLiburSet($d, $d->copy()->addDays(120));

        for ($i = 0; $i < 120 && self::isHariTutup($d, $set); $i++) {
            $d->addDay();
        }

        return $d;
    }

    /**
     * Hitung hari keterlambatan: hanya HARI BUKA (bukan Sabtu/Minggu/hari libur)
     * setelah tanggal jatuh tempo sampai tanggal dikembalikan yang dihitung.
     *
     * @param Carbon|string $tanggalKembali (Jatuh Tempo)
     * @param Carbon|string|null $tanggalDikembalikan (Waktu kembali riil; default hari ini)
     * @return int jumlah hari keterlambatan (0 jika belum/tidak terlambat)
     */
    public static function hitungKeterlambatan($tanggalKembali, $tanggalDikembalikan = null): int
    {
        $jatuhTempo = Carbon::parse($tanggalKembali)->startOfDay();
        $sekarang = $tanggalDikembalikan
                    ? Carbon::parse($tanggalDikembalikan)->startOfDay()
                    : Carbon::today();

        if (! $sekarang->gt($jatuhTempo)) {
            return 0; // belum terlambat
        }

        $mulai = $jatuhTempo->copy()->addDay();
        $libur = self::hariLiburSet($mulai, $sekarang);

        $hari = 0;
        for ($d = $mulai->copy(); $d->lte($sekarang); $d->addDay()) {
            if (! $d->isWeekend() && ! isset($libur[$d->toDateString()])) {
                $hari++;
            }
        }

        return $hari;
    }

    /**
     * Hitung nominal denda berdasarkan jumlah hari terlambat
     *
     * @param int $hariTerlambat
     * @return float|int nominal total denda
     */
    public static function hitungDenda(int $hariTerlambat, int $jumlahBuku = 1)
    {
        if ($hariTerlambat <= 0) {
            return 0;
        }

        // Ambil nominal dari Pengaturan (default 2000 jika tidak ada)
        $pengaturan = \App\Models\Pengaturan::first();
        $nominalPerHari = $pengaturan ? $pengaturan->denda_per_hari : 2000;
        return $hariTerlambat * $nominalPerHari * $jumlahBuku;
    }

    /**
     * Cek sisa hari sebelum jatuh tempo.
     * Mengembalikan positif jika H-x. 0 jika hari ini jatuh tempo, negatif jika terlambat.
     */
    public static function sisaHari($tanggalKembali): int
    {
        $jatuhTempo = Carbon::parse($tanggalKembali)->startOfDay();
        $hariIni = Carbon::today();

        if ($hariIni->gt($jatuhTempo)) {
            // Sudah lewat jatuh tempo
            return -((int) $hariIni->diffInDays($jatuhTempo, true));
        }

        return (int) $hariIni->diffInDays($jatuhTempo, true);
    }
}
