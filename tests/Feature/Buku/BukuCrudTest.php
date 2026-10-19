<?php

use App\Models\Buku;
use App\Models\KategoriBuku;
use App\Models\DetailPeminjaman;
use App\Models\Peminjaman;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

it('menampilkan daftar buku', function () {
    Buku::factory()->count(3)->create();

    $this->actingAs($this->admin)
        ->get(route('buku.index'))
        ->assertOk();
});

it('pencarian buku berdasarkan judul berfungsi', function () {
    Buku::factory()->create(['judul' => 'Laskar Pelangi']);
    Buku::factory()->create(['judul' => 'Bumi Manusia']);

    $response = $this->actingAs($this->admin)
        ->get(route('buku.index', ['search' => 'Laskar']));

    $response->assertOk();
});

it('admin bisa menambahkan buku baru', function () {
    $category = KategoriBuku::factory()->create();

    $response = $this->actingAs($this->admin)->post(route('buku.store'), [
        'kode_buku' => 'BK999',
        'judul' => 'Belajar Laravel',
        'pengarang' => 'Taylor Otwell',
        'kategori_id' => $category->id,
        'penerbit' => 'Laravel Press',
        'tahun_terbit' => 2024,
        'stok' => 10,
    ]);

    $response->assertRedirect(route('buku.index'));
    $this->assertDatabaseHas('buku', ['kode_buku' => 'BK999', 'judul' => 'Belajar Laravel']);
});

it('gagal menambahkan buku jika field wajib kosong', function () {
    $response = $this->actingAs($this->admin)->post(route('buku.store'), []);

    $response->assertSessionHasErrors(['kode_buku', 'judul', 'pengarang', 'kategori_id', 'penerbit', 'tahun_terbit', 'stok']);
});

it('gagal menambahkan buku jika kode_buku sudah dipakai', function () {
    Buku::factory()->create(['kode_buku' => 'BK001']);
    $category = KategoriBuku::factory()->create();

    $response = $this->actingAs($this->admin)->post(route('buku.store'), [
        'kode_buku' => 'BK001',
        'judul' => 'Judul Lain',
        'pengarang' => 'Penulis Lain',
        'kategori_id' => $category->id,
        'penerbit' => 'Penerbit Lain',
        'tahun_terbit' => 2023,
        'stok' => 5,
    ]);

    $response->assertSessionHasErrors('kode_buku');
});

it('admin bisa memperbarui data buku', function () {
    $buku = Buku::factory()->create(['judul' => 'Judul Lama']);

    $response = $this->actingAs($this->admin)->put(route('buku.update', $buku), [
        'kode_buku' => $buku->kode_buku,
        'judul' => 'Judul Baru',
        'pengarang' => $buku->pengarang,
        'kategori_id' => $buku->kategori_id,
        'penerbit' => $buku->penerbit,
        'tahun_terbit' => $buku->tahun_terbit,
        'stok' => $buku->stok,
    ]);

    $response->assertRedirect(route('buku.index'));
    $this->assertDatabaseHas('buku', ['id' => $buku->id, 'judul' => 'Judul Baru']);
});

it('buku yang sedang dipinjam tidak bisa dihapus', function () {
    $buku = Buku::factory()->create();
    $peminjaman = Peminjaman::factory()->create(['status' => 'Dipinjam']);
    DetailPeminjaman::factory()->create([
        'peminjaman_id' => $peminjaman->id,
        'buku_id' => $buku->id,
    ]);

    $response = $this->actingAs($this->admin)->delete(route('buku.destroy', $buku));

    $response->assertRedirect(route('buku.index'));
    $response->assertSessionHas('error');
    $this->assertDatabaseHas('buku', ['id' => $buku->id, 'deleted_at' => null]);
});

it('buku yang tidak sedang dipinjam bisa dihapus', function () {
    $buku = Buku::factory()->create();

    $response = $this->actingAs($this->admin)->delete(route('buku.destroy', $buku));

    $response->assertRedirect(route('buku.index'));
    $this->assertSoftDeleted('buku', ['id' => $buku->id]);
});
