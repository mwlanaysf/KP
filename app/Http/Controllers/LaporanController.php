<?php

namespace App\Http\Controllers;

use App\Models\Anggota;
use App\Models\Buku;
use App\Models\Peminjaman;
use App\Models\Pengembalian;
use App\Models\Denda;
use App\Models\DetailPeminjaman;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Cell\DataType;

class LaporanController extends Controller
{
    public function index()
    {
        $totalPeminjaman = Peminjaman::count();
        $totalPengembalian = Pengembalian::count();
        $totalDenda = Denda::sum('total_denda');
        $totalBukuDipinjam = DetailPeminjaman::whereHas('peminjaman', function($q) {
            $q->where('status', 'Dipinjam');
        })->count();

        $minYearPengembalian = Pengembalian::whereNotNull('tanggal_dikembalikan')
            ->min(\Illuminate\Support\Facades\DB::raw('YEAR(tanggal_dikembalikan)'));
        
        $currentYear = date('Y');
        $minYear = $minYearPengembalian ? (int)$minYearPengembalian : $currentYear;

        $jurusans = \App\Models\Jurusan::orderBy('nama')->get();
        $categories = \App\Models\KategoriBuku::orderBy('nama')->get();
        $classes = Anggota::select('kelas')->whereNotNull('kelas')->where('kelas', '!=', '')->distinct()->pluck('kelas');

        return Inertia::render('Laporan/Index', [
            'stats' => [
                'total_peminjaman' => $totalPeminjaman,
                'total_pengembalian' => $totalPengembalian,
                'total_denda' => $totalDenda,
                'total_buku_dipinjam' => $totalBukuDipinjam,
            ],
            'minYear' => $minYear,
            'jurusan' => $jurusans,
            'kategori_buku' => $categories,
            'classes' => $classes,
        ]);
    }

    /**
     * Helper untuk label periode berdasarkan filter
     */
    private function getPeriodeLabel($request)
    {
        $filterType = $request->get('filter_type', 'semua');
        $startDate  = $request->get('start_date');
        $endDate    = $request->get('end_date');
        $bulanStr   = $request->get('bulan');
        $tahun      = (int) $request->get('tahun', now()->year);
        $namaBulan  = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

        if ($filterType === 'rentang') {
            $start = $startDate ? \Carbon\Carbon::parse($startDate)->format('d M Y') : 'Awal';
            $end   = $endDate   ? \Carbon\Carbon::parse($endDate)->format('d M Y')   : 'Akhir';
            return "$start s/d $end";
        } elseif ($filterType === 'bulan') {
            if ($bulanStr === 'semua') {
                return 'Tahun ' . $tahun;
            }
            $bulan = (int) ($bulanStr ?? now()->month);
            return $namaBulan[$bulan] . ' ' . $tahun;
        }
        return 'Semua Waktu';
    }

