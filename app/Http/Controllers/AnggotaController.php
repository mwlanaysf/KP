<?php

namespace App\Http\Controllers;

use App\Models\Anggota;
use App\Models\Jurusan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AnggotaController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');
        $sortBy = $request->get('sortBy', 'id');
        $sortDir = $request->get('sortDir', 'desc');

        $allowedSorts = ['id','kode_anggota','nama','no_hp','alamat','created_at', 'kelas', 'jurusan'];

        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'id';
        }

        $query = Anggota::with(['jurusan'])->select('anggota.*');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('kode_anggota','like',"%{$search}%")
                  ->orWhere('nama','like',"%{$search}%")
                  ->orWhere('alamat','like',"%{$search}%");
            });
        }

        if ($sortBy === 'jurusan') {
            $query->leftJoin('jurusan', 'anggota.jurusan_id', '=', 'jurusan.id')
                  ->orderBy('jurusan.nama', $sortDir);
        } else {
            $query->orderBy('anggota.'.$sortBy, $sortDir);
        }

        $anggota = $query
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Anggota/Index', [
            'anggota' => $anggota,
            'search' => $search,
            'sortBy' => $sortBy,
            'sortDir' => $sortDir,
        ]);
    }

    public function create()
    {
        return Inertia::render('Anggota/Create', [
            'kode_anggota' => $this->nextSequentialCode(Anggota::class, 'kode_anggota', 'AG', 3),
            'jurusan' => Jurusan::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_anggota' => 'required|string|max:50|unique:anggota,kode_anggota',
            'nama' => 'required|string|max:255',
            'jurusan_id' => 'nullable|exists:jurusan,id',
            'kelas' => 'required|in:X,XI,XII',
            'no_hp' => 'required|string|max:20',
            'alamat' => 'required|string',
        ]);

        Anggota::create($validated);

        return redirect()->route('anggota.index')->with('success', 'Anggota berhasil ditambahkan');
    }

    public function edit(Anggota $anggota)
    {
        return Inertia::render('Anggota/Edit',[
            'anggota'=>$anggota,
            'jurusan' => Jurusan::all(),
        ]);
    }

    public function update(Request $request, Anggota $anggota)
    {
        $validated = $request->validate([
            'nama'=>'required|string|max:255',
            'jurusan_id' => 'nullable|exists:jurusan,id',
            'kelas' => 'required|in:X,XI,XII',
            'no_hp'=>'required|string|max:20',
            'alamat'=>'required|string',
        ]);

        $anggota->update($validated);

        return redirect()->route('anggota.index')->with('success', 'Anggota berhasil diperbarui');
    }

    public function destroy(Anggota $anggota)
    {
        $hasActiveTransactions = $anggota->peminjaman()->where('status', 'Dipinjam')->exists();
        $hasUnpaidFines = $anggota->peminjaman()->whereHas('pengembalian.denda', function ($q) {
            $q->where('status_bayar', 'Belum Lunas');
        })->exists();

        if ($hasActiveTransactions || $hasUnpaidFines) {
            return redirect()->back()->with('error', 'Anggota tidak dapat dihapus karena masih memiliki transaksi aktif atau denda yang belum lunas.');
        }

        $anggota->delete();

        return redirect()->back()->with('success', 'Anggota berhasil dihapus');
    }

    /**
     * SEARCH UNTUK COMBOBOX
     */
    public function search(Request $request)
    {
        $q = $request->get('q');
        $id = $request->query('id');

        if ($id) {
            $a = Anggota::with(['jurusan'])->find($id);
            if (!$a) {
                return response()->json([]);
            }
            return response()->json([
                [
                    'id' => $a->id,
                    'label' => $a->kode_anggota.' - '.$a->nama.($a->kelas ? ' ('.$a->kelas.')' : '')
                ]
            ]);
        }

        $anggota = Anggota::with(['jurusan'])
            ->when($q, function ($query) use ($q) {
                $query->where(function ($sub) use ($q) {
                    $sub->where('kode_anggota', 'like', "%{$q}%")
                        ->orWhere('nama', 'like', "%{$q}%");
                });
            })
            ->orderBy('nama','asc')
            ->limit(10)
            ->get();

        return response()->json(
            $anggota->map(function ($a) {
                return [
                    'id' => $a->id,
                    'label' => $a->kode_anggota.' - '.$a->nama.($a->kelas ? ' ('.$a->kelas.')' : '')
                ];
            })->values()
        );
    }
}


