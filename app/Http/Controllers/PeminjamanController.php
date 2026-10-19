<?php

namespace App\Http\Controllers;

use App\Models\Buku;
use App\Models\DetailPeminjaman;
use App\Models\HariLibur;
use App\Models\Peminjaman;
use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PeminjamanController extends Controller
{

    public function index(Request $request)
    {
        return redirect()->route('peminjaman.create');
    }

    public function create()
    {
        $pengaturan = Pengaturan::first();
        $durasi = $pengaturan ? $pengaturan->durasi_peminjaman : 7;
        $tanggalKembali = $this->shiftIfHariLibur(now()->addDays($durasi));

        return Inertia::render('Peminjaman/Create', [

            'kode_peminjaman'   => $this->generateKode(),
            'tanggal_pinjam'    => now()->toDateString(),
            'tanggal_kembali'   => $tanggalKembali->toDateString(),
            'durasi_peminjaman' => $durasi,

        ]);

    }

    private function generateKode()
    {

        $today = now()->format('ymd');
        $prefix = 'PMJ'.$today;

        $last = Peminjaman::where('kode_peminjaman', 'like', $prefix . '%')
            ->orderBy('id','desc')
            ->first();

        $number = 1;

        if($last && $last->kode_peminjaman){

            $lastNumber = (int)substr($last->kode_peminjaman,-3);

            $number = $lastNumber + 1;

        }

        return $prefix.str_pad($number,3,'0',STR_PAD_LEFT);

    }

    public function store(Request $request)
    {
        $pengaturan = Pengaturan::first();
        $maksimalPinjam = $pengaturan ? $pengaturan->maksimal_pinjam : 3;

        $validated = $request->validate([
            'anggota_id' => 'required|exists:anggota,id',
            'buku_id' => 'required|array|min:1|max:' . $maksimalPinjam,
            'buku_id.*' => 'required|exists:buku,id',
        ],[
            'buku_id.max' => 'Maksimal ' . $maksimalPinjam . ' buku dalam satu transaksi peminjaman.'
        ]);

        try {

            DB::transaction(function () use ($validated, $pengaturan){

                $durasi = $pengaturan ? $pengaturan->durasi_peminjaman : 7;
                $tanggalKembali = $this->shiftIfHariLibur(now()->addDays($durasi));

                $peminjaman = Peminjaman::create([

                    'kode_peminjaman' => $this->generateKode(),
                    'anggota_id'      => $validated['anggota_id'],
                    'user_id'         => auth()->id(),
                    'tanggal_pinjam'  => now(),
                    'tanggal_kembali' => $tanggalKembali,
                    'status'          => 'Dipinjam'

                ]);

                foreach ($validated['buku_id'] as $bukuId) {

                    // Atomic decrement: hanya decrement jika stok > 0 (mencegah race condition)
                    $affected = Buku::where('id', $bukuId)->where('stok', '>', 0)->decrement('stok');

                    if ($affected === 0) {
                        $buku = Buku::find($bukuId);
                        throw new \Exception("Stok buku '{$buku?->judul}' habis atau tidak ditemukan.");
                    }

                    DetailPeminjaman::create([

                        'peminjaman_id' => $peminjaman->id,
                        'buku_id' => $bukuId

                    ]);

                }

            });

            return redirect()->route('peminjaman.create')->with('success','Peminjaman berhasil ditambahkan');

        } catch (\Exception $e) {

            return redirect()->route('peminjaman.create')->with('error', $e->getMessage() ?: 'Terjadi kesalahan');

        }

    }



    public function show(Peminjaman $peminjaman)
    {
        $peminjaman->load([
            'anggota.jurusan',
            'detail_peminjaman.buku'
        ]);

        $peminjaman->jumlah_buku = $peminjaman->detail_peminjaman->count();

        return Inertia::render('Peminjaman/Show',[
            'peminjaman' => $peminjaman
        ]);
    }

    /**
     * Geser tanggal ke depan selama masih bertepatan dengan hari libur.
     */
    private function shiftIfHariLibur(Carbon $date): Carbon
    {
        $maxIterasi = 60; // safety: maksimal geser 60 hari
        $iterasi    = 0;

        while ($iterasi < $maxIterasi && HariLibur::whereDate('tanggal', $date->toDateString())->exists()) {
            $date->addDay();
            $iterasi++;
        }

        return $date;
    }

}

