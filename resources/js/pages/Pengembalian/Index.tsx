import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { useState, useEffect, useRef } from 'react'
import { ConfirmModal } from '@/components/ConfirmModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { ArrowUpDown, ArrowUp, ArrowDown, Eye } from 'lucide-react'
import { Pagination } from '@/components/Pagination'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Pengembalian', href: '/pengembalian' },
]

type PaginatedData = {
  data: any[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
  links: { url: string | null; label: string; active: boolean }[]
}

type SortProps = {
  sortBy?: string
  sortDir?: string
  search?: string
}

export default function PengembalianIndex({ peminjaman }: { peminjaman: PaginatedData }) {

  const { props } = usePage<SortProps & { auth: any }>()
  const role = props.auth?.user?.role || 'admin'
  const canEdit = ['admin', 'super_admin'].includes(role)

  const [search, setSearch] = useState(props.search || '')
  const [sortBy, setSortBy] = useState(props.sortBy || 'id')
  const [sortDir, setSortDir] = useState(props.sortDir || 'desc')
  const [returningId, setReturningId] = useState<number | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  useEffect(() => {
    setSortBy(props.sortBy || 'id')
    setSortDir(props.sortDir || 'desc')
  }, [props.sortBy, props.sortDir])

  const isMounted = useRef(false)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    const timer = setTimeout(() => {
      router.get(route('pengembalian.index'), { search, sortBy, sortDir }, { preserveState: true, replace: true, preserveScroll: true })
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSort = (column: string) => {
    const newSortDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc'
    setSortBy(column)
    setSortDir(newSortDir)

    router.get(
      route('pengembalian.index'),
      { page: peminjaman.current_page, search, sortBy: column, sortDir: newSortDir },
      { preserveScroll: true, preserveState: true }
    )
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown size={14} className="ml-1 inline text-gray-400" />
    if (sortDir === 'asc') return <ArrowUp size={14} className="ml-1 inline text-primary" />
    return <ArrowDown size={14} className="ml-1 inline text-primary" />
  }

  const SortableHead = ({
    column,
    children,
    className,
  }: {
    column: string
    children: React.ReactNode
    className?: string
  }) => (
    <TableHead
      className={`cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 ${className || ''}`}
      onClick={() => handleSort(column)}
    >
      <div
        className={`flex items-center gap-1 whitespace-nowrap ${className?.includes('text-center') ? 'justify-center' : ''
          }`}
      >
        {children}
        {getSortIcon(column)}
      </div>
    </TableHead>
  )

  const getStatusInfo = (row: any) => {
    const due = row.tanggal_kembali ? new Date(row.tanggal_kembali) : null
    const today = new Date()

    if (!due || isNaN(due.getTime())) {
      return {
        badgeClass: 'text-gray-500 dark:text-gray-400',
        label: 'Belum ada jatuh tempo',
      }
    }

    const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate())
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const diffMs = dueMidnight.getTime() - todayMidnight.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays > 0) {
      return {
        badgeClass: 'text-amber-600 dark:text-amber-400 font-semibold',
        label: `Sisa ${diffDays} hari`,
      }
    }

    if (diffDays === 0) {
      return {
        badgeClass: 'text-orange-600 dark:text-orange-400 font-semibold',
        label: 'Jatuh tempo hari ini',
      }
    }

    const terlambat = Math.abs(diffDays)

    return {
      badgeClass: 'text-destructive dark:text-red-400 font-semibold',
      label: `Terlambat ${terlambat} hari`,
    }
  }

  const handleKembalikan = (id: number) => {
    setConfirmId(id)
  }

  const doKembalikan = () => {
    if (confirmId === null) return
    setReturningId(confirmId)
    router.post(
      route('pengembalian.store'),
      { peminjaman_id: confirmId },
      {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          router.reload({ only: ['peminjaman'] })
        },
        onFinish: () => {
          setReturningId(null)
          setConfirmId(null)
        },
      }
    )
  }

  return (

    <AppLayout breadcrumbs={breadcrumbs}>

      <ConfirmModal
        open={confirmId !== null}
        title="Kembalikan Buku"
        description="Yakin ingin memproses pengembalian buku ini? Aksi ini tidak dapat dibatalkan."
        confirmLabel="Ya, Kembalikan"
        loading={returningId !== null}
        onConfirm={doKembalikan}
        onCancel={() => setConfirmId(null)}
      />

      <Head title="Pengembalian" />

      <div className="w-full px-6 lg:px-10 py-8 space-y-6">

        <Card className="border border-border/60 shadow-sm max-w-none">

          <CardHeader className="border-b border-border/40 pb-6 bg-gray-50/40 dark:bg-neutral-900/40 rounded-t-lg">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

              <div>
                <CardTitle className="text-2xl font-semibold">
                  Pengembalian
                </CardTitle>

                <CardDescription>
                  Daftar peminjaman aktif yang belum dikembalikan
                </CardDescription>
              </div>

              <div
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto"
              >

                <Input
                  type="text"
                  placeholder="Cari kode atau nama anggota..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-80 md:w-96"
                />

                </div>

            </div>

          </CardHeader>

          <CardContent className="p-0">

            <Table className="w-full text-sm">

              <TableHeader className="bg-gray-100 dark:bg-neutral-900/40">

                <TableRow>

                  <TableHead className="w-14 text-center">No</TableHead>

                  <SortableHead column="kode_peminjaman">
                    Kode Peminjaman
                  </SortableHead>

                  <SortableHead column="nama">
                    Nama Anggota
                  </SortableHead>

                  <SortableHead column="tanggal_pinjam">
                    Tanggal Pinjam
                  </SortableHead>

                  <SortableHead column="tanggal_kembali">
                    Jatuh Tempo
                  </SortableHead>

                  <SortableHead column="jumlah_buku" className="text-center">
                    Jumlah Buku
                  </SortableHead>

                  <SortableHead column="status" className="text-center w-36">
                    Keterangan
                  </SortableHead>

                  <TableHead className="text-center w-40">
                    Aksi
                  </TableHead>

                </TableRow>

              </TableHeader>

              <TableBody>

                {peminjaman.data.map((row, index) => (

                  <TableRow key={row.id} className="hover:bg-muted/40">

                    <TableCell className="text-center">
                      {(peminjaman.current_page - 1) * peminjaman.per_page + index + 1}
                    </TableCell>

                    <TableCell className="font-medium whitespace-nowrap">
                      {row.kode_peminjaman || '-'}
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      {row.anggota?.deleted_at ? <span className="italic text-gray-500">Anggota nonaktif</span> : (row.anggota?.nama || '-')}
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      {new Date(row.tanggal_pinjam).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      {row.tanggal_kembali
                        ? new Date(row.tanggal_kembali).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                        : '-'}
                    </TableCell>

                    <TableCell className="text-center font-medium">
                      {row.jumlah_buku || 0}
                    </TableCell>

                    <TableCell className="text-center">
                      {(() => {
                        const info = getStatusInfo(row)
                        return (
                          <span className={`text-sm ${info.badgeClass}`}>
                            {info.label}
                          </span>
                        )
                      })()}
                    </TableCell>

                    <TableCell className="text-center">

                      <div className="flex justify-center gap-2">

                        <Link href={route('pengembalian.peminjaman.show', row.id)}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Detail
                          </Button>
                        </Link>

                        {canEdit && (
                          <Button
                            size="sm"
                            
                            onClick={() => handleKembalikan(row.id)}
                            disabled={returningId === row.id}
                          >
                            {returningId === row.id ? 'Memproses...' : 'Kembalikan'}
                          </Button>
                        )}

                      </div>

                    </TableCell>

                  </TableRow>

                ))}

              </TableBody>

            </Table>

            <Pagination
              links={peminjaman.links}
              currentPage={peminjaman.current_page}
              lastPage={peminjaman.last_page}
              from={peminjaman.from}
              to={peminjaman.to}
              total={peminjaman.total}
            />

          </CardContent>

        </Card>

      </div>

    </AppLayout>

  )
}
