<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 8.5px; color: #111827; background: #ffffff; padding: 28px 32px; line-height: 1.3; }
        .hdr { width: 100%; margin-bottom: 12px; border-bottom: 1px solid #111827; padding-bottom: 8px; }
        .hdr-title { font-size: 14px; font-weight: bold; color: #111827; letter-spacing: 0.2px; }
        .hdr-sub { font-size: 7.5px; color: #4b5563; margin-top: 2px; }
        .hdr-right { text-align: right; vertical-align: top; white-space: nowrap; }
        .doc-label { display: inline-block; border: 0.5px solid #6b7280; color: #374151; padding: 1.5px 6px; font-size: 6.5px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; border-radius: 2px; }
        .doc-date { font-size: 6.5px; color: #6b7280; display: block; margin-top: 3px; }
        
        .summary { width: 100%; border-collapse: collapse; margin-bottom: 12px; border: 0.5px solid #e5e7eb; }
        .sum-cell { padding: 6px 10px; background: #f9fafb; border-right: 0.5px solid #e5e7eb; vertical-align: top; }
        .sum-cell:last-child { border-right: none; }
        .sum-lbl { font-size: 6px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; font-weight: 600; }
        .sum-val { font-size: 10px; font-weight: bold; color: #111827; }
        .sum-val.md { font-size: 8.5px; }

        .tbl-wrap { border: 0.5px solid #d1d5db; border-radius: 2px; overflow: hidden; }
        table.t { width: 100%; border-collapse: collapse; table-layout: fixed; }
        table.t thead tr { background: #374151; }
        table.t th { padding: 5px 6px; text-align: left; color: #f9fafb; font-size: 7px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; border-right: 0.5px solid #4b5563; }
        table.t th:last-child { border-right: none; }
        table.t td { padding: 4.5px 6px; font-size: 8px; color: #1f2937; border-bottom: 0.5px solid #f3f4f6; border-right: 0.5px solid #f3f4f6; vertical-align: middle; word-wrap: break-word; }
        table.t td:last-child { border-right: none; }
        table.t tbody tr:nth-child(even) td { background: #f9fafb; }
        table.t tbody tr:last-child td { border-bottom: none; }
        
        .bl { margin: 0; padding: 0; list-style: none; }
        .bl li { line-height: 1.5; font-size: 8px; }
        .bl li:before { content: "- "; color: #6b7280; }

        .text-center { text-align: center !important; }
        .text-right { text-align: right !important; }
    </style>
</head>
<body>
    @php
        $NB  = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        $bln = $NB[\Carbon\Carbon::now()->month];
        $now = \Carbon\Carbon::now();
        function fT($d,$NB){ $c=\Carbon\Carbon::parse($d); return $c->format('d').' '.$NB[$c->month].' '.$c->format('Y'); }
        $totalBuku    = $pengembalian->sum(fn($r)=>$r->peminjaman?->detail_peminjaman?->count() ?? 0);
        $jmlTepat     = $pengembalian->filter(fn($r)=>($r->terlambat??0)<=0)->count();
        $jmlTerlambat = $pengembalian->filter(fn($r)=>($r->terlambat??0)>0)->count();
    @endphp

    <table class="hdr" cellpadding="0" cellspacing="0">
        <tr>
            <td>
                <div class="hdr-title">Laporan Data Pengembalian</div>
            </td>
            <td class="hdr-right">
                <span class="doc-label">PENGEMBALIAN</span>
                <span class="doc-date">Dicetak: {{ $now->format('d') }} {{ $bln }} {{ $now->format('Y') }}, {{ $now->format('H:i') }} WIB</span>
            </td>
        </tr>
    </table>

    <table class="summary" cellpadding="0" cellspacing="0">
        <tr>
            <td class="sum-cell"><div class="sum-lbl">Total Pengembalian</div><div class="sum-val">{{ count($pengembalian) }}</div></td>
            <td class="sum-cell"><div class="sum-lbl">Total Buku Kembali</div><div class="sum-val">{{ $totalBuku }}</div></td>
            <td class="sum-cell"><div class="sum-lbl">Tepat Waktu</div><div class="sum-val">{{ $jmlTepat }}</div></td>
            <td class="sum-cell"><div class="sum-lbl">Terlambat</div><div class="sum-val">{{ $jmlTerlambat }}</div></td>
            <td class="sum-cell"><div class="sum-lbl">Periode Cetak</div><div class="sum-val md">{{ $now->format('d') }} {{ $bln }} {{ $now->year }}</div></td>
        </tr>
    </table>

    <div class="tbl-wrap">
        <table class="t">
            <thead>
                <tr>
                    <th style="width:4%;" class="text-center">No</th>
                    <th style="width:9%;">Kode</th>
                    <th style="width:13%;">Nama Anggota</th>
                    <th style="width:7%;" class="text-center">Jurusan</th>
                    <th style="width:5%;" class="text-center">Kelas</th>
                    <th style="width:7%;" class="text-center">Jumlah Buku</th>
                    <th style="width:16%;">Judul Buku</th>
                    <th style="width:8%;">Tanggal Pinjam</th>
                    <th style="width:8%;">Jatuh Tempo</th>
                    <th style="width:8%;">Tanggal Kembali</th>
                    <th style="width:6%;" class="text-center">Terlambat</th>
                    <th style="width:9%;" class="text-center">Status</th>
                </tr>
            </thead>
            <tbody>
                @forelse($pengembalian as $i => $row)
                @php
                    $pinjam      = $row->peminjaman;
                    $terlambat   = abs($row->terlambat ?? 0);
                    $isTerlambat = ($row->terlambat ?? 0) > 0;
                    $judulBuku   = $pinjam?->detail_peminjaman?->pluck('buku.judul')?->filter()->values() ?? collect();
                @endphp
                <tr>
                    <td class="text-center">{{ $i + 1 }}</td>
                    <td>{{ $pinjam?->kode_peminjaman ?? '-' }}</td>
                    <td><strong>{{ $pinjam?->anggota?->nama ?? '-' }}</strong></td>
                    <td class="text-center">{{ $pinjam?->anggota?->jurusan?->nama ?? '-' }}</td>
                    <td class="text-center">{{ $pinjam?->anggota?->kelas ?? '-' }}</td>
                    <td class="text-center">{{ $judulBuku->count() }}</td>
                    <td style="vertical-align: top;">
                        <ul class="bl">
                            @foreach($judulBuku as $judul)<li>{{ $judul }}</li>@endforeach
                            @if($judulBuku->isEmpty())<li style="color:#9ca3af">-</li>@endif
                        </ul>
                    </td>
                    <td>{{ $pinjam ? fT($pinjam->tanggal_pinjam,$NB) : '-' }}</td>
                    <td>{{ $pinjam ? fT($pinjam->tanggal_kembali,$NB) : '-' }}</td>
                    <td>{{ $row->tanggal_dikembalikan ? fT($row->tanggal_dikembalikan,$NB) : '-' }}</td>
                    <td class="text-center">
                        {{ $isTerlambat ? $terlambat.' hari' : '-' }}
                    </td>
                    <td class="text-center">
                        @if($isTerlambat)Terlambat
                        @else Tepat Waktu @endif
                    </td>
                </tr>
                @empty
                <tr><td colspan="12" class="text-center" style="padding:20px; color:#6b7280; font-style:italic;">Tidak ada data pengembalian</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</body>
</html>
