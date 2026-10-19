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
import {
  Pencil,
  Trash2,
  PowerOff,
  Power,
  ShieldCheck,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { Pagination } from '@/components/Pagination'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Pengguna', href: '/petugas' },
]

type User = {
  id: number
  name: string
  username: string
  role: string
  status: string
}

type PaginatedData = {
  data: User[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
  links: { url: string | null; label: string; active: boolean }[]
}

type Filters = {
  search?: string
}

// Tipe aksi modal
type ActionType = 'deactivate' | 'activate' | 'delete' | null

interface ModalState {
  type: ActionType
  user: User | null
}

const modalConfig = {
  deactivate: {
    title: 'Nonaktifkan Pengguna',
    getDesc: (u: User) =>
      `Yakin ingin menonaktifkan akun "${u.name}"? Pengguna ini tidak akan bisa login ke sistem.`,
    confirmLabel: 'Ya, Nonaktifkan',
    variant: 'default' as const,
  },
  activate: {
    title: 'Aktifkan Pengguna',
    getDesc: (u: User) =>
      `Yakin ingin mengaktifkan kembali akun "${u.name}"? Pengguna ini akan bisa login kembali.`,
    confirmLabel: 'Ya, Aktifkan',
    variant: 'default' as const,
  },

  delete: {
    title: 'Hapus Pengguna',
    getDesc: (u: User) =>
      `Yakin ingin menghapus akun "${u.name}"? Data transaksi terkait tetap tersimpan.`,
    confirmLabel: 'Ya, Hapus',
    variant: 'destructive' as const,
  },
}

export default function PetugasIndex({
  users,
  filters,
}: {
  users: PaginatedData
  filters: Filters
}) {
  const { props } = usePage<{ auth: { user: { role: string } }; flash?: { success?: string; error?: string } }>()
  const role = props.auth?.user?.role || 'super_admin'
  const canEdit = ['admin', 'super_admin'].includes(role)
  const [search, setSearch] = useState(filters.search || '')
  const [modal, setModal] = useState<ModalState>({ type: null, user: null })
  const [actionLoading, setActionLoading] = useState(false)
  const { delete: destroy } = useForm()

  // Flash → toast
  useEffect(() => {
    if (props.flash?.success) toast.success(props.flash.success, { duration: 4000 })
    if (props.flash?.error) toast.error(props.flash.error, { duration: 5000 })
  }, [props.flash])

  const isMounted = useRef(false)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    const timer = setTimeout(() => {
      router.get(route('petugas.index'), { search }, { preserveState: true, replace: true, preserveScroll: true })
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const openModal = (type: ActionType, user: User) => setModal({ type, user })
  const closeModal = () => setModal({ type: null, user: null })

  const handleConfirm = () => {
    if (!modal.user || !modal.type) return
    setActionLoading(true)

    const finish = () => {
      setActionLoading(false)
      closeModal()
    }

    if (modal.type === 'delete') {
      destroy(route('petugas.destroy', modal.user.id), {
        preserveScroll: true,
        onFinish: finish,
      })
    } else if (modal.type === 'activate' || modal.type === 'deactivate') {
      router.patch(route('petugas.toggle-status', modal.user.id), {}, {
        preserveScroll: true,
        onFinish: finish,
      })
    }
  }

  const currentConfig = modal.type ? modalConfig[modal.type] : null

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Pengguna" />
      <Toaster position="top-right" toastOptions={{ className: 'text-sm font-medium' }} />

      {/* Modal konfirmasi tunggal yang digunakan ulang */}
      <ConfirmModal
        open={modal.type !== null}
        title={currentConfig?.title ?? ''}
        description={modal.user && currentConfig ? currentConfig.getDesc(modal.user) : ''}
        confirmLabel={currentConfig?.confirmLabel ?? 'Ya, Lanjutkan'}
        variant={currentConfig?.variant ?? 'default'}
        loading={actionLoading}
        onConfirm={handleConfirm}
        onCancel={closeModal}
      />

      <div className="w-full px-6 lg:px-10 py-8 space-y-6">
        <Card className="border border-border/60 shadow-sm max-w-none">
          <CardHeader className="border-b border-border/40 pb-6 bg-gray-50/40 dark:bg-neutral-900/40 rounded-t-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Pengguna
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Kelola akun pengguna sistem perpustakaan.
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                <Input
                  type="text"
                  placeholder="Cari nama atau username..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-80 md:w-96"
                />
                {canEdit && (
                  <Link href={route('petugas.create')}>
                    <Button type="button" className="whitespace-nowrap">Tambah Pengguna</Button>
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
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead className="text-center">Role</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  {canEdit && <TableHead className="text-center" style={{ minWidth: '220px' }}>Aksi</TableHead>}
                </TableRow>
              </TableHeader>

              <TableBody>
                {users.data.length > 0 ? (
                  users.data.map((item, index) => {
                    const isSuperAdmin = item.role === 'super_admin'
                    return (
                      <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="text-center">
                          {(users.current_page - 1) * users.per_page + index + 1}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.name}</span>
                            {isSuperAdmin && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                <ShieldCheck size={10} />
                                Admin
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="font-medium text-slate-700 dark:text-slate-300">{item.username}</TableCell>

                        <TableCell className="text-center font-medium text-slate-700 dark:text-slate-300">
                          {item.role === 'super_admin' ? 'Admin' : item.role === 'kepala_sekolah' ? 'Kepala Sekolah' : 'Petugas'}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className={`inline-flex items-center justify-center gap-2 font-medium ${item.status === 'aktif' ? 'text-slate-700 dark:text-slate-300' : 'text-gray-400 dark:text-gray-500'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${item.status === 'aktif' ? 'bg-primary' : 'bg-gray-400 dark:bg-gray-500'}`} />
                            {item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                          </div>
                        </TableCell>

                        {canEdit && (
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-1 flex-wrap">

                              {/* Toggle Status Aktif/Nonaktif */}
                              {!isSuperAdmin && (
                                <Button
                                  onClick={() => openModal(item.status === 'aktif' ? 'deactivate' : 'activate', item)}
                                  variant="outline"
                                  size="sm"
                                  className={`
                                    ${item.status === 'aktif'
                                      ? 'border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-600'
                                      : 'border-primary text-primary hover:bg-primary/10 hover:text-primary hover:border-primary'}
                                  `}
                                >
                                  {item.status === 'aktif' ? <PowerOff size={14} /> : <Power size={14} />}
                                  {item.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                                </Button>
                              )}

                              {/* Edit - tidak bisa edit sesama/lain admin, kecuali dia sendiri superadmin (nanti dilimit di backend juga) */}
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-600"
                              >
                                <Link href={route('petugas.edit', item.id)} className="flex items-center gap-1">
                                  <Pencil size={14} /> Edit
                                </Link>
                              </Button>

                              {/* Delete - Tidak bisa hapus superadmin */}
                              {!isSuperAdmin && (
                                <Button
                                  onClick={() => openModal('delete', item)}
                                  variant="outline"
                                  size="sm"
                                  className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                                >
                                  <Trash2 size={14} /> Hapus
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}

                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={canEdit ? 6 : 5} className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                      {search ? `Tidak ada hasil untuk "${search}".` : 'Belum ada data petugas.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <Pagination
              links={users.links}
              currentPage={users.current_page}
              lastPage={users.last_page}
              from={users.from}
              to={users.to}
              total={users.total}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
