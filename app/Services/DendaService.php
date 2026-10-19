<?php

namespace App\Services;

use Carbon\Carbon;
use App\Models\Peminjaman;

class DendaService
{
    /**
     * Hitung hari keterlambatan berdasarkan tanggal kembali (jatuh tempo)
     * dan tanggal dikembalikan (opsional, jika tidak ada memakai now())
     * 
     * @param Carbon|string $tanggalKembali (Jatuh Tempo)
     * @param Carbon|string|null $tanggalDikembalikan (Waktu kembali riil)
     * @return int jumlah hari keterlambatan (0 jika belum/tidak terlambat)
     */
    public static function hitungKeterlambatan($tanggalKembali, $tanggalDikembalikan = null): int
    {
        $jatuhTempo = Carbon::parse($tanggalKembali)->startOfDay();
        $sekarang = $tanggalDikembalikan 
                    ? Carbon::parse($tanggalDikembalikan)->startOfDay() 
                    : Carbon::today();

        if ($sekarang->gt($jatuhTempo)) {
            return (int) $sekarang->diffInDays($jatuhTempo, true);
        }

        return 0; // belum terlambat
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
