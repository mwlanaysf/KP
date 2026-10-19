<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Perpustakaan</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        h2 { text-align: center; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th, td { border: 1px solid #444; padding: 6px; text-align: left; }
        th { background: #f0f0f0; }
    </style>
</head>
<body>

<h2>Laporan Data Peminjaman</h2>
<table>
    <thead>
        <tr>
            <th>No</th>
            <th>Nama Peminjam</th>
            <th>Judul Buku</th>
            <th>Tanggal Pinjam</th>
            <th>Tanggal Kembali</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($peminjaman as $i => $p)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ $p->nama_peminjam }}</td>
            <td>{{ $p->buku->judul ?? '-' }}</td>
            <td>{{ $p->tanggal_pinjam }}</td>
            <td>{{ $p->tanggal_kembali }}</td>
            <td>{{ $p->status }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

<h2>Laporan Data Pengembalian</h2>
<table>
    <thead>
        <tr>
            <th>No</th>
            <th>Nama Peminjam</th>
            <th>Judul Buku</th>
            <th>Tanggal Kembali</th>
            <th>Tanggal Pengembalian</th>
            <th>Terlambat</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($pengembalian as $i => $p)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ $p->peminjaman->nama_peminjam ?? '-' }}</td>
            <td>{{ $p->peminjaman->buku->judul ?? '-' }}</td>
            <td>{{ $p->peminjaman->tanggal_kembali ?? '-' }}</td>
            <td>{{ $p->tanggal_pengembalian }}</td>
            <td>{{ $p->terlambat_hari }} hari</td>
        </tr>
        @endforeach
    </tbody>
</table>

<h2>Laporan Data Denda</h2>
<table>
    <thead>
        <tr>
            <th>No</th>
            <th>Nama Peminjam</th>
            <th>Judul Buku</th>
            <th>Jumlah Hari</th>
            <th>Total Denda</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($denda as $i => $d)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ $d->pengembalian->peminjaman->nama_peminjam ?? '-' }}</td>
            <td>{{ $d->pengembalian->peminjaman->buku->judul ?? '-' }}</td>
            <td>{{ $d->jumlah_hari }}</td>
            <td>Rp {{ number_format($d->total_denda, 0, ',', '.') }}</td>
            <td>{{ $d->status }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

</body>
</html>
