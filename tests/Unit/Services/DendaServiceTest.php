<?php

use App\Services\DendaService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class);

// ------------------------------------------------------------------
// hitungKeterlambatan()
// ------------------------------------------------------------------

it('mengembalikan 0 jika belum jatuh tempo', function () {
    $jatuhTempo = Carbon::today()->addDays(3);

    expect(DendaService::hitungKeterlambatan($jatuhTempo))->toBe(0);
});

it('mengembalikan 0 tepat pada hari jatuh tempo', function () {
    $jatuhTempo = Carbon::today();

    expect(DendaService::hitungKeterlambatan($jatuhTempo))->toBe(0);
});

it('menghitung jumlah hari terlambat dengan benar jika sudah lewat jatuh tempo', function () {
    $jatuhTempo = Carbon::today()->subDays(5);

    expect(DendaService::hitungKeterlambatan($jatuhTempo))->toBe(5);
});

it('menghitung keterlambatan berdasarkan tanggal_dikembalikan eksplisit, bukan hari ini', function () {
    $jatuhTempo = '2025-01-01';
    $tanggalDikembalikan = '2025-01-10';

    expect(DendaService::hitungKeterlambatan($jatuhTempo, $tanggalDikembalikan))->toBe(9);
});

it('menerima input string tanggal maupun instance Carbon', function () {
    $jatuhTempoString = '2025-01-01';
    $jatuhTempoCarbon = Carbon::parse('2025-01-01');
    $dikembalikan = '2025-01-04';

    expect(DendaService::hitungKeterlambatan($jatuhTempoString, $dikembalikan))
        ->toBe(DendaService::hitungKeterlambatan($jatuhTempoCarbon, $dikembalikan));
});

// ------------------------------------------------------------------
// hitungDenda()
// ------------------------------------------------------------------

it('mengembalikan 0 jika tidak ada hari terlambat', function () {
    expect(DendaService::hitungDenda(0))->toBe(0);
    expect(DendaService::hitungDenda(-2))->toBe(0);
});

it('menghitung denda memakai tarif default 2000/hari jika tabel pengaturan kosong', function () {
    $total = DendaService::hitungDenda(hariTerlambat: 3, jumlahBuku: 1);

    expect($total)->toBe(3 * 2000 * 1);
});

it('menghitung denda memakai tarif custom dari pengaturan', function () {
    \App\Models\Pengaturan::create([
        'denda_per_hari' => 5000,
        'durasi_peminjaman' => 7,
        'maksimal_pinjam' => 3
    ]);

    $total = DendaService::hitungDenda(hariTerlambat: 2, jumlahBuku: 3);

    expect($total)->toBe(2 * 5000 * 3);
});

// ------------------------------------------------------------------
// sisaHari()
// ------------------------------------------------------------------

it('mengembalikan sisa hari positif jika belum jatuh tempo', function () {
    $jatuhTempo = Carbon::today()->addDays(4);

    expect(DendaService::sisaHari($jatuhTempo))->toBe(4);
});

it('mengembalikan 0 jika hari ini adalah hari jatuh tempo', function () {
    expect(DendaService::sisaHari(Carbon::today()))->toBe(0);
});

it('mengembalikan nilai negatif jika sudah lewat jatuh tempo', function () {
    $jatuhTempo = Carbon::today()->subDays(6);

    expect(DendaService::sisaHari($jatuhTempo))->toBe(-6);
});
