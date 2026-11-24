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
  { title: 'Anggota', href: '/anggota' },
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

import { type SharedData } from '@/types'

export default function AnggotaIndex({ anggota }: { anggota: PaginatedData }) {
  const { props } = usePage<SortProps & SharedData>()
  const role = props.auth.user?.role || 'admin'
  const canEdit = ['admin', 'super_admin'].includes(role)
  const [search, setSearch] = useState(props.search || '')
  const [sortBy, setSortBy] = useState(props.sortBy || 'id')
  const [sortDir, setSortDir] = useState(props.sortDir || 'desc')
  const { delete: destroy } = useForm()
  const [confirmItem, setConfirmItem] = useState<{ id: number; nama: string } | null>(null)
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
      router.get(route('anggota.index'), { search, sortBy, sortDir }, { preserveState: true, replace: true, preserveScroll: true })
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSort = (column: string) => {
    const newSortDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc'

    setSortBy(column)
    setSortDir(newSortDir)

    router.get(route('anggota.index'), {
      page: anggota.current_page,
      search,
      sortBy: column,
      sortDir: newSortDir
    }, { preserveScroll: true, preserveState: true })
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown size={14} className="ml-1 inline text-gray-400" />
    if (sortDir === 'asc') return <ArrowUp size={14} className="ml-1 inline text-primary" />
    return <ArrowDown size={14} className="ml-1 inline text-primary" />
  }

  const handleDelete = (id: number, nama: string) => {
    setConfirmItem({ id, nama })
  }

  const doDelete = () => {
    if (!confirmItem) return
    setDeleteLoading(true)
    destroy(route('anggota.destroy', confirmItem.id), {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        setConfirmItem(null)
        setDeleteLoading(false)
      },
      onError: () => {
        setDeleteLoading(false)
      },
      onFinish: () => {
        setDeleteLoading(false)
      },
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
      <Head title="Anggota" />

      <ConfirmModal
        open={confirmItem !== null}
        title="Hapus Anggota"
        description={confirmItem ? `Yakin ingin menghapus anggota "${confirmItem.nama}"? Data yang dihapus tidak dapat dikembalikan.` : ''}
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
                <CardTitle className="text-2xl font-semibold">
                  Anggota
                </CardTitle>
                <CardDescription>
                  Daftar anggota yang terdaftar dalam sistem perpustakaan
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="text"
                  placeholder="Cari nama, kelas, atau alamat..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-80 md:w-96"
                />
                {canEdit && (
                  <Link href={route('anggota.create')}>
                    <Button type="button">
                      Tambah Anggota
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
                  <SortableHead column="kode_anggota">Kode</SortableHead>
                  <SortableHead column="nama">Nama</SortableHead>
                  <SortableHead column="jurusan">Jurusan</SortableHead>
                  <SortableHead column="kelas">Kelas</SortableHead>
                  <SortableHead column="no_hp">No HP</SortableHead>
                  <SortableHead column="alamat">Alamat</SortableHead>
                  {canEdit && <TableHead className="w-32 text-center">Aksi</TableHead>}
                </TableRow>
              </TableHeader>

              <TableBody>
                {anggota.data.length > 0 ? (
                  anggota.data.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">

                      <TableCell className="text-center">
                        {(anggota.current_page - 1) * anggota.per_page + index + 1}
                      </TableCell>

                      <TableCell>{item.kode_anggota}</TableCell>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell>{item.jurusan ? item.jurusan.nama : '-'}</TableCell>
                      <TableCell>{item.kelas || '-'}</TableCell>
                      <TableCell>{item.no_hp || '-'}</TableCell>

                      <TableCell className="max-w-xs truncate">
                        {item.alamat || '-'}
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
                              <Link href={route('anggota.edit', item.id)} className="flex items-center gap-1">
                                <Pencil size={14} />
                                Edit
                              </Link>
                            </Button>

                            <Button
                              onClick={() => handleDelete(item.id, item.nama)}
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
                    <TableCell colSpan={7} className="text-center py-8">
                      Tidak ada data anggota
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <Pagination
              links={anggota.links}
              currentPage={anggota.current_page}
              lastPage={anggota.last_page}
              from={anggota.from}
              to={anggota.to}
              total={anggota.total}
            />

          </CardContent>

        </Card>
      </div>
    </AppLayout>
  )
}
