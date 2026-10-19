<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('guest diarahkan ke login saat mengakses halaman yang butuh auth', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

it('super_admin bisa mengakses menu Petugas (khusus super_admin)', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $this->actingAs($superAdmin)
        ->get(route('petugas.index'))
        ->assertOk();
});

it('admin biasa TIDAK bisa mengakses menu Petugas (403)', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('petugas.index'))
        ->assertForbidden();
});

it('kepala_sekolah TIDAK bisa mengakses menu Petugas (403)', function () {
    $kepsek = User::factory()->kepalaSekolah()->create();

    $this->actingAs($kepsek)
        ->get(route('petugas.index'))
        ->assertForbidden();
});

it('admin dan super_admin bisa mengakses data master buku (index)', function () {
    $admin = User::factory()->admin()->create();
    $superAdmin = User::factory()->superAdmin()->create();

    $this->actingAs($admin)->get(route('buku.index'))->assertOk();
    $this->actingAs($superAdmin)->get(route('buku.index'))->assertOk();
});

it('kepala_sekolah bisa melihat (read-only) daftar buku', function () {
    $kepsek = User::factory()->kepalaSekolah()->create();

    $this->actingAs($kepsek)
        ->get(route('buku.index'))
        ->assertOk();
});

it('kepala_sekolah TIDAK bisa mengakses transaksi peminjaman', function () {
    $kepsek = User::factory()->kepalaSekolah()->create();

    $this->actingAs($kepsek)
        ->get(route('peminjaman.index'))
        ->assertForbidden();
});


