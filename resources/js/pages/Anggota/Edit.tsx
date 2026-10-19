import AppLayout from '@/layouts/app-layout'
import { Head, useForm, Link } from '@inertiajs/react'
import { ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type BreadcrumbItem } from '@/types'

export default function Edit({ anggota, jurusan }: { anggota: any, jurusan: any }) {
  const { data, setData, put, processing, errors } = useForm({
    kode_anggota: anggota.kode_anggota || '',
    nama: anggota.nama || '',
    jurusan_id: anggota.jurusan_id?.toString() || '',
    kelas: anggota.kelas || '',
    no_hp: anggota.no_hp || '',
    alamat: anggota.alamat || '',
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    put(route('anggota.update', anggota.id))
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Anggota', href: '/anggota' },
    { title: 'Edit Anggota', href: `/anggota/${anggota.id}/edit` },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Anggota" />

      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-md border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/40 pb-5 mb-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Anggota</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Perbarui informasi detail anggota perpustakaan di bawah ini. Pastikan data yang dimasukkan sudah benar.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild className="gap-2 text-gray-600 hover:bg-gray-100">
              <Link href={route('anggota.index')}>
                <ArrowLeft size={16} />
                Kembali
              </Link>
            </Button>
          </div>

          <form onSubmit={submit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="kode_anggota">Kode Anggota <span className="text-destructive">*</span></Label>
                <Input
                  id="kode_anggota"
                  value={data.kode_anggota}
                  disabled
                  readOnly
                  className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed border-neutral-200 dark:border-neutral-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap <span className="text-destructive">*</span></Label>
                <Input
                  id="nama"
                  value={data.nama}
                  onChange={(e) => setData('nama', e.target.value)}
                  className="focus-visible:ring-ring"
                />
                {errors.nama && (
                  <p className="text-destructive text-xs font-medium mt-1">{errors.nama}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="jurusan_id">Jurusan <span className="text-destructive">*</span></Label>
                <Select
                  value={data.jurusan_id}
                  onValueChange={(value) => setData('jurusan_id', value)}
                >
                  <SelectTrigger className="focus-visible:ring-ring">
                    <SelectValue placeholder="Pilih jurusan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jurusan?.map((major: any) => (
                      <SelectItem key={major.id} value={major.id.toString()}>
                        {major.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.jurusan_id && (
                  <p className="text-destructive text-xs font-medium mt-1">{errors.jurusan_id}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="kelas">Kelas <span className="text-destructive">*</span></Label>
                <Select
                  value={data.kelas}
                  onValueChange={(value) => setData('kelas', value)}
                >
                  <SelectTrigger className={`focus-visible:ring-ring${errors.kelas ? ' border-destructive' : ''}`}>
                    <SelectValue placeholder="Pilih Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="X">X</SelectItem>
                    <SelectItem value="XI">XI</SelectItem>
                    <SelectItem value="XII">XII</SelectItem>
                  </SelectContent>
                </Select>
                {errors.kelas && (
                  <p className="text-destructive text-xs font-medium mt-1">{errors.kelas}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="no_hp">No HP <span className="text-destructive">*</span></Label>
                <Input
                  id="no_hp"
                  value={data.no_hp}
                  onChange={(e) => setData('no_hp', e.target.value)}
                  className="focus-visible:ring-ring"
                />
                {errors.no_hp && (
                  <p className="text-destructive text-xs font-medium mt-1">{errors.no_hp}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat Lengkap <span className="text-destructive">*</span></Label>
              <Textarea
                id="alamat"
                value={data.alamat}
                onChange={(e) => setData('alamat', e.target.value)}
                className="min-h-[80px] resize-y focus-visible:ring-ring"
              />
              {errors.alamat && (
                <p className="text-destructive text-xs font-medium mt-1">{errors.alamat}</p>
              )}
            </div>

            <div className="flex justify-end items-center gap-3 pt-6 border-t border-neutral-100 dark:border-neutral-800 mt-6">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => window.location.reload()}
                className="text-gray-600 bg-gray-50 hover:bg-gray-100"
              >
                Reset
              </Button>
              <Button 
                type="submit" 
                disabled={processing}
                className="bg-primary hover:bg-primary/90 rounded-md focus-visible:ring-ring transition-opacity"
              >
                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </AppLayout>
  )
}
