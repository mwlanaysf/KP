import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, BookOpen, ChevronLeft } from 'lucide-react';

type BukuRow = {
    id: number;
    kode_buku: string;
    judul: string;
    pengarang: string;
};

type PageProps = {
    jenis: 'Peminjaman' | 'Pengembalian' | 'Pembayaran Denda';
    status: string;
    back_url: string;
    anggota: {
        kode_anggota: string;
        nama: string;
        kelas: string;
        jurusan: string;
    };
    peminjaman: {
        kode_peminjaman: string;
        tanggal_pinjam: string;
        tanggal_kembali: string;
        status: string;
        petugas: string;
    };
    pengembalian: {
        tanggal_dikembalikan: string | null;
        hari_terlambat: number;
        petugas: string;
    } | null;
    denda: {
        nominal_per_hari: number;
        total_denda: number;
        status_bayar: string;
        tanggal_pembayaran: string | null;
    } | null;
    buku: BukuRow[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Riwayat Transaksi', href: '/riwayat-transaksi' },
    { title: 'Detail', href: '#' },
];

const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return date;
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

const formatCurrency = (value: number | null | undefined) => `Rp${Number(value || 0).toLocaleString('id-ID')}`;

const statusClass = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'terlambat' || s === 'belum lunas') return 'text-destructive dark:text-red-400';
    if (s === 'dipinjam') return 'text-amber-600';
    return 'text-primary dark:text-primary';
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <p className="text-gray-500 text-xs">{label}</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{value}</p>
        </div>
    );
}

export default function RiwayatTransaksiShow({ jenis, status, back_url, anggota, peminjaman, pengembalian, denda, buku }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail ${jenis}`} />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* HEADER */}
                <Card className="border border-border/60 shadow-sm rounded-md">
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Detail {jenis}</h1>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                <span>
                                    Kode: <span className="font-medium text-gray-900 dark:text-gray-100">{peminjaman.kode_peminjaman || '-'}</span>
                                </span>
                                <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-gray-300" />
                                <span className="flex items-center gap-2">
                                    <span>Status:</span>
                                    <span className={`text-sm font-semibold ${statusClass(status)}`}>{status}</span>
                                </span>
                            </div>
                        </div>

                        <Link href={back_url}>
                            <Button variant="outline" size="sm" className="gap-2 shadow-sm">
                                <ChevronLeft className="h-4 w-4" />
                                Kembali
                            </Button>
                        </Link>
                    </CardHeader>

                    <CardContent className="pt-0 pb-5">
                        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                            {/* ANGGOTA */}
                            <div className="rounded-md border border-border/60 bg-white/80 dark:bg-transparent p-4 md:p-5 space-y-3 text-sm">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Informasi Anggota</p>
                                <div className="grid grid-cols-1 gap-3">
                                    <Field label="Kode Anggota" value={anggota.kode_anggota} />
                                    <Field label="Nama" value={anggota.nama} />
                                    <Field label="Kelas" value={anggota.kelas} />
                                    <Field label="Jurusan" value={anggota.jurusan} />
                                </div>
                            </div>

                            {/* TRANSAKSI */}
                            <div className="rounded-md border border-border/60 bg-white/80 dark:bg-transparent p-4 md:p-5 space-y-3 text-sm">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Informasi Peminjaman</p>
                                <div className="grid grid-cols-1 gap-3">
                                    <Field label="Tanggal Pinjam" value={formatDate(peminjaman.tanggal_pinjam)} />
                                    <Field label="Jatuh Tempo" value={formatDate(peminjaman.tanggal_kembali)} />
                                    {pengembalian && <Field label="Dikembalikan" value={formatDate(pengembalian.tanggal_dikembalikan)} />}
                                    <Field label="Petugas Peminjaman" value={peminjaman.petugas} />
                                    {pengembalian && <Field label="Petugas Pengembalian" value={pengembalian.petugas} />}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* DAFTAR BUKU */}
                <Card className="overflow-hidden rounded-md border border-border/60 shadow-sm">
                    <CardHeader className="flex items-center gap-2 border-b border-border/50 bg-gray-50/60 dark:bg-neutral-900/40">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <BookOpen className="h-4 w-4" />
                            </span>
                            <CardTitle className="text-base font-semibold">Daftar Buku</CardTitle>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100/80 dark:bg-neutral-900/60 text-gray-500">
                                <tr>
                                    <th className="px-6 py-3 text-center font-medium w-16">No</th>
                                    <th className="px-6 py-3 text-left font-medium w-40">Kode Buku</th>
                                    <th className="px-6 py-3 text-left font-medium">Judul Buku</th>
                                    <th className="px-6 py-3 text-left font-medium">Pengarang</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                                {buku.length > 0 ? (
                                    buku.map((row, i) => (
                                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900/40 transition-colors">
                                            <td className="px-6 py-3 text-center text-gray-600 dark:text-gray-400">{i + 1}</td>
                                            <td className="px-6 py-3 text-gray-600 dark:text-gray-400 font-medium">{row.kode_buku}</td>
                                            <td className="px-6 py-3 text-gray-900 dark:text-gray-100 font-medium">{row.judul}</td>
                                            <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{row.pengarang}</td>
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

                {/* DENDA (hanya jika ada) */}
                {denda && pengembalian && (
                    <Card className="rounded-md border border-border/60 shadow-sm">
                        <CardHeader className="rounded-t-md border-b border-border/40 bg-gray-50/50 pb-3 dark:bg-neutral-900/40">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                                    <AlertCircle className="h-4 w-4" />
                                </span>
                                <CardTitle className="text-base font-semibold">Informasi Denda</CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-4 pb-5">
                            <div className="grid gap-4 text-sm md:grid-cols-2 md:gap-6">
                                <div className="space-y-3">
                                    <Field label="Hari Terlambat" value={`${Math.max(0, pengembalian.hari_terlambat)} hari`} />
                                    <Field label="Denda per Hari" value={formatCurrency(denda.nominal_per_hari)} />
                                </div>
                                <div className="space-y-3">
                                    <Field label="Total Denda" value={<span className="font-semibold">{formatCurrency(denda.total_denda)}</span>} />
                                    <Field
                                        label="Status Pembayaran"
                                        value={<span className={`font-semibold ${statusClass(denda.status_bayar)}`}>{denda.status_bayar}</span>}
                                    />
                                </div>
                            </div>

                            {denda.status_bayar === 'Lunas' && (
                                <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                                    Tanggal Pembayaran: <span className="font-medium">{formatDate(denda.tanggal_pembayaran)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
