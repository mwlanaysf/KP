import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Users,
    Book,
    ClipboardList,
    AlertCircle,
    CheckCircle2,
    TrendingUp,
    Award,
    Clock,
    UserPlus,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer
} from 'recharts';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const BULAN = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

interface DashboardProps {
    kpi: {
        total_anggota: number;
        total_buku: number;
        total_peminjaman_aktif: number;
        denda_belum_bayar: number;
    };
    keterlambatan: {
        id: number;
        nama_anggota: string;
        kelas_jurusan: string;
        keterlambatan: number;
        estimasi_denda: number;
    }[];
    aktivitas_terbaru: {
        id: string;
        nama_anggota: string;
        aksi: string;
        judul_buku: string;
        waktu: string;
    }[];
    top_books: {
        id: number;
        judul: string;
        kategori: string;
        stok: number;
        total_dipinjam: number;
    }[];
    top_members: {
        id: number;
        nama: string;
        kode_anggota: string;
        jurusan: string;
        kelas: string;
        total_transaksi: number;
    }[];
    chart_data: {
        name: string;
        full_date: string;
        total: number;
    }[];
    chart_stats: {
        total: number;
        average: number;
        diff_amount: number;
        diff_percentage: number;
    };
    filters: {
        available_months: { value: string; label: string }[];
        available_years: string[];
        selected_month: string;
        selected_mode: string;
        buku_mode: string;
        buku_bulan: string;
        buku_tahun: string;
        anggota_mode: string;
        anggota_bulan: string;
        anggota_tahun: string;
        lambat_mode: string;
        lambat_bulan: string;
        lambat_tahun: string;
    };
}

const getActivityMeta = (aksi: string) => {
    switch (aksi?.toLowerCase()) {
        case 'pinjam':
            return {
                style: 'text-blue-600 dark:text-blue-400',
                icon: <ArrowUpRight className="w-3.5 h-3.5" />,
                iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
            };
        case 'kembali':
            return {
                style: 'text-primary dark:text-primary',
                icon: <ArrowDownRight className="w-3.5 h-3.5" />,
                iconBg: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
            };
        case 'daftar':
            return {
                style: 'text-indigo-600 dark:text-indigo-400',
                icon: <UserPlus className="w-3.5 h-3.5" />,
                iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
            };
        case 'bayar':
            return {
                style: 'text-orange-600 dark:text-orange-400',
                icon: <CreditCard className="w-3.5 h-3.5" />,
                iconBg: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
            };
        default:
            return {
                style: 'text-slate-600 dark:text-slate-400',
                icon: <Clock className="w-3.5 h-3.5" />,
                iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            };
    }
};


