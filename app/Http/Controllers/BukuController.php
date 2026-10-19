<?php

namespace App\Http\Controllers;

use App\Models\Buku;
use App\Models\KategoriBuku;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class BukuController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');
        $sortBy = $request->get('sortBy', 'id');
        $sortDir = $request->get('sortDir', 'desc');

        $allowedSorts = [
            'id','kode_buku','judul','pengarang','kategori_id',
            'penerbit','tahun_terbit','stok','created_at', 'detail_peminjaman_count'
        ];

        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'id';
        }

        $query = Buku::with('kategori')->withCount('detail_peminjaman');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('kode_buku','like',"%{$search}%")
                  ->orWhere('judul','like',"%{$search}%")
                  ->orWhere('pengarang','like',"%{$search}%")
                  ->orWhereHas('kategori', function($qCat) use ($search) {
                      $qCat->where('name', 'like', "%{$search}%");
                  })
                  ->orWhere('penerbit','like',"%{$search}%");
            });
        }

        $buku = $query->orderBy($sortBy,$sortDir)->paginate(10);

        return Inertia::render('Buku/Index',[
            'buku'=>$buku,
            'search'=>$search,
            'sortBy'=>$sortBy,
            'sortDir'=>$sortDir
        ]);
    }

    public function show(Buku $buku)
    {
        return redirect()->route('buku.index');
    }

    public function search(Request $request)
    {
        $q = $request->query('q');
        $exclude = $request->query('exclude');
        $id = $request->query('id');
        $kode_buku = $request->query('kode_buku');

        if ($kode_buku) {
            $buku = Buku::where('kode_buku', $kode_buku)->first();

            if (!$buku) {
                return response()->json([]);
            }

            return response()->json([
                [
                    'id' => $buku->id,
                    'kode_buku' => $buku->kode_buku,
                    'judul' => $buku->judul,
                    'pengarang' => $buku->pengarang,
                    'tahun_terbit' => $buku->tahun_terbit,
                    'stok' => $buku->stok,
                    'label' => "{$buku->kode_buku} - {$buku->judul}",
                    'disabled' => $buku->stok <= 0
                ]
            ]);
        }

        if ($id) {

            $buku = Buku::find($id);

            if (!$buku) {
                return response()->json([]);
            }

            return response()->json([
                [
                    'id' => $buku->id,
                    'kode_buku' => $buku->kode_buku,
                    'judul' => $buku->judul,
                    'pengarang' => $buku->pengarang,
                    'tahun_terbit' => $buku->tahun_terbit,
                    'stok' => $buku->stok,
                    'label' => "{$buku->kode_buku} - {$buku->judul}",
                    'disabled' => $buku->stok <= 0
                ]
            ]);
        }

        $query = Buku::query();

        if ($exclude) {
            $excludeIds = explode(',', $exclude);
            $query->whereNotIn('id', $excludeIds);
        }

        if ($q) {
            $query->where(function ($s) use ($q) {
                $s->where('kode_buku','like',"%{$q}%")
                  ->orWhere('judul','like',"%{$q}%")
                  ->orWhere('pengarang','like',"%{$q}%");
            });
        }

        $buku = $query
            ->orderBy('judul','asc')
            ->limit(10)
            ->get();

        return response()->json(
            $buku->map(function ($b) {
                return [
                    'id' => $b->id,
                    'label' => "{$b->kode_buku} - {$b->judul} ({$b->pengarang})",
                    'disabled' => $b->stok <= 0
                ];
            })
        );
    }

    public function create()
    {
        $last = Buku::where('kode_buku', 'like', 'BK%')->orderBy('id','desc')->first();

        if(!$last){
            $kode = 'BK001';
        }else{
            $num = (int) substr($last->kode_buku,2);
            $num++;
            $kode = 'BK'.str_pad($num,3,'0',STR_PAD_LEFT);
        }

        return Inertia::render('Buku/Create',[
            'kode_buku' => $kode,
            'kategori_buku' => KategoriBuku::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_buku'=>'required|unique:buku,kode_buku',
            'judul'=>'required|string|max:255',
            'pengarang'=>'required|string|max:255',
            'kategori_id'=>'required|exists:kategori_buku,id',
            'penerbit'=>'required|string|max:255',
            'tahun_terbit'=>'required|integer|min:1901|max:2155',
            'stok'=>'required|integer|min:1',
        ]);

        Buku::create($validated);

        return redirect()->route('buku.index')->with('success', 'Buku berhasil ditambahkan');
    }

    public function edit(Buku $buku)
    {
        return Inertia::render('Buku/Edit',[
            'buku'=>$buku,
            'kategori_buku'=>KategoriBuku::all()
        ]);
    }

    public function update(Request $request,Buku $buku)
    {
        $validated = $request->validate([
            'kode_buku'=>'required|unique:buku,kode_buku,'.$buku->id,
            'judul'=>'required|string|max:255',
            'pengarang'=>'required|string|max:255',
            'kategori_id'=>'required|exists:kategori_buku,id',
            'penerbit'=>'required|string|max:255',
            'tahun_terbit'=>'required|integer|min:1901|max:2155',
            'stok'=>'required|integer|min:1',
        ]);

        $buku->update($validated);

        return redirect()->route('buku.index')->with('success', 'Buku berhasil diperbarui');
    }

    public function destroy(Buku $buku)
    {
        $isBorrowed = \App\Models\DetailPeminjaman::where('buku_id', $buku->id)
            ->whereHas('peminjaman', function ($q) {
                $q->where('status', 'Dipinjam');
            })->exists();

        if ($isBorrowed) {
            return redirect()->route('buku.index')->with('error', 'Buku tidak dapat dihapus karena masih dalam status sedang dipinjam.');
        }

        $buku->delete();

        return redirect()->route('buku.index')->with('success', 'Buku berhasil dihapus');
    }
}
