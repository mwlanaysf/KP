<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pengembalian;
use App\Models\Peminjaman;
use App\Models\DetailPeminjaman;
use App\Models\Buku;
use App\Models\Denda;
use App\Models\Pengaturan;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Services\DendaService;

class PengembalianController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');
        $sortBy = $request->get('sortBy', 'id');
        $sortDir = $request->get('sortDir', 'desc');

        // Note: although this is PengembalianController, we are returning active Peminjaman
        $allowedSorts = ['id', 'kode_peminjaman', 'tanggal_pinjam', 'tanggal_kembali', 'status', 'jumlah_buku', 'nama'];

        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'id';
        }

        $query = Peminjaman::with([
            'anggota',
            'detail_peminjaman.buku'
        ])->withCount([
            'detail_peminjaman as jumlah_buku'
        ])->where('status', '!=', 'Dikembalikan');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('kode_peminjaman', 'like', "%{$search}%")
                ->orWhereHas('anggota', function ($sub) use ($search) {
                    $sub->where('nama', 'like', "%{$search}%")
                        ->orWhere('kode_anggota', 'like', "%{$search}%");
                });
            });
        }

        if ($sortBy === 'nama') {
            $query->join('anggota', 'peminjaman.anggota_id', '=', 'anggota.id')
                ->orderBy('anggota.nama', $sortDir)
                ->select('peminjaman.*');
        } elseif ($sortBy === 'jumlah_buku') {
            $query->orderBy('jumlah_buku', $sortDir);
        } else {
            $query->orderBy($sortBy, $sortDir);
        }

        $peminjaman = $query
            ->paginate(10)
            ->withQueryString();

        // Hari terlambat hanya menghitung hari buka (Sabtu/Minggu/hari libur dilewati)
        $peminjaman->getCollection()->transform(function ($p) {
            $p->hari_terlambat = $p->tanggal_kembali
                ? DendaService::hitungKeterlambatan($p->tanggal_kembali)
                : 0;
            return $p;
        });

        return Inertia::render('Pengembalian/Index', [
            'peminjaman' => $peminjaman,
            'search' => $search,
            'sortBy' => $sortBy,
            'sortDir' => $sortDir
        ]);
    }

    public function show(Pengembalian $pengembalian)
    {
        $pengembalian->load([
            'peminjaman.anggota:id,kode_anggota,nama,kelas,jurusan_id,deleted_at',
            'peminjaman.anggota.jurusan',
            'peminjaman.detail_peminjaman.buku',
            'denda',
        ]);

        $jumlahBuku = $pengembalian->peminjaman
            ? $pengembalian->peminjaman->detail_peminjaman->count()
            : 0;

        $today = Carbon::today();
        $jatuhTempo = $pengembalian->peminjaman?->tanggal_kembali
            ? Carbon::parse($pengembalian->peminjaman->tanggal_kembali)->startOfDay()
            : null;
        $dikembalikan = $pengembalian->tanggal_dikembalikan
            ? Carbon::parse($pengembalian->tanggal_dikembalikan)->startOfDay()
            : null;

        if ($jatuhTempo && $dikembalikan) {
            $statusPengembalian = ($pengembalian->terlambat ?? 0) > 0 ? 'Terlambat' : 'Tepat waktu';
        } elseif ($jatuhTempo && !$dikembalikan) {
            $statusPengembalian = DendaService::hitungKeterlambatan($jatuhTempo, $today) > 0 ? 'Terlambat' : 'Dipinjam';
        } else {
            $statusPengembalian = $dikembalikan ? 'Tepat waktu' : 'Dipinjam';
        }

        // Load relasi denda di awal
        $pengembalian->load('denda');

        // Pastikan denda hanya ada jika terlambat
        $terlambat = $pengembalian->terlambat ?? 0;

        if ($terlambat > 0) {
            $pengaturan = Pengaturan::first();
            $nominalPerHari = $pengaturan ? $pengaturan->denda_per_hari : 2000;
            $totalDenda = $terlambat * $nominalPerHari * $jumlahBuku;
            $statusBayar = 'Belum Lunas';

            if ($pengembalian->denda) {
                // Hanya update nominal jika denda BELUM LUNAS
                // Jangan sentuh denda yang sudah dibayar agar data historis tetap akurat
                if ($pengembalian->denda->status_bayar !== 'Lunas') {
                    $pengembalian->denda->update([
                        'nominal_per_hari' => $nominalPerHari,
                        'total_denda'      => $totalDenda,
                    ]);
                }
            } else {
                Denda::create([
                    'pengembalian_id'  => $pengembalian->id,
                    'nominal_per_hari' => $nominalPerHari,
                    'total_denda'      => $totalDenda,
                    'status_bayar'     => $statusBayar,
                ]);
            }
        } else {
            // Jika tidak terlambat tapi ada denda, hapus denda
            if ($pengembalian->denda) {
                $pengembalian->denda->delete();
            }
        }

        // Reload semua relasi termasuk denda
        $pengembalian->load(['peminjaman.anggota:id,kode_anggota,nama,kelas,jurusan_id,deleted_at', 'peminjaman.anggota.jurusan', 'peminjaman.detail_peminjaman.buku', 'denda']);

        return Inertia::render('Pengembalian/Show', [
            'pengembalian' => $pengembalian,
            'jumlah_buku' => $jumlahBuku,
            'status_pengembalian' => $statusPengembalian,
        ]);
    }

    public function showPeminjaman(Peminjaman $peminjaman)
    {
        $peminjaman->load([
            'anggota.jurusan',
            'detail_peminjaman.buku'
        ]);

        $peminjaman->jumlah_buku = $peminjaman->detail_peminjaman->count();

        return Inertia::render('Peminjaman/Show',[
            'peminjaman' => $peminjaman,
            'source' => 'pengembalian'
        ]);
    }

    public function create()
    {
        return Inertia::render('Pengembalian/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'peminjaman_id' => 'required|exists:peminjaman,id'
        ]);

        try {

            DB::transaction(function () use ($request) {

                $peminjaman = Peminjaman::with('detail_peminjaman.buku')
                    ->findOrFail($request->peminjaman_id);

                $tanggal_dikembalikan = Carbon::now()->startOfDay();
                $tanggal_kembali = Carbon::parse($peminjaman->tanggal_kembali)->startOfDay();

                $hariTerlambat = DendaService::hitungKeterlambatan($tanggal_kembali, $tanggal_dikembalikan);


                $pengembalian = Pengembalian::create([
                    'peminjaman_id' => $peminjaman->id,
                    'user_id' => auth()->id(),
                    'tanggal_dikembalikan' => $tanggal_dikembalikan->toDateString(),
                    'terlambat' => $hariTerlambat,
                ]);

                foreach ($peminjaman->detail_peminjaman as $detail) {
                    Buku::where('id', $detail->buku_id)->increment('stok');
                }

                $peminjaman->update([
                    'status' => 'Dikembalikan'
                ]);

                if ($hariTerlambat > 0) {
                    $pengaturan = Pengaturan::first();
                    $nominalPerHari = $pengaturan ? $pengaturan->denda_per_hari : 2000;
                    $jumlahBuku = $peminjaman->detail_peminjaman->count();
                    $totalDenda = $hariTerlambat * $nominalPerHari * $jumlahBuku;

                    $denda = Denda::create([
                        'pengembalian_id'  => $pengembalian->id,
                        'nominal_per_hari' => $nominalPerHari,
                        'total_denda'      => $totalDenda,
                        'status_bayar'     => 'Belum Lunas',
                    ]);
                }

            });

            return redirect()->back()->with('success', 'Buku berhasil dikembalikan');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menyimpan pengembalian.');

        }
    }

    public function destroy(Pengembalian $pengembalian)
    {
        try {
            DB::transaction(function () use ($pengembalian) {
                // Restore peminjaman status
                $peminjaman = Peminjaman::with('detail_peminjaman')->find($pengembalian->peminjaman_id);
                
                if ($peminjaman) {
                    $peminjaman->update(['status' => 'Dipinjam']);
                    
                    // Kurangi kembali stok buku
                    foreach ($peminjaman->detail_peminjaman as $detail) {
                        Buku::where('id', $detail->buku_id)->decrement('stok');
                    }
                }

                // Hapus record denda terkait
                if ($pengembalian->denda) {
                    $pengembalian->denda->delete();
                }
                $pengembalian->delete();
            });

            return redirect()->route('pengembalian.index')->with('success', 'Data pengembalian dihapus. Status peminjaman dan stok buku telah dikembalikan.');
        } catch (\Exception $e) {
            return redirect()->route('pengembalian.index')->with('error', 'Gagal menghapus pengembalian: ' . $e->getMessage());
        }
    }
    
    /**
     * Recalculate terlambat for all pengembalian records and sync denda
     */
    public function syncDenda()
    {
        $pengembalianList = Pengembalian::with('peminjaman')->get();
        $count = 0;
        
        foreach ($pengembalianList as $pengembalian) {
            $peminjaman = $pengembalian->peminjaman;
            if (!$peminjaman) continue;
            
            // Recalculate terlambat from actual dates
            $tanggalKembali = Carbon::parse($peminjaman->tanggal_kembali)->startOfDay();
            $tanggalDikembalikan = Carbon::parse($pengembalian->tanggal_dikembalikan)->startOfDay();
            
            $terlambat = DendaService::hitungKeterlambatan($tanggalKembali, $tanggalDikembalikan);
            
            // Update terlambat field
            $pengembalian->update(['terlambat' => $terlambat]);
            
            $pengaturan = Pengaturan::first();
            $nominalPerHari = $pengaturan ? $pengaturan->denda_per_hari : 2000;
            $jumlahBuku = $peminjaman->detail_peminjaman->count();
            $totalDenda = $terlambat * $nominalPerHari * $jumlahBuku;
            
            if ($terlambat > 0) {
                if ($pengembalian->denda) {
                    // Update existing denda
                    $pengembalian->denda->update([
                        'nominal_per_hari' => $nominalPerHari,
                        'total_denda' => $totalDenda,
                    ]);
                } else {
                    // Create new denda
                    $denda = Denda::create([
                        'pengembalian_id'  => $pengembalian->id,
                        'nominal_per_hari' => $nominalPerHari,
                        'total_denda'      => $totalDenda,
                        'status_bayar'     => 'Belum Lunas',
                    ]);
                }
                $count++;
            } else {
                // Not late: remove denda if exists
                if ($pengembalian->denda) {
                    $pengembalian->denda->delete();
                }
            }
        }
        
        return redirect()->back()->with('success', 'Denda berhasil disinkronkan untuk ' . $count . ' data terlambat');
    }
}