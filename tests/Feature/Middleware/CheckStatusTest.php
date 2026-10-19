<?php

use App\Http\Middleware\CheckStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

/**
 * NOTE: Middleware ini diuji langsung (bukan lewat route) karena file
 * bootstrap/app.php (tempat middleware ini didaftarkan/di-alias-kan)
 * tidak ikut diupload. Jika `CheckStatus` sudah dipasang secara global
 * pada middleware group 'web' atau 'auth' di proyek Anda, Anda bisa
 * menambahkan test tambahan yang memukul route asli, mis:
 *
 *   $this->actingAs($inactiveUser)->get(route('dashboard'))->assertRedirect(route('login'));
 */

it('user aktif tetap bisa lanjut ke halaman berikutnya', function () {
    $user = User::factory()->create(['status' => 'aktif']);
    $this->actingAs($user);

    $request = Request::create('/dashboard', 'GET');
    $request->setLaravelSession($this->app['session']->driver());

    $middleware = new CheckStatus();
    $response = $middleware->handle($request, fn ($req) => new \Illuminate\Http\Response('OK'));

    expect($response->getContent())->toBe('OK');
    expect(Auth::check())->toBeTrue();
});

it('user nonaktif otomatis di-logout dan diarahkan ke login', function () {
    $user = User::factory()->create(['status' => 'tidak aktif']);
    $this->actingAs($user);

    $request = Request::create('/dashboard', 'GET');
    $request->setLaravelSession($this->app['session']->driver());

    $middleware = new CheckStatus();
    $response = $middleware->handle($request, fn ($req) => new \Illuminate\Http\Response('OK'));

    expect($response->isRedirect(route('login')))->toBeTrue();
    expect(Auth::check())->toBeFalse();
});
