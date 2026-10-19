import { useEffect } from 'react'
import AppLayout from '@/layouts/app-layout'
import { ArrowLeft } from 'lucide-react'
import { Head, useForm, Link, usePage, router } from '@inertiajs/react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type BreadcrumbItem } from '@/types'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Anggota', href: '/anggota' },
  { title: 'Tambah', href: '/anggota/create' },
]

export default function Create() {
  const { props } = usePage<any>()

  const { data, setData, post, processing, errors, reset } = useForm({
    kode_anggota: props.kode_anggota || '',
    nama: '',
    jurusan_id: '',
    kelas: '',
    no_hp: '',
    alamat: '',
  })

  useEffect(() => {
    if (props.kode_anggota) {
      setData('kode_anggota', props.kode_anggota)
    }
  }, [props.kode_anggota])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route('anggota.store'), {
      onSuccess: () => {
        reset('nama', 'jurusan_id', 'kelas', 'no_hp', 'alamat')
        router.clearHistory()
      },
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Anggota" />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <Card className="border border-border/60 shadow-sm rounded-md">
          {/* Header */}
          <CardHeader className="border-b border-border/40 pb-5 bg-gray-50/40 dark:bg-neutral-900/40 rounded-t-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Anggota
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400 text-sm">
                  Tambahkan anggota baru perpustakaan
                </CardDescription>
              </div>

              <Button variant="outline" size="sm" asChild className="gap-2 text-gray-600 hover:bg-gray-100">
                <Link href={route('anggota.index')}>
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
                Kode Anggota <span className="text-destructive">*</span>
              </label>
              <Input
                value={data.kode_anggota}
                readOnly
                className="bg-gray-100 dark:bg-neutral-800"
              />
              {errors.kode_anggota && (
                <p className="text-destructive text-sm mt-1">
                  {errors.kode_anggota}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nama <span className="text-destructive">*</span>
              </label>
              <Input
                value={data.nama}
                onChange={(e) => setData('nama', e.target.value)}
              />
              {errors.nama && (
                <p className="text-destructive text-sm mt-1">
                  {errors.nama}
                </p>
              )}
            </div>

          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <label className="block text-sm font-medium mb-1">
                Jurusan
              </label>
              <Select
                value={data.jurusan_id?.toString() || ''}
                onValueChange={(value) => setData('jurusan_id', value)}
              >
                <SelectTrigger className={errors.jurusan_id ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Pilih jurusan..." />
                </SelectTrigger>
                <SelectContent>
                  {props.jurusan?.map((major: any) => (
                    <SelectItem key={major.id} value={major.id.toString()}>
                      {major.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.jurusan_id && (
                <p className="text-destructive text-sm mt-1">
                  {errors.jurusan_id}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Kelas <span className="text-destructive">*</span>
              </label>
              <Select
                value={data.kelas}
                onValueChange={(value) => setData('kelas', value)}
              >
                <SelectTrigger className={errors.kelas ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="X">X</SelectItem>
                  <SelectItem value="XI">XI</SelectItem>
                  <SelectItem value="XII">XII</SelectItem>
                </SelectContent>
              </Select>
              {errors.kelas && (
                <p className="text-destructive text-sm mt-1">
                  {errors.kelas}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                No HP <span className="text-destructive">*</span>
              </label>
              <Input
                value={data.no_hp}
                onChange={(e) => setData('no_hp', e.target.value)}
              />
              {errors.no_hp && (
                <p className="text-destructive text-sm mt-1">
                  {errors.no_hp}
                </p>
              )}
            </div>

          </div>

          {/* Alamat */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Alamat <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={data.alamat}
              onChange={(e) => setData('alamat', e.target.value)}
              className="min-h-[100px]"
            />
            {errors.alamat && (
              <p className="text-destructive text-sm mt-1">
                {errors.alamat}
              </p>
            )}
          </div>

              {/* Buttons */}
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
