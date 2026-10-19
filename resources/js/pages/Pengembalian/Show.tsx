import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, ChevronLeft, AlertCircle } from 'lucide-react';

type BukuRow = {
    id: number;
    buku: {
        kode_buku: string;
        judul: string;
        pengarang: string;
        deleted_at?: string | null;
    };
};

type PengembalianShow = {
    id: number;
    tanggal_dikembalikan: string | null;
    terlambat: number;
    peminjaman: {
        kode_peminjaman: string;
        tanggal_pinjam: string;
        tanggal_kembali: string;
        anggota: {
            kode_anggota: string;
            nama: string;
            kelas: string;
            deleted_at?: string | null;
            jurusan?: { nama: string } | null;
        };
        detail_peminjaman: BukuRow[];
    } | null;
    denda: {
        nominal_per_hari: number;
        total_denda: number;
        status_bayar: string;
        updated_at?: string | null;
    } | null;
};

type PageProps = {
    pengembalian: PengembalianShow;
    jumlah_buku: number;
    status_pengembalian: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pengembalian', href: '/pengembalian' },
    { title: 'Detail', href: '#' },
];

const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};

const formatCurrency = (value: number | null | undefined) => {
    const v = Number(value || 0);
    return `Rp${v.toLocaleString('id-ID')}`;
};

export default function PengembalianShowPage({ pengembalian, jumlah_buku, status_pengembalian }: PageProps) {
    const peminjaman = pengembalian.peminjaman;
    const anggota = peminjaman?.anggota;
    const detailBuku = peminjaman?.detail_peminjaman ?? [];

    const isTerlambat = status_pengembalian === 'Terlambat';

    const statusBadgeClass = isTerlambat ? 'text-destructive' : 'text-primary';

    const hariTerlambat = Math.abs(pengembalian.terlambat || 0);
    const denda = pengembalian.denda;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Pengembalian" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* HEADER */}
                <Card className="border border-border/60 shadow-sm rounded-md">
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                                Detail Pengembalian
                            </h1>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                <span>Kode: <span className="font-medium text-gray-900">{peminjaman?.kode_peminjaman || '-'}</span></span>

                                <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-gray-300" />

                                <span className="flex items-center gap-2">
                                    <span className="text-gray-500">Status:</span>
                                    <span className={`text-sm font-semibold ${statusBadgeClass}`}>
                                        {status_pengembalian}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <Link href={route('pengembalian.index')}>
                            <Button variant="outline" size="sm" className="gap-2">
                                <ChevronLeft className="h-4 w-4" />
                                Kembali
                            </Button>
                        </Link>
                    </CardHeader>

                    <CardContent className="pt-0 pb-5">
                        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                            {/* ANGGOTA */}
                            <div className="rounded-md border border-border/60 bg-white/80 p-4 md:p-5 space-y-3 text-sm">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Informasi Anggota
                                </p>

                                <div className="grid grid-cols-1 gap-3">
                                    <div>
                                        <p className="text-gray-500 text-xs">Kode Anggota</p>
                                        <p className="font-medium text-gray-900">{anggota?.kode_anggota}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 text-xs">Nama</p>
                                        <p className="font-medium text-gray-900">
                                            {anggota?.deleted_at ? <span className="italic text-gray-500">Anggota nonaktif</span> : (anggota?.nama || '-')}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 text-xs">Kelas</p>
                                        <p className="font-medium text-gray-900">{anggota?.kelas}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 text-xs">Jurusan</p>
                                        <p className="font-medium text-gray-900">{anggota?.jurusan?.nama || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* PENGEMBALIAN */}
                            <div className="rounded-md border border-border/60 bg-white/80 p-4 md:p-5 space-y-3 text-sm">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Informasi Pengembalian
                                </p>

                                <div className="grid grid-cols-1 gap-3">
                                    <div>
                                        <p className="text-gray-500 text-xs">Tanggal Pinjam</p>
                                        <p className="font-medium text-gray-900">{formatDate(peminjaman?.tanggal_pinjam)}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 text-xs">Jatuh Tempo</p>
                                        <p className="font-medium text-gray-900">{formatDate(peminjaman?.tanggal_kembali)}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 text-xs">Dikembalikan</p>
                                        <p className="font-medium text-gray-900">{formatDate(pengembalian.tanggal_dikembalikan)}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 text-xs">Jumlah Buku</p>
                                        <p className="font-medium text-gray-900">{jumlah_buku} buku</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* TABEL */}
                <Card className="overflow-hidden rounded-md border border-border/60 shadow-sm">
                    <CardHeader className="flex items-center gap-2 border-b border-border/50 bg-gray-50/60">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <BookOpen className="h-4 w-4" />
                            </span>
                            <CardTitle className="text-base font-semibold">Buku yang Dikembalikan</CardTitle>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100/80 text-gray-500">
                                <tr>
                                    <th className="px-6 py-3 text-center font-medium w-16">No</th>
                                    <th className="px-6 py-3 text-left font-medium w-40">Kode Buku</th>
                                    <th className="px-6 py-3 text-left font-medium">Judul Buku</th>
                                    <th className="px-6 py-3 text-left font-medium">Pengarang</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {detailBuku.map((row, i) => (
                                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3 text-center text-gray-600">{i + 1}</td>
                                        <td className="px-6 py-3 text-gray-600 font-medium">{row.buku?.kode_buku || '-'}</td>
                                        <td className="px-6 py-3 text-gray-900 font-medium">
                                            {row.buku?.deleted_at ? <span className="italic text-gray-500">Buku sudah dihapus</span> : (row.buku?.judul || '-')}
                                        </td>
                                        <td className="px-6 py-3 text-gray-600">{row.buku?.pengarang || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* DENDA */}
                <Card className="rounded-md border border-border/60 shadow-sm">
                    <CardHeader className="rounded-t-md border-b border-border/40 bg-gray-50/50 pb-3 dark:bg-neutral-900/40">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                                    <AlertCircle className="h-4 w-4" />
                                </span>
                                <CardTitle className="text-base font-semibold">Informasi Denda</CardTitle>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-4 pb-5">
                        <div className="grid gap-4 text-sm md:grid-cols-2 md:gap-6">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500">Hari Terlambat</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{isTerlambat ? `${Math.max(0, hariTerlambat)} hari` : '-'}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">Denda per Hari</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{denda ? formatCurrency(denda.nominal_per_hari) : '-'}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500">Total Denda</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{denda ? formatCurrency(denda.total_denda) : 'Rp0'}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">Status Pembayaran</p>
                                    <span className={`inline-flex items-center text-sm font-semibold ${denda?.status_bayar === 'Lunas' || !isTerlambat
                                        ? 'text-primary dark:text-primary'
                                        : 'text-destructive dark:text-red-400'
                                    }`}>
                                        {denda?.status_bayar || (isTerlambat ? 'Denda' : 'Tepat Waktu')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {denda?.status_bayar === 'Lunas' && denda?.updated_at && (
                            <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                                <p>
                                    Tanggal Pembayaran: <span className="font-medium">{formatDate(denda.updated_at)}</span>
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}


