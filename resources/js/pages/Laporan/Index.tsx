import AppLayout from '@/layouts/app-layout'
import { Head, usePage } from '@inertiajs/react'
import { type BreadcrumbItem } from '@/types'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Users,
  BookOpen,
  ClipboardList,
  RotateCcw,
  AlertCircle,
  FileText,
  Sheet,
  TrendingUp,
  Award,
  Clock,
} from 'lucide-react'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Laporan', href: '/laporan' },
]

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function getDefaultDates() {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const toLocal = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  return { startDate: toLocal(firstDay), endDate: toLocal(today) }
}

export default function LaporanIndex() {
  // Props dipakai oleh sub-components (AnggotaReportCard, dll) melalui usePage() masing-masing

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Laporan" />

      <div className="w-full px-6 lg:px-10 py-8 space-y-6">

        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/40 pb-6 bg-gray-50/40 dark:bg-neutral-900/40 rounded-t-lg">
            <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Cetak Laporan
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400 mt-1">
              Unduh dan cetak laporan perpustakaan dalam format PDF atau Excel.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 pb-8">
            <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 items-start">

<AnggotaReportCard />

<BukuReportCard />

              <PeminjamanReportCard />

              {/* Laporan dengan Filter */}
              <PengembalianReportCard />

              <DendaReportCard />

            </div>
          </CardContent>
        </Card>

        {/* STATISTIK SECTION */}
        <div className="mt-12 space-y-4">
          <div className="px-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Statistik Perpustakaan</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Analisis aktivitas dan penggunaan perpustakaan.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 items-start">
            
            <StatistikAnggotaTeraktifCard />

            <StatistikBukuTerpopulerCard />

            <StatistikAnggotaTerlambatCard />

          </div>
        </div>

      </div>
    </AppLayout>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ReportCard({
  label, description, icon, color, headerColor, iconBg, pdfHref, excelHref,
}: {
  label: string; description: string; icon: React.ReactNode;
  color: string; headerColor: string; iconBg: string;
  pdfHref: string; excelHref: string;
}) {
  return (
    <div className="rounded-md border border-border/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full bg-white dark:bg-neutral-900">
      <div className={`flex items-center gap-3 px-5 py-4 border-b ${headerColor}`}>
        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-md flex-shrink-0 ${iconBg}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className={`font-semibold text-base ${color}`}>{label}</p>
          <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-1">{description}</p>
        </div>
      </div>
      <div className="flex gap-3 px-5 py-4 mt-auto border-t border-border/40 bg-gray-50/50 dark:bg-neutral-800/30">
        <a href={pdfHref} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="outline" className="w-full gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 dark:hover:bg-neutral-800 dark:hover:border-neutral-600 dark:hover:text-gray-100 text-sm" size="sm">
            <FileText className="w-4 h-4 text-destructive" />Cetak PDF
          </Button>
        </a>
        <a href={excelHref} className="flex-1">
          <Button variant="default" className="w-full gap-2 text-white shadow-sm text-sm" size="sm">
            <Sheet className="w-4 h-4" />Cetak Excel
          </Button>
        </a>
      </div>
    </div>
  )
}

function PengembalianReportCard() {
  const [startDate, setStartDate] = useState<string>(() => getDefaultDates().startDate)
  const [endDate, setEndDate] = useState<string>(() => getDefaultDates().endDate)

  const isValid = startDate !== '' && endDate !== '' && new Date(startDate) <= new Date(endDate)

  const pdfHref = `/laporan/pdf/pengembalian?filter_type=rentang&start_date=${startDate}&end_date=${endDate}`
  const excelHref = `/laporan/excel/pengembalian?filter_type=rentang&start_date=${startDate}&end_date=${endDate}`

  return (
    <div className="rounded-md border border-border/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full bg-white dark:bg-neutral-900">
      <div className="flex flex-col gap-3 px-5 py-4 border-b bg-transparent border-border/50">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-md flex-shrink-0 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
            <RotateCcw className="w-6 h-6" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-base text-primary">Laporan Pengembalian</p>
            <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-1">Data transaksi pengembalian buku</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Tanggal Awal</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 bg-white dark:bg-neutral-950 text-sm text-gray-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Tanggal Akhir</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 bg-white dark:bg-neutral-950 text-sm text-gray-500" />
            </div>
          </div>
          {startDate && endDate && new Date(startDate) > new Date(endDate) && (
            <p className="text-xs text-destructive">Tanggal awal tidak boleh lebih besar dari tanggal akhir.</p>
          )}
        </div>
      </div>
      <div className="flex gap-3 px-5 py-4 mt-auto border-t border-border/40 bg-gray-50/50 dark:bg-neutral-800/30">
        <a href={pdfHref} target={isValid ? "_blank" : undefined} rel="noopener noreferrer" className={`flex-1 ${!isValid ? 'pointer-events-none opacity-50' : ''}`}>
          <Button variant="outline" className="w-full gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 dark:hover:bg-neutral-800 dark:hover:border-neutral-600 dark:hover:text-gray-100 text-sm" size="sm" disabled={!isValid}>
            <FileText className="w-4 h-4 text-destructive" />Cetak PDF
          </Button>
        </a>
        <a href={excelHref} className={`flex-1 ${!isValid ? 'pointer-events-none opacity-50' : ''}`}>
          <Button variant="default" className="w-full gap-2 text-white shadow-sm text-sm" size="sm" disabled={!isValid}>
            <Sheet className="w-4 h-4" />Cetak Excel
          </Button>
        </a>
      </div>
    </div>
  )
}

function PeminjamanReportCard() {
  const [startDate, setStartDate] = useState<string>(() => getDefaultDates().startDate)
  const [endDate, setEndDate] = useState<string>(() => getDefaultDates().endDate)

  const isValid = startDate !== '' && endDate !== '' && new Date(startDate) <= new Date(endDate)

  const pdfHref = `/laporan/pdf/peminjaman?filter_type=rentang&start_date=${startDate}&end_date=${endDate}`
  const excelHref = `/laporan/excel/peminjaman?filter_type=rentang&start_date=${startDate}&end_date=${endDate}`

  return (
    <div className="rounded-md border border-border/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full bg-white dark:bg-neutral-900">
      <div className="flex flex-col gap-3 px-5 py-4 border-b bg-transparent border-border/50">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-md flex-shrink-0 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
            <ClipboardList className="w-6 h-6" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-base text-primary">Laporan Peminjaman</p>
            <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-1">Data transaksi peminjaman buku</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Tanggal Awal</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 bg-white dark:bg-neutral-950 text-sm text-gray-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Tanggal Akhir</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 bg-white dark:bg-neutral-950 text-sm text-gray-500" />
            </div>
          </div>
          {startDate && endDate && new Date(startDate) > new Date(endDate) && (
            <p className="text-xs text-destructive">Tanggal awal tidak boleh lebih besar dari tanggal akhir.</p>
          )}
        </div>
      </div>
      <div className="flex gap-3 px-5 py-4 mt-auto border-t border-border/40 bg-gray-50/50 dark:bg-neutral-800/30">
        <a href={pdfHref} target={isValid ? "_blank" : undefined} rel="noopener noreferrer" className={`flex-1 ${!isValid ? 'pointer-events-none opacity-50' : ''}`}>
          <Button variant="outline" className="w-full gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 dark:hover:bg-neutral-800 dark:hover:border-neutral-600 dark:hover:text-gray-100 text-sm" size="sm" disabled={!isValid}>
            <FileText className="w-4 h-4 text-destructive" />Cetak PDF
          </Button>
        </a>
        <a href={excelHref} className={`flex-1 ${!isValid ? 'pointer-events-none opacity-50' : ''}`}>
          <Button variant="default" className="w-full gap-2 text-white shadow-sm text-sm" size="sm" disabled={!isValid}>
            <Sheet className="w-4 h-4" />Cetak Excel
          </Button>
        </a>
      </div>
    </div>
  )
}

function DendaReportCard() {
  const [status, setStatus] = useState<string>('semua')
  const [startDate, setStartDate] = useState<string>(() => getDefaultDates().startDate)
  const [endDate, setEndDate] = useState<string>(() => getDefaultDates().endDate)

  const isValid = startDate !== '' && endDate !== '' && new Date(startDate) <= new Date(endDate)

  const pdfHref = `/laporan/pdf/denda?filter_type=rentang&start_date=${startDate}&end_date=${endDate}&status=${status}`
  const excelHref = `/laporan/excel/denda?filter_type=rentang&start_date=${startDate}&end_date=${endDate}&status=${status}`

  return (
    <div className="rounded-md border border-border/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full bg-white dark:bg-neutral-900">
      <div className="flex flex-col gap-3 px-5 py-4 border-b bg-transparent border-border/50">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-md flex-shrink-0 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
            <AlertCircle className="w-6 h-6" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-base text-primary">Laporan Denda</p>
            <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-1">Data denda keterlambatan pengembalian</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 bg-white dark:bg-neutral-950 text-sm">
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Status</SelectItem>
              <SelectItem value="Lunas">Lunas</SelectItem>
              <SelectItem value="Belum Lunas">Belum Lunas</SelectItem>
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Tanggal Awal</label>
              <Input type="date" lang="id" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 bg-white dark:bg-neutral-950 text-sm text-gray-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Tanggal Akhir</label>
              <Input type="date" lang="id" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 bg-white dark:bg-neutral-950 text-sm text-gray-500" />
            </div>
          </div>
          {startDate && endDate && new Date(startDate) > new Date(endDate) && (
            <p className="text-xs text-destructive">Tanggal awal tidak boleh lebih besar dari tanggal akhir.</p>
          )}
        </div>
      </div>
      <div className="flex gap-3 px-5 py-4 mt-auto border-t border-border/40 bg-gray-50/50 dark:bg-neutral-800/30">
        <a href={pdfHref} target={isValid ? "_blank" : undefined} rel="noopener noreferrer" className={`flex-1 ${!isValid ? 'pointer-events-none opacity-50' : ''}`}>
          <Button variant="outline" className="w-full gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 dark:hover:bg-neutral-800 dark:hover:border-neutral-600 dark:hover:text-gray-100 text-sm" size="sm" disabled={!isValid}>
            <FileText className="w-4 h-4 text-destructive" />Cetak PDF
          </Button>
        </a>
        <a href={excelHref} className={`flex-1 ${!isValid ? 'pointer-events-none opacity-50' : ''}`}>
          <Button variant="default" className="w-full gap-2 text-white shadow-sm text-sm" size="sm" disabled={!isValid}>
            <Sheet className="w-4 h-4" />Cetak Excel
          </Button>
        </a>
      </div>
    </div>
  )
}

function StatistikAnggotaTeraktifCard() {
  const { minYear } = usePage<any>().props
  const currentYear = new Date().getFullYear()
  const currentMonth = (new Date().getMonth() + 1).toString()
  const startYear = parseInt(minYear) || currentYear

  const TAHUN = []
  for (let y = currentYear; y >= startYear; y--) {
    TAHUN.push(y)
  }

  const [periode, setPeriode] = useState<string>('semua')
  const [bulan, setBulan] = useState<string>(currentMonth)
  const [tahun, setTahun] = useState<string>(currentYear.toString())

  const isSemua = periode === 'semua'
  const _isReady = isSemua || (bulan !== '' && tahun !== '')

  const pdfHref = isSemua
    ? `/laporan/pdf/statistik_anggota_teraktif?filter_type=semua`
    : `/laporan/pdf/statistik_anggota_teraktif?filter_type=bulan&bulan=${bulan}&tahun=${tahun}`
  const excelHref = isSemua
    ? `/laporan/excel/statistik_anggota_teraktif?filter_type=semua`
    : `/laporan/excel/statistik_anggota_teraktif?filter_type=bulan&bulan=${bulan}&tahun=${tahun}`

  return (
    <div className="rounded-md border border-border/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full bg-white dark:bg-neutral-900">
      <div className="flex flex-col gap-3 px-5 py-4 border-b bg-transparent border-border/50">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-md flex-shrink-0 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
            <Award className="w-6 h-6" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-base text-primary">Anggota Teraktif</p>
            <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-1">Data anggota dengan jumlah peminjaman terbanyak.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Periode</label>
            <Select value={periode} onValueChange={setPeriode}>
              <SelectTrigger className="h-9 bg-white dark:bg-neutral-950 text-sm">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Waktu</SelectItem>
                <SelectItem value="per_bulan">Per Bulan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Select value={bulan} onValueChange={setBulan} disabled={isSemua}>
              <SelectTrigger className="h-9 bg-white dark:bg-neutral-950 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                {BULAN.map((namaBulan, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {namaBulan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={tahun} onValueChange={setTahun} disabled={isSemua}>
              <SelectTrigger className="h-9 bg-white dark:bg-neutral-950 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {TAHUN.map((thn) => (
                  <SelectItem key={thn} value={thn.toString()}>
                    {thn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="flex gap-3 px-5 py-4 mt-auto border-t border-border/40 bg-gray-50/50 dark:bg-neutral-800/30">
        <a href={pdfHref} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="outline" className="w-full gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 dark:hover:bg-neutral-800 dark:hover:border-neutral-600 dark:hover:text-gray-100 text-sm" size="sm">
            <FileText className="w-4 h-4 text-destructive" />Cetak PDF
          </Button>
        </a>
        <a href={excelHref} className="flex-1">
          <Button variant="default" className="w-full gap-2 text-white shadow-sm text-sm" size="sm">
            <Sheet className="w-4 h-4" />Cetak Excel
          </Button>
        </a>
      </div>
    </div>
  )
}

function StatistikBukuTerpopulerCard() {
  const { minYear } = usePage<any>().props
  const currentYear = new Date().getFullYear()
  const currentMonth = (new Date().getMonth() + 1).toString()
  const startYear = parseInt(minYear) || currentYear

  const TAHUN = []
  for (let y = currentYear; y >= startYear; y--) {
    TAHUN.push(y)
  }

  const [periode, setPeriode] = useState<string>('semua')
  const [bulan, setBulan] = useState<string>(currentMonth)
  const [tahun, setTahun] = useState<string>(currentYear.toString())

  const isSemua = periode === 'semua'

  const pdfHref = isSemua
    ? `/laporan/pdf/statistik_buku_terpopuler?filter_type=semua`
    : `/laporan/pdf/statistik_buku_terpopuler?filter_type=bulan&bulan=${bulan}&tahun=${tahun}`
  const excelHref = isSemua
    ? `/laporan/excel/statistik_buku_terpopuler?filter_type=semua`
    : `/laporan/excel/statistik_buku_terpopuler?filter_type=bulan&bulan=${bulan}&tahun=${tahun}`

  return (
    <div className="rounded-md border border-border/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full bg-white dark:bg-neutral-900">
      <div className="flex flex-col gap-3 px-5 py-4 border-b bg-transparent border-border/50">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-md flex-shrink-0 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
            <TrendingUp className="w-6 h-6" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-base text-primary">Buku Terpopuler</p>
            <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-1">Data buku yang paling sering dipinjam.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Periode</label>
            <Select value={periode} onValueChange={setPeriode}>
              <SelectTrigger className="h-9 bg-white dark:bg-neutral-950 text-sm">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Waktu</SelectItem>
                <SelectItem value="per_bulan">Per Bulan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Select value={bulan} onValueChange={setBulan} disabled={isSemua}>
              <SelectTrigger className="h-9 bg-white dark:bg-neutral-950 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                {BULAN.map((namaBulan, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {namaBulan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={tahun} onValueChange={setTahun} disabled={isSemua}>
              <SelectTrigger className="h-9 bg-white dark:bg-neutral-950 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {TAHUN.map((thn) => (
                  <SelectItem key={thn} value={thn.toString()}>
                    {thn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="flex gap-3 px-5 py-4 mt-auto border-t border-border/40 bg-gray-50/50 dark:bg-neutral-800/30">
        <a href={pdfHref} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="outline" className="w-full gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 dark:hover:bg-neutral-800 dark:hover:border-neutral-600 dark:hover:text-gray-100 text-sm" size="sm">
            <FileText className="w-4 h-4 text-destructive" />Cetak PDF
          </Button>
        </a>
        <a href={excelHref} className="flex-1">
          <Button variant="default" className="w-full gap-2 text-white shadow-sm text-sm" size="sm">
            <Sheet className="w-4 h-4" />Cetak Excel
          </Button>
        </a>
      </div>
    </div>
  )
}

function StatistikAnggotaTerlambatCard() {
  const { minYear } = usePage<any>().props
  const currentYear = new Date().getFullYear()
  const currentMonth = (new Date().getMonth() + 1).toString()
  const startYear = parseInt(minYear) || currentYear

  const TAHUN = []
  for (let y = currentYear; y >= startYear; y--) {
    TAHUN.push(y)
  }

  const [periode, setPeriode] = useState<string>('semua')
  const [bulan, setBulan] = useState<string>(currentMonth)
  const [tahun, setTahun] = useState<string>(currentYear.toString())

  const isSemua = periode === 'semua'

  const pdfHref = isSemua
    ? `/laporan/pdf/statistik_anggota_terlambat?filter_type=semua`
    : `/laporan/pdf/statistik_anggota_terlambat?filter_type=bulan&bulan=${bulan}&tahun=${tahun}`
  const excelHref = isSemua
    ? `/laporan/excel/statistik_anggota_terlambat?filter_type=semua`
    : `/laporan/excel/statistik_anggota_terlambat?filter_type=bulan&bulan=${bulan}&tahun=${tahun}`

  return (
    <div className="rounded-md border border-border/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full bg-white dark:bg-neutral-900">
      <div className="flex flex-col gap-3 px-5 py-4 border-b bg-transparent border-border/50">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-md flex-shrink-0 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
            <Clock className="w-6 h-6" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-base text-primary">Anggota Sering Terlambat</p>
            <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-1">Data anggota yang paling sering terlambat mengembalikan buku.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <Select value={periode} onValueChange={setPeriode}>
            <SelectTrigger className="h-9 bg-white dark:bg-neutral-950 text-sm">
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Waktu</SelectItem>
              <SelectItem value="per_bulan">Per Bulan</SelectItem>
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-2">
            <Select value={bulan} onValueChange={setBulan} disabled={isSemua}>
              <SelectTrigger className="h-9 bg-white dark:bg-neutral-950 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                {BULAN.map((namaBulan, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {namaBulan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={tahun} onValueChange={setTahun} disabled={isSemua}>
              <SelectTrigger className="h-9 bg-white dark:bg-neutral-950 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {TAHUN.map((thn) => (
                  <SelectItem key={thn} value={thn.toString()}>
                    {thn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="flex gap-3 px-5 py-4 mt-auto border-t border-border/40 bg-gray-50/50 dark:bg-neutral-800/30">
        <a href={pdfHref} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="outline" className="w-full gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 dark:hover:bg-neutral-800 dark:hover:border-neutral-600 dark:hover:text-gray-100 text-sm" size="sm">
            <FileText className="w-4 h-4 text-destructive" />Cetak PDF
          </Button>
        </a>
        <a href={excelHref} className="flex-1">
          <Button variant="default" className="w-full gap-2 text-white shadow-sm text-sm" size="sm">
            <Sheet className="w-4 h-4" />Cetak Excel
          </Button>
        </a>
      </div>
    </div>
  )
}

function AnggotaReportCard() {
  const { jurusan, classes } = usePage<any>().props
  const [selectedJurusan, setJurusan] = useState<string>('semua')
  const [kelas, setKelas] = useState<string>('semua')

  const pdfHref = `/laporan/pdf/anggota?jurusan=${selectedJurusan}&kelas=${kelas}`
  const excelHref = `/laporan/excel/anggota?jurusan=${selectedJurusan}&kelas=${kelas}`

  return (
    <div className="rounded-md border border-border/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full bg-white dark:bg-neutral-900">
      <div className="flex flex-col gap-3 px-5 py-4 border-b bg-transparent border-border/50">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-md flex-shrink-0 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
            <Users className="w-6 h-6" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-base text-primary">Laporan Anggota</p>
            <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-1">Data seluruh anggota perpustakaan</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <Select value={selectedJurusan} onValueChange={setJurusan}>
            <SelectTrigger className="h-9 bg-white dark:bg-neutral-950 text-sm">
              <SelectValue placeholder="Pilih Jurusan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Jurusan</SelectItem>
              {jurusan?.map((m: any) => (
                <SelectItem key={m.id} value={m.id.toString()}>{m.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={kelas} onValueChange={setKelas}>
            <SelectTrigger className="h-9 bg-white dark:bg-neutral-950 text-sm">
              <SelectValue placeholder="Pilih Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Kelas</SelectItem>
              {classes?.map((c: any) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-3 px-5 py-4 mt-auto border-t border-border/40 bg-gray-50/50 dark:bg-neutral-800/30">
        <a href={pdfHref} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="outline" className="w-full gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 dark:hover:bg-neutral-800 dark:hover:border-neutral-600 dark:hover:text-gray-100 text-sm" size="sm">
            <FileText className="w-4 h-4 text-destructive" />Cetak PDF
          </Button>
        </a>
        <a href={excelHref} className="flex-1">
          <Button variant="default" className="w-full gap-2 text-white shadow-sm text-sm" size="sm">
            <Sheet className="w-4 h-4" />Cetak Excel
          </Button>
        </a>
      </div>
    </div>
  )
}

function BukuReportCard() {
  const { kategori_buku } = usePage<any>().props
  const [kategori, setKategori] = useState<string>('semua')

  const pdfHref = `/laporan/pdf/buku?kategori=${kategori}`
  const excelHref = `/laporan/excel/buku?kategori=${kategori}`

  return (
    <div className="rounded-md border border-border/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full bg-white dark:bg-neutral-900">
      <div className="flex flex-col gap-3 px-5 py-4 border-b bg-transparent border-border/50">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-md flex-shrink-0 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
            <BookOpen className="w-6 h-6" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-base text-primary">Laporan Buku</p>
            <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-1">Data koleksi buku tersedia</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <Select value={kategori} onValueChange={setKategori}>
            <SelectTrigger className="h-9 bg-white dark:bg-neutral-950 text-sm">
              <SelectValue placeholder="Pilih Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Kategori</SelectItem>
              {kategori_buku?.map((c: any) => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-3 px-5 py-4 mt-auto border-t border-border/40 bg-gray-50/50 dark:bg-neutral-800/30">
        <a href={pdfHref} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="outline" className="w-full gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 dark:hover:bg-neutral-800 dark:hover:border-neutral-600 dark:hover:text-gray-100 text-sm" size="sm">
            <FileText className="w-4 h-4 text-destructive" />Cetak PDF
          </Button>
        </a>
        <a href={excelHref} className="flex-1">
          <Button variant="default" className="w-full gap-2 text-white shadow-sm text-sm" size="sm">
            <Sheet className="w-4 h-4" />Cetak Excel
          </Button>
        </a>
      </div>
    </div>
  )
}
