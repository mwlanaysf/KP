import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, Link, useForm, router, usePage } from '@inertiajs/react'
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
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Pagination } from '@/components/Pagination'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Buku', href: '/buku' },
]

type Buku = {
  id: number
  kode_buku: string
  judul: string
  pengarang: string
  penerbit: string
  tahun_terbit: string | number
  stok: number
  detail_peminjaman_count: number
  kategori?: { nama: string } | null
}

type PaginatedData = {
  data: Buku[]
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

import { type SharedData } from '@/types'

export default function BukuIndex({ buku }: { buku: PaginatedData }) {
  const { props } = usePage<SortProps & SharedData>()
  const role = props.auth.user?.role || 'admin'
  const canEdit = ['admin', 'super_admin'].includes(role)
  const [search, setSearch] = useState(props.search || '')
  const [sortBy, setSortBy] = useState(props.sortBy || 'id')
  const [sortDir, setSortDir] = useState(props.sortDir || 'desc')
  const { delete: destroy } = useForm()
  const [confirmItem, setConfirmItem] = useState<{ id: number; judul: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

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
      router.get(route('buku.index'), { search, sortBy, sortDir }, { preserveState: true, replace: true, preserveScroll: true })
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSort = (column: string) => {
    const newSortDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc'
    setSortBy(column)
    setSortDir(newSortDir)
    router.get(
      route('buku.index'),
      { page: buku.current_page, search, sortBy: column, sortDir: newSortDir },
      { preserveScroll: true, preserveState: true }
    )
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown size={14} className="text-gray-400" />
    if (sortDir === 'asc') return <ArrowUp size={14} className="text-primary" />
    return <ArrowDown size={14} className="text-primary" />
  }

  const handleDelete = (id: number, judul: string) => {
    setConfirmItem({ id, judul })
  }

  const doDelete = () => {
    if (!confirmItem) return
    setDeleteLoading(true)
    destroy(route('buku.destroy', confirmItem.id), {
      preserveScroll: true,
      onFinish: () => {
        setDeleteLoading(false)
        setConfirmItem(null)
      },
      onSuccess: () => router.reload({ only: ['buku'] }),
    })
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
      <div className="flex items-center gap-1 whitespace-nowrap">
        {children}
        {getSortIcon(column)}
      </div>
    </TableHead>
  )

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Buku" />

      <ConfirmModal
        open={confirmItem !== null}
        title="Hapus Buku"
        description={confirmItem ? `Yakin ingin menghapus buku "${confirmItem.judul}"? Data yang dihapus tidak dapat dikembalikan.` : ''}
        confirmLabel="Ya, Hapus"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={doDelete}
        onCancel={() => setConfirmItem(null)}
      />

      <div className="w-full px-6 lg:px-10 py-8 space-y-6">
        <Card className="border border-border/60 shadow-sm max-w-none">
          <CardHeader className="border-b border-border/40 pb-6 bg-gray-50/40 dark:bg-neutral-900/40 rounded-t-md">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Buku
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Daftar koleksi buku yang tersedia di perpustakaan
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                <Input
                  type="text"
                  placeholder="Cari kode, judul, atau pengarang..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-80 md:w-96"
                />
                {canEdit && (
                  <Link href={route('buku.create')}>
                    <Button type="button" className="w-full sm:w-auto whitespace-nowrap">
                      Tambah Buku
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table className="w-full text-sm">
              <TableHeader className="bg-gray-100 dark:bg-neutral-900/40">
                <TableRow>
                  <TableHead className="w-14 text-center">No</TableHead>
                  <SortableHead column="kode_buku">Kode</SortableHead>
                  <SortableHead column="judul">Judul</SortableHead>
                  <SortableHead column="pengarang">Pengarang</SortableHead>
                  <SortableHead column="kategori_id">Kategori</SortableHead>
                  <SortableHead column="penerbit">Penerbit</SortableHead>
                  <SortableHead column="tahun_terbit">Tahun</SortableHead>
                  <SortableHead column="stok">Stok</SortableHead>
                  <SortableHead column="detail_peminjaman_count">Dipinjam</SortableHead>
                  {canEdit && <TableHead className="w-32 text-center">Aksi</TableHead>}
                </TableRow>
              </TableHeader>

              <TableBody>
                {buku.data.length > 0 ? (
                  buku.data.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="text-center">
                        {(buku.current_page - 1) * buku.per_page + index + 1}
                      </TableCell>
                      <TableCell>{item.kode_buku}</TableCell>
                      <TableCell className="font-medium">{item.judul}</TableCell>
                      <TableCell>{item.pengarang}</TableCell>
                      <TableCell>{item.kategori ? item.kategori.nama : '-'}</TableCell>
                      <TableCell>{item.penerbit}</TableCell>
                      <TableCell className="text-center">{item.tahun_terbit}</TableCell>
                      <TableCell className="text-center">{item.stok}</TableCell>
                      <TableCell className="text-center">
                        {item.detail_peminjaman_count}
                      </TableCell>
                      {canEdit && (
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 dark:hover:border-blue-600"
                            >
                              <Link href={route('buku.edit', item.id)} className="flex items-center gap-1">
                                <Pencil size={14} />
                                Edit
                              </Link>
                            </Button>

                            <Button
                              onClick={() => handleDelete(item.id, item.judul)}
                              variant="outline"
                              size="sm"
                              className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-destructive"
                            >
                              <Trash2 size={14} />
                              Hapus
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                      {search ? `Tidak ada hasil untuk "${search}".` : 'Tidak ada data buku.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <Pagination
              links={buku.links}
              currentPage={buku.current_page}
              lastPage={buku.last_page}
              from={buku.from}
              to={buku.to}
              total={buku.total}
            />

          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
