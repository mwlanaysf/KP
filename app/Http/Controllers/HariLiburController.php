<?php

namespace App\Http\Controllers;

use App\Models\HariLibur;
use Illuminate\Http\Request;

class HariLiburController extends Controller
{
    /**
     * Simpan hari libur baru.
     */
    public function store(Request $request)
    {
        $request->validate([
            'tanggal'        => 'required|date|unique:hari_libur,tanggal',
            'keterangan' => 'required|string|max:255',
            'jenis_hari_libur' => 'required|in:nasional,sekolah',
        ], [
            'tanggal.unique'        => 'Tanggal tersebut sudah terdaftar sebagai hari libur.',
            'tanggal.required'      => 'Tanggal wajib diisi.',
            'keterangan.required' => 'Keterangan wajib diisi.',
            'jenis_hari_libur.required' => 'Jenis hari libur wajib dipilih.',
            'jenis_hari_libur.in' => 'Jenis hari libur tidak valid.',
        ]);

        HariLibur::create([
            'tanggal'        => $request->tanggal,
            'keterangan' => $request->keterangan,
            'jenis_hari_libur'        => $request->jenis_hari_libur,
        ]);

        return back()->with('success', 'Hari libur berhasil ditambahkan.');
    }

    /**
     * Perbarui hari libur.
     */
    public function update(Request $request, HariLibur $hariLibur)
    {
        $request->validate([
            'tanggal'        => 'required|date|unique:hari_libur,tanggal,' . $hariLibur->id,
            'keterangan' => 'required|string|max:255',
            'jenis_hari_libur' => 'required|in:nasional,sekolah',
        ], [
            'tanggal.unique'        => 'Tanggal tersebut sudah terdaftar sebagai hari libur.',
            'tanggal.required'      => 'Tanggal wajib diisi.',
            'keterangan.required' => 'Keterangan wajib diisi.',
            'jenis_hari_libur.required' => 'Jenis hari libur wajib dipilih.',
            'jenis_hari_libur.in' => 'Jenis hari libur tidak valid.',
        ]);

        $hariLibur->update([
            'tanggal'        => $request->tanggal,
            'keterangan' => $request->keterangan,
            'jenis_hari_libur' => $request->jenis_hari_libur,
        ]);

        return back()->with('success', 'Hari libur berhasil diperbarui.');
    }

    /**
     * Hapus hari libur.
     */
    public function destroy(HariLibur $hariLibur)
    {
        $hariLibur->delete();
        return back()->with('success', 'Hari libur berhasil dihapus.');
    }
}
