<?php

namespace App\Http\Controllers;

use App\Models\Denda;
use App\Models\Pengembalian;
use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DendaController extends Controller
{
    /**
     * Menampilkan daftar denda dari peminjaman yang terlambat.
     * Menghitung denda otomatis dari keterlambatan.
     */
    public function index(Request $request)
    {
        $pengaturan = Pengaturan::first();
        $tarif = $pengaturan ? $pengaturan->denda_per_hari : 2000;
        $search = $request->get('search');
        $sortBy = $request->get('sortBy', 'id');
        $sortDir = $request->get('sortDir', 'desc');
        
        $allowedSorts = ['id', 'kode_peminjaman', 'nama_anggota', 'hari_terlambat', 'jumlah_denda', 'status_pembayaran', 'jumlah_buku'];
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'id';
        }
        
        // Query dari denda yang total_denda > 0 dan belum lunas
        $query = Denda::with(['pengembalian.peminjaman.anggota', 'pengembalian.peminjaman.detail_peminjaman.buku'])
            ->where('total_denda', '>', 0)
            ->where('status_bayar', '!=', 'Lunas');
        
        // Filter search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->whereHas('pengembalian.peminjaman.anggota', function($qq) use ($search) {
                    $qq->where('nama', 'like', "%{$search}%");
                })->orWhereHas('pengembalian.peminjaman.detail_peminjaman.buku', function($qq) use ($search) {
                    $qq->where('judul', 'like', "%{$search}%");
                });
            });
        }
        
        // Sorting kustom
        switch ($sortBy) {
            case 'kode_peminjaman':
                $query->join('pengembalian', 'denda.pengembalian_id', '=', 'pengembalian.id')
                    ->join('peminjaman', 'pengembalian.peminjaman_id', '=', 'peminjaman.id')
                    ->orderBy('peminjaman.kode_peminjaman', $sortDir)
                    ->select('denda.*');
                break;
            case 'nama_anggota':
                $query->join('pengembalian', 'denda.pengembalian_id', '=', 'pengembalian.id')
                    ->join('peminjaman', 'pengembalian.peminjaman_id', '=', 'peminjaman.id')
                    ->join('anggota', 'peminjaman.anggota_id', '=', 'anggota.id')
                    ->orderBy('anggota.nama', $sortDir)
                    ->select('denda.*');
                break;
            case 'hari_terlambat':
                $query->join('pengembalian', 'denda.pengembalian_id', '=', 'pengembalian.id')
                    ->orderBy('pengembalian.terlambat', $sortDir)
                    ->select('denda.*');
                break;
            case 'jumlah_buku':
                $query->join('pengembalian', 'denda.pengembalian_id', '=', 'pengembalian.id')
                    ->orderBy(
                    \App\Models\DetailPeminjaman::selectRaw('count(*)')
                        ->whereColumn('peminjaman_id', '=', 'pengembalian.peminjaman_id'),
                    $sortDir
                )->select('denda.*');
                break;
            case 'jumlah_denda':
                $query->orderBy('denda.total_denda', $sortDir);
                break;
            case 'status_pembayaran':
                $query->orderBy('denda.status_bayar', $sortDir);
                break;
            default:
                $query->orderBy('denda.id', $sortDir);
                break;
        }
        
        $dendaPaginator = $query->paginate(10);

        // Transform data untuk menampilkan informasi denda
        $data = $dendaPaginator->getCollection()->map(function($denda) {
            $pengembalian = $denda->pengembalian;
            $peminjaman = $pengembalian ? $pengembalian->peminjaman : null;
            $anggota = $peminjaman ? $peminjaman->anggota : null;

            return [
                // id denda untuk ke halaman detail
                'id' => $denda->id,
                'pengembalian_id' => $denda->pengembalian_id,
                'kode_peminjaman' => $peminjaman?->kode_peminjaman ?? '-',
                'nama_anggota' => $anggota?->trashed() ? 'Anggota nonaktif' : ($anggota->nama ?? '-'),
                'jumlah_buku' => $peminjaman?->detail_peminjaman?->count() ?? 0,
                'hari_terlambat' => $pengembalian?->terlambat ?? 0,
                'jumlah_denda' => $denda->total_denda,
                'status_pembayaran' => $denda->status_bayar,
            ];
        });

        $dendaPaginator->setCollection($data);

        return Inertia::render('Denda/Index', [
            'denda' => $dendaPaginator,
            'tarif_denda' => $tarif,
            'sortBy' => $sortBy,
            'sortDir' => $sortDir,
            'search' => $search,
        ]);
    }

    /**
     * Menampilkan detail denda beserta informasi peminjaman & buku.
     */
    public function show(Denda $denda)
    {
        $denda->load([
            'pengembalian.peminjaman.anggota.jurusan',
            'pengembalian.peminjaman.detail_peminjaman.buku',
        ]);

        $pengembalian = $denda->pengembalian;
        $peminjaman = $pengembalian ? $pengembalian->peminjaman : null;
        $anggota = $peminjaman ? $peminjaman->anggota : null;

        $hariTerlambat = $pengembalian?->terlambat ?? 0;
        $pengaturan = Pengaturan::first();
        $tarif = $denda->nominal_per_hari ?? ($pengaturan ? $pengaturan->denda_per_hari : 2000);
        $totalDenda = $denda->total_denda ?? ($hariTerlambat * $tarif);

        $detailBuku = $peminjaman
            ? $peminjaman->detail_peminjaman->map(function ($detail) {
                return [
                    'id' => $detail->id,
                    'kode_buku' => $detail->buku->kode_buku ?? '-',
                    'judul' => $detail->buku?->trashed() ? 'Buku sudah dihapus' : ($detail->buku->judul ?? '-'),
                    'pengarang' => $detail->buku->pengarang ?? '-',
                ];
            })->values()
            : collect();

        return Inertia::render('Denda/Show', [
            'peminjaman' => $peminjaman ? [
                'id' => $peminjaman->id,
                'kode_peminjaman' => $peminjaman->kode_peminjaman,
                'tanggal_pinjam' => $peminjaman->tanggal_pinjam,
                'tanggal_kembali' => $peminjaman->tanggal_kembali,
                'tanggal_dikembalikan' => $pengembalian?->tanggal_dikembalikan,
                'anggota' => [
                    'kode_anggota' => $anggota?->kode_anggota ?? '-',
                    'nama' => $anggota?->trashed() ? 'Anggota nonaktif' : ($anggota->nama ?? '-'),
                    'kelas' => $anggota?->kelas ?? '-',
                    'jurusan' => $anggota?->jurusan ? ['nama' => $anggota->jurusan->nama] : null,
                ],
                'detail_buku' => $detailBuku,
            ] : null,
            'denda' => [
                'id' => $denda->id,
                'pengembalian_id' => $pengembalian?->id,
                'hari_terlambat' => $hariTerlambat,
                'nominal_per_hari' => $tarif,
                'total_denda' => $totalDenda,
                'status_pembayaran' => $denda->status_bayar ?? 'Belum Bayar',
                // gunakan updated_at sebagai tanggal pembayaran saat status Lunas
                'tanggal_pembayaran' => ($denda->status_bayar === 'Lunas' && $denda->updated_at)
                    ? $denda->updated_at->toDateString()
                    : null,
            ],
        ]);
    }

    /**
     * Memperbarui status pembayaran denda (Lunas).
     */
    public function update(Request $request, Pengembalian $pengembalian)
    {
        // Cari denda terkait
        $denda = Denda::where('pengembalian_id', $pengembalian->id)->first();
        
        if ($denda) {
            $denda->update(['status_bayar' => 'Lunas']);
        }

        return redirect()->back()
            ->with('success', 'Pembayaran denda berhasil.');
    }

    /**
     * Menyetel tarif denda per hari (disimpan di session).
     */
    public function setting(Request $request)
    {
        $request->validate([
            'tarif_denda' => 'required|integer|min:0',
        ]);

        $pengaturan = Pengaturan::first();
        if ($pengaturan) {
            $pengaturan->update(['denda_per_hari' => $request->tarif_denda]);
        } else {
            Pengaturan::create(['denda_per_hari' => $request->tarif_denda, 'durasi_peminjaman' => 7, 'maksimal_pinjam' => 3]);
        }

        return back()->with('success', 'Tarif denda per hari berhasil diperbarui.');
    }

    public function destroy(Denda $denda)
    {
        if ($denda->status_bayar === 'Belum Lunas') {
            return back()->with('error', 'Denda belum lunas tidak dapat dihapus.');
        }

        $denda->delete();

        return redirect()->back()->with('success', 'Denda dihapus.');
    }
}