const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number; payload: { full_date: string } }[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 dark:bg-slate-900/95 p-3 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 backdrop-blur-sm transition-all">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">{payload[0].payload.full_date}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.5)]"></div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {payload[0].value} <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-0.5">transaksi</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export default function Dashboard({ kpi, keterlambatan, aktivitas_terbaru, top_books, top_members, chart_data, chart_stats, filters }: DashboardProps) {
    const isKeterlambatanAman = keterlambatan.length === 0;

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newFilters = getCombinedFilters();
        newFilters.month = e.target.value;
        router.get('/dashboard', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newFilters = getCombinedFilters();
        newFilters.mode = e.target.value;
        router.get('/dashboard', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const getCombinedFilters = () => ({
        mode: filters.selected_mode,
        month: filters.selected_month,
        buku_mode: filters.buku_mode,
        buku_bulan: filters.buku_bulan,
        buku_tahun: filters.buku_tahun,
        anggota_mode: filters.anggota_mode,
        anggota_bulan: filters.anggota_bulan,
        anggota_tahun: filters.anggota_tahun,
        lambat_mode: filters.lambat_mode,
        lambat_bulan: filters.lambat_bulan,
        lambat_tahun: filters.lambat_tahun,
    });

    const handleWidgetFilterChange = (widget: string, field: string, value: string) => {
        const newFilters: Record<string, string> = getCombinedFilters();
        newFilters[`${widget}_${field}`] = value;
        router.get('/dashboard', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Operasional" />

            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">

                {/* 1. KPI UTAMA */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1 */}
                    <div className="flex flex-col justify-between rounded-md border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium tracking-tight text-slate-500 dark:text-slate-400">Total Anggota</h3>
                            <Users className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        </div>
                        <div className="mt-4">
                            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{kpi.total_anggota}</div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Pengguna terdaftar aktif</p>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="flex flex-col justify-between rounded-md border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium tracking-tight text-slate-500 dark:text-slate-400">Total Buku</h3>
                            <Book className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        </div>
                        <div className="mt-4">
                            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{kpi.total_buku}</div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Total koleksi di perpustakaan</p>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="flex flex-col justify-between rounded-md border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium tracking-tight text-slate-500 dark:text-slate-400">Peminjaman Aktif</h3>
                            <ClipboardList className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        </div>
                        <div className="mt-4">
                            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{kpi.total_peminjaman_aktif}</div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Sedang dipinjam anggota</p>
                        </div>
                    </div>

                    {/* Card 4 */}
                    <div className="flex flex-col justify-between rounded-md border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium tracking-tight text-slate-500 dark:text-slate-400">Denda Belum Lunas</h3>
                            {kpi.denda_belum_bayar > 0 ? (
                                <AlertCircle className="h-4 w-4 text-rose-500" />
                            ) : (
                                <CheckCircle2 className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            )}
                        </div>
                        <div className="mt-4">
                            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{kpi.denda_belum_bayar}</div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {kpi.denda_belum_bayar > 0 ? 'Perlu ditindaklanjuti segera' : 'Semua denda telah lunas'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. CHART GRAFIK PEMINJAMAN */}
                <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Grafik Peminjaman Harian</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Tren transaksi sepanjang bulan</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <select
                                value={filters.selected_mode}
                                onChange={handleModeChange}
                                className="block w-full sm:w-auto rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:focus:ring-blue-500 font-medium"
                            >
                                <option value="month">Per Bulan</option>
                                <option value="30days">30 Hari Terakhir</option>
                            </select>

                            {filters.selected_mode === 'month' && (
                                <select
                                    value={filters.selected_month}
                                    onChange={handleMonthChange}
                                    className="block w-full sm:w-auto rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:focus:ring-blue-500"
                                >
                                    {filters.available_months.map((m) => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="mb-6 flex items-center gap-4 md:gap-6 bg-slate-50/50 dark:bg-slate-800/30 p-2.5 rounded-md border border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col items-end sm:items-start px-2">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Total Bulan Ini</span>
                            <span className="text-base font-bold text-slate-900 dark:text-slate-100 leading-none">{chart_stats.total}</span>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                        <div className="flex flex-col items-start px-2 hidden sm:flex">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Rata-rata Harian</span>
                            <span className="text-base font-bold text-slate-900 dark:text-slate-100 leading-none">{chart_stats.average}<span className="text-xs font-medium text-slate-500 ml-1">/hari</span></span>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                        <div className="flex flex-col items-start px-2">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                {filters.selected_mode === 'month' ? 'Bulan Lalu' : '30 Hari Sebelumnya'}
                            </span>
                            {chart_stats.diff_amount !== 0 ? (
                                <div className={`flex items-center gap-1 text-xs font-bold ${chart_stats.diff_amount > 0 ? 'text-primary dark:text-primary' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {chart_stats.diff_amount > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    <span>{Math.abs(chart_stats.diff_amount)} ({chart_stats.diff_percentage}%)</span>
                                </div>
                            ) : (
                                <div className="text-xs font-bold text-slate-500">
                                    Tetap
                                </div>
                            )}
                        </div>
                    </div>

                    {chart_stats.total === 0 ? (
                        <div className="h-[280px] w-full flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 rounded-md border border-dashed border-slate-200 dark:border-slate-800">
                            <TrendingUp className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-3" />
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Belum ada transaksi pada periode ini.</p>
                        </div>
                    ) : (
                        <div className="h-[280px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chart_data} margin={{ top: 20, right: 10, bottom: 0, left: -20 }}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="currentColor" className="text-slate-200/60 dark:text-slate-800/60" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                                        dy={10}
                                        minTickGap={20}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                                        allowDecimals={false}
                                        domain={[0, 'auto']}
                                        padding={{ top: 20, bottom: 0 }}
                                    />
                                    <RechartsTooltip
                                        content={<CustomTooltip />}
                                        cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        name="Transaksi"
                                        stroke="#3b82f6"
                                        strokeWidth={2.5}
                                        fillOpacity={1}
                                        fill="url(#colorTotal)"
                                        activeDot={{ r: 5, strokeWidth: 3, stroke: '#bfdbfe', fill: '#3b82f6', style: { filter: 'drop-shadow(0px 0px 4px rgba(59, 130, 246, 0.6))' } }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* 3. ROW: TOP BUKU & TOP ANGGOTA */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {/* Top Buku */}
                    <div className="flex flex-col rounded-md border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-col gap-4 mb-2">
                            <div className="flex items-center gap-3">
                                <Book className="h-5 w-5 text-slate-400" />
                                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Buku Terpopuler</h2>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 -mt-2">
                                {filters.buku_mode === 'per_bulan' ? 'Berdasarkan jumlah peminjaman pada periode terpilih.' : 'Berdasarkan histori seluruh transaksi peminjaman.'}
                            </p>
                            <div className="flex flex-col gap-1.5 mt-1">
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">Periode</span>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Select value={filters.buku_mode} onValueChange={(val) => handleWidgetFilterChange('buku', 'mode', val)}>
                                        <SelectTrigger className="h-8 w-[120px] text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                            <SelectValue placeholder="Periode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="semua">Semua</SelectItem>
                                            <SelectItem value="per_bulan">Per Bulan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {filters.buku_mode === 'per_bulan' && (
                                        <>
                                            <Select value={filters.buku_bulan} onValueChange={(val) => handleWidgetFilterChange('buku', 'bulan', val)}>
                                                <SelectTrigger className="h-8 w-[120px] text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                                    <SelectValue placeholder="Bulan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {BULAN.map((b, i) => (
                                                        <SelectItem key={i + 1} value={(i + 1).toString()}>{b}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Select value={filters.buku_tahun} onValueChange={(val) => handleWidgetFilterChange('buku', 'tahun', val)}>
                                                <SelectTrigger className="h-8 w-[80px] text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                                    <SelectValue placeholder="Tahun" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {filters.available_years.map(y => (
                                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </>
                                    )}
                                </div>
                            </div>
                            <hr className="border-slate-100 dark:border-slate-800/60 my-3" />
                        </div>

                        {top_books.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-10">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada statistik buku.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {top_books.map((buku, i) => (
                                    <div key={buku.id} className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-6 text-center font-semibold text-slate-400 dark:text-slate-500 text-sm">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{buku.judul}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{buku.kategori}</p>
                                        </div>
                                        <div className="flex-shrink-0 text-right">
                                            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{buku.total_dipinjam}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Top Anggota */}
                    <div className="flex flex-col rounded-md border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-col gap-4 mb-2">
                            <div className="flex items-center gap-3">
                                <Award className="h-5 w-5 text-slate-400" />
                                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Anggota Teraktif</h2>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 -mt-2">
                                {filters.anggota_mode === 'per_bulan' ? 'Berdasarkan jumlah transaksi pada periode terpilih.' : 'Berdasarkan histori seluruh transaksi peminjaman.'}
                            </p>
                            <div className="flex flex-col gap-1.5 mt-1">
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">Periode</span>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Select value={filters.anggota_mode} onValueChange={(val) => handleWidgetFilterChange('anggota', 'mode', val)}>
                                        <SelectTrigger className="h-8 w-[120px] text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                            <SelectValue placeholder="Periode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="semua">Semua</SelectItem>
                                            <SelectItem value="per_bulan">Per Bulan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {filters.anggota_mode === 'per_bulan' && (
                                        <>
                                            <Select value={filters.anggota_bulan} onValueChange={(val) => handleWidgetFilterChange('anggota', 'bulan', val)}>
                                                <SelectTrigger className="h-8 w-[120px] text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                                    <SelectValue placeholder="Bulan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {BULAN.map((b, i) => (
                                                        <SelectItem key={i + 1} value={(i + 1).toString()}>{b}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Select value={filters.anggota_tahun} onValueChange={(val) => handleWidgetFilterChange('anggota', 'tahun', val)}>
                                                <SelectTrigger className="h-8 w-[80px] text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                                    <SelectValue placeholder="Tahun" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {filters.available_years.map(y => (
                                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </>
                                    )}
                                </div>
                            </div>
                            <hr className="border-slate-100 dark:border-slate-800/60 my-3" />
                        </div>

                        {top_members.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-10">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada statistik anggota.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {top_members.map((member, i) => (
                                    <div key={member.id} className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-6 text-center font-semibold text-slate-400 dark:text-slate-500 text-sm">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{member.nama}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{member.kode_anggota} • {member.kelas} {member.jurusan}</p>
                                        </div>
                                        <div className="flex-shrink-0 text-right">
                                            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{member.total_transaksi}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. ROW: KETERLAMBATAN & AKTIVITAS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    {/* Keterlambatan */}
                    <div className="flex flex-col rounded-md border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-col gap-4 mb-2">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-slate-400" />
                                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Daftar Keterlambatan</h2>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 -mt-2">
                                {filters.lambat_mode === 'per_bulan' ? 'Keterlambatan pada periode terpilih.' : 'Akumulasi keterlambatan sepanjang histori.'}
                            </p>
                            <div className="flex flex-col gap-1.5 mt-1">
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">Periode</span>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Select value={filters.lambat_mode} onValueChange={(val) => handleWidgetFilterChange('lambat', 'mode', val)}>
                                        <SelectTrigger className="h-8 w-[120px] text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                            <SelectValue placeholder="Periode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="semua">Semua</SelectItem>
                                            <SelectItem value="per_bulan">Per Bulan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {filters.lambat_mode === 'per_bulan' && (
                                        <>
                                            <Select value={filters.lambat_bulan} onValueChange={(val) => handleWidgetFilterChange('lambat', 'bulan', val)}>
                                                <SelectTrigger className="h-8 w-[120px] text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                                    <SelectValue placeholder="Bulan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {BULAN.map((b, i) => (
                                                        <SelectItem key={i + 1} value={(i + 1).toString()}>{b}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Select value={filters.lambat_tahun} onValueChange={(val) => handleWidgetFilterChange('lambat', 'tahun', val)}>
                                                <SelectTrigger className="h-8 w-[80px] text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                                    <SelectValue placeholder="Tahun" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {filters.available_years.map(y => (
                                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </>
                                    )}
                                </div>
                            </div>
                            <hr className="border-slate-100 dark:border-slate-800/60 my-3" />
                        </div>

                        {isKeterlambatanAman ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                                <div className="h-10 w-10 rounded-md bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-3">
                                    <CheckCircle2 className="h-5 w-5 text-slate-400" />
                                </div>
                                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Tidak ada keterlambatan</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Semua sirkulasi berjalan lancar.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto -mx-6 px-6">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                                        <tr>
                                            <th className="pb-3 w-[40px]"></th>
                                            <th className="pb-3 font-medium">Anggota</th>
                                            <th className="pb-3 font-medium text-center">Telat</th>
                                            <th className="pb-3 font-medium text-right">Denda</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                        {keterlambatan.slice(0, 5).map((item, i) => (
                                            <tr key={item.id}>
                                                <td className="py-3 w-[40px]">
                                                    <div className="w-6 text-center text-slate-400 dark:text-slate-500 font-semibold text-sm">
                                                        {i + 1}
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <div className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[150px] sm:max-w-[200px]">{item.nama_anggota}</div>
                                                    <div className="text-xs text-slate-500 truncate max-w-[150px] sm:max-w-[200px]">{item.kelas_jurusan}</div>
                                                </td>
                                                <td className="py-3 text-center">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                        {item.keterlambatan} hari
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                        Rp {Number(item.estimasi_denda).toLocaleString('id-ID')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Aktivitas */}
                    <div className="flex flex-col rounded-md border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Aktivitas Terbaru</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Log transaksi sistem</p>
                            </div>
                            <MoreHorizontal className="h-5 w-5 text-slate-400" />
                        </div>

                        {aktivitas_terbaru.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-10">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada aktivitas tercatat.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {aktivitas_terbaru.map(act => {
                                    const meta = getActivityMeta(act.aksi);
                                    return (
                                        <div key={act.id} className="flex gap-4 items-start relative group">
                                            {/* Timeline connector */}
                                            <div className="absolute left-4 top-8 bottom-[-16px] w-px bg-slate-100 dark:bg-slate-800 group-last:hidden"></div>

                                            <div className={`mt-0.5 relative z-10 flex h-8 w-8 items-center justify-center rounded-md ${meta.iconBg} ring-4 ring-white dark:ring-slate-900`}>
                                                {meta.icon}
                                            </div>
                                            <div className="flex-1 min-w-0 pt-1">
                                                <div className="flex justify-between items-center gap-2">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                                        {act.nama_anggota}
                                                    </p>
                                                    <span className="text-[11px] text-slate-500 whitespace-nowrap">
                                                        {act.waktu}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wide ${meta.style}`}>
                                                        {act.aksi}
                                                    </span>
                                                    <span className="text-xs text-slate-500 truncate">{act.judul_buku}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
