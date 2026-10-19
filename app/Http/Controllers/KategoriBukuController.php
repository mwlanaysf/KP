<?php

namespace App\Http\Controllers;

use App\Models\KategoriBuku;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KategoriBukuController extends Controller
{
    public function index(Request $request)
    {
        $query = KategoriBuku::query();
        if ($request->has('search')) {
            $query->where('nama', 'like', '%' . $request->search . '%');
        }
        $kategori_buku = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('KategoriBuku/Index', [
            'kategori_buku' => $kategori_buku,
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate(['nama' => 'required|string|max:255|unique:kategori_buku']);
        KategoriBuku::create($request->only('nama'));
        return redirect()->back()->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(Request $request, KategoriBuku $category)
    {
        $request->validate(['nama' => 'required|string|max:255|unique:kategori_buku,nama,' . $category->id]);
        $category->update($request->only('nama'));
        return redirect()->back()->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(KategoriBuku $category)
    {
        if ($category->buku()->exists()) {
            return redirect()->back()->with('error', 'Kategori tidak dapat dihapus karena masih digunakan pada data buku.');
        }
        $category->delete();
        return redirect()->back()->with('success', 'Kategori berhasil dihapus.');
    }
}