    /**
     * Cetak laporan PDF per modul
     */
    public function cetakPdf(string $modul, \Illuminate\Http\Request $request)
    {
        $filterType = $request->get('filter_type', 'semua');
        $startDate  = $request->get('start_date');
        $endDate    = $request->get('end_date');
        $bulan      = $request->get('bulan', now()->month);
        $tahun      = (int) $request->get('tahun', now()->year);
        $status     = $request->get('status', 'semua');
        $jurusan    = $request->get('jurusan', 'semua');
        $kelas      = $request->get('kelas', 'semua');
        $kategori   = $request->get('kategori', 'semua');
        $periodeLabel = $this->getPeriodeLabel($request);

        [$data, $view, $filename] = match ($modul) {
            'anggota' => [
                ['anggota' => Anggota::with('jurusan')
                    ->when($jurusan !== 'semua', fn($q) => $q->where('jurusan_id', $jurusan))
                    ->when($kelas !== 'semua', fn($q) => $q->where('kelas', $kelas))
                    ->orderBy('kode_anggota')->get()],
                'laporan.anggota',
                'laporan_anggota.pdf',
            ],
            'buku' => [
                ['buku' => Buku::with('kategori')
                    ->when($kategori !== 'semua', fn($q) => $q->where('kategori_id', $kategori))
                    ->orderBy('kode_buku')->get()],
                'laporan.buku',
                'laporan_buku.pdf',
            ],
            'peminjaman' => [
                [
                    'peminjaman' => Peminjaman::with([
                        'anggota' => fn($q) => $q->withTrashed()->with('jurusan'),
                        'detail_peminjaman.buku' => fn($q) => $q->withTrashed()->with('kategori')
                    ])
                        ->when($filterType === 'bulan', fn($q) => $q->whereMonth('tanggal_pinjam', $bulan)->whereYear('tanggal_pinjam', $tahun))
                        ->when($filterType === 'rentang', fn($q) => $q->when($startDate, fn($q2) => $q2->where('tanggal_pinjam', '>=', $startDate))->when($endDate, fn($q2) => $q2->where('tanggal_pinjam', '<=', $endDate)))
                        ->orderBy('tanggal_pinjam')
                        ->get(),
                    'periode' => $periodeLabel,
                ],
                'laporan.peminjaman',
                'laporan_peminjaman.pdf',
            ],
            'pengembalian' => [
                [
                    'pengembalian' => Pengembalian::with([
                        'peminjaman.anggota' => fn($q) => $q->withTrashed()->with('jurusan'),
                        'peminjaman.detail_peminjaman.buku' => fn($q) => $q->withTrashed()->with('kategori')
                    ])
                        ->when($filterType === 'bulan', fn($q) => $q->whereMonth('tanggal_dikembalikan', $bulan)->whereYear('tanggal_dikembalikan', $tahun))
                        ->when($filterType === 'rentang', fn($q) => $q->when($startDate, fn($q2) => $q2->where('tanggal_dikembalikan', '>=', $startDate))->when($endDate, fn($q2) => $q2->where('tanggal_dikembalikan', '<=', $endDate)))
                        ->orderBy('tanggal_dikembalikan')
                        ->get(),
                    'periode' => $periodeLabel,
                ],
                'laporan.pengembalian',
                'laporan_pengembalian.pdf',
            ],
            'denda' => [
                [
                    'denda' => Denda::with([
                        'pengembalian.peminjaman.anggota' => fn($q) => $q->withTrashed()->with('jurusan'),
                        'pengembalian.peminjaman.detail_peminjaman.buku' => fn($q) => $q->withTrashed()->with('kategori')
                    ])
                        ->when($status === 'Lunas', fn($q) => $q->where('status_bayar', 'Lunas'))
                        ->when($status === 'Belum Lunas', fn($q) => $q->where('status_bayar', '!=', 'Lunas'))
                        ->when($filterType === 'bulan', fn($q) => $q->whereMonth('created_at', $bulan)->whereYear('created_at', $tahun))
                        ->when($filterType === 'rentang', fn($q) => $q->when($startDate, fn($q2) => $q2->whereDate('created_at', '>=', $startDate))->when($endDate, fn($q2) => $q2->whereDate('created_at', '<=', $endDate)))
                        ->orderByDesc('id')
                        ->get(),
                    'periode' => $periodeLabel,
                    'status_filter' => $status
                ],
                'laporan.denda',
                'laporan_denda.pdf',
            ],
            'statistik_anggota_teraktif' => [
                [
                    'anggota' => Anggota::withCount(['peminjaman' => function($q) use ($filterType, $bulan, $tahun, $startDate, $endDate) {
                        $q->when($filterType === 'bulan', fn($q2) => 
                            $q2->when($bulan !== 'semua', fn($q3) => $q3->whereMonth('tanggal_pinjam', $bulan))
                               ->whereYear('tanggal_pinjam', $tahun)
                        )
                          ->when($filterType === 'rentang', fn($q2) => $q2->when($startDate, fn($q3) => $q3->where('tanggal_pinjam', '>=', $startDate))->when($endDate, fn($q3) => $q3->where('tanggal_pinjam', '<=', $endDate)));
                    }])
                    ->having('peminjaman_count', '>', 0)
                    ->orderByDesc('peminjaman_count')
                    ->get(),
                    'periode' => $periodeLabel,
                ],
                'laporan.statistik_anggota_teraktif',
                'statistik_anggota_teraktif.pdf',
            ],
            'statistik_buku_terpopuler' => [
                [
                    'buku' => Buku::withCount(['detail_peminjaman' => function($q) use ($filterType, $bulan, $tahun, $startDate, $endDate) {
                        $q->whereHas('peminjaman', function($q2) use ($filterType, $bulan, $tahun, $startDate, $endDate) {
                            $q2->when($filterType === 'bulan', fn($q3) => 
                                $q3->when($bulan !== 'semua', fn($q4) => $q4->whereMonth('tanggal_pinjam', $bulan))
                                   ->whereYear('tanggal_pinjam', $tahun)
                            )
                               ->when($filterType === 'rentang', fn($q3) => $q3->when($startDate, fn($q4) => $q4->where('tanggal_pinjam', '>=', $startDate))->when($endDate, fn($q4) => $q4->where('tanggal_pinjam', '<=', $endDate)));
                        });
                    }])
                    ->having('detail_peminjaman_count', '>', 0)
                    ->orderByDesc('detail_peminjaman_count')
                    ->get(),
                    'periode' => $periodeLabel,
                ],
                'laporan.statistik_buku_terpopuler',
                'statistik_buku_terpopuler.pdf',
            ],
            'statistik_anggota_terlambat' => [
                [
                    'anggota' => Anggota::withCount(['peminjaman as terlambat_count' => function ($query) use ($filterType, $bulan, $tahun, $startDate, $endDate) {
                        $query->whereHas('pengembalian', function ($q) use ($filterType, $bulan, $tahun, $startDate, $endDate) {
                            $q->where('terlambat', '>', 0)
                              ->when($filterType === 'bulan', fn($q2) => 
                                  $q2->when($bulan !== 'semua', fn($q3) => $q3->whereMonth('tanggal_dikembalikan', $bulan))
                                     ->whereYear('tanggal_dikembalikan', $tahun)
                              )
                              ->when($filterType === 'rentang', fn($q2) => $q2->when($startDate, fn($q3) => $q3->where('tanggal_dikembalikan', '>=', $startDate))->when($endDate, fn($q3) => $q3->where('tanggal_dikembalikan', '<=', $endDate)));
                        });
                    }])->having('terlambat_count', '>', 0)->orderByDesc('terlambat_count')->get(),
                    'periode' => $periodeLabel,
                ],
                'laporan.statistik_anggota_terlambat',
                'statistik_anggota_terlambat.pdf',
            ],
            default => abort(404, 'Modul laporan tidak ditemukan'),
        };

        $pdf = Pdf::loadView($view, $data)->setPaper('A4', 'portrait');

        return response($pdf->output(), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', "inline; filename=\"{$filename}\"");
    }

    /**
     * Ekspor laporan Excel per modul
     */
    public function cetakExcel(string $modul, \Illuminate\Http\Request $request)
    {
        $filterType = $request->get('filter_type', 'semua');
        $startDate  = $request->get('start_date');
        $endDate    = $request->get('end_date');
        $bulan      = $request->get('bulan', now()->month);
        $tahun      = (int) $request->get('tahun', now()->year);
        $status     = $request->get('status', 'semua');
        $jurusan    = $request->get('jurusan', 'semua');
        $kelas      = $request->get('kelas', 'semua');
        $kategori   = $request->get('kategori', 'semua');
        $periodeLabel = $this->getPeriodeLabel($request);

        $nb     = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        $now    = now();

        $fTgl = function ($date) use ($nb) {
            if (!$date) return '-';
            $c = \Carbon\Carbon::parse($date);
            return $c->format('d') . ' ' . $nb[$c->month] . ' ' . $c->format('Y');
        };

        $title       = '';
        $docLabel    = '';
        $summaryData = [];
        $headers     = [];
        $rows        = [];
        $footerLeft  = "Dicetak otomatis — Sistem Manajemen Perpustakaan © {$now->year}";
        $footerRight = '';
        $filename    = '';
        $data        = collect();

        switch ($modul) {
            case 'anggota':
                $data     = Anggota::with('jurusan')
                    ->when($jurusan !== 'semua', fn($q) => $q->where('jurusan_id', $jurusan))
                    ->when($kelas !== 'semua', fn($q) => $q->where('kelas', $kelas))
                    ->orderBy('kode_anggota')->get();
                $title    = 'Laporan Data Anggota';
                $docLabel = 'DATA ANGGOTA';
                $summaryData = [
                    'Total Anggota'     => $data->count(),
                    'Jurusan Terdaftar' => $data->pluck('jurusan.nama')->filter()->unique()->count(),
                    'Periode Cetak'     => $now->format('d M Y'),
                ];
                $headers = ['No', 'Kode Anggota', 'Nama Lengkap', 'Kelas', 'jurusan', 'No HP', 'Tanggal Daftar'];
                foreach ($data as $i => $r) {
                    $rows[] = [
                        $i + 1,
                        $r->kode_anggota,
                        $r->nama,
                        $r->kelas ?? '-',
                        $r->jurusan?->nama ?? '-',
                        $r->no_hp ?? '-',
                        $fTgl($r->created_at),
                    ];
                }
                $footerRight = "Total {$data->count()} anggota terdaftar";
                $filename    = 'laporan_anggota.xlsx';
                break;

            case 'buku':
                $data     = Buku::with('kategori')
                    ->when($kategori !== 'semua', fn($q) => $q->where('kategori_id', $kategori))
                    ->orderBy('kode_buku')->get();
                $title    = 'Laporan Data Buku';
                $docLabel = 'DATA BUKU';
                $summaryData = [
                    'Total Buku'    => $data->count(),
                    'Periode Cetak' => $now->format('d M Y'),
                    'Status'        => 'Koleksi Aktif',
                ];
                $headers = ['No', 'Kode Buku', 'Judul Buku', 'Pengarang', 'Kategori', 'Stok'];
                foreach ($data as $i => $r) {
                    $rows[] = [
                        $i + 1,
                        $r->kode_buku,
                        $r->judul,
                        $r->pengarang,
                        $r->kategori?->nama ?? '-',
                        $r->stok,
                    ];
                }
                $footerRight = "Total {$data->count()} judul buku";
                $filename    = 'laporan_buku.xlsx';
                break;

            case 'peminjaman':
                $data = Peminjaman::with([
                    'anggota' => fn($q) => $q->withTrashed()->with('jurusan'),
                    'detail_peminjaman.buku' => fn($q) => $q->withTrashed()->with('kategori')
                ])
                    ->when($filterType === 'bulan', fn($q) => $q->whereMonth('tanggal_pinjam', $bulan)->whereYear('tanggal_pinjam', $tahun))
                    ->when($filterType === 'rentang', fn($q) => $q->when($startDate, fn($q2) => $q2->where('tanggal_pinjam', '>=', $startDate))->when($endDate, fn($q2) => $q2->where('tanggal_pinjam', '<=', $endDate)))
                    ->orderBy('tanggal_pinjam')
                    ->get();
                $totalBuku = $data->sum(fn($p) => $p->detail_peminjaman->count());
                $title     = 'Laporan Histori Transaksi Peminjaman';
                $docLabel  = 'HISTORI PEMINJAMAN';
                $summaryData = [
                    'Total Transaksi'     => $data->count(),
                    'Total Buku'          => $totalBuku,
                    'Periode'             => $periodeLabel,
                ];
                $headers = ['No', 'Kode Peminjaman', 'Nama Anggota', 'jurusan', 'Kelas', 'Jumlah Buku', 'Judul Buku', 'Tanggal Pinjam', 'Jatuh Tempo', 'Status'];
                foreach ($data as $i => $r) {
                    $judulArr = $r->detail_peminjaman->pluck('buku.judul')->filter()->values()->toArray();
                    $status = $r->status ?? '-';
                    if ($status === 'Dipinjam' && $r->tanggal_kembali) {
                        $jatuhTempo = \Carbon\Carbon::parse($r->tanggal_kembali)->startOfDay();
                        if (\App\Services\DendaService::hitungKeterlambatan($jatuhTempo) > 0) {
                            $status = 'Terlambat';
                        }
                    }

                    $rows[] = [
                        $i + 1,
                        $r->kode_peminjaman,
                        $r->anggota?->nama ?? '-',
                        $r->anggota?->jurusan?->nama ?? '-',
                        $r->anggota?->kelas ?? '-',
                        $r->detail_peminjaman->count(),
                        empty($judulArr) ? '-' : "- " . implode("\n- ", $judulArr),
                        $fTgl($r->tanggal_pinjam),
                        $fTgl($r->tanggal_kembali),
                        $status,
                    ];
                }
                $footerRight = "{$data->count()} transaksi • {$totalBuku} buku";
                $filename    = 'laporan_peminjaman.xlsx';
                break;

            case 'pengembalian':
                $data = Pengembalian::with([
                    'peminjaman.anggota' => fn($q) => $q->withTrashed()->with('jurusan'),
                    'peminjaman.detail_peminjaman.buku' => fn($q) => $q->withTrashed()->with('kategori')
                ])
                    ->when($filterType === 'bulan', fn($q) => $q->whereMonth('tanggal_dikembalikan', $bulan)->whereYear('tanggal_dikembalikan', $tahun))
                    ->when($filterType === 'rentang', fn($q) => $q->when($startDate, fn($q2) => $q2->where('tanggal_dikembalikan', '>=', $startDate))->when($endDate, fn($q2) => $q2->where('tanggal_dikembalikan', '<=', $endDate)))
                    ->orderBy('tanggal_dikembalikan')
                    ->get();
                $totalBuku    = $data->sum(fn($r) => $r->peminjaman?->detail_peminjaman?->count() ?? 0);
                $jmlTepat     = $data->filter(fn($r) => ($r->terlambat ?? 0) <= 0)->count();
                $jmlTerlambat = $data->filter(fn($r) => ($r->terlambat ?? 0) > 0)->count();
                $title        = 'Laporan Data Pengembalian';
                $docLabel     = 'PENGEMBALIAN';
                $summaryData  = [
                    'Total Pengembalian' => $data->count(),
                    'Total Buku Kembali' => $totalBuku,
                    'Tepat Waktu'        => $jmlTepat,
                    'Terlambat'          => $jmlTerlambat,
                    'Periode'            => $periodeLabel,
                ];
                $headers = ['No', 'Kode', 'Nama Anggota', 'jurusan', 'Kelas', 'Jumlah Buku', 'Judul Buku', 'Tanggal Pinjam', 'Jatuh Tempo', 'Tanggal Kembali', 'Terlambat', 'Status'];
                foreach ($data as $i => $r) {
                    $p           = $r->peminjaman;
                    $terlambat   = abs($r->terlambat ?? 0);
                    $isTerlambat = ($r->terlambat ?? 0) > 0;
                    $judulArr    = $p?->detail_peminjaman?->pluck('buku.judul')?->filter()->values()->toArray() ?? [];
                    $rows[] = [
                        $i + 1,
                        $p?->kode_peminjaman ?? '-',
                        $p?->anggota?->nama ?? '-',
                        $p?->anggota?->jurusan?->nama ?? '-',
                        $p?->anggota?->kelas ?? '-',
                        $p?->detail_peminjaman?->count() ?? 0,
                        empty($judulArr) ? '-' : "- " . implode("\n- ", $judulArr),
                        $fTgl($p?->tanggal_pinjam),
                        $fTgl($p?->tanggal_kembali),
                        $fTgl($r->tanggal_dikembalikan),
                        $isTerlambat ? "{$terlambat} hari" : '-',
                        $isTerlambat ? 'Terlambat' : 'Tepat Waktu',
                    ];
                }
                $footerRight = "{$data->count()} pengembalian • {$totalBuku} buku";
                $filename    = "laporan_pengembalian.xlsx";
                break;

            case 'denda':
                $data = Denda::with([
                    'pengembalian.peminjaman.anggota' => fn($q) => $q->withTrashed()->with('jurusan'),
                    'pengembalian.peminjaman.detail_peminjaman.buku' => fn($q) => $q->withTrashed()->with('kategori'),
                ])
                    ->when($status === 'Lunas', fn($q) => $q->where('status_bayar', 'Lunas'))
                    ->when($status === 'Belum Lunas', fn($q) => $q->where('status_bayar', '!=', 'Lunas'))
                    ->when($filterType === 'bulan', fn($q) => $q->whereMonth('created_at', $bulan)->whereYear('created_at', $tahun))
                    ->when($filterType === 'rentang', fn($q) => $q->when($startDate, fn($q2) => $q2->whereDate('created_at', '>=', $startDate))->when($endDate, fn($q2) => $q2->whereDate('created_at', '<=', $endDate)))
                    ->orderByDesc('id')
                    ->get();
                $totalDenda = $data->sum('total_denda');
                $totalBuku  = $data->sum(fn($d) => $d->pengembalian?->peminjaman?->detail_peminjaman?->count() ?? 0);
                $title      = 'Laporan Data Denda';
                $docLabel   = 'DENDA';
                $summaryData = [
                    'Total Tagihan' => $data->count(),
                    'Total Buku'    => $totalBuku,
                    'Total Denda'   => 'Rp ' . number_format($totalDenda, 0, ',', '.'),
                    'Total Pemasukan' => $status === 'Lunas' ? 'Rp ' . number_format($totalDenda, 0, ',', '.') : 'Rp 0',
                    'Periode'       => $periodeLabel,
                    'Filter Status' => ucfirst($status),
                ];
                if ($status !== 'Lunas') {
                    unset($summaryData['Total Pemasukan']);
                }
                $headers = ['No', 'Kode Peminjaman', 'Nama Anggota', 'jurusan', 'Kelas', 'Jumlah Buku', 'Judul Buku', 'Terlambat', 'Tarif/Hari', 'Total Denda', 'Status'];
                foreach ($data as $i => $r) {
                    $p        = $r->pengembalian?->peminjaman ?? null;
                    $judulArr = $p?->detail_peminjaman?->pluck('buku.judul')?->filter()->values()->toArray() ?? [];
                    $rows[] = [
                        $i + 1,
                        $p?->kode_peminjaman ?? '-',
                        $p?->anggota?->nama ?? '-',
                        $p?->anggota?->jurusan?->nama ?? '-',
                        $p?->anggota?->kelas ?? '-',
                        $p?->detail_peminjaman?->count() ?? 0,
                        empty($judulArr) ? '-' : "- " . implode("\n- ", $judulArr),
                        abs($r->pengembalian?->terlambat ?? 0) . ' hari',
                        'Rp ' . number_format($r->nominal_per_hari ?? 0, 0, ',', '.'),
                        'Rp ' . number_format($r->total_denda ?? 0, 0, ',', '.'),
                        $r->status_bayar ?? '-',
                    ];
                }
                if ($data->count() > 0) {
                    $rows[] = ['', '', '', '', '', '', '', '', 'Total Keseluruhan:', 'Rp ' . number_format($totalDenda, 0, ',', '.'), ''];
                }
                $footerRight = "{$data->count()} tagihan • Rp " . number_format($totalDenda, 0, ',', '.');
                $filename    = 'laporan_denda.xlsx';
                break;

            case 'statistik_anggota_teraktif':
                $data = Anggota::with('jurusan')->withCount(['peminjaman' => function($q) use ($filterType, $bulan, $tahun, $startDate, $endDate) {
                    $q->when($filterType === 'bulan', fn($q2) => 
                        $q2->when($bulan !== 'semua', fn($q3) => $q3->whereMonth('tanggal_pinjam', $bulan))
                           ->whereYear('tanggal_pinjam', $tahun)
                    )
                      ->when($filterType === 'rentang', fn($q2) => $q2->when($startDate, fn($q3) => $q3->where('tanggal_pinjam', '>=', $startDate))->when($endDate, fn($q3) => $q3->where('tanggal_pinjam', '<=', $endDate)));
                }])
                    ->having('peminjaman_count', '>', 0)
                    ->orderByDesc('peminjaman_count')
                    ->get();
                $title = 'Anggota Teraktif ' . $periodeLabel;
                $docLabel = 'STATISTIK';
                $summaryData = [
                    'Total Anggota Aktif' => $data->count(),
                    'Periode Laporan' => $periodeLabel,
                    'Periode Cetak' => $now->format('d M Y'),
                ];
                $headers = ['Ranking', 'Kode Anggota', 'Nama Lengkap', 'jurusan', 'Kelas', 'Total Peminjaman'];
                foreach ($data as $i => $r) {
                    $rows[] = [
                        $i + 1,
                        $r->kode_anggota,
                        $r->nama,
                        $r->jurusan?->nama ?? '-',
                        $r->kelas ?? '-',
                        $r->peminjaman_count,
                    ];
                }
                $footerRight = "Total {$data->count()} anggota";
                $filename = 'statistik_anggota_teraktif.xlsx';
                break;

            case 'statistik_buku_terpopuler':
                $data = Buku::with('kategori')->withCount(['detail_peminjaman' => function($q) use ($filterType, $bulan, $tahun, $startDate, $endDate) {
                    $q->whereHas('peminjaman', function($q2) use ($filterType, $bulan, $tahun, $startDate, $endDate) {
                        $q2->when($filterType === 'bulan', fn($q3) => 
                            $q3->when($bulan !== 'semua', fn($q4) => $q4->whereMonth('tanggal_pinjam', $bulan))
                               ->whereYear('tanggal_pinjam', $tahun)
                        )
                           ->when($filterType === 'rentang', fn($q3) => $q3->when($startDate, fn($q4) => $q4->where('tanggal_pinjam', '>=', $startDate))->when($endDate, fn($q4) => $q4->where('tanggal_pinjam', '<=', $endDate)));
                    });
                }])
                    ->having('detail_peminjaman_count', '>', 0)
                    ->orderByDesc('detail_peminjaman_count')
                    ->get();
                $title = 'Buku Terpopuler ' . $periodeLabel;
                $docLabel = 'STATISTIK';
                $summaryData = [
                    'Total Buku Populer' => $data->count(),
                    'Periode Laporan' => $periodeLabel,
                    'Periode Cetak' => $now->format('d M Y'),
                ];
                $headers = ['Ranking', 'Kode Buku', 'Judul Buku', 'Pengarang', 'Kategori', 'Total Dipinjam'];
                foreach ($data as $i => $r) {
                    $rows[] = [
                        $i + 1,
                        $r->kode_buku,
                        $r->judul,
                        $r->pengarang,
                        $r->kategori?->nama ?? '-',
                        $r->detail_peminjaman_count,
                    ];
                }
                $footerRight = "Total {$data->count()} buku";
                $filename = 'statistik_buku_terpopuler.xlsx';
                break;

            case 'statistik_anggota_terlambat':
                $data = Anggota::with('jurusan')->withCount(['peminjaman as terlambat_count' => function ($query) use ($filterType, $bulan, $tahun, $startDate, $endDate) {
                    $query->whereHas('pengembalian', function ($q) use ($filterType, $bulan, $tahun, $startDate, $endDate) {
                        $q->where('terlambat', '>', 0)
                          ->when($filterType === 'bulan', fn($q2) => 
                              $q2->when($bulan !== 'semua', fn($q3) => $q3->whereMonth('tanggal_dikembalikan', $bulan))
                                 ->whereYear('tanggal_dikembalikan', $tahun)
                          )
                          ->when($filterType === 'rentang', fn($q2) => $q2->when($startDate, fn($q3) => $q3->where('tanggal_dikembalikan', '>=', $startDate))->when($endDate, fn($q3) => $q3->where('tanggal_dikembalikan', '<=', $endDate)));
                    });
                }])->having('terlambat_count', '>', 0)->orderByDesc('terlambat_count')->get();
                $title = 'Anggota Paling Sering Terlambat ' . $periodeLabel;
                $docLabel = 'STATISTIK';
                $summaryData = [
                    'Total Anggota Terlambat' => $data->count(),
                    'Periode Laporan' => $periodeLabel,
                    'Periode Cetak' => $now->format('d M Y'),
                ];
                $headers = ['Ranking', 'Kode Anggota', 'Nama Lengkap', 'jurusan', 'Kelas', 'Jumlah Keterlambatan'];
                foreach ($data as $i => $r) {
                    $rows[] = [
                        $i + 1,
                        $r->kode_anggota,
                        $r->nama,
                        $r->jurusan?->nama ?? '-',
                        $r->kelas ?? '-',
                        $r->terlambat_count,
                    ];
                }
                $footerRight = "Total {$data->count()} anggota";
                $filename = 'statistik_anggota_terlambat.xlsx';
                break;

            default:
                abort(404, 'Modul laporan tidak ditemukan');
        }

        $spreadsheet = new Spreadsheet();
        
        // Font Default (Calibri / Arial)
        $spreadsheet->getDefaultStyle()->getFont()->setName('Calibri')->setSize(10);
        
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle(ucfirst($modul));

        // Pengaturan Halaman Cetak (A4 Portrait)
        $sheet->getPageSetup()
              ->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_PORTRAIT)
              ->setPaperSize(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::PAPERSIZE_A4);

        $totalCols  = count($headers);
        $highestCol = Coordinate::stringFromColumnIndex($totalCols);

        // 1. Judul & Subjudul
        $sheet->setCellValue('A1', $title);
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 18, 'color' => ['argb' => 'FF111827']],
        ]);
        
        $sheet->setCellValue($highestCol . '1', $docLabel);
        $sheet->setCellValue($highestCol . '2', 'Dicetak: ' . $now->format('d') . ' ' . $nb[$now->month] . ' ' . $now->format('Y') . ', ' . $now->format('H:i') . ' WIB');
        $sheet->getStyle($highestCol . '1:' . $highestCol . '2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle($highestCol . '1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['argb' => 'FF374151']],
            'borders' => ['outline' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFD1D5DB']]]
        ]);
        $sheet->getStyle($highestCol . '2')->applyFromArray(['font' => ['size' => 9, 'color' => ['argb' => 'FF6B7280']]]);

        // 2. Ringkasan Statistik
        $summaryRow = 4;
        $colIdx     = 1;
        $sheet->getStyle('A4:' . $highestCol . '5')
            ->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFF9FAFB');
        $sheet->getStyle('A4:' . $highestCol . '5')
            ->getBorders()->getOutline()->setBorderStyle(Border::BORDER_THIN)->getColor()->setARGB('FFE5E7EB');

        foreach ($summaryData as $lbl => $val) {
            $colStr     = Coordinate::stringFromColumnIndex($colIdx);
            $nextColStr = Coordinate::stringFromColumnIndex(min($colIdx + 1, $totalCols));

            $sheet->setCellValue($colStr . $summaryRow, strtoupper($lbl));
            $sheet->setCellValue($colStr . ($summaryRow + 1), $val);

            $sheet->getStyle($colStr . $summaryRow)->applyFromArray([
                'font' => ['size' => 8, 'bold' => true, 'color' => ['argb' => 'FF6B7280']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
            ]);
            $sheet->getStyle($colStr . ($summaryRow + 1))->applyFromArray([
                'font' => ['size' => 11, 'bold' => true, 'color' => ['argb' => 'FF111827']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
            ]);
            if ($lbl === 'Terlambat' || $lbl === 'Total Denda') {
                $sheet->getStyle($colStr . ($summaryRow + 1))->getFont()->setColor(new Color('FFB91C1C'));
            }

            if ($colStr !== $nextColStr) {
                $sheet->mergeCells($colStr . $summaryRow . ':' . $nextColStr . $summaryRow);
                $sheet->mergeCells($colStr . ($summaryRow + 1) . ':' . $nextColStr . ($summaryRow + 1));
            }

            $colIdx += 2;
            if ($colIdx > $totalCols) break;
        }

        // 3. Header Tabel (baris 7)
        $headerRow = 7;
        foreach ($headers as $idx => $header) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($idx + 1);
            $sheet->setCellValue($colLetter . $headerRow, strtoupper($header));
        }
        $sheet->getStyle('A' . $headerRow . ':' . $highestCol . $headerRow)->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF'], 'size' => 11],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF374151']],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF4B5563']]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension($headerRow)->setRowHeight(25);

        // 4. Baris Data
        $isDenda      = ($modul === 'denda');
        $totalRows    = count($rows);
        $rowIndex     = $headerRow + 1;

        // Kolom yg harus di-set as STRING secara eksplisit agar format tidak hancur
        $stringColumns = ['No HP', 'Kode Anggota', 'Kode Buku', 'Kode Peminjaman', 'Kode'];

        foreach ($rows as $rIdx => $row) {
            $isTotalRow = $isDenda && ($rIdx === $totalRows - 1) && $data->count() > 0;

            foreach ($row as $cIdx => $val) {
                $colNum = $cIdx + 1;
                $headerName = $headers[$cIdx] ?? '';
                
                // Pastikan Kode/No HP diset explicit as string
                if (in_array($headerName, $stringColumns) && !$isTotalRow) {
                    $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colNum);
                    $sheet->setCellValueExplicit($colLetter . $rowIndex, (string) $val, DataType::TYPE_STRING);
                } else {
                    $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colNum);
                    $sheet->setCellValue($colLetter . $rowIndex, $val);
                }
                
                // Wrap text
                if (in_array($headerName, ['Judul Buku', 'Nama Anggota', 'Nama Lengkap']) && !$isTotalRow) {
                    $sheet->getStyle([$colNum, $rowIndex])->getAlignment()->setWrapText(true);
                }
            }

            if ($isTotalRow) {
                $sheet->getStyle('A' . $rowIndex . ':' . $highestCol . $rowIndex)->applyFromArray([
                    'font'    => ['bold' => true, 'size' => 11],
                    'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFF3F4F6']],
                    'borders' => ['top' => ['borderStyle' => Border::BORDER_THIN]],
                ]);
                $sheet->getStyle(Coordinate::stringFromColumnIndex(9) . $rowIndex)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                $sheet->getStyle(Coordinate::stringFromColumnIndex(10) . $rowIndex)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            }

            $rowIndex++;
        }

        // 5. Border & Alignment
        if (count($rows) > 0) {
            $dataStart = $headerRow + 1;
            $dataEnd   = $rowIndex - 1;
            
            // Default border & font size & vertical middle
            $sheet->getStyle('A' . $dataStart . ':' . $highestCol . $dataEnd)->applyFromArray([
                'font'      => ['size' => 11],
                'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFE5E7EB']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            foreach ($headers as $idx => $header) {
                $hl  = strtolower($header);
                $col = Coordinate::stringFromColumnIndex($idx + 1);
                $rng = $col . $dataStart . ':' . $col . $dataEnd;

                // Center Align
                if (in_array($hl, ['no', 'ranking', 'kelas', 'jurusan', 'stok', 'jumlah buku', 'kategori', 'status', 'keterlambatan', 'terlambat', 'total peminjaman', 'total dipinjam', 'jumlah keterlambatan'])
                    || str_contains($hl, 'kode')
                    || str_contains($hl, 'tanggal')
                    || str_contains($hl, 'jatuh tempo')) {
                    $sheet->getStyle($rng)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                }
                // Left Align
                elseif (in_array($hl, ['nama anggota', 'nama lengkap', 'judul buku', 'pengarang'])) {
                    $sheet->getStyle($rng)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                }
                // Right Align
                elseif (in_array($hl, ['tarif/hari', 'total denda'])) {
                    $sheet->getStyle($rng)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }
            }
        }

        // 6. Footer
        $footerRow = $rowIndex + 1;
        $sheet->setCellValue('A' . $footerRow, $footerLeft);
        $sheet->setCellValue($highestCol . $footerRow, $footerRight);
        $sheet->getStyle('A' . $footerRow . ':' . $highestCol . $footerRow)->applyFromArray([
            'font' => ['size' => 10, 'color' => ['argb' => 'FF6B7280']],
        ]);
        $sheet->getStyle($highestCol . $footerRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle('A' . $footerRow . ':' . $highestCol . $footerRow)
            ->getBorders()->getTop()->setBorderStyle(Border::BORDER_THIN)->getColor()->setARGB('FFE5E7EB');

        // 7. Auto Width & Height
        for ($i = 1; $i <= $totalCols; $i++) {
            $col = Coordinate::stringFromColumnIndex($i);
            $headerName = strtolower($headers[$i - 1] ?? '');
            
            if ($headerName === 'judul buku' || $headerName === 'judul') {
                $sheet->getColumnDimension($col)->setWidth(30);
            } elseif ($headerName === 'no' || $headerName === 'ranking') {
                $sheet->getColumnDimension($col)->setWidth(8);
            } else {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }
        }

        $writer = new Xlsx($spreadsheet);
        return response()->stream(
            fn() => $writer->save('php://output'),
            200,
            [
                'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
                'Cache-Control'       => 'max-age=0',
            ]
        );
    }
}


