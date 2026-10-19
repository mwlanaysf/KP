import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { ArrowLeft } from 'lucide-react'
import { Head, Link, useForm, router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { AsyncCombobox } from '@/components/ui/async-combobox'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Pengembalian', href: '/pengembalian' },
  { title: 'Tambah', href: '/pengembalian/create' },
]

export default function CreatePengembalian() {
  const { data, setData, post, processing, errors, reset } = useForm({
    peminjaman_id: '',
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route('pengembalian.store'), {
      onSuccess: () => router.visit(route('pengembalian.index'), { replace: true })
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Pengembalian" />

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10">
        <Card className="border border-border/60 shadow-sm rounded-md">
          {/* Header */}
          <CardHeader className="border-b border-border/40 pb-5 bg-gray-50/40 dark:bg-neutral-900/40 rounded-t-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Pengembalian
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400 text-sm">
                  Pilih peminjaman yang akan dikembalikan oleh anggota
                </CardDescription>
              </div>

              <Button variant="outline" size="sm" asChild className="gap-2 text-gray-600 hover:bg-gray-100">
                <Link href={route('pengembalian.index')}>
                  <ArrowLeft size={16} />
                  Kembali
                </Link>
              </Button>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="pt-8 pb-10 px-4 sm:px-8">
            <form onSubmit={submit} className="space-y-8">
              {/* Select Peminjaman - AsyncCombobox */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                  Pilih Peminjaman
                </label>
                <AsyncCombobox
                  value={data.peminjaman_id}
                  onChange={(value) => setData('peminjaman_id', value)}
                  searchUrl={route('peminjaman.search', {}, true)}
                  placeholder="Cari nama anggota, judul buku, atau kode buku..."
                  searchPlaceholder="Ketik untuk mencari..."
                  emptyText="Tidak ada peminjaman aktif ditemukan."
                />
                {errors.peminjaman_id && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.peminjaman_id}
                  </p>
                )}
              </div>

              {/* Tombol aksi */}
              <div className="flex justify-end gap-3 pt-6 border-t border-border/40 mt-6">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => reset()}
                  className="text-gray-600 bg-gray-50 hover:bg-gray-100"
                >
                  Reset
                </Button>
                <Button 
                  type="submit" 
                  disabled={processing || !data.peminjaman_id}
                  className="bg-primary hover:bg-primary/90 rounded-md"
                >
                  {processing ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
