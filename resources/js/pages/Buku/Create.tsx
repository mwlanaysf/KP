import { useEffect } from 'react'
import AppLayout from '@/layouts/app-layout'
import { Head, useForm, Link, usePage, router } from '@inertiajs/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type BreadcrumbItem } from '@/types'
import { ArrowLeft } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Buku', href: '/buku' },
  { title: 'Tambah', href: '/buku/create' },
]

export default function Create() {

  const { props } = usePage<any>()

  const { data, setData, post, processing, errors, reset } = useForm({
    kode_buku: props.kode_buku || '',
    judul: '',
    pengarang: '',
    kategori_id: '',
    penerbit: '',
    tahun_terbit: '',
    stok: '',
  })

  useEffect(() => {
    if (props.kode_buku) {
      setData('kode_buku', props.kode_buku)
    }
  }, [props.kode_buku])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route('buku.store'), {
      onSuccess: () => {
        reset('judul', 'pengarang', 'kategori_id', 'penerbit', 'tahun_terbit', 'stok')
        router.clearHistory()
      },
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Buku" />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <Card className="border border-border/60 shadow-sm rounded-md">
          {/* Header */}
          <CardHeader className="border-b border-border/40 pb-5 bg-gray-50/40 dark:bg-neutral-900/40 rounded-t-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Buku
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400 text-sm">
                  Tambahkan buku baru ke perpustakaan
                </CardDescription>
              </div>

              <Button variant="outline" size="sm" asChild className="gap-2 text-gray-600 hover:bg-gray-100">
                <Link href={route('buku.index')}>
                  <ArrowLeft size={16} />
                  Kembali
                </Link>
              </Button>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="pt-6 pb-8 px-6">
            <form onSubmit={submit} className="space-y-4">

              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Kode Buku <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={data.kode_buku}
                    readOnly
                    className="bg-gray-100 dark:bg-neutral-800"
                  />
                  {errors.kode_buku && (
                    <p className="text-destructive text-sm mt-1">{errors.kode_buku}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Judul <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={data.judul}
                    onChange={(e) => setData('judul', e.target.value)}
                  />
                  {errors.judul && (
                    <p className="text-destructive text-sm mt-1">{errors.judul}</p>
                  )}
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Pengarang <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={data.pengarang}
                    onChange={(e) => setData('pengarang', e.target.value)}
                  />
                  {errors.pengarang && (
                    <p className="text-destructive text-sm mt-1">{errors.pengarang}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Kategori <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={data.kategori_id?.toString() || ''}
                    onValueChange={(value) => setData('kategori_id', value)}
                  >
                    <SelectTrigger className={errors.kategori_id ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Pilih kategori..." />
                    </SelectTrigger>
                    <SelectContent>
                      {props.kategori_buku?.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.kategori_id && (
                    <p className="text-destructive text-sm mt-1">{errors.kategori_id}</p>
                  )}
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Penerbit <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={data.penerbit}
                    onChange={(e) => setData('penerbit', e.target.value)}
                  />
                  {errors.penerbit && (
                    <p className="text-destructive text-sm mt-1">{errors.penerbit}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tahun Terbit <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    value={data.tahun_terbit}
                    onChange={(e) => setData('tahun_terbit', e.target.value)}
                  />
                  {errors.tahun_terbit && (
                    <p className="text-destructive text-sm mt-1">{errors.tahun_terbit}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Stok <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    value={data.stok}
                    onChange={(e) => setData('stok', e.target.value)}
                  />
                  {errors.stok && (
                    <p className="text-destructive text-sm mt-1">{errors.stok}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => reset()}
                  className="text-gray-600 bg-gray-50 hover:bg-gray-100"
                >
                  Reset
                </Button>
                <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90 rounded-md">
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
