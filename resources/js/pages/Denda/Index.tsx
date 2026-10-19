import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, router, usePage, Link } from '@inertiajs/react'
import { useState, useEffect, useRef } from 'react'
import { ConfirmModal } from '@/components/ConfirmModal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ArrowUpDown, ArrowUp, ArrowDown, Settings, Eye } from 'lucide-react'
import { Pagination } from '@/components/Pagination'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Denda', href: '/denda' },
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

export default function DendaIndex({
  denda,
  tarif_denda,
  search,
}: {
  denda: PaginatedData
  tarif_denda: number
  search?: string
}) {
  const { props } = usePage<{ auth: any, sortBy?: string; sortDir?: string; statusFilter?: string }>()
  const role = props.auth?.user?.role || 'admin'
  const canEdit = ['admin', 'super_admin'].includes(role)
  const [searchValue, setSearchValue] = useState(search || '')
  const [sortByState, setSortByState] = useState(props.sortBy || 'id')
  const [sortDirState, setSortDirState] = useState(props.sortDir || 'desc')

  const [isSettingOpen, setIsSettingOpen] = useState(false)
  const [tarifInput, setTarifInput] = useState(tarif_denda.toString())
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [bayarLoading, setBayarLoading] = useState(false)

  const handleSaveTarif = (e: React.FormEvent) => {
    e.preventDefault()
    router.post(
      route('denda.setting'),
      { tarif_denda: Number(tarifInput) },
      {
        onSuccess: () => setIsSettingOpen(false),
        preserveScroll: true,
      }
    )
  }

  useEffect(() => {
    setSortByState(props.sortBy || 'id')
    setSortDirState(props.sortDir || 'desc')
  }, [props.sortBy, props.sortDir])

  const isMounted = useRef(false)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    const timer = setTimeout(() => {
      router.get(route('denda.index'), { search: searchValue, sortBy: sortByState, sortDir: sortDirState }, { preserveState: true, replace: true, preserveScroll: true })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue])

  const handleSort = (column: string) => {
    const newSortDir = sortByState === column && sortDirState === 'asc' ? 'desc' : 'asc'
    setSortByState(column)
    setSortDirState(newSortDir)
    router.get(
      route('denda.index'),
      { page: denda.current_page, search: searchValue, sortBy: column, sortDir: newSortDir },
      { preserveScroll: true, preserveState: true }
    )
  }



  const getSortIcon = (column: string) => {
    if (sortByState !== column) return <ArrowUpDown size={14} className="ml-1 inline text-gray-400" />
    if (sortDirState === 'asc') return <ArrowUp size={14} className="ml-1 inline text-primary" />
    return <ArrowDown size={14} className="ml-1 inline text-primary" />
  }

  const handleBayarDenda = (pengembalianId: number) => {
    setConfirmId(pengembalianId)
  }

  const doBayarDenda = () => {
    if (confirmId === null) return
    setBayarLoading(true)
    router.put(
      route('denda.bayar', confirmId),
      {},
      {
        preserveScroll: true,
        onFinish: () => {
          setBayarLoading(false)
          setConfirmId(null)
        },
        onSuccess: () => {
          router.reload({ only: ['denda'] })
        },
      }
    )
  }

  const SortableHead = ({ column, children, className }: { column: string; children: React.ReactNode; className?: string }) => (
    <TableHead 
      className={`cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 ${className || ''}`} 
      onClick={() => handleSort(column)}
    >
      <div className={`flex items-center gap-1 whitespace-nowrap ${className?.includes('text-center') ? 'justify-center' : ''}`}>
        {children}
        {getSortIcon(column)}
      </div>
    </TableHead>
  )



  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Denda" />

      <ConfirmModal
        open={confirmId !== null}
        title="Konfirmasi Pembayaran"
        description="Tandai denda ini sebagai LUNAS? Status pembayaran akan diperbarui dan tidak dapat dikembalikan."
        confirmLabel="Ya, Tandai Lunas"
        loading={bayarLoading}
        onConfirm={doBayarDenda}
        onCancel={() => setConfirmId(null)}
      />

      <div className="w-full px-6 lg:px-10 py-8 space-y-6">
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/40 pb-6 bg-gray-50/40 dark:bg-neutral-900/40 rounded-t-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Denda
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Daftar denda keterlambatan pengembalian buku perpustakaan. Tarif saat ini: <strong>Rp {tarif_denda.toLocaleString('id-ID')}/hari</strong>
                </CardDescription>
              </div>

              {canEdit && (
                <Dialog open={isSettingOpen} onOpenChange={setIsSettingOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 shrink-0">
                      <Settings className="w-4 h-4" />
                      Atur Tarif Denda
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]" hideCloseButton>
                    <form onSubmit={handleSaveTarif}>
                      <DialogHeader>
                        <DialogTitle>Pengaturan Tarif Denda</DialogTitle>
                        <DialogDescription>
                          Tentukan besaran nominal denda yang akan dikenakan per hari untuk keterlambatan pengembalian buku.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <label htmlFor="tarif" className="text-sm font-medium">
                            Nominal Per Hari (Rp)
                          </label>
                          <Input
                            id="tarif"
                            type="number"
                            min="0"
                            value={tarifInput}
                            onChange={(e) => setTarifInput(e.target.value)}
                            className="w-full"
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsSettingOpen(false)}>
                          Batal
                        </Button>
                        <Button type="submit">Simpan Perubahan</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 w-full">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input
                  type="text"
                  placeholder="Cari kode atau nama..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
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
                  <SortableHead column="nama_anggota">
                    Nama Anggota
                  </SortableHead>
                  <SortableHead column="jumlah_buku" className="text-center">
                    Jumlah Buku
                  </SortableHead>
                  <SortableHead column="hari_terlambat" className="text-center">
                    Hari Terlambat
                  </SortableHead>
                  <SortableHead column="jumlah_denda" className="text-center">
                    Jumlah Denda
                  </SortableHead>
                  <SortableHead column="status_pembayaran" className="text-center">
                    Status Pembayaran
                  </SortableHead>
                  <TableHead className="w-[1%] whitespace-nowrap px-2 text-center">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {denda.data.length > 0 ? (
                  denda.data.map((row, index) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <TableCell className="text-center">
                        {(denda.current_page - 1) * denda.per_page + index + 1}
                      </TableCell>

                      <TableCell className="font-medium">
                        {row.kode_peminjaman || '-'}
                      </TableCell>

                      <TableCell>
                        {row.nama_anggota || '-'}
                      </TableCell>

                      <TableCell className="text-center font-medium">
                        {row.jumlah_buku}
                      </TableCell>

                      <TableCell className="text-center">
                        <span className="text-destructive font-medium">
                          {row.hari_terlambat} hari
                        </span>
                      </TableCell>

                      <TableCell className="text-center font-semibold text-gray-900 dark:text-gray-100">
                        Rp {Number(row.jumlah_denda || 0).toLocaleString('id-ID')}
                      </TableCell>

                      <TableCell className="text-center">
                        <span
                          className={`text-sm font-semibold ${row.status_pembayaran?.toLowerCase() === 'lunas'
                              ? 'text-primary dark:text-primary'
                              : 'text-destructive dark:text-red-400'
                            }`}
                        >
                          {row.status_pembayaran === 'Lunas' ? 'Lunas' : 'Belum Bayar'}
                        </span>
                      </TableCell>

                      <TableCell className="text-center w-[1%] whitespace-nowrap px-2">
                        <div className="flex items-center justify-center gap-1">
                            <Button variant="outline" size="sm" asChild className="px-2">
                                <Link href={route('denda.show', row.id)}>
                                    <Eye size={14} className="mr-1" />
                                    Detail
                                </Link>
                            </Button>
                            {canEdit && (
                                <Button
                                    size="sm"
                                    className={`px-2 bg-primary text-white hover:bg-primary/90 shadow-sm transition-colors ${
                                        row.status_pembayaran?.toLowerCase() === 'lunas' ? 'invisible pointer-events-none' : ''
                                    }`}
                                    onClick={() => handleBayarDenda(row.pengembalian_id)}
                                >
                                    Bayar
                                </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm"
                    >
                      {searchValue
                        ? 'Tidak ada hasil untuk pencarian tersebut.'
                        : 'Tidak ada data denda keterlambatan.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <Pagination
              links={denda.links}
              currentPage={denda.current_page}
              lastPage={denda.last_page}
              from={denda.from}
              to={denda.to}
              total={denda.total}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
