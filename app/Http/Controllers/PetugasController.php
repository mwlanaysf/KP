<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;


class PetugasController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');
        $users = User::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('username', 'like', "%{$search}%")
                      ->orWhere('role', 'like', "%{$search}%");
            })
            ->whereIn('role', ['admin', 'kepala_sekolah'])
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Petugas/Index', [
            'users'   => $users,
            'filters' => $request->only(['search'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Petugas/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'username' => ['required', 'string', 'max:255', Rule::unique('users')->whereNull('deleted_at')],
            'password' => 'required|string|confirmed',
            'role'     => ['required', Rule::in(['super_admin', 'admin', 'kepala_sekolah'])],
            'status'   => ['required', Rule::in(['aktif', 'nonaktif'])],
        ]);

        if ($request->role === 'super_admin' && auth()->user()->role !== 'super_admin') {
            return redirect()->back()->with('error', 'Hanya Super Admin yang dapat membuat Super Admin baru.');
        }

        User::create([
            'name'     => $request->name,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
            'status'   => $request->status,
        ]);

        $roleName = match($request->role) {
            'kepala_sekolah' => 'Kepala Sekolah',
            'super_admin' => 'Super Admin',
            default => 'Petugas',
        };

        return redirect()->route('petugas.index')->with('success', "Data {$roleName} berhasil ditambahkan.");
    }

    public function edit(User $user)
    {
        return Inertia::render('Petugas/Edit', [
            'user' => $user
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'username' => ['required', 'string', 'max:255', Rule::unique('users')->ignore($user->id)->whereNull('deleted_at')],
            'role'     => ['required', Rule::in(['super_admin', 'admin', 'kepala_sekolah'])],
            'status'   => ['required', Rule::in(['aktif', 'nonaktif'])],
            'password' => 'nullable|string|confirmed',
        ]);

        if ($request->role === 'super_admin' && auth()->user()->role !== 'super_admin') {
            return redirect()->back()->with('error', 'Hanya Super Admin yang dapat memberikan role Super Admin.');
        }
        
        if ($user->role === 'super_admin' && $request->role !== 'super_admin' && auth()->user()->role !== 'super_admin') {
            return redirect()->back()->with('error', 'Super Admin tidak dapat diubah oleh admin biasa.');
        }

        $user->name     = $request->name;
        $user->username = $request->username;
        $user->role     = $request->role;
        $user->status = $request->status;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        $roleName = match($user->role) {
            'kepala_sekolah' => 'Kepala Sekolah',
            'super_admin' => 'Super Admin',
            default => 'Petugas',
        };

        return redirect()->route('petugas.index')->with('success', "Data {$roleName} berhasil diperbarui.");
    }

    /**
     * Toggle status aktif ↔ nonaktif dengan proteksi super_admin.
     */
    public function toggleStatus(User $user)
    {
        if ($user->role === 'super_admin') {
            return redirect()->back()->with('error', 'Super Admin tidak dapat dinonaktifkan atau dihapus.');
        }

        // Toggle dua arah: active ↔ inactive
        $user->status = $user->status === 'aktif' ? 'nonaktif' : 'aktif';
        $user->save();

        $roleName = match($user->role) {
            'kepala_sekolah' => 'Kepala Sekolah',
            'super_admin' => 'Super Admin',
            default => 'Petugas',
        };
        
        $action = $user->status === 'aktif' ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->back()->with('success', "Akun {$roleName} berhasil {$action}.");
    }

    /**
     * Hapus petugas (soft delete).
     * Jika petugas memiliki histori transaksi → hanya nonaktifkan, tidak hapus.
     */
    public function destroy(User $user)
    {
        if ($user->role === 'super_admin') {
            return redirect()->back()->with('error', 'Super Admin tidak dapat dinonaktifkan atau dihapus.');
        }

        // Cek apakah petugas pernah terlibat dalam transaksi peminjaman
        // (peminjaman dibuat saat petugas login sebagai admin — diwakili dengan akun aktif)
        // Kita cek apakah ada data peminjaman/pengembalian yang terkait user ini
        // Karena sistem tidak menyimpan created_by, kita gunakan soft delete saja
        // agar histori relasi tetap aman
        $user->status = 'nonaktif';
        $user->save();
        $user->delete(); // soft delete — deleted_at diisi, data tidak hilang dari DB

        $roleName = match($user->role) {
            'kepala_sekolah' => 'Kepala Sekolah',
            'super_admin' => 'Super Admin',
            default => 'Petugas',
        };

        return redirect()->back()->with('success', "Data {$roleName} berhasil dihapus. Data transaksi tetap tersimpan.");
    }
}
