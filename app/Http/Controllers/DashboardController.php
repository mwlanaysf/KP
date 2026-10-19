<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Anggota;
use App\Models\Buku;
use App\Models\Peminjaman;
use App\Models\Pengembalian;
use App\Services\DendaService;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();

        // 1. KPI UTAMA
        $totalAnggota = Anggota::count();
        $totalBuku = Buku::count();
        $totalPeminjamanAktif = Peminjaman::where('status', 'Dipinjam')->count();
        
        $dendaBelumBayar = \App\Models\Denda::where('total_denda', '>', 0)
            ->where('status_bayar', '!=', 'Lunas')
            ->count();

        // 2. DAFTAR KETERLAMBATAN
        $lambatMode = request('lambat_mode', 'per_bulan');
        $lambatBulan = request('lambat_bulan', Carbon::today()->format('n'));
        $lambatTahun = request('lambat_tahun', Carbon::today()->format('Y'));

        $daftarKeterlambatan = Anggota::with('jurusan')->whereHas('peminjaman.pengembalian', function($q) use ($lambatMode, $lambatBulan, $lambatTahun) {
            $q->where('terlambat', '>', 0)
              ->when($lambatMode === 'per_bulan', function($q2) use ($lambatBulan, $lambatTahun) {
                  $q2->whereMonth('tanggal_dikembalikan', $lambatBulan)
                     ->whereYear('tanggal_dikembalikan', $lambatTahun);
              });
        })->get()->map(function($a) use ($lambatMode, $lambatBulan, $lambatTahun) {
            $pengembalianQuery = \App\Models\Pengembalian::whereHas('peminjaman', function($q) use ($a) {
                $q->where('anggota_id', $a->id);
            })->where('terlambat', '>', 0)
              ->when($lambatMode === 'per_bulan', function($q) use ($lambatBulan, $lambatTahun) {
                  $q->whereMonth('tanggal_dikembalikan', $lambatBulan)
                    ->whereYear('tanggal_dikembalikan', $lambatTahun);
              });
            
            $totalHari = $pengembalianQuery->sum('terlambat');
            
            $pengembalianIds = $pengembalianQuery->pluck('id');
            $totalDenda = \App\Models\Denda::whereIn('pengembalian_id', $pengembalianIds)->sum('total_denda');
            
            return [
                'id' => $a->id,
                'nama_anggota' => $a->nama,
                'kelas_jurusan' => $a->kelas . ' ' . ($a->jurusan->nama ?? ''),
                'keterlambatan' => $totalHari,
                'estimasi_denda' => $totalDenda
            ];
        })->sortByDesc('keterlambatan')->take(5)->values()->toArray();

        // 3. AKTIVITAS TERBARU (Tidak terbatas hari ini, filter masa depan)
        $aktivitasPinjam = Peminjaman::with(['anggota', 'detail_peminjaman.buku'])
            ->where('created_at', '<=', now())
            ->orderBy('created_at', 'desc')
            ->take(8)
            ->get()
            ->map(function ($p) {
                $judulBuku = $p->detail_peminjaman->first()?->buku->judul ?? '-';
                return [
                    'id' => 'p-' . $p->id,
                    'nama_anggota' => $p->anggota->nama ?? '-',
                    'aksi' => 'Pinjam',
                    'judul_buku' => $judulBuku,
                    'waktu_raw' => $p->created_at,
                    'timestamp' => $p->created_at->timestamp
                ];
            });

        $aktivitasKembali = Pengembalian::with(['peminjaman.anggota', 'peminjaman.detail_peminjaman.buku'])
            ->where('created_at', '<=', now())
            ->orderBy('created_at', 'desc')
            ->take(8)
            ->get()
            ->map(function ($p) {
                $judulBuku = $p->peminjaman->detail_peminjaman->first()?->buku->judul ?? '-';
                return [
                    'id' => 'k-' . $p->id,
                    'nama_anggota' => $p->peminjaman->anggota->nama ?? '-',
                    'aksi' => 'Kembali',
                    'judul_buku' => $judulBuku,
                    'waktu_raw' => $p->created_at,
                    'timestamp' => $p->created_at->timestamp
                ];
            });

        $aktivitasAnggota = Anggota::where('created_at', '<=', now())
            ->orderBy('created_at', 'desc')
            ->take(8)
            ->get()
            ->map(function ($a) {
                return [
                    'id' => 'a-' . $a->id,
                    'nama_anggota' => $a->nama,
                    'aksi' => 'Daftar',
                    'judul_buku' => 'Anggota Baru',
                    'waktu_raw' => $a->created_at,
                    'timestamp' => $a->created_at->timestamp
                ];
            });

        $aktivitasDenda = \App\Models\Denda::with('pengembalian.peminjaman.anggota')
            ->where('status_bayar', 'Lunas')
            ->where('updated_at', '<=', now())
            ->orderBy('updated_at', 'desc')
            ->take(8)
            ->get()
            ->map(function ($d) {
                return [
                    'id' => 'd-' . $d->id,
                    'nama_anggota' => $d->pengembalian->peminjaman->anggota->nama ?? '-',
                    'aksi' => 'Bayar',
                    'judul_buku' => 'Pelunasan Denda Rp ' . number_format($d->total_denda, 0, ',', '.'),
                    'waktu_raw' => $d->updated_at,
                    'timestamp' => $d->updated_at->timestamp
                ];
            });

        $aktivitasTerbaru = $aktivitasPinjam->concat($aktivitasKembali)
            ->concat($aktivitasAnggota)
            ->concat($aktivitasDenda)
            ->sortByDesc('timestamp')
            ->values()
            ->take(8)
            ->map(function ($act) use ($today) {
                $actDate = Carbon::parse($act['waktu_raw']);
                $actStartOfDay = $actDate->copy()->startOfDay();
                
                $diffDays = $today->diffInDays($actStartOfDay, false);

                if ($diffDays == 0) {
                    $act['waktu_format'] = $actDate->format('H:i');
                } else if ($diffDays == -1) {
                    $act['waktu_format'] = 'Kemarin';
                } else {
                    $act['waktu_format'] = abs($diffDays) . ' hari lalu';
                }
                
                return [
                    'id' => $act['id'],
                    'nama_anggota' => $act['nama_anggota'],
                    'aksi' => $act['aksi'],
                    'judul_buku' => $act['judul_buku'],
                    'waktu' => $act['waktu_format']
                ];
            })
            ->toArray();

        // 4. STATISTIK BUKU PALING SERING DIPINJAM
        $bukuMode = request('buku_mode', 'per_bulan');
        $bukuBulan = request('buku_bulan', Carbon::today()->format('n'));
        $bukuTahun = request('buku_tahun', Carbon::today()->format('Y'));

        $topBooks = Buku::with('kategori')->withCount(['detail_peminjaman' => function($q) use ($bukuMode, $bukuBulan, $bukuTahun) {
            $q->whereHas('peminjaman', function($q2) use ($bukuMode, $bukuBulan, $bukuTahun) {
                $q2->when($bukuMode === 'per_bulan', function($q3) use ($bukuBulan, $bukuTahun) {
                    $q3->whereMonth('tanggal_pinjam', $bukuBulan)
                       ->whereYear('tanggal_pinjam', $bukuTahun);
                });
            });
        }])
        ->having('detail_peminjaman_count', '>', 0)
        ->orderByDesc('detail_peminjaman_count')
        ->take(5)
        ->get()
        ->map(function ($item) {
            return [
                'id' => $item->id,
                'judul' => $item->judul ?? 'Buku Dihapus',
                'kategori' => $item->kategori->nama ?? '-',
                'stok' => $item->stok ?? 0,
                'total_dipinjam' => $item->detail_peminjaman_count
            ];
        });

        // 5. STATISTIK ANGGOTA PALING AKTIF
        $anggotaMode = request('anggota_mode', 'per_bulan');
        $anggotaBulan = request('anggota_bulan', Carbon::today()->format('n'));
        $anggotaTahun = request('anggota_tahun', Carbon::today()->format('Y'));

        $topMembers = Anggota::with('jurusan')->withCount(['peminjaman' => function($q) use ($anggotaMode, $anggotaBulan, $anggotaTahun) {
            $q->when($anggotaMode === 'per_bulan', function($q2) use ($anggotaBulan, $anggotaTahun) {
                $q2->whereMonth('tanggal_pinjam', $anggotaBulan)
                   ->whereYear('tanggal_pinjam', $anggotaTahun);
            });
        }])
        ->having('peminjaman_count', '>', 0)
        ->orderByDesc('peminjaman_count')
        ->take(5)
        ->get()
        ->map(function ($item) {
            return [
                'id' => $item->id,
                'nama' => $item->nama ?? 'Anggota Dihapus',
                'kode_anggota' => $item->kode_anggota ?? '-',
                'jurusan' => $item->jurusan->nama ?? '-',
                'kelas' => $item->kelas ?? '-',
                'total_transaksi' => $item->peminjaman_count
            ];
        });

        // 6. GRAFIK PEMINJAMAN (Mode: Per Bulan atau 30 Hari Terakhir)
        $selectedMode = request('mode', 'month');
        $selectedMonthStr = request('month', Carbon::today()->format('Y-m'));

        if ($selectedMode === '30days') {
            $endDate = Carbon::today();
            $startDate = Carbon::today()->subDays(29);
            
            $prevEndDate = Carbon::today()->subDays(30);
            $prevStartDate = Carbon::today()->subDays(59);
            
            $daysToDivide = 30;
        } else {
            try {
                $monthDate = Carbon::createFromFormat('Y-m', $selectedMonthStr)->startOfMonth();
            } catch (\Exception $e) {
                $monthDate = Carbon::today()->startOfMonth();
                $selectedMonthStr = $monthDate->format('Y-m');
            }

            $startDate = $monthDate->copy()->startOfMonth();
            $endDate = $monthDate->copy()->endOfMonth();

            $prevMonthDate = $monthDate->copy()->subMonth();
            $prevStartDate = $prevMonthDate->copy()->startOfMonth();
            $prevEndDate = $prevMonthDate->copy()->endOfMonth();
            
            $daysToDivide = $monthDate->isCurrentMonth() ? max(1, Carbon::today()->day) : $monthDate->daysInMonth;
        }
        
        $peminjamanHarian = Peminjaman::select(
            \DB::raw('DATE(created_at) as date'),
            \DB::raw('COUNT(*) as total')
        )
        ->whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
        ->groupBy('date')
        ->get()
        ->keyBy('date');

        $period = \Carbon\CarbonPeriod::create($startDate, $endDate);
        
        $chartDataFormatted = collect($period)->map(function ($date) use ($peminjamanHarian, $selectedMode) {
            $dateString = $date->format('Y-m-d');
            return [
                'name' => $selectedMode === '30days' ? $date->translatedFormat('d M') : $date->format('j'),
                'full_date' => $date->translatedFormat('d M Y'),
                'total' => isset($peminjamanHarian[$dateString]) ? $peminjamanHarian[$dateString]->total : 0,
            ];
        })->toArray();

        // Available Months for dropdown
        $oldestTransaction = Peminjaman::orderBy('created_at', 'asc')->first();
        $availableMonths = [];
        $currentAvailable = $oldestTransaction ? Carbon::parse($oldestTransaction->created_at)->startOfMonth() : Carbon::now()->startOfMonth();
        $nowMonth = Carbon::now()->startOfMonth();
        
        $bulanId = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        while ($currentAvailable <= $nowMonth) {
            $monthNum = (int) $currentAvailable->format('n');
            $year = $currentAvailable->format('Y');
            $availableMonths[] = [
                'value' => $currentAvailable->format('Y-m'),
                'label' => $bulanId[$monthNum] . ' ' . $year
            ];
            $currentAvailable->addMonth();
        }
        $availableMonths = array_reverse($availableMonths);

        // Available Years
        $availableYears = [];
        $currentYear = (int) Carbon::today()->format('Y');
        $minYear = $oldestTransaction ? (int) Carbon::parse($oldestTransaction->created_at)->format('Y') : $currentYear;
        for ($y = $currentYear; $y >= $minYear; $y--) {
            $availableYears[] = (string) $y;
        }

        // Statistics Comparison
        $prevTotal = Peminjaman::whereBetween('created_at', [$prevStartDate->startOfDay(), $prevEndDate->endOfDay()])->count();
        $currTotal = Peminjaman::whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])->count();

        $chartDiff = $currTotal - $prevTotal;
        $diffPercentage = $prevTotal > 0 ? round(($chartDiff / $prevTotal) * 100, 1) : ($currTotal > 0 ? 100 : 0);
        
        $dailyAverage = round($currTotal / $daysToDivide, 1);

        return Inertia::render('dashboard', [
            'kpi' => [
                'total_anggota' => $totalAnggota,
                'total_buku' => $totalBuku,
                'total_peminjaman_aktif' => $totalPeminjamanAktif,
                'denda_belum_bayar' => $dendaBelumBayar,
            ],
            'keterlambatan' => $daftarKeterlambatan,
            'aktivitas_terbaru' => $aktivitasTerbaru,
            'top_books' => $topBooks,
            'top_members' => $topMembers,
            'chart_data' => $chartDataFormatted,
            'chart_stats' => [
                'total' => $currTotal,
                'average' => $dailyAverage,
                'diff_amount' => $chartDiff,
                'diff_percentage' => $diffPercentage
            ],
            'filters' => [
                'available_months' => $availableMonths,
                'available_years' => $availableYears,
                'selected_month' => $selectedMonthStr,
                'selected_mode' => $selectedMode,
                'buku_mode' => $bukuMode,
                'buku_bulan' => $bukuBulan,
                'buku_tahun' => $bukuTahun,
                'anggota_mode' => $anggotaMode,
                'anggota_bulan' => $anggotaBulan,
                'anggota_tahun' => $anggotaTahun,
                'lambat_mode' => $lambatMode,
                'lambat_bulan' => $lambatBulan,
                'lambat_tahun' => $lambatTahun,
            ]
        ]);
    }
}

