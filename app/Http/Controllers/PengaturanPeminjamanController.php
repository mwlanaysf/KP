<?php

namespace App\Http\Controllers;

use App\Models\HariLibur;
use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengaturanPeminjamanController extends Controller
{
    /**
     * Tampilkan halaman Pengaturan Peminjaman.
     */
    public function index(Request $request)
    {
        $search   = $request->get('search');

        $query = HariLibur::query()->orderBy('tanggal', 'asc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('keterangan', 'like', "%{$search}%")
                  ->orWhere('tanggal', 'like', "%{$search}%");
            });
        }

        $hari_libur = $query->paginate(10)->withQueryString();

        $pengaturan = Pengaturan::first();

        return Inertia::render('Peminjaman/Pengaturan', [
            'hari_libur'          => $hari_libur,
            'durasi_peminjaman' => $pengaturan ? $pengaturan->durasi_peminjaman : 7,
            'search'            => $search,
        ]);
    }

    /**
     * Simpan durasi peminjaman ke Cache.
     */
    public function updateDurasi(Request $request)
    {
        $request->validate([
            'durasi' => 'required|integer|min:1|max:365',
        ], [
            'durasi.required' => 'Durasi wajib diisi.',
            'durasi.min'      => 'Durasi minimal 1 hari.',
            'durasi.max'      => 'Durasi maksimal 365 hari.',
        ]);

        $pengaturan = Pengaturan::first();
        if ($pengaturan) {
            $pengaturan->update(['durasi_peminjaman' => $request->durasi]);
        } else {
            Pengaturan::create(['durasi_peminjaman' => $request->durasi, 'maksimal_pinjam' => 3, 'denda_per_hari' => 2000]);
        }

        return back()->with('success', 'Durasi peminjaman berhasil diperbarui menjadi ' . $request->durasi . ' hari.');
    }
}

