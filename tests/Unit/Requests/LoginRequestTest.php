<?php

use App\Http\Requests\Auth\LoginRequest;

it('memiliki rule validasi username dan password wajib diisi', function () {
    $request = new LoginRequest();

    expect($request->rules())->toBe([
        'username' => ['required', 'string'],
        'password' => ['required', 'string'],
    ]);
});

it('selalu mengizinkan (authorize) request login', function () {
    $request = new LoginRequest();

    expect($request->authorize())->toBeTrue();
});

it('membuat throttle key dari kombinasi username (lowercase) dan ip address', function () {
    $request = LoginRequest::create('/login', 'POST', [
        'username' => 'Budi.Santoso',
    ]);
    $request->server->set('REMOTE_ADDR', '127.0.0.1');

    expect($request->throttleKey())->toBe('budi.santoso|127.0.0.1');
});

it('menghasilkan throttle key yang berbeda untuk ip berbeda meski username sama', function () {
    $requestA = LoginRequest::create('/login', 'POST', ['username' => 'admin']);
    $requestA->server->set('REMOTE_ADDR', '10.0.0.1');

    $requestB = LoginRequest::create('/login', 'POST', ['username' => 'admin']);
    $requestB->server->set('REMOTE_ADDR', '10.0.0.2');

    expect($requestA->throttleKey())->not->toBe($requestB->throttleKey());
});
