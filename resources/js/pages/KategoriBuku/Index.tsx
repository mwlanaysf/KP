import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, router, useForm, usePage } from '@inertiajs/react'
import { useState, useRef, useEffect } from 'react'
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
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Pagination } from '@/components/Pagination'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Master Data', href: '#' },
  { title: 'Kategori Buku', href: '/kategori-buku' },
]

export default function CategoryIndex({ kategori_buku }: { kategori_buku: any }) {
  const { props } = usePage<any>()
  const role = props.auth?.user?.role || 'admin'
  const canEdit = ['admin', 'super_admin'].includes(role)
  const [search, setSearch] = useState(props.filters?.search || '')
  
  // Confirm Delete Modal State
  const [confirmItem, setConfirmItem] = useState<{ id: number; nama: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
    id: null as number | null,
    nama: ''
  })

  const isMounted = useRef(false)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    const timer = setTimeout(() => {
      router.get(route('kategori-buku.index'), { search }, { preserveState: true, replace: true, preserveScroll: true })
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const openCreateModal = () => {
    clearErrors()
    reset()
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const openEditModal = (item: any) => {
    clearErrors()
    setData({ id: item.id, nama: item.nama })
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditing && data.id) {
      put(route('kategori-buku.update', data.id), {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => setIsModalOpen(false),
      })
    } else {
      post(route('kategori-buku.store'), {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          setIsModalOpen(false)
          reset()
        },
      })
    }
  }

  const handleDelete = (id: number, nama: string) => {
    setConfirmItem({ id, nama })
  }

  const doDelete = () => {
    if (!confirmItem) return
    setDeleteLoading(true)
    destroy(route('kategori-buku.destroy', confirmItem.id), {
      preserveScroll: true,
      preserveState: true,
      onFinish: () => {
        setDeleteLoading(false)
        setConfirmItem(null)
      },
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Kategori Buku" />

      <ConfirmModal
        open={confirmItem !== null}
        title="Hapus Kategori"
        description={confirmItem ? `Yakin ingin menghapus kategori "${confirmItem.nama}"?` : ''}
        confirmLabel="Ya, Hapus"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={doDelete}
        onCancel={() => setConfirmItem(null)}
      />

      {/* Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]" hideCloseButton>
          <form onSubmit={submitForm}>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
              <DialogDescription>
                Masukkan nama kategori buku. Pastikan nama kategori belum digunakan.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nama">Nama Kategori</Label>
                <Input
                  id="nama"
                  value={data.nama}
                  onChange={(e) => setData('nama', e.target.value)}
                  placeholder="Misal: Fiksi, Komputer, Sejarah"
                  className={errors.nama ? 'border-destructive focus-visible:ring-red-500' : ''}
                />
                {errors.nama && <span className="text-sm text-destructive">{errors.nama}</span>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="w-full px-6 lg:px-10 py-8 space-y-6">
        <Card className="border border-border/60 shadow-sm max-w-none">
          <CardHeader className="border-b border-border/40 pb-6 bg-gray-50/40 dark:bg-neutral-900/40 rounded-t-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Kategori Buku
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Kelola master data kategori buku
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                <div className="flex w-full sm:w-auto gap-2">
                  <Input
                    type="text"
                    placeholder="Cari kategori..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-64"
                  />
                </div>
                {canEdit && (
                  <Button onClick={openCreateModal} className="w-full sm:w-auto whitespace-nowrap">
                    <Plus className="mr-2 size-4" />
                    Tambah Kategori
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table className="w-full text-sm">
              <TableHeader className="bg-gray-100 dark:bg-neutral-900/40">
                <TableRow>
                  <TableHead className="w-14 text-center">No</TableHead>
                  <TableHead>Nama Kategori</TableHead>
                  {canEdit && <TableHead className="w-32 text-center">Aksi</TableHead>}
                </TableRow>
              </TableHeader>

              <TableBody>
                {kategori_buku.data.length > 0 ? (
                  kategori_buku.data.map((item: any, index: number) => (
                    <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="text-center">
                        {(kategori_buku.current_page - 1) * kategori_buku.per_page + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      {canEdit && (
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              onClick={() => openEditModal(item)}
                              variant="outline"
                              size="sm"
                              className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 dark:hover:border-blue-600"
                            >
                              <Pencil size={14} />
                              Edit
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
                    <TableCell colSpan={canEdit ? 3 : 2} className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                      {search ? `Tidak ada hasil untuk "${search}".` : 'Belum ada data kategori buku.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            <Pagination
              links={kategori_buku.links}
              currentPage={kategori_buku.current_page}
              lastPage={kategori_buku.last_page}
              from={kategori_buku.from}
              to={kategori_buku.to}
              total={kategori_buku.total}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
