<?php

use App\Models\Buku;
use App\Models\Denda;
use App\Models\DetailPeminjaman;
use App\Models\Peminjaman;
use App\Models\Pengembalian;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Rabu, 18 November 2026 (hari kerja) agar perhitungan hari buka deterministik
    Carbon::setTestNow(Carbon::parse('2026-11-18 10:00:00'));
    $this->admin = User::factory()->admin()->create();
    Cache::forget('tarif_denda');
});

afterEach(function () {
    Carbon::setTestNow();
});

it('mengembalikan buku tepat waktu: stok bertambah, status jadi Dikembalikan, tidak ada denda', function () {
    $buku = Buku::factory()->create(['stok' => 3]);
    $peminjaman = Peminjaman::factory()->create([
        'status' => 'Dipinjam',
        'tanggal_kembali' => Carbon::today()->addDay(), // belum jatuh tempo
    ]);
    DetailPeminjaman::factory()->create(['peminjaman_id' => $peminjaman->id, 'buku_id' => $buku->id]);

    $response = $this->actingAs($this->admin)->post(route('pengembalian.store'), [
        'peminjaman_id' => $peminjaman->id,
    ]);

    $response->assertSessionHas('success');

    expect($buku->fresh()->stok)->toBe(4);
    $this->assertDatabaseHas('peminjaman', ['id' => $peminjaman->id, 'status' => 'Dikembalikan']);
    $this->assertDatabaseHas('pengembalian', ['peminjaman_id' => $peminjaman->id, 'terlambat' => 0]);
    $this->assertDatabaseCount('denda', 0);
});

it('mengembalikan buku terlambat otomatis membuat catatan denda', function () {
    $buku = Buku::factory()->create(['stok' => 2]);
    $peminjaman = Peminjaman::factory()->create([
        'status' => 'Dipinjam',
        'tanggal_kembali' => Carbon::today()->subDays(3), // 3 hari terlambat
    ]);
    DetailPeminjaman::factory()->create(['peminjaman_id' => $peminjaman->id, 'buku_id' => $buku->id]);

    $this->actingAs($this->admin)->post(route('pengembalian.store'), [
        'peminjaman_id' => $peminjaman->id,
    ]);

    $this->assertDatabaseHas('pengembalian', ['peminjaman_id' => $peminjaman->id, 'terlambat' => 3]);

    $pengembalian = Pengembalian::where('peminjaman_id', $peminjaman->id)->first();
    $denda = Denda::where('pengembalian_id', $pengembalian->id)->first();
    expect($denda)->not->toBeNull()
        ->and($denda->total_denda)->toEqual(3 * 2000 * 1) // 3 hari x tarif default 2000 x 1 buku
        ->and($denda->status_bayar)->toBe('Belum Lunas');
});

it('menggunakan tarif denda custom dari pengaturan saat menghitung denda', function () {
    \App\Models\Pengaturan::create(['durasi_peminjaman' => 7, 'maksimal_pinjam' => 3, 'denda_per_hari' => 5000]);

    $buku = Buku::factory()->create(['stok' => 1]);
    $peminjaman = Peminjaman::factory()->create([
        'status' => 'Dipinjam',
        'tanggal_kembali' => Carbon::today()->subDays(2),
    ]);
    DetailPeminjaman::factory()->create(['peminjaman_id' => $peminjaman->id, 'buku_id' => $buku->id]);

    $this->actingAs($this->admin)->post(route('pengembalian.store'), [
        'peminjaman_id' => $peminjaman->id,
    ]);

    $pengembalian = Pengembalian::where('peminjaman_id', $peminjaman->id)->first();
    $denda = Denda::where('pengembalian_id', $pengembalian->id)->first();
    expect($denda->total_denda)->toEqual(2 * 5000 * 1);
});

it('validasi: peminjaman_id wajib diisi dan harus ada di tabel peminjaman', function () {
    $response = $this->actingAs($this->admin)->post(route('pengembalian.store'), [
        'peminjaman_id' => 99999,
    ]);

    $response->assertSessionHasErrors('peminjaman_id');
});

it('menghapus pengembalian mengembalikan status peminjaman & mengurangi kembali stok', function () {
    $buku = Buku::factory()->create(['stok' => 5]);
    $peminjaman = Peminjaman::factory()->create(['status' => 'Dikembalikan']);
    DetailPeminjaman::factory()->create(['peminjaman_id' => $peminjaman->id, 'buku_id' => $buku->id]);
    $pengembalian = Pengembalian::factory()->create(['peminjaman_id' => $peminjaman->id]);

    $response = $this->actingAs($this->admin)->delete(route('pengembalian.destroy', $pengembalian));

    $response->assertRedirect(route('pengembalian.index'));
    $this->assertDatabaseHas('peminjaman', ['id' => $peminjaman->id, 'status' => 'Dipinjam']);
    expect($buku->fresh()->stok)->toBe(4);
    $this->assertDatabaseMissing('pengembalian', ['id' => $pengembalian->id]);
});

it('menghapus pengembalian juga menghapus denda yang terkait', function () {
    $peminjaman = Peminjaman::factory()->create(['status' => 'Dikembalikan']);
    $pengembalian = Pengembalian::factory()->create(['peminjaman_id' => $peminjaman->id, 'terlambat' => 2]);
    $denda = Denda::factory()->create([
        'pengembalian_id' => $pengembalian->id,
    ]);

    $this->actingAs($this->admin)->delete(route('pengembalian.destroy', $pengembalian));

    $this->assertDatabaseMissing('denda', ['id' => $denda->id]);
});

it('halaman show pengembalian membuat denda otomatis jika terlambat', function () {
    $buku = Buku::factory()->create();
    $peminjaman = Peminjaman::factory()->create(['status' => 'Dikembalikan']);
    DetailPeminjaman::factory()->create(['peminjaman_id' => $peminjaman->id, 'buku_id' => $buku->id]);
    $pengembalian = Pengembalian::factory()->create([
        'peminjaman_id' => $peminjaman->id,
        'terlambat' => 4,
    ]);

    $response = $this->actingAs($this->admin)->get(route('pengembalian.show', $pengembalian));

    $response->assertOk();
    $this->assertDatabaseHas('denda', [
        'pengembalian_id' => $pengembalian->id,
        'total_denda' => 4 * 2000 * 1,
    ]);
});

it('Sabtu dan Minggu tidak dihitung terlambat saat pengembalian', function () {
    // Hari ini Senin 16 Nov 2026, jatuh tempo Jumat 13 Nov -> hanya Senin yang dihitung (1 hari)
    Carbon::setTestNow(Carbon::parse('2026-11-16 10:00:00'));

    $buku = Buku::factory()->create(['stok' => 2]);
    $peminjaman = Peminjaman::factory()->create([
        'status' => 'Dipinjam',
        'tanggal_kembali' => '2026-11-13',
    ]);
    DetailPeminjaman::factory()->create(['peminjaman_id' => $peminjaman->id, 'buku_id' => $buku->id]);

    $this->actingAs($this->admin)->post(route('pengembalian.store'), [
        'peminjaman_id' => $peminjaman->id,
    ]);

    $this->assertDatabaseHas('pengembalian', ['peminjaman_id' => $peminjaman->id, 'terlambat' => 1]);
});
