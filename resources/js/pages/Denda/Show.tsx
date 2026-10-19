import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { AlertCircle, BookOpen, ChevronLeft } from 'lucide-react';
import { ConfirmModal } from '@/components/ConfirmModal';

type BukuRow = {
    id: number;
    kode_buku: string;
    judul: string;
    pengarang: string;
};

type PeminjamanDetail = {
    id: number;
    kode_peminjaman: string;
    tanggal_pinjam: string;
    tanggal_kembali: string;
    tanggal_dikembalikan: string | null;
    anggota: {
        kode_anggota: string;
        nama: string;
        kelas: string;
        jurusan?: { nama: string } | null;
    };
    detail_buku: BukuRow[];
} | null;

type DendaDetail = {
    id: number;
    pengembalian_id?: number | null;
    hari_terlambat: number;
    nominal_per_hari: number;
    total_denda: number;
    status_pembayaran: string;
    tanggal_pembayaran: string | null;
};

type PageProps = {
    peminjaman: PeminjamanDetail;
    denda: DendaDetail;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Denda', href: '/denda' },
    { title: 'Detail', href: '#' },
];

const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return date;

    return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};

const formatCurrency = (value: number | null | undefined) => {
    const v = Number(value || 0);
    return `Rp${v.toLocaleString('id-ID')}`;
};

export default function DendaShowPage({ peminjaman, denda }: PageProps) {
    const { props } = usePage<{ auth: any }>();
    const role = props.auth?.user?.role || 'admin';
    const canEdit = ['admin', 'super_admin'].includes(role);
    
    const hariTerlambat = denda.hari_terlambat || 0;

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [bayarLoading, setBayarLoading] = useState(false);

    const isLunas = denda.status_pembayaran?.toLowerCase() === 'lunas';
    const statusLabel = isLunas ? 'Lunas' : 'Belum Bayar';
    const statusBadgeClass = isLunas
        ? 'text-primary dark:text-primary'
        : 'text-destructive dark:text-red-400';

    const handleBayarDenda = () => {
        if (!denda.pengembalian_id || isLunas) return;
        setConfirmOpen(true);
    };

    const doBayarDenda = () => {
        if (!denda.pengembalian_id) return;
        setBayarLoading(true);
        router.put(
            route('denda.bayar', denda.pengembalian_id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setBayarLoading(false);
                    setConfirmOpen(false);
                },
            },
        );
    };

    const detailBuku = peminjaman?.detail_buku ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Denda" />
            <ConfirmModal
                open={confirmOpen}
                title="Konfirmasi Pembayaran"
                description="Tandai denda ini sebagai LUNAS? Status pembayaran akan diperbarui dan tidak dapat dikembalikan."
                confirmLabel="Ya, Tandai Lunas"
                loading={bayarLoading}
                onConfirm={doBayarDenda}
                onCancel={() => setConfirmOpen(false)}
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* HEADER */}
                <Card className="border border-border/60 shadow-sm rounded-md">
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                                Detail Denda
                            </h1>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                <span>Kode: <span className="font-medium text-gray-900">{peminjaman?.kode_peminjaman || '-'}</span></span>

                                <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-gray-300" />

                                <span className="flex items-center gap-2">
                                    <span className="text-gray-500">Status:</span>
                                    <span className={`text-sm font-semibold ${statusBadgeClass}`}>
                                        {statusLabel}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <Link href={route('denda.index')}>
                            <Button variant="outline" size="sm" className="gap-2 shadow-sm">
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
                                        <p className="font-medium text-gray-900">{peminjaman?.anggota?.kode_anggota || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Nama</p>
                                        <p className="font-medium text-gray-900">
                                            {peminjaman?.anggota?.nama || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Kelas</p>
                                        <p className="font-medium text-gray-900">{peminjaman?.anggota?.kelas || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Jurusan</p>
                                        <p className="font-medium text-gray-900">{peminjaman?.anggota?.jurusan?.nama || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* PEMINJAMAN */}
                            <div className="rounded-md border border-border/60 bg-white/80 p-4 md:p-5 space-y-3 text-sm">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Informasi Peminjaman
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
                                        <p className="font-medium text-gray-900">{formatDate(peminjaman?.tanggal_dikembalikan)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* TABEL BUKU */}
                <Card className="overflow-hidden rounded-md border border-border/60 shadow-sm">
                    <CardHeader className="flex items-center gap-2 border-b border-border/50 bg-gray-50/60">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <BookOpen className="h-4 w-4" />
                            </span>
                            <CardTitle className="text-base font-semibold">Daftar Buku</CardTitle>
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
                                {detailBuku.length > 0 ? (
                                    detailBuku.map((row, i) => (
                                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3 text-center text-gray-600">{i + 1}</td>
                                            <td className="px-6 py-3 text-gray-600 font-medium">{row.kode_buku || '-'}</td>
                                            <td className="px-6 py-3 text-gray-900 font-medium">{row.judul || '-'}</td>
                                            <td className="px-6 py-3 text-gray-600">{row.pengarang || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-sm text-gray-500">
                                            Tidak ada data buku untuk transaksi ini.
                                        </td>
                                    </tr>
                                )}
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

                            {canEdit && !isLunas && denda.pengembalian_id && (
                                <Button size="sm" className="bg-primary text-white hover:bg-primary/90 shadow-sm" onClick={handleBayarDenda}>
                                    Bayar Denda
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="pt-4 pb-5">
                        <div className="grid gap-4 text-sm md:grid-cols-2 md:gap-6">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500">Hari Terlambat</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{Math.max(0, hariTerlambat)} hari</p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">Denda per Hari</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(denda.nominal_per_hari)}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500">Total Denda</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(denda.total_denda)}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">Status Pembayaran</p>
                                    <span className={`inline-flex items-center text-sm font-semibold ${statusBadgeClass}`}>
                                        {statusLabel}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {isLunas && (
                            <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                                <p>
                                    Tanggal Pembayaran: <span className="font-medium">{formatDate(denda.tanggal_pembayaran)}</span>
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}


