<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\BukuController;
use App\Http\Controllers\PeminjamanController;
use App\Http\Controllers\PengembalianController;
use App\Http\Controllers\DendaController;
use App\Http\Controllers\AnggotaController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KategoriBukuController;
use App\Http\Controllers\JurusanController;

use App\Http\Controllers\HariLiburController;
use App\Http\Controllers\PengaturanPeminjamanController;

/*
|--------------------------------------------------------------------------
| Halaman Utama (FIX)
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');


/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

Route::middleware(['auth','verified'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

});


/*
|--------------------------------------------------------------------------
| Sistem Perpustakaan
|--------------------------------------------------------------------------
*/

Route::middleware(['auth','verified'])->group(function () {

    /*
    | Rute khusus Admin (Super Admin)
    */
    Route::middleware(['role:super_admin'])->group(function () {
        Route::resource('petugas', \App\Http\Controllers\PetugasController::class)
            ->parameters(['petugas' => 'user'])
            ->except(['show', 'index']);
        Route::patch('petugas/{user}/toggle-status', [\App\Http\Controllers\PetugasController::class, 'toggleStatus'])->name('petugas.toggle-status');

        // Pengaturan Peminjaman
        Route::get('/pengaturan-peminjaman', [PengaturanPeminjamanController::class, 'index'])->name('pengaturan-peminjaman.index');
        Route::post('/pengaturan-peminjaman/durasi', [PengaturanPeminjamanController::class, 'updateDurasi'])->name('pengaturan-peminjaman.durasi');

        // Hari Libur CRUD
        Route::resource('hari-libur', HariLiburController::class)->except(['create', 'edit', 'show']);
    });

    /*
    | Rute Operasional (Petugas & Admin)
    */
    Route::middleware(['role:admin,super_admin'])->group(function () {

        // Master Data
        Route::resource('kategori-buku', KategoriBukuController::class)
            ->parameters(['kategori-buku' => 'category'])
            ->except(['create', 'show', 'edit']);
            
        Route::resource('jurusan', JurusanController::class)
            ->parameters(['jurusan' => 'major'])
            ->except(['create', 'show', 'edit']);

        // Transaksi Peminjaman (CRUD)
        Route::resource('peminjaman', PeminjamanController::class)->except(['index', 'show']);

        // Transaksi Pengembalian (CRUD)
        Route::resource('pengembalian', PengembalianController::class)->except(['index', 'show']);
        Route::post('/pengembalian/sync-denda', [PengembalianController::class,'syncDenda'])->name('pengembalian.syncDenda');

        // Denda (CRUD)
        Route::resource('denda', DendaController::class)->except(['index', 'show']);
        Route::put('/pengembalian/{pengembalian}/bayar-denda', [DendaController::class,'update'])->name('denda.bayar');
        Route::post('/denda/setting', [DendaController::class,'setting'])->name('denda.setting');

        // CRUD Buku (Hanya Create, Store, Edit, Update, Destroy)
        Route::resource('buku', BukuController::class)->except(['index', 'show']);

        // CRUD Anggota (Hanya Create, Store, Edit, Update, Destroy)
        Route::resource('anggota', AnggotaController::class)
            ->parameters(['anggota' => 'anggota'])
            ->except(['index', 'show']);
    });

    /*
    | Rute yang bisa diakses Admin, Super Admin, dan Kepala Sekolah (Read-Only)
    */
    // Buku (View & Search)
    Route::get('/buku/search', [BukuController::class,'search'])->name('buku.search');
    Route::get('/buku', [BukuController::class, 'index'])->name('buku.index');

    // Anggota (View & Search)
    Route::get('/anggota/search', [AnggotaController::class,'search'])->name('anggota.search');
    Route::get('/anggota', [AnggotaController::class, 'index'])->name('anggota.index');

    // Kategori & Jurusan (Read-Only untuk kepala_sekolah)
    Route::get('/kategori-buku', [KategoriBukuController::class, 'index'])->name('kategori-buku.index');
    Route::get('/jurusan', [JurusanController::class, 'index'])->name('jurusan.index');

    // Petugas (View & Search - khusus Super Admin)
    Route::middleware(['role:super_admin'])->group(function () {
        Route::get('/petugas', [\App\Http\Controllers\PetugasController::class, 'index'])->name('petugas.index');
    });

    // Transaksi (View & Search - Admin & Petugas)
    Route::middleware(['role:admin,super_admin'])->group(function () {
        Route::get('/peminjaman/search', [PeminjamanController::class,'search'])->name('peminjaman.search');
        Route::get('/peminjaman', [PeminjamanController::class, 'index'])->name('peminjaman.index');
        Route::get('/peminjaman/{peminjaman}', [PeminjamanController::class, 'show'])->name('peminjaman.show');
        
        Route::get('/pengembalian', [PengembalianController::class, 'index'])->name('pengembalian.index');
        Route::get('/pengembalian/peminjaman/{peminjaman}', [PengembalianController::class, 'showPeminjaman'])->name('pengembalian.peminjaman.show');
        Route::get('/pengembalian/{pengembalian}', [PengembalianController::class, 'show'])->name('pengembalian.show');
        
        Route::get('/denda', [DendaController::class, 'index'])->name('denda.index');
        Route::get('/denda/{denda}', [DendaController::class, 'show'])->name('denda.show');
    });

    // Riwayat Transaksi (Admin, Petugas, & Kepala Sekolah)
    Route::middleware(['role:admin,super_admin,kepala_sekolah'])->group(function () {
        Route::get('/riwayat-transaksi', [\App\Http\Controllers\RiwayatTransaksiController::class, 'index'])->name('riwayat-transaksi.index');
        Route::get('/riwayat-transaksi/{type}/{id}', [\App\Http\Controllers\RiwayatTransaksiController::class, 'show'])->name('riwayat-transaksi.show');
    });

    /*
    | Laporan (Admin, Petugas, dan Kepala Sekolah)
    */
    Route::get('/laporan', [LaporanController::class,'index'])->name('laporan.index');
    Route::get('/laporan/pdf/{modul}', [LaporanController::class,'cetakPdf'])->name('laporan.pdf');
    Route::get('/laporan/excel/{modul}', [LaporanController::class,'cetakExcel'])->name('laporan.excel');

});


/*
|--------------------------------------------------------------------------
| Route tambahan
|--------------------------------------------------------------------------
*/

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';


/*
|--------------------------------------------------------------------------
| DEV / TESTING ROUTES
|--------------------------------------------------------------------------
*/

if (app()->environment('local')) {
    
    Route::get('/dev/set-time/{date}', function ($date) {
        \Illuminate\Support\Facades\Cache::put('testing_mock_date', $date);
        return "Waktu berhasil dibekukan ke: <b>{$date}</b>";
    });

    Route::get('/dev/reset-time', function () {
        \Illuminate\Support\Facades\Cache::forget('testing_mock_date');
        \Illuminate\Support\Carbon::setTestNow();
        return "Waktu kembali normal";
    });
}
