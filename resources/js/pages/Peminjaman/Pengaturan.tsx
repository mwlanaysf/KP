import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, router, useForm, usePage } from '@inertiajs/react'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { ConfirmModal } from '@/components/ConfirmModal'
import {
  Settings, Calendar, Plus, Pencil, Trash2, ChevronLeft,
} from 'lucide-react'
import { Pagination } from '@/components/Pagination'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Peminjaman', href: '/peminjaman' },
  { title: 'Pengaturan', href: '/pengaturan-peminjaman' },
]

type Holiday = {
  id: number
  tanggal: string
  keterangan: string
  jenis_hari_libur: 'nasional' | 'sekolah'
}

type PaginatedHariLibur = {
  data: Holiday[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
  links: { url: string | null; label: string; active: boolean }[]
}

type PageProps = {
  hari_libur: PaginatedHariLibur
  durasi_peminjaman: number
  search?: string
}

const TYPE_LABELS: Record<string, string> = {
  nasional: 'Nasional',
  sekolah: 'Sekolah',
}

const TYPE_BADGE: Record<string, string> = {
  nasional: 'text-blue-600',
  sekolah: 'text-primary',
}

function formatDate(dateStr: string) {
  const datePart = dateStr.split('T')[0]
  const d = new Date(datePart + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function PengaturanPeminjaman() {
  const { props } = usePage<PageProps>()
  const { hari_libur, durasi_peminjaman } = props

  // ── Durasi Form ──────────────────────────────────────────────────
  const durasiForm = useForm({ durasi: String(durasi_peminjaman) })

  const submitDurasi = (e: React.FormEvent) => {
    e.preventDefault()
    durasiForm.post(route('pengaturan-peminjaman.durasi'), { preserveScroll: true })
  }

  // ── Search & Filter ──────────────────────────────────────────────
  const [search, setSearch] = useState(props.search || '')

  const isMounted = useRef(false)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    const timer = setTimeout(() => {
      router.get(route('pengaturan-peminjaman.index'), { search }, { preserveState: true, replace: true, preserveScroll: true })
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // ── Add / Edit Modal ─────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Holiday | null>(null)

  const holidayForm = useForm({
    tanggal: '',
    keterangan: '',
    jenis_hari_libur: 'sekolah',
  })

  const openAdd = () => {
    setEditTarget(null)
    holidayForm.reset()
    holidayForm.clearErrors()
    setModalOpen(true)
  }

  const openEdit = (h: Holiday) => {
    setEditTarget(h)
    holidayForm.setData({ tanggal: h.tanggal, keterangan: h.keterangan, jenis_hari_libur: h.jenis_hari_libur })
    holidayForm.clearErrors()
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditTarget(null)
    holidayForm.reset()
    holidayForm.clearErrors()
  }

  const submitHoliday = (e: React.FormEvent) => {
    e.preventDefault()
    if (editTarget) {
      holidayForm.put(route('hari-libur.update', editTarget.id), {
        preserveScroll: true,
        onSuccess: closeModal,
      })
    } else {
      holidayForm.post(route('hari-libur.store'), {
        preserveScroll: true,
        onSuccess: closeModal,
      })
    }
  }

  // ── Delete Confirm ───────────────────────────────────────────────
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const doDelete = () => {
    if (deleteId === null) return
    setDeleting(true)
    router.delete(route('hari-libur.destroy', deleteId), {
      preserveScroll: true,
      onFinish: () => {
        setDeleting(false)
        setDeleteId(null)
      },
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Pengaturan" />

      <ConfirmModal
        open={deleteId !== null}
        title="Hapus Hari Libur"
        description="Yakin ingin menghapus hari libur ini? Aksi ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus"
        loading={deleting}
        onConfirm={doDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* ─── Add/Edit Modal ─────────────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={(v) => { if (!v) closeModal() }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {editTarget ? 'Edit Hari Libur' : 'Tambah Hari Libur'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={submitHoliday} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="hol-date" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tanggal <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hol-date"
                type="date"
                value={holidayForm.data.tanggal}
                onChange={e => holidayForm.setData('tanggal', e.target.value)}
                className="h-9"
              />
              {holidayForm.errors.tanggal && (
                <p className="text-xs text-destructive">{holidayForm.errors.tanggal}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hol-desc" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Keterangan <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hol-desc"
                type="text"
                placeholder="contoh: Hari Kemerdekaan"
                value={holidayForm.data.keterangan}
                onChange={e => holidayForm.setData('keterangan', e.target.value)}
                className="h-9"
              />
              {holidayForm.errors.keterangan && (
                <p className="text-xs text-destructive">{holidayForm.errors.keterangan}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hol-type" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Jenis Hari Libur <span className="text-destructive">*</span>
              </Label>
              <select
                id="hol-type"
                value={holidayForm.data.jenis_hari_libur}
                onChange={e => holidayForm.setData('jenis_hari_libur', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="nasional">Nasional</option>
                <option value="sekolah">Sekolah</option>
              </select>
              {holidayForm.errors.jenis_hari_libur && (
                <p className="text-xs text-destructive">{holidayForm.errors.jenis_hari_libur}</p>
              )}
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeModal} className="h-9">
                Batal
              </Button>
              <Button
                type="submit"
                disabled={holidayForm.processing}
                className="bg-primary hover:bg-primary/90 h-9"
              >
                {holidayForm.processing ? 'Menyimpan...' : (editTarget ? 'Simpan Perubahan' : 'Tambah')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="w-full px-6 lg:px-10 py-8 space-y-6">

        {/* ─── Header + Kembali ─────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Pengaturan Peminjaman</h2>
            <p className="text-sm text-gray-500 mt-1">Kelola durasi peminjaman dan daftar hari libur operasional perpustakaan.</p>
          </div>
          <Button variant="outline" onClick={() => router.get(route('peminjaman.index'))} className="gap-2 shadow-sm h-9">
            <ChevronLeft className="w-4 h-4" />
            Kembali
          </Button>
        </div>

        {/* ─── Section 1: Durasi Peminjaman ──────────────────────── */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/40 pb-5 bg-gray-50/40 dark:bg-neutral-900/40 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-md">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Durasi Peminjaman</CardTitle>
                <CardDescription>Atur berapa hari batas waktu peminjaman buku</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={submitDurasi} className="flex items-end gap-4 max-w-sm">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="durasi" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Durasi (hari)
                </Label>
                <Input
                  id="durasi"
                  type="number"
                  min={1}
                  max={365}
                  value={durasiForm.data.durasi}
                  onChange={e => durasiForm.setData('durasi', e.target.value)}
                  className="h-9"
                />
                {durasiForm.errors.durasi && (
                  <p className="text-xs text-destructive">{durasiForm.errors.durasi}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={durasiForm.processing}
                className="bg-primary hover:bg-primary/90 h-9 px-5"
              >
                {durasiForm.processing ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              Saat ini: <span className="font-semibold text-primary">{durasi_peminjaman} hari</span>. Jika jatuh tempo jatuh pada hari libur, sistem akan otomatis menggesernya ke hari kerja berikutnya.
            </p>
          </CardContent>
        </Card>

        {/* ─── Section 2: Kelola Hari Libur ──────────────────────── */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/40 pb-5 bg-gray-50/40 dark:bg-neutral-900/40 rounded-t-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-md">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Kelola Hari Libur</CardTitle>
                  <CardDescription>
                    Data hari libur nasional dan hari libur sekolah
                    <span className="block mt-1 font-medium text-primary">Total {hari_libur.total} Hari Libur Terdaftar</span>
                  </CardDescription>
                </div>
              </div>

              {/* Search + Tambah */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
                <Input
                  type="text"
                  placeholder="Cari keterangan atau tanggal..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full sm:w-64 h-9"
                />
                <Button
                  type="button"
                  onClick={openAdd}
                  className="bg-primary hover:bg-primary/90 h-9 gap-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Hari Libur
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table className="w-full text-sm">
              <TableHeader className="bg-gray-100 dark:bg-neutral-900/40">
                <TableRow>
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-center w-28">Jenis</TableHead>
                  <TableHead className="text-center w-32">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hari_libur.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                      <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p>Belum ada data hari libur</p>
                      <p className="text-xs mt-1">Klik "Tambah Hari Libur" untuk menambahkan.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  hari_libur.data.map((h, index) => (
                    <TableRow key={h.id} className="hover:bg-muted/40">
                      <TableCell className="text-center">
                        {(hari_libur.current_page - 1) * hari_libur.per_page + index + 1}
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatDate(h.tanggal)}
                      </TableCell>
                      <TableCell>{h.keterangan}</TableCell>
                      <TableCell className="text-center">
                        <span className={`text-sm font-semibold ${TYPE_BADGE[h.jenis_hari_libur] || ''}`}>
                          {TYPE_LABELS[h.jenis_hari_libur] || h.jenis_hari_libur}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(h)}
                            className="h-8 px-3 gap-1.5"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteId(h.id)}
                            className="h-8 px-3 gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <Pagination
              links={hari_libur.links}
              currentPage={hari_libur.current_page}
              lastPage={hari_libur.last_page}
              from={hari_libur.from}
              to={hari_libur.to}
              total={hari_libur.total}
            />
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  )
}
