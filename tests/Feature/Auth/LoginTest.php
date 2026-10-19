<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('menampilkan halaman login untuk guest', function () {
    $this->get(route('login'))->assertOk();
});

it('user bisa login dengan username & password yang benar', function () {
    $user = User::factory()->create([
        'username' => 'budi',
        'password' => bcrypt('rahasia123'),
    ]);

    $response = $this->post(route('login'), [
        'username' => 'budi',
        'password' => 'rahasia123',
    ]);

    $response->assertRedirect(route('dashboard'));
    $this->assertAuthenticatedAs($user);
});

it('login gagal jika password salah', function () {
    User::factory()->create([
        'username' => 'budi',
        'password' => bcrypt('rahasia123'),
    ]);

    $response = $this->from(route('login'))->post(route('login'), [
        'username' => 'budi',
        'password' => 'salah',
    ]);

    $response->assertRedirect(route('login'));
    $response->assertSessionHasErrors('username');
    $this->assertGuest();
});

it('login gagal jika username tidak terdaftar', function () {
    $response = $this->post(route('login'), [
        'username' => 'tidak-ada',
        'password' => 'apasaja',
    ]);

    $response->assertSessionHasErrors('username');
    $this->assertGuest();
});

it('username dan password wajib diisi', function () {
    $response = $this->post(route('login'), []);

    $response->assertSessionHasErrors(['username', 'password']);
});

it('user yang sudah login bisa logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $response->assertRedirect('/');
    $this->assertGuest();
});
