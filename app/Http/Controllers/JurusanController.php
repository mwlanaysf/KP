<?php

namespace App\Http\Controllers;

use App\Models\Jurusan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JurusanController extends Controller
{
    public function index(Request $request)
    {
        $query = Jurusan::query();
        if ($request->has('search')) {
            $query->where('nama', 'like', '%' . $request->search . '%');
        }
        $jurusan = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Jurusan/Index', [
            'jurusan' => $jurusan,
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate(['nama' => 'required|string|max:255|unique:jurusan']);
        Jurusan::create($request->only('nama'));
        return redirect()->back()->with('success', 'Jurusan berhasil ditambahkan.');
    }

    public function update(Request $request, Jurusan $major)
    {
        $request->validate(['nama' => 'required|string|max:255|unique:jurusan,nama,' . $major->id]);
        $major->update($request->only('nama'));
        return redirect()->back()->with('success', 'Jurusan berhasil diperbarui.');
    }

    public function destroy(Jurusan $major)
    {
        if ($major->anggota()->exists()) {
            return redirect()->back()->with('error', 'Jurusan tidak dapat dihapus karena masih digunakan pada data anggota.');
        }
        $major->delete();
        return redirect()->back()->with('success', 'Jurusan berhasil dihapus.');
    }
}

