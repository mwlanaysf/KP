import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { ChevronLeft, BookOpen } from 'lucide-react'
import { ConfirmModal } from '@/components/ConfirmModal'

type PeminjamanShow = {
  id: number
  kode_peminjaman: string
  tanggal_pinjam: string
  tanggal_kembali: string
  status: string
  anggota: {
    kode_anggota: string
    nama: string
    kelas: string
    deleted_at?: string | null
    jurusan?: { nama: string } | null
  }
  detail_peminjaman: Array<{
    id: number
    buku: {
      kode_buku: string
      judul: string
      pengarang: string
      deleted_at?: string | null
    }
  }>
}

export default function PeminjamanShow({ peminjaman, source = 'peminjaman' }: { peminjaman: PeminjamanShow, source?: string }) {
  const { props } = usePage<{ auth: any }>()
  const role = props.auth?.user?.role || 'admin'
  const canEdit = ['admin', 'super_admin'].includes(role)

  const isFromPengembalian = source === 'pengembalian';
  const parentHref = isFromPengembalian ? '/pengembalian' : '/peminjaman';
  const parentTitle = isFromPengembalian ? 'Pengembalian' : 'Peminjaman';
  
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: parentTitle, href: parentHref },
    { title: 'Detail', href: '#' },
  ];

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const statusBadge = (status: string) => {

    const s = status?.toLowerCase()

    if (s === 'dikembalikan')
      return <span className="text-sm font-semibold text-primary">Dikembalikan</span>

    if (s === 'terlambat')
      return <span className="text-sm font-semibold text-destructive">Terlambat</span>

    return <span className="text-sm font-semibold text-amber-600">Dipinjam</span>
  }

  const handleKembalikan = () => {
    const currentStatus = peminjaman.status?.toLowerCase()
    if (currentStatus === 'dikembalikan') return
    setConfirmOpen(true)
  }

  const doKembalikan = () => {
    setLoading(true)
    router.post(
      route('pengembalian.store'),
      { peminjaman_id: peminjaman.id },
      {
        preserveScroll: true,
        onFinish: () => {
          setLoading(false)
          setConfirmOpen(false)
        },
      }
    )
  }

  return (

    <AppLayout breadcrumbs={breadcrumbs}>
      <ConfirmModal
        open={confirmOpen}
        title="Kembalikan Buku"
        description="Yakin ingin memproses pengembalian buku ini? Aksi ini tidak dapat dibatalkan."
        confirmLabel="Ya, Kembalikan"
        loading={loading}
        onConfirm={doKembalikan}
        onCancel={() => setConfirmOpen(false)}
      />
      <Head title={`Detail Peminjaman`} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* HEADER + STATUS */}
        <Card className="border border-border/60 shadow-sm rounded-md">

          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">

            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                Detail Peminjaman
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span>Kode: <span className="font-medium text-gray-900">{peminjaman.kode_peminjaman}</span></span>
                <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-gray-300" />
                <span className="flex items-center gap-2">
                  <span className="text-gray-500">Status:</span>
                  {statusBadge(peminjaman.status)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canEdit && peminjaman.status.toLowerCase() !== 'dikembalikan' && (
                <Button
                  size="sm"
                  
                  onClick={handleKembalikan}
                >
                  Kembalikan
                </Button>
              )}

              <Link href={route(isFromPengembalian ? 'pengembalian.index' : 'peminjaman.index')}>
                <Button variant="outline" size="sm" className="gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  Kembali
                </Button>
              </Link>
            </div>

          </CardHeader>

          <CardContent className="pt-0 pb-5">

            {/* INFORMASI */}
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">

              <div className="rounded-md border border-border/60 bg-white/80 p-4 md:p-5 space-y-3 text-sm">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Informasi Anggota
                </p>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-gray-500 text-xs">Kode Anggota</p>
                    <p className="font-medium text-gray-900">{peminjaman.anggota.kode_anggota}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs">Nama</p>
                    <p className="font-medium text-gray-900">
                      {peminjaman.anggota.deleted_at ? <span className="italic text-gray-500">Anggota nonaktif</span> : peminjaman.anggota.nama}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs">Kelas</p>
                    <p className="font-medium text-gray-900">{peminjaman.anggota.kelas}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs">Jurusan</p>
                    <p className="font-medium text-gray-900">{peminjaman.anggota.jurusan?.nama || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-border/60 bg-white/80 p-4 md:p-5 space-y-3 text-sm">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Informasi Peminjaman
                </p>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-gray-500 text-xs">Tanggal Pinjam</p>
                    <p className="font-medium text-gray-900">{formatDate(peminjaman.tanggal_pinjam)}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs">Tanggal Kembali</p>
                    <p className="font-medium text-gray-900">{formatDate(peminjaman.tanggal_kembali)}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs">Jumlah Buku</p>
                    <p className="font-medium text-gray-900">{peminjaman.detail_peminjaman.length} buku</p>
                  </div>
                </div>
              </div>

            </div>

          </CardContent>

        </Card>

        {/* TABEL BUKU */}
        <Card className="border border-border/60 shadow-sm rounded-md overflow-hidden">

          <CardHeader className="flex items-center gap-2 border-b border-border/50 bg-gray-50/60">

            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <BookOpen className="w-4 h-4" />
              </span>
              <CardTitle className="text-base font-semibold">
                Buku yang Dipinjam
              </CardTitle>
            </div>

          </CardHeader>

          <CardContent className="p-0">

            <table className="w-full text-sm">

              <thead className="bg-gray-100/80 text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-center font-medium w-16">No</th>
                  <th className="px-6 py-3 text-left font-medium w-40">Kode Buku</th>
                  <th className="px-6 py-3 text-left font-medium">Judul Buku</th>
                  <th className="px-6 py-3 text-left font-medium">Pengarang</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {peminjaman.detail_peminjaman.length > 0 ? (

                  peminjaman.detail_peminjaman.map((item, i) => (

                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">

                      <td className="px-6 py-3 text-center text-gray-600">
                        {i + 1}
                      </td>

                      <td className="px-6 py-3 text-gray-600 font-medium">
                        {item.buku?.kode_buku || '-'}
                      </td>

                      <td className="px-6 py-3 text-gray-900 font-medium">
                        {item.buku?.deleted_at ? <span className="italic text-gray-500">Buku sudah dihapus</span> : (item.buku?.judul || '-')}
                      </td>

                      <td className="px-6 py-3 text-gray-600">
                        {item.buku?.pengarang || '-'}
                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td colSpan={4} className="text-center py-10 text-gray-500 text-sm">
                      Tidak ada buku yang dipinjam
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </CardContent>

        </Card>

      </div>

    </AppLayout>
  )
}


