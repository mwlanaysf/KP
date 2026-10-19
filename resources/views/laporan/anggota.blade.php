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
        table.t tbody tr:last-child td { border-bottom: none; }
        
        .text-center { text-align: center !important; }
        .text-right { text-align: right !important; }
    </style>
</head>
<body>
    @php
        $NB  = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        $bln = $NB[\Carbon\Carbon::now()->month];
        $now = \Carbon\Carbon::now();
    @endphp

    <table class="hdr" cellpadding="0" cellspacing="0">
        <tr>
            <td>
                <div class="hdr-title">Laporan Data Anggota</div>
            </td>
            <td class="hdr-right">
                <span class="doc-label">Data Anggota</span>
                <span class="doc-date">Dicetak: {{ $now->format('d') }} {{ $bln }} {{ $now->format('Y') }}, {{ $now->format('H:i') }} WIB</span>
            </td>
        </tr>
    </table>

    <table class="summary" cellpadding="0" cellspacing="0">
        <tr>
            <td class="sum-cell"><div class="sum-lbl">Total Anggota</div><div class="sum-val">{{ count($anggota) }}</div></td>
            <td class="sum-cell"><div class="sum-lbl">Jurusan Terdaftar</div><div class="sum-val">{{ $anggota->pluck('jurusan.nama')->filter()->unique()->count() }}</div></td>
            <td class="sum-cell"><div class="sum-lbl">Periode Cetak</div><div class="sum-val md">{{ $bln }} {{ $now->year }}</div></td>
            <td class="sum-cell"><div class="sum-lbl">Status</div><div class="sum-val md">Aktif &amp; Terdaftar</div></td>
        </tr>
    </table>

    <div class="tbl-wrap">
        <table class="t">
            <thead>
                <tr>
                    <th style="width:4%;" class="text-center">No</th>
                    <th style="width:12%;">Kode Anggota</th>
                    <th style="width:25%;">Nama Lengkap</th>
                    <th style="width:8%;" class="text-center">Kelas</th>
                    <th style="width:12%;" class="text-center">Jurusan</th>
                    <th style="width:17%;">No HP</th>
                    <th style="width:22%;">Tanggal Daftar</th>
                </tr>
            </thead>
            <tbody>
                @forelse($anggota as $i => $row)
                <tr>
                    <td class="text-center">{{ $i + 1 }}</td>
                    <td>{{ $row->kode_anggota }}</td>
                    <td><strong>{{ $row->nama }}</strong></td>
                    <td class="text-center">{{ $row->kelas ?? '-' }}</td>
                    <td class="text-center">{{ $row->jurusan->nama ?? '-' }}</td>
                    <td>{{ $row->no_hp ?? '-' }}</td>
                    <td>{{ \Carbon\Carbon::parse($row->created_at)->format('d') }} {{ $NB[\Carbon\Carbon::parse($row->created_at)->month] }} {{ \Carbon\Carbon::parse($row->created_at)->format('Y') }}</td>
                </tr>
                @empty
                <tr><td colspan="7" class="text-center" style="padding:20px; color:#6b7280; font-style:italic;">Tidak ada data anggota</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</body>
</html>
