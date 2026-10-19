<?php

namespace App\Http\Controllers;

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
        $orderSql = "ORDER BY " . $sortBy . " " . strtoupper($sortDir);

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

    public function show($type, $id)
    {
        if ($type === 'Peminjaman') {
            return redirect()->route('peminjaman.show', $id);
        } elseif ($type === 'Pengembalian') {
            return redirect()->route('pengembalian.show', $id);
        } elseif ($type === 'Pembayaran Denda') {
            return redirect()->route('denda.show', $id);
        }
        return redirect()->route('riwayat-transaksi.index');
    }
}
