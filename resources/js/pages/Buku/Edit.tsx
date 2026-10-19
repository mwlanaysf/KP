import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';

export default function Edit({ buku, kategori_buku }: { buku: any, kategori_buku: any }) {
  const { data, setData, put, processing, errors } = useForm({
    kode_buku: buku.kode_buku || '',
    judul: buku.judul || '',
    pengarang: buku.pengarang || '',
    kategori_id: buku.kategori_id?.toString() || '',
    penerbit: buku.penerbit || '',
    tahun_terbit: buku.tahun_terbit || '',
    stok: buku.stok || '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('buku.update', buku.id));
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Buku', href: '/buku' },
    { title: 'Edit Buku', href: `/buku/${buku.id}/edit` },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Buku" />
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-md border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/40 pb-5 mb-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Buku</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Perbarui informasi detail buku di bawah ini. Pastikan data yang dimasukkan sudah benar.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild className="gap-2 text-gray-600 hover:bg-gray-100">
              <Link href={route('buku.index')}>
                <ArrowLeft size={16} />
                Kembali
              </Link>
            </Button>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="kode_buku">Kode Buku <span className="text-destructive">*</span></Label>
                <Input
                  id="kode_buku"
                  value={data.kode_buku}
                  disabled
                  readOnly
                  className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed border-neutral-200 dark:border-neutral-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="judul">Judul Buku <span className="text-destructive">*</span></Label>
                <Input 
                  id="judul"
                  value={data.judul} 
                  onChange={(e) => setData('judul', e.target.value)} 
                  className="focus-visible:ring-ring"
                />
                {errors.judul && <p className="text-destructive text-xs font-medium mt-1">{errors.judul}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pengarang">Pengarang <span className="text-destructive">*</span></Label>
                <Input
                  id="pengarang"
                  value={data.pengarang}
                  onChange={(e) => setData('pengarang', e.target.value)}
                  className="focus-visible:ring-ring"
                />
                {errors.pengarang && <p className="text-destructive text-xs font-medium mt-1">{errors.pengarang}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="kategori_id">Kategori <span className="text-destructive">*</span></Label>
                <Select 
                  value={data.kategori_id} 
                  onValueChange={(value) => setData('kategori_id', value)}
                >
                  <SelectTrigger className="focus-visible:ring-ring">
                    <SelectValue placeholder="Pilih kategori buku" />
                  </SelectTrigger>
                  <SelectContent>
                    {kategori_buku?.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.kategori_id && <p className="text-destructive text-xs font-medium mt-1">{errors.kategori_id}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="penerbit">Penerbit <span className="text-destructive">*</span></Label>
                <Input
                  id="penerbit"
                  value={data.penerbit}
                  onChange={(e) => setData('penerbit', e.target.value)}
                  className="focus-visible:ring-ring"
                />
                {errors.penerbit && <p className="text-destructive text-xs font-medium mt-1">{errors.penerbit}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tahun_terbit">Tahun Terbit <span className="text-destructive">*</span></Label>
                <Input
                  id="tahun_terbit"
                  type="number"
                  value={data.tahun_terbit}
                  onChange={(e) => setData('tahun_terbit', e.target.value)}
                  className="focus-visible:ring-ring"
                />
                {errors.tahun_terbit && <p className="text-destructive text-xs font-medium mt-1">{errors.tahun_terbit}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stok">Stok Buku <span className="text-destructive">*</span></Label>
                <Input
                  id="stok"
                  type="number"
                  value={data.stok}
                  onChange={(e) => setData('stok', e.target.value)}
                  className="focus-visible:ring-ring"
                />
                {errors.stok && <p className="text-destructive text-xs font-medium mt-1">{errors.stok}</p>}
              </div>
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
  );
}
