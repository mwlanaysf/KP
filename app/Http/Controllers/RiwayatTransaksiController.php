<?php

namespace App\Http\Controllers;

use App\Models\Denda;
use App\Models\Peminjaman;
use App\Models\Pengembalian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RiwayatTransaksiController extends Controller
{
    public function index(Request $request)
    {
        $search      = $request->get('search');
        $filterJenis = $request->get('jenis', 'semua');
        $sortBy      = $request->get('sortBy', 'tanggal');
        $sortDir     = $request->get('sortDir', 'desc');
        $tanggalDari = $request->get('tanggal_dari');
        $tanggalSampai = $request->get('tanggal_sampai');
        $perPage     = 15;

        $allowedSorts = ['tanggal', 'jenis_transaksi', 'referensi', 'status', 'nama_anggota', 'nama_petugas'];
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'tanggal';
        }
        $sortDir = strtolower($sortDir) === 'asc' ? 'asc' : 'desc';

        // ---- Build raw UNION SQL with petugas ----

        // GROUP_CONCAT syntax berbeda antara SQLite dan MySQL
        $isMySQL = config('database.default') === 'mysql';
        $groupConcatBuku = $isMySQL
            ? "GROUP_CONCAT(b.judul SEPARATOR '||')"
            : "GROUP_CONCAT(b.judul, '||')";

        // Peminjaman sub-select
        $peminjamanSql = "
            SELECT
                'Peminjaman' AS jenis_transaksi,
                p.id         AS id_transaksi,
                p.kode_peminjaman AS referensi,
                a.nama       AS nama_anggota,
                p.tanggal_pinjam AS tanggal,
                p.created_at AS waktu,
                p.updated_at AS updated_at,
                p.status     AS status,
                (SELECT {$groupConcatBuku} FROM detail_peminjaman dp JOIN buku b ON b.id = dp.buku_id WHERE dp.peminjaman_id = p.id) AS buku_list
            FROM peminjaman p
            INNER JOIN anggota a ON a.id = p.anggota_id
        ";

        // Pengembalian sub-select
        $pengembalianSql = "
            SELECT
                'Pengembalian' AS jenis_transaksi,
                pen.id         AS id_transaksi,
                p.kode_peminjaman AS referensi,
                a.nama         AS nama_anggota,
                pen.tanggal_dikembalikan AS tanggal,
                pen.created_at AS waktu,
                pen.updated_at AS updated_at,
                CASE WHEN pen.terlambat > 0 THEN 'Terlambat' ELSE 'Tepat Waktu' END AS status,
                (SELECT {$groupConcatBuku} FROM detail_peminjaman dp JOIN buku b ON b.id = dp.buku_id WHERE dp.peminjaman_id = p.id) AS buku_list
            FROM pengembalian pen
            INNER JOIN peminjaman p ON p.id = pen.peminjaman_id
            INNER JOIN anggota a   ON a.id = p.anggota_id
        ";

        // Pembayaran Denda sub-select (only Lunas = completed payment history)
        $dendaSql = "
            SELECT
                'Pembayaran Denda' AS jenis_transaksi,
                d.id    AS id_transaksi,
                p.kode_peminjaman AS referensi,
                a.nama  AS nama_anggota,
                DATE(d.updated_at) AS tanggal,
                d.updated_at AS waktu,
                d.updated_at AS updated_at,
                d.status_bayar AS status,
                (SELECT {$groupConcatBuku} FROM detail_peminjaman dp JOIN buku b ON b.id = dp.buku_id WHERE dp.peminjaman_id = p.id) AS buku_list
            FROM denda d
            INNER JOIN pengembalian pen_d ON pen_d.id = d.pengembalian_id
            INNER JOIN peminjaman p ON p.id = pen_d.peminjaman_id
            INNER JOIN anggota a    ON a.id = p.anggota_id
            WHERE d.status_bayar = 'Lunas'
        ";

        // Filter by jenis
        if ($filterJenis === 'Peminjaman') {
            $unionSql = "({$peminjamanSql}) AS combined_table";
        } elseif ($filterJenis === 'Pengembalian') {
            $unionSql = "({$pengembalianSql}) AS combined_table";
        } elseif ($filterJenis === 'Pembayaran Denda') {
            $unionSql = "({$dendaSql}) AS combined_table";
        } else {
            // Semua: UNION ALL
            $unionSql = "(
                {$peminjamanSql}
                UNION ALL
                {$pengembalianSql}
                UNION ALL
                {$dendaSql}
            ) AS combined_table";
        }

        // Build WHERE clauses
        $conditions = [];
        $params     = [];

        if ($search) {
            $conditions[] = "(referensi LIKE ? OR nama_anggota LIKE ?)";
            $params[]     = "%{$search}%";
            $params[]     = "%{$search}%";
        }

        if ($tanggalDari) {
            $conditions[] = "tanggal >= ?";
            $params[]     = $tanggalDari;
        }

        if ($tanggalSampai) {
            $conditions[] = "tanggal <= ?";
            $params[]     = $tanggalSampai;
        }

        $where    = count($conditions) ? "WHERE " . implode(" AND ", $conditions) : '';
        // Kolom "tanggal" hanya berisi tanggal (tanpa jam), jadi urutkan berdasarkan "waktu"
        // (timestamp saat transaksi dicatat) supaya transaksi terbaru selalu paling atas.
        $dir      = strtoupper($sortDir);
        $orderCol = $sortBy === 'tanggal' ? 'waktu' : $sortBy;
        $orderSql = "ORDER BY {$orderCol} {$dir}, waktu {$dir}, id_transaksi {$dir}";

        // Count for pagination
        $countSql = "SELECT COUNT(*) AS total FROM {$unionSql} {$where}";
        $total    = DB::selectOne($countSql, $params)->total;

        // Paginate
        $page   = max(1, (int) $request->get('page', 1));
        $offset = ($page - 1) * $perPage;

        $dataSql = "SELECT * FROM {$unionSql} {$where} {$orderSql} LIMIT {$perPage} OFFSET {$offset}";
        $rows    = DB::select($dataSql, $params);

        foreach ($rows as $row) {
            if ($row->buku_list) {
                $row->buku = explode('||', $row->buku_list);
            } else {
                $row->buku = [];
            }
            unset($row->buku_list);
        }

        // Build paginator-like object
        $lastPage = max(1, (int) ceil($total / $perPage));
        $from     = $total > 0 ? $offset + 1 : 0;
        $to       = min($offset + $perPage, $total);

        // Build links array for pagination component (Previous + pages + Next)
        $queryBase = array_filter($request->query(), fn($k) => $k !== 'page', ARRAY_FILTER_USE_KEY);
        $links = [];
        $links[] = [
            'url'    => $page > 1 ? route('riwayat-transaksi.index', array_merge($queryBase, ['page' => $page - 1])) : null,
            'label'  => '&laquo; Previous',
            'active' => false,
        ];
        for ($i = 1; $i <= $lastPage; $i++) {
            $links[] = [
                'url'    => route('riwayat-transaksi.index', array_merge($queryBase, ['page' => $i])),
                'label'  => (string) $i,
                'active' => $i === (int) $page,
            ];
        }
        $links[] = [
            'url'    => $page < $lastPage ? route('riwayat-transaksi.index', array_merge($queryBase, ['page' => $page + 1])) : null,
            'label'  => 'Next &raquo;',
            'active' => false,
        ];

        $riwayat = [
            'data'         => $rows,
            'current_page' => (int) $page,
            'last_page'    => $lastPage,
            'per_page'     => $perPage,
            'total'        => $total,
            'from'         => $from,
            'to'           => $to,
            'links'        => $links,
        ];

        return Inertia::render('RiwayatTransaksi/Index', [
            'riwayat'        => $riwayat,
            'search'         => $search,
            'sortBy'         => $sortBy,
            'sortDir'        => $sortDir,
            'filterJenis'    => $filterJenis,
            'tanggal_dari'   => $tanggalDari,
            'tanggal_sampai' => $tanggalSampai,
        ]);
    }

    public function show(Request $request, $type, $id)
    {
        $slug = strtolower(str_replace([' ', '_'], '-', $type));

        // Simpan filter/pencarian/halaman dari riwayat supaya tombol "Kembali" mengembalikan tampilan semula
        $backQuery = array_filter(
            $request->only(['search', 'jenis', 'sortBy', 'sortDir', 'tanggal_dari', 'tanggal_sampai', 'page']),
            fn ($v) => $v !== null && $v !== ''
        );
        $backUrl = route('riwayat-transaksi.index', $backQuery);

        $pengembalian = null;
        $denda        = null;

        if ($slug === 'peminjaman') {
            $jenis      = 'Peminjaman';
            $peminjaman = Peminjaman::findOrFail($id);
        } elseif ($slug === 'pengembalian') {
            $jenis        = 'Pengembalian';
            $pengembalian = Pengembalian::with(['petugas', 'denda'])->findOrFail($id);
            $peminjaman   = $pengembalian->peminjaman;
            $denda        = $pengembalian->denda;
        } elseif (in_array($slug, ['denda', 'pembayaran-denda'], true)) {
            $jenis        = 'Pembayaran Denda';
            $denda        = Denda::with('pengembalian.petugas')->findOrFail($id);
            $pengembalian = $denda->pengembalian;
            $peminjaman   = $pengembalian?->peminjaman;
        } else {
            abort(404);
        }

        abort_if(! $peminjaman, 404);

        $peminjaman->loadMissing(['anggota.jurusan', 'detail_peminjaman.buku', 'petugas']);
        $anggota = $peminjaman->anggota;

        $buku = $peminjaman->detail_peminjaman->map(fn ($d) => [
            'id'        => $d->id,
            'kode_buku' => $d->buku?->kode_buku ?? '-',
            'judul'     => $d->buku?->judul ?? '-',
            'pengarang' => $d->buku?->pengarang ?? '-',
        ])->values();

        if ($jenis === 'Peminjaman') {
            $status = $peminjaman->status;
        } elseif ($jenis === 'Pengembalian') {
            $status = ($pengembalian->terlambat ?? 0) > 0 ? 'Terlambat' : 'Tepat Waktu';
        } else {
            $status = $denda->status_bayar;
        }

        return Inertia::render('RiwayatTransaksi/Show', [
            'jenis'    => $jenis,
            'status'   => $status,
            'back_url' => $backUrl,
            'anggota'  => [
                'kode_anggota' => $anggota?->kode_anggota ?? '-',
                'nama'         => $anggota?->nama ?? '-',
                'kelas'        => $anggota?->kelas ?? '-',
                'jurusan'      => $anggota?->jurusan?->nama ?? '-',
            ],
            'peminjaman' => [
                'kode_peminjaman' => $peminjaman->kode_peminjaman,
                'tanggal_pinjam'  => $peminjaman->tanggal_pinjam,
                'tanggal_kembali' => $peminjaman->tanggal_kembali,
                'status'          => $peminjaman->status,
                'petugas'         => $peminjaman->petugas?->name ?? '-',
            ],
            'pengembalian' => $pengembalian ? [
                'tanggal_dikembalikan' => $pengembalian->tanggal_dikembalikan,
                'hari_terlambat'       => (int) ($pengembalian->terlambat ?? 0),
                'petugas'              => $pengembalian->petugas?->name ?? '-',
            ] : null,
            'denda' => $denda ? [
                'nominal_per_hari'   => $denda->nominal_per_hari,
                'total_denda'        => $denda->total_denda,
                'status_bayar'       => $denda->status_bayar,
                'tanggal_pembayaran' => $denda->status_bayar === 'Lunas' && $denda->updated_at
                    ? $denda->updated_at->toDateString()
                    : null,
            ] : null,
            'buku' => $buku,
        ]);
    }
}
