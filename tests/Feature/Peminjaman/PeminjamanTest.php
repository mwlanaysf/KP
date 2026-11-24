<?php

use App\Models\Anggota;
use App\Models\Buku;
use App\Models\DetailPeminjaman;
use App\Models\Peminjaman;
use App\Models\Pengembalian;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    Cache::forget('durasi_peminjaman');
    Cache::forget('tarif_denda');
});

it('halaman create menyediakan kode_peminjaman & tanggal_kembali otomatis (default durasi 7 hari)', function () {
    $response = $this->actingAs($this->admin)->get(route('peminjaman.create'));

    $response->assertOk();
});

it('admin bisa meminjamkan 1 buku dan stok buku berkurang', function () {
    $anggota = Anggota::factory()->create();
    $buku = Buku::factory()->create(['stok' => 5]);

    $response = $this->actingAs($this->admin)->post(route('peminjaman.store'), [
        'anggota_id' => $anggota->id,
        'buku_id' => [$buku->id],
    ]);

    $response->assertRedirect(route('peminjaman.create'));
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('peminjaman', [
        'anggota_id' => $anggota->id,
        'status' => 'Dipinjam',
    ]);
    $this->assertDatabaseHas('detail_peminjaman', ['buku_id' => $buku->id]);
    expect($buku->fresh()->stok)->toBe(4);
});

it('boleh meminjam lebih dari satu buku sekaligus (maksimal 3)', function () {
    $anggota = Anggota::factory()->create();
    $bukus = Buku::factory()->count(3)->create(['stok' => 2]);

    $response = $this->actingAs($this->admin)->post(route('peminjaman.store'), [
        'anggota_id' => $anggota->id,
        'buku_id' => $bukus->pluck('id')->toArray(),
    ]);

    $response->assertSessionHas('success');
    $this->assertEquals(3, DetailPeminjaman::count());
});

it('tidak boleh meminjam lebih dari 3 buku dalam satu transaksi', function () {
    $anggota = Anggota::factory()->create();
    $bukus = Buku::factory()->count(4)->create(['stok' => 2]);

    $response = $this->actingAs($this->admin)->post(route('peminjaman.store'), [
        'anggota_id' => $anggota->id,
        'buku_id' => $bukus->pluck('id')->toArray(),
    ]);

    $response->assertSessionHasErrors('buku_id');
    $this->assertDatabaseCount('peminjaman', 0);
});

it('peminjaman gagal (rollback) jika salah satu buku stoknya habis', function () {
    $anggota = Anggota::factory()->create();
    $bukuTersedia = Buku::factory()->create(['stok' => 5]);
    $bukuHabis = Buku::factory()->habis()->create();

    $response = $this->actingAs($this->admin)->post(route('peminjaman.store'), [
        'anggota_id' => $anggota->id,
        'buku_id' => [$bukuTersedia->id, $bukuHabis->id],
    ]);

    $response->assertRedirect(route('peminjaman.create'));
    $response->assertSessionHas('error');

    // Transaksi harus rollback total: tidak ada peminjaman/detail yang tersimpan
    $this->assertDatabaseCount('peminjaman', 0);
    $this->assertDatabaseCount('detail_peminjaman', 0);
    // Stok buku yang tadinya tersedia juga tidak boleh berkurang
    expect($bukuTersedia->fresh()->stok)->toBe(5);
});

it('validasi: anggota_id dan buku_id wajib diisi', function () {
    $response = $this->actingAs($this->admin)->post(route('peminjaman.store'), []);

    $response->assertSessionHasErrors(['anggota_id', 'buku_id']);
});


it('jatuh tempo yang jatuh pada Sabtu atau Minggu digeser ke Senin', function () {
    // Jumat 13 Nov 2026 + durasi 8 hari = Sabtu 21 Nov -> digeser ke Senin 23 Nov
    \Illuminate\Support\Carbon::setTestNow(\Illuminate\Support\Carbon::parse('2026-11-13 09:00:00'));
    \App\Models\Pengaturan::create(['durasi_peminjaman' => 8, 'maksimal_pinjam' => 3, 'denda_per_hari' => 2000]);

    $anggota = Anggota::factory()->create();
    $buku = Buku::factory()->create(['stok' => 5]);

    $this->actingAs($this->admin)->post(route('peminjaman.store'), [
        'anggota_id' => $anggota->id,
        'buku_id' => [$buku->id],
    ]);

    $tanggalKembali = Peminjaman::first()->tanggal_kembali;
    expect(\Illuminate\Support\Carbon::parse($tanggalKembali)->toDateString())->toBe('2026-11-23');

    \Illuminate\Support\Carbon::setTestNow();
});
