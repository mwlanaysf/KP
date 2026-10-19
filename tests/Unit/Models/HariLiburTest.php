<?php

use App\Models\HariLibur;
use Illuminate\Support\Carbon;

it('meng-cast kolom tanggal menjadi instance Carbon dengan format Y-m-d', function () {
    $HariLibur = new HariLibur(['tanggal' => '2025-08-17', 'keterangan' => 'Kemerdekaan', 'jenis_hari_libur' => 'nasional']);

    expect($HariLibur->tanggal)->toBeInstanceOf(Carbon::class)
        ->and($HariLibur->tanggal->format('Y-m-d'))->toBe('2025-08-17');
});

it('menyimpan keterangan dan jenis_hari_libur sesuai fillable', function () {
    $HariLibur = new HariLibur([
        'tanggal' => '2025-12-25',
        'keterangan' => 'Natal',
        'jenis_hari_libur' => 'nasional',
    ]);

    expect($HariLibur->keterangan)->toBe('Natal')
        ->and($HariLibur->jenis_hari_libur)->toBe('nasional');
});

