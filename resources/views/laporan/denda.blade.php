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
        .tot td { background: #f3f4f6 !important; font-weight: bold; border-top: 0.5px solid #d1d5db; }
        .tot td { background: #f3f4f6 !important; font-weight: bold; border-top: 0.5px solid #d1d5db; }

        .bl { margin: 0; padding: 0; list-style: none; }
        .bl li { line-height: 1.5; font-size: 8px; }
        .bl li:before { content: "- "; color: #6b7280; }

        .text-center { text-align: center !important; }
        .text-right { text-align: right !important; }
        .font-bold { font-weight: bold !important; }
    </style>
</head>
<body>
    @php
        $NB  = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        $bln = $NB[\Carbon\Carbon::now()->month];
        $now = \Carbon\Carbon::now();
        $totalDenda = $denda->sum('total_denda');
        $totalBuku  = $denda->sum(fn($d)=>$d->pengembalian?->peminjaman?->detail_peminjaman?->count() ?? 0);
        $statusLabel = ucfirst($status_filter ?? 'Semua');
    @endphp

    <table class="hdr" cellpadding="0" cellspacing="0">
        <tr>
            <td>
                <div class="hdr-title">Laporan Data Denda</div>
            </td>
            <td class="hdr-right">
                <span class="doc-label">DENDA</span>
                <span class="doc-date">Dicetak: {{ $now->format('d') }} {{ $bln }} {{ $now->format('Y') }}, {{ $now->format('H:i') }} WIB</span>
            </td>
        </tr>
    </table>

    <table class="summary" cellpadding="0" cellspacing="0">
        <tr>
            <td class="sum-cell"><div class="sum-lbl">Total Tagihan</div><div class="sum-val">{{ $denda->count() }}</div></td>
            <td class="sum-cell"><div class="sum-lbl">Total Denda</div><div class="sum-val md">Rp {{ number_format($totalDenda,0,',','.') }}</div></td>
            @if(isset($status_filter) && $status_filter === 'Lunas')
            <td class="sum-cell"><div class="sum-lbl">Total Pemasukan</div><div class="sum-val md">Rp {{ number_format($totalDenda,0,',','.') }}</div></td>
            @endif
            <td class="sum-cell"><div class="sum-lbl">Filter Status</div><div class="sum-val md">{{ $statusLabel }}</div></td>
            <td class="sum-cell"><div class="sum-lbl">Periode Laporan</div><div class="sum-val md">{{ $periode ?? 'Semua Waktu' }}</div></td>
        </tr>
    </table>

    <div class="tbl-wrap">
        <table class="t">
            <thead>
                <tr>
                    <th style="width:4%;" class="text-center">No</th>
                    <th style="width:10%;">Kode Peminjaman</th>
                    <th style="width:13%;">Nama Anggota</th>
                    <th style="width:8%;" class="text-center">Jurusan</th>
                    <th style="width:5%;" class="text-center">Kelas</th>
                    <th style="width:8%;" class="text-center">Jumlah Buku</th>
                    <th style="width:16%;">Judul Buku</th>
                    <th style="width:7%;" class="text-center">Terlambat</th>
                    <th style="width:9%;" class="text-right">Tarif/Hari</th>
                    <th style="width:10%;" class="text-right">Total Denda</th>
                    <th style="width:10%;" class="text-center">Status</th>
                </tr>
            </thead>
            <tbody>
                @forelse($denda as $i => $row)
                @php
                    $pinjam    = $row->pengembalian?->peminjaman ?? null;
                    $judulBuku = $pinjam?->detail_peminjaman?->pluck('buku.judul')?->filter()->values() ?? collect();
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
                    <td class="text-center">{{ abs($row->pengembalian?->terlambat ?? 0) }} hari</td>
                    <td class="text-right" style="color:#4b5563;">Rp {{ number_format($row->nominal_per_hari??0,0,',','.') }}</td>
                    <td class="text-right font-bold">Rp {{ number_format($row->total_denda??0,0,',','.') }}</td>
                    <td class="text-center">
                        @if($row->status_bayar === 'Lunas')
                            Lunas
                        @else
                            Belum Lunas
                        @endif
                    </td>
                </tr>
                @empty
                <tr><td colspan="11" class="text-center" style="padding:20px; color:#6b7280; font-style:italic;">Tidak ada data denda</td></tr>
                @endforelse
                @if($denda->count() > 0)
                <tr class="tot">
                    <td colspan="9" class="text-right" style="color:#374151;">Total Keseluruhan:</td>
                    <td class="text-right">Rp {{ number_format($totalDenda,0,',','.') }}</td>
                    <td></td>
                </tr>
                @endif
            </tbody>
        </table>
    </div>
</body>
</html>
