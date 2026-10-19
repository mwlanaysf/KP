<?php

use App\Models\Anggota;
use App\Models\Denda;
use App\Models\Jurusan;
use App\Models\Peminjaman;
use App\Models\Pengembalian;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

it('menampilkan daftar anggota', function () {
    Anggota::factory()->count(3)->create();

    $this->actingAs($this->admin)
        ->get(route('anggota.index'))
        ->assertOk();
});

it('admin bisa menambahkan anggota baru', function () {
    $major = Jurusan::factory()->create();

    $response = $this->actingAs($this->admin)->post(route('anggota.store'), [
        'kode_anggota' => 'AG999',
        'nama' => 'Siti Aminah',
        'jurusan_id' => $major->id,
        'kelas' => 'X',
        'no_hp' => '081234567890',
        'alamat' => 'Jl. Merdeka No. 1',
    ]);

    $response->assertRedirect(route('anggota.index'));
    $this->assertDatabaseHas('anggota', ['kode_anggota' => 'AG999', 'nama' => 'Siti Aminah']);
});

it('kelas anggota harus salah satu dari X, XI, XII', function () {
    $major = Jurusan::factory()->create();

    $response = $this->actingAs($this->admin)->post(route('anggota.store'), [
        'kode_anggota' => 'AG998',
        'nama' => 'Budi',
        'jurusan_id' => $major->id,
        'kelas' => 'XIII', // tidak valid
        'no_hp' => '081234567890',
        'alamat' => 'Jl. Merdeka No. 2',
    ]);

    $response->assertSessionHasErrors('kelas');
});

it('anggota dengan peminjaman aktif tidak bisa dihapus', function () {
    $anggota = Anggota::factory()->create();
    Peminjaman::factory()->create([
        'anggota_id' => $anggota->id,
        'status' => 'Dipinjam',
    ]);

    $response = $this->actingAs($this->admin)->delete(route('anggota.destroy', $anggota));

    $response->assertRedirect(route('anggota.index'));
    $response->assertSessionHas('error');
    $this->assertDatabaseHas('anggota', ['id' => $anggota->id, 'deleted_at' => null]);
});

it('anggota dengan denda belum lunas tidak bisa dihapus', function () {
    $anggota = Anggota::factory()->create();
    $peminjaman = Peminjaman::factory()->create([
        'anggota_id' => $anggota->id,
        'status' => 'Dikembalikan',
    ]);
    $pengembalian = Pengembalian::factory()->create(['peminjaman_id' => $peminjaman->id]);
    Denda::factory()->create([

        'pengembalian_id' => $pengembalian->id,
        'status_bayar' => 'Belum Lunas',
    ]);

    $response = $this->actingAs($this->admin)->delete(route('anggota.destroy', $anggota));

    $response->assertSessionHas('error');
    $this->assertDatabaseHas('anggota', ['id' => $anggota->id, 'deleted_at' => null]);
});

it('anggota tanpa transaksi aktif maupun denda bisa dihapus', function () {
    $anggota = Anggota::factory()->create();

    $response = $this->actingAs($this->admin)->delete(route('anggota.destroy', $anggota));

    $response->assertRedirect(route('anggota.index'));
    $this->assertSoftDeleted('anggota', ['id' => $anggota->id]);
});
