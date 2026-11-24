<?php

use App\Services\DendaService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class);

// Semua test memakai "hari ini" tetap = Rabu, 18 November 2026 agar hasil deterministik
beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-11-18 10:00:00'));
});

afterEach(function () {
    Carbon::setTestNow();
});

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
    // Selasa 17 Nov -> hari ini Rabu 18 Nov: 1 hari buka
    $jatuhTempo = Carbon::today()->subDay();

    expect(DendaService::hitungKeterlambatan($jatuhTempo))->toBe(1);
});

it('menghitung keterlambatan berdasarkan tanggal_dikembalikan eksplisit, bukan hari ini', function () {
    // Rabu 1 Jan 2025 -> Jumat 10 Jan 2025: 9 hari kalender, dikurangi Sabtu 4 & Minggu 5 = 7 hari buka
    $jatuhTempo = '2025-01-01';
    $tanggalDikembalikan = '2025-01-10';

    expect(DendaService::hitungKeterlambatan($jatuhTempo, $tanggalDikembalikan))->toBe(7);
});

it('melewati Sabtu dan Minggu saat menghitung keterlambatan', function () {
    // Jumat 13 Nov -> Senin 16 Nov: hanya Senin yang dihitung
    expect(DendaService::hitungKeterlambatan('2026-11-13', '2026-11-16'))->toBe(1);
    // Jumat 13 Nov -> Minggu 15 Nov: belum ada hari buka terlewat
    expect(DendaService::hitungKeterlambatan('2026-11-13', '2026-11-15'))->toBe(0);
});

it('melewati hari libur yang terdaftar saat menghitung keterlambatan', function () {
    \App\Models\HariLibur::create(['tanggal' => '2026-11-16', 'keterangan' => 'Libur Sekolah', 'jenis_hari_libur' => 'sekolah']);

    // Jumat 13 Nov -> Selasa 17 Nov: Sabtu, Minggu, dan Senin (libur) dilewati, hanya Selasa dihitung
    expect(DendaService::hitungKeterlambatan('2026-11-13', '2026-11-17'))->toBe(1);
});

it('menerima input string tanggal maupun instance Carbon', function () {
    $jatuhTempoString = '2025-01-01';
    $jatuhTempoCarbon = Carbon::parse('2025-01-01');
    $dikembalikan = '2025-01-04';

    expect(DendaService::hitungKeterlambatan($jatuhTempoString, $dikembalikan))
        ->toBe(DendaService::hitungKeterlambatan($jatuhTempoCarbon, $dikembalikan));
});

// ------------------------------------------------------------------
// hariBukaBerikutnya() / isHariTutup()
// ------------------------------------------------------------------

it('menggeser jatuh tempo yang jatuh pada Sabtu atau Minggu ke Senin', function () {
    expect(DendaService::hariBukaBerikutnya('2026-11-14')->toDateString())->toBe('2026-11-16'); // Sabtu
    expect(DendaService::hariBukaBerikutnya('2026-11-15')->toDateString())->toBe('2026-11-16'); // Minggu
});

it('tidak menggeser tanggal yang jatuh pada hari buka', function () {
    expect(DendaService::hariBukaBerikutnya('2026-11-18')->toDateString())->toBe('2026-11-18'); // Rabu
});

it('menggeser jatuh tempo melewati hari libur terdaftar yang bersambung dengan akhir pekan', function () {
    \App\Models\HariLibur::create(['tanggal' => '2026-11-16', 'keterangan' => 'Libur Sekolah', 'jenis_hari_libur' => 'sekolah']);

    // Sabtu 14 Nov -> Minggu 15 -> Senin 16 (libur) -> Selasa 17
    expect(DendaService::hariBukaBerikutnya('2026-11-14')->toDateString())->toBe('2026-11-17');
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
