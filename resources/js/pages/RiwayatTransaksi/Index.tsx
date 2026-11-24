import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, router, Link, usePage, usePoll } from '@inertiajs/react'
import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Search,
  RotateCcw,
} from 'lucide-react'
import { Pagination } from '@/components/Pagination'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Riwayat Transaksi', href: '/riwayat-transaksi' },
]

type RiwayatItem = {
  jenis_transaksi: string
  id_transaksi: number
  referensi: string
  nama_anggota: string
  buku: string[]
  tanggal: string
  status: string
}

type PaginatedData = {
  data: RiwayatItem[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
  links: { url: string | null; label: string; active: boolean }[]
}

import { type SharedData } from '@/types'

export default function RiwayatTransaksiIndex({
  riwayat,
  search,
  sortBy,
  sortDir,
  filterJenis,
  tanggal_dari,
  tanggal_sampai,
}: {
  riwayat: PaginatedData
  search?: string
  sortBy?: string
  sortDir?: string
  filterJenis?: string
  tanggal_dari?: string
  tanggal_sampai?: string
}) {
  const { props } = usePage<SharedData & { sortBy?: string; sortDir?: string; filterJenis?: string }>()
  const role = props.auth?.user?.role || 'admin'
  const canViewDetail = ['admin', 'super_admin'].includes(role)

  // Auto-refresh data riwayat tiap 10 detik (hanya prop 'riwayat', filter & halaman tetap).
  // Polling otomatis berhenti saat tab tidak aktif.
  usePoll(10000, { only: ['riwayat'] })

  const [searchValue, setSearchValue] = useState(search || '')
  const [sortByState, setSortByState] = useState(sortBy || 'tanggal')
  const [sortDirState, setSortDirState] = useState(sortDir || 'desc')
  const [jenisState, setJenisState] = useState(filterJenis || 'semua')
  const [dari, setDari] = useState(tanggal_dari || '')
  const [sampai, setSampai] = useState(tanggal_sampai || '')
  // Draft state for date (only apply when user clicks Terapkan)
  const [draftDari, setDraftDari] = useState(tanggal_dari || '')
  const [draftSampai, setDraftSampai] = useState(tanggal_sampai || '')

  useEffect(() => {
    setSortByState(sortBy || 'tanggal')
    setSortDirState(sortDir || 'desc')
    setJenisState(filterJenis || 'semua')
    setDari(tanggal_dari || '')
    setSampai(tanggal_sampai || '')
    setDraftDari(tanggal_dari || '')
    setDraftSampai(tanggal_sampai || '')
  }, [sortBy, sortDir, filterJenis, tanggal_dari, tanggal_sampai])

  // Search debounce
  const isMounted = useRef(false)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    const timer = setTimeout(() => {
      router.get(
        route('riwayat-transaksi.index'),
        { search: searchValue, jenis: jenisState, sortBy: sortByState, sortDir: sortDirState, tanggal_dari: dari, tanggal_sampai: sampai },
        { preserveState: true, replace: true, preserveScroll: true }
      )
    }, 350)
    return () => clearTimeout(timer)
  }, [searchValue])

  const handleSort = (column: string) => {
    const newSortDir = sortByState === column && sortDirState === 'asc' ? 'desc' : 'asc'
    setSortByState(column)
    setSortDirState(newSortDir)
    router.get(
      route('riwayat-transaksi.index'),
      { page: riwayat.current_page, search: searchValue, jenis: jenisState, sortBy: column, sortDir: newSortDir, tanggal_dari: dari, tanggal_sampai: sampai },
      { preserveScroll: true, preserveState: true }
    )
  }

  const handleFilterJenis = (jenis: string) => {
    setJenisState(jenis)
    router.get(
      route('riwayat-transaksi.index'),
      { search: searchValue, jenis, sortBy: sortByState, sortDir: sortDirState, tanggal_dari: dari, tanggal_sampai: sampai },
      { preserveScroll: true }
    )
  }

  const handleApplyFilter = () => {
    setDari(draftDari)
    setSampai(draftSampai)
    router.get(
      route('riwayat-transaksi.index'),
      { search: searchValue, jenis: jenisState, sortBy: sortByState, sortDir: sortDirState, tanggal_dari: draftDari, tanggal_sampai: draftSampai },
      { preserveScroll: true }
    )
  }

  const handleReset = () => {
    setSearchValue('')
    setJenisState('semua')
    setDraftDari('')
    setDraftSampai('')
    setDari('')
    setSampai('')
    router.get(route('riwayat-transaksi.index'), {}, { preserveScroll: true })
  }

  // Link ke halaman detail riwayat, membawa filter/halaman aktif agar tombol "Kembali" mengembalikan tampilan ini
  const detailUrl = (row: RiwayatItem) => {
    const slug =
      row.jenis_transaksi === 'Peminjaman'
        ? 'peminjaman'
        : row.jenis_transaksi === 'Pengembalian'
        ? 'pengembalian'
        : 'denda'
    const q = new URLSearchParams()
    if (search) q.set('search', search)
    if (filterJenis && filterJenis !== 'semua') q.set('jenis', filterJenis)
    if (sortBy) q.set('sortBy', sortBy)
    if (sortDir) q.set('sortDir', sortDir)
    if (tanggal_dari) q.set('tanggal_dari', tanggal_dari)
    if (tanggal_sampai) q.set('tanggal_sampai', tanggal_sampai)
    if (riwayat.current_page > 1) q.set('page', String(riwayat.current_page))
    const qs = q.toString()
    return `/riwayat-transaksi/${slug}/${row.id_transaksi}${qs ? `?${qs}` : ''}`
  }

  const getSortIcon = (column: string) => {
    if (sortByState !== column) return <ArrowUpDown size={13} className="ml-1 inline text-gray-400" />
    if (sortDirState === 'asc') return <ArrowUp size={13} className="ml-1 inline text-primary" />
    return <ArrowDown size={13} className="ml-1 inline text-primary" />
  }

  const SortableHead = ({ column, children, className }: { column: string; children: React.ReactNode; className?: string }) => (
    <TableHead
      className={`cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-800 ${className || ''}`}
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1 whitespace-nowrap">
        {children}
        {getSortIcon(column)}
      </div>
    </TableHead>
  )

  const jenisOptions = [
    { value: 'semua', label: 'Semua' },
    { value: 'Peminjaman', label: 'Peminjaman' },
    { value: 'Pengembalian', label: 'Pengembalian' },
    { value: 'Pembayaran Denda', label: 'Pembayaran Denda' },
  ]

  const getJenisBadge = (jenis: string) => {
    switch (jenis) {
      case 'Peminjaman':
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 dark:bg-blue-900/40 dark:text-blue-300 font-medium text-[11px] px-2 py-0.5">
            Peminjaman
          </Badge>
        )
      case 'Pengembalian':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 dark:bg-green-900/40 dark:text-green-300 font-medium text-[11px] px-2 py-0.5">
            Pengembalian
          </Badge>
        )
      case 'Pembayaran Denda':
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 dark:bg-orange-900/40 dark:text-orange-300 font-medium text-[11px] px-2 py-0.5">
            Pembayaran Denda
          </Badge>
        )
      default:
        return <Badge variant="outline">{jenis}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    if (!status) return <span className="text-gray-400">-</span>
    const s = status.toLowerCase()

    if (s === 'lunas' || s === 'tepat waktu' || s === 'dikembalikan') {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 dark:bg-green-900/40 dark:text-green-300 text-[11px] px-2 py-0.5">{status}</Badge>
    }
    if (s === 'terlambat' || s === 'belum lunas') {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 dark:bg-red-900/40 dark:text-red-300 text-[11px] px-2 py-0.5">{status}</Badge>
    }
    if (s === 'dipinjam') {
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 dark:bg-blue-900/40 dark:text-blue-300 text-[11px] px-2 py-0.5">{status}</Badge>
    }
    return <Badge variant="outline" className="text-[11px] px-2 py-0.5">{status}</Badge>
  }

  const hasFilter = searchValue || jenisState !== 'semua' || dari || sampai

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Riwayat Transaksi" />

      <div className="w-full px-6 lg:px-10 py-8">
        <Card className="border border-border/60 shadow-sm">

          {/* ── Card Header ── */}
          <CardHeader className="border-b border-border/40 pb-5 bg-gray-50/40 dark:bg-neutral-900/40 rounded-t-lg">
            <div className="mb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Riwayat Transaksi
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400 mt-1">
                Menampilkan histori seluruh aktivitas perpustakaan.
              </CardDescription>
            </div>

            {/* ── Filter Row ── */}
            <div className="flex flex-wrap items-end gap-3">

              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Cari kode atau nama anggota..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              {/* Filter Jenis */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-neutral-800 p-1 rounded-md border border-border/50">
                {jenisOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={jenisState === option.value ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleFilterJenis(option.value)}
                    className={`whitespace-nowrap h-7 px-3 text-xs font-medium rounded transition-all ${jenisState !== option.value ? 'text-gray-500 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-100' : ''
                      }`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <label className="text-[11px] text-gray-500 font-medium pl-0.5">Dari</label>
                  <Input
                    type="date"
                    value={draftDari}
                    onChange={(e) => setDraftDari(e.target.value)}
                    className="h-9 text-sm w-36"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[11px] text-gray-500 font-medium pl-0.5">Sampai</label>
                  <Input
                    type="date"
                    value={draftSampai}
                    onChange={(e) => setDraftSampai(e.target.value)}
                    className="h-9 text-sm w-36"
                  />
                </div>
              </div>

              {/* Terapkan */}
              <div className="flex flex-col gap-0.5 pt-4">
                <Button
                  type="button"
                  size="sm"
                  className="h-9 px-4 text-sm"
                  onClick={handleApplyFilter}
                >
                  Terapkan
                </Button>
              </div>

              {/* Reset */}
              {hasFilter && (
                <div className="flex flex-col gap-0.5 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-sm"
                    onClick={handleReset}
                  >
                    <RotateCcw size={13} className="mr-1.5" />
                    Reset
                  </Button>
                </div>
              )}

            </div>
          </CardHeader>

          {/* ── Table ── */}
          <CardContent className="p-0">
            <Table className="w-full text-sm">
              <TableHeader className="bg-gray-50 dark:bg-neutral-900/60">
                <TableRow className="border-b border-border/40">
                  <TableHead className="w-12 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">No</TableHead>
                  <SortableHead column="tanggal">Tanggal</SortableHead>
                  <SortableHead column="jenis_transaksi">Jenis Transaksi</SortableHead>
                  <SortableHead column="referensi">Kode Peminjaman</SortableHead>
                  <SortableHead column="nama_anggota">Nama Anggota</SortableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400">Buku</TableHead>
                  <SortableHead column="status">Status</SortableHead>
                  {canViewDetail && (
                    <TableHead className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 w-20">
                      Aksi
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {riwayat.data.length > 0 ? (
                  riwayat.data.map((row, index) => (
                    <TableRow
                      key={`${row.jenis_transaksi}-${row.id_transaksi}`}
                      className="hover:bg-muted/30 transition-colors border-b border-border/30"
                    >
                      <TableCell className="text-center text-gray-500 text-xs">
                        {(riwayat.current_page - 1) * riwayat.per_page + index + 1}
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {row.tanggal
                          ? new Date(row.tanggal).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                          : '-'}
                      </TableCell>

                      <TableCell>{getJenisBadge(row.jenis_transaksi)}</TableCell>

                      <TableCell className="font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        {row.referensi || '-'}
                      </TableCell>

                      <TableCell className="whitespace-nowrap">{row.nama_anggota || '-'}</TableCell>

                      <TableCell className="text-gray-600 dark:text-gray-400 min-w-[200px]">
                        {row.buku && row.buku.length > 0 ? (
                          <div className="flex flex-col gap-1.5 py-1">
                            {row.buku.map((judul, i) => (
                              <span key={i} className="block">- {judul}</span>
                            ))}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>

                      <TableCell>{getStatusBadge(row.status)}</TableCell>

                      {canViewDetail && (
                        <TableCell className="text-center">
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              href={detailUrl(row)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Detail
                            </Link>
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={canViewDetail ? 8 : 7}
                      className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm"
                    >
                      {hasFilter
                        ? 'Tidak ada hasil yang cocok dengan filter yang dipilih.'
                        : 'Belum ada histori transaksi.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <Pagination
              links={riwayat.links}
              currentPage={riwayat.current_page}
              lastPage={riwayat.last_page}
              from={riwayat.from}
              to={riwayat.to}
              total={riwayat.total}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
