<?php

use App\Models\User;
use Illuminate\Support\Facades\Storage;

uses(Tests\TestCase::class);

// ------------------------------------------------------------------
// Role helpers
// ------------------------------------------------------------------

it('mendeteksi role super_admin', function () {
    $user = new User(['role' => 'super_admin']);

    expect($user->isSuperAdmin())->toBeTrue()
        ->and($user->isAdmin())->toBeFalse()
        ->and($user->isKepalaSekolah())->toBeFalse();
});

it('mendeteksi role admin', function () {
    $user = new User(['role' => 'admin']);

    expect($user->isAdmin())->toBeTrue()
        ->and($user->isSuperAdmin())->toBeFalse();
});

it('mendeteksi role kepala_sekolah', function () {
    $user = new User(['role' => 'kepala_sekolah']);

    expect($user->isKepalaSekolah())->toBeTrue();
});

it('mengembalikan false untuk semua role helper jika role tidak dikenali', function () {
    $user = new User(['role' => 'petugas']);

    expect($user->isSuperAdmin())->toBeFalse()
        ->and($user->isAdmin())->toBeFalse()
        ->and($user->isKepalaSekolah())->toBeFalse();
});

// ------------------------------------------------------------------
// Status helper
// ------------------------------------------------------------------

it('mendeteksi status aktif', function () {
    $user = new User(['status' => 'aktif']);

    expect($user->isActive())->toBeTrue();
});

it('mendeteksi status tidak aktif', function () {
    $user = new User(['status' => 'tidak aktif']);

    expect($user->isActive())->toBeFalse();
});

// ------------------------------------------------------------------
// Accessor: avatar
// ------------------------------------------------------------------

it('mengembalikan null jika user tidak punya avatar', function () {
    $user = new User(['avatar' => null]);

    expect($user->avatar)->toBeNull();
});

it('mengembalikan url storage jika avatar tersedia', function () {
    Storage::fake('public');

    $user = new User(['avatar' => 'avatars/foto.jpg']);

    expect($user->avatar)->toBe(Storage::url('avatars/foto.jpg'));
});
