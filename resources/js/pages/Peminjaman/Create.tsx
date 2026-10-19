import React, { useState, useEffect } from "react"
import AppLayout from "@/layouts/app-layout"
import { Head, useForm, Link, usePage } from "@inertiajs/react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AsyncCombobox } from "@/components/ui/async-combobox"
import { toast } from "react-hot-toast"
import { Trash2, Settings } from "lucide-react"
import { type BreadcrumbItem } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Peminjaman', href: '/peminjaman' },
]

export default function CreatePeminjaman() {
  const { props } = usePage<any>()
  const user = props.auth?.user

  const { data, setData, post, processing, reset, transform } = useForm({
    anggota_id: "",
    buku_id: ["", "", ""],
  })

  const [daftarBuku, setDaftarBuku] = useState<{ id: string | null; kode_buku: string; data: any | null }[]>([
    { id: null, kode_buku: "", data: null },
    { id: null, kode_buku: "", data: null },
    { id: null, kode_buku: "", data: null },
  ])

  useEffect(() => {
    transform((d: any) => ({
      ...d,
      buku_id: d.buku_id.filter(Boolean),
    }))
  }, [transform])

  const handleBookChange = (index: number, value: string) => {
    // update form data
    const arr = [...data.buku_id]
    arr[index] = value
    setData("buku_id", arr)

    // if cleared
    if (!value) {
      setDaftarBuku((prev) => {
        const updated = [...prev]
        updated[index] = { id: null, kode_buku: "", data: null }
        return updated
      })
      return
    }

    // fetch detail by id
    fetch(`${route("buku.search", {}, true)}?id=${value}`, {
      headers: { Accept: "application/json" }
    })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) {
          const dataBuku = d[0]

          // validate duplicate
          const isDuplicate = daftarBuku.some((b, i) => i !== index && b.id === dataBuku.id)
          if (isDuplicate) {
            toast.error("Buku ini sudah dipilih di baris lain.")

            // Revert changes
            const revertedArr = [...data.buku_id]
            revertedArr[index] = ""
            setData("buku_id", revertedArr)

            setDaftarBuku((prev) => {
              const updated = [...prev]
              updated[index] = { id: null, kode_buku: "", data: null }
              return updated
            })
            return
          }

          if (dataBuku.stok <= 0) {
            toast.error("Stok buku habis!")
          }

          setDaftarBuku((prev) => {
            const updated = [...prev]
            updated[index] = { id: dataBuku.id, kode_buku: dataBuku.kode_buku, data: dataBuku }
            return updated
          })
        }
      })
      .catch(() => {
        toast.error("Terjadi kesalahan saat mengambil detail buku")
      })
  }

  const getExcludeIds = (index: number) => {
    return data.buku_id.filter((id, i) => id && i !== index)
  }

  const hapusBuku = (index: number) => {
    setDaftarBuku(prev => {
      const updated = [...prev]
      updated[index] = { id: null, kode_buku: "", data: null }
      return updated
    })
    const formArr = [...data.buku_id]
    formArr[index] = ""
    setData("buku_id", formArr)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()

    const filtered = data.buku_id.filter(Boolean)

    if (filtered.length === 0) {
      toast.error("Minimal pilih 1 buku")
      return
    }

    // Cek ada yang stok habis ga
    const isAnyStokHabis = daftarBuku.some(b => b.data && b.data.stok <= 0)
    if (isAnyStokHabis) {
      toast.error("Ada buku yang stoknya habis. Hapus buku tersebut dari daftar.")
      return
    }

    post(route("peminjaman.store"), {
      onSuccess: () => {
        setData({
          anggota_id: "",
          buku_id: ["", "", ""],
        })
        setDaftarBuku([
          { id: null, kode_buku: "", data: null },
          { id: null, kode_buku: "", data: null },
          { id: null, kode_buku: "", data: null },
        ])
      }
    })
  }

  const selectedCount = data.buku_id.filter(Boolean).length

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Peminjaman" />

      <div className="w-full mx-auto p-4 sm:p-6">

        <Card className="rounded-md border border-border/60 shadow-sm bg-white dark:bg-zinc-900">
          <CardContent className="p-5 sm:p-6">

            {/* HEADER (Inside Card) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/40 pb-4 mb-5 gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Peminjaman</h1>
                <p className="text-sm text-gray-500 mt-0.5">Tambahkan transaksi peminjaman buku</p>
              </div>
              {user?.role === "super_admin" && (
                <Button variant="outline" size="sm" asChild className="gap-2 text-gray-600 hover:bg-gray-100 h-9">
                  <Link href={route("pengaturan-peminjaman.index")}>
                    <Settings size={16} />
                    Pengaturan Peminjaman
                  </Link>
                </Button>
              )}
            </div>

            <form onSubmit={submit} className="space-y-6">

              {/* SECTION 1 - INFORMASI PEMINJAMAN */}
              <div>
                <h2 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3">Informasi Peminjaman</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-gray-50/30 dark:bg-neutral-900/10 p-4 border rounded-md">
                  {/* Kolom Kiri */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal Peminjaman</Label>
                      <Input
                        readOnly
                        value={props.tanggal_pinjam || ''}
                        className="bg-gray-100/50 dark:bg-neutral-800/50 text-sm border-gray-200 dark:border-neutral-700 h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal Pengembalian</Label>
                      <Input
                        readOnly
                        value={props.tanggal_kembali || ''}
                        className="bg-gray-100/50 dark:bg-neutral-800/50 text-sm border-gray-200 dark:border-neutral-700 h-9"
                      />
                      <p className="text-[11px] text-gray-500">Durasi peminjaman: {props.durasi_peminjaman || 7} hari (jatuh tempo digeser jika hari libur)</p>
                    </div>
                  </div>

                  {/* Kolom Kanan */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pilih Anggota <span className="text-destructive">*</span></Label>
                      <AsyncCombobox
                        value={data.anggota_id}
                        onChange={(v: string) => setData("anggota_id", v)}
                        searchUrl={route("anggota.search", {}, true)}
                        placeholder="Ketik nama atau kode anggota..."
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Petugas</Label>
                      <Input
                        readOnly
                        value={user?.name || ''}
                        className="bg-gray-100/50 dark:bg-neutral-800/50 text-sm border-gray-200 dark:border-neutral-700 h-9"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2 - DAFTAR BUKU */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">Daftar Buku</h2>
                  <div className="text-xs font-medium text-gray-600 bg-gray-100 dark:bg-neutral-800 px-3 py-1 rounded-md">
                    Total: <span className="text-primary ml-1">{selectedCount}</span> / 3 Buku
                  </div>
                </div>

                <div className="space-y-3">

                  {[0, 1, 2].map(index => {
                    // index 0 always shows.
                    // index 1 shows if index 0 has valid bukuItem
                    // index 2 shows if index 1 has valid bukuItem
                    if (index > 0 && !daftarBuku[index - 1].data) return null;

                    const bukuItem = daftarBuku[index];
                    const isStokHabis = bukuItem.data && bukuItem.data.stok <= 0;

                    return (
                      <div key={index} className="flex flex-col xl:flex-row gap-3 items-start xl:items-end bg-white dark:bg-neutral-900/50 p-4 border border-gray-200 dark:border-neutral-800 rounded-md shadow-sm transition-all">

                        {/* Kode Input */}
                        <div className="w-full xl:w-64 space-y-1.5 flex-shrink-0">
                          <Label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Buku {index + 1}</Label>
                          <AsyncCombobox
                            value={data.buku_id[index]}
                            onChange={(v: string) => handleBookChange(index, v)}
                            searchUrl={route("buku.search", {}, true)}
                            excludeIds={getExcludeIds(index)}
                            placeholder="Cari buku..."
                            className="w-full bg-white dark:bg-neutral-900 focus-visible:ring-ring"
                          />
                        </div>

                        {/* Readonly Details */}
                        <div className="w-full flex flex-col md:flex-row gap-3 flex-1">
                          <div className="space-y-1.5 flex-[2]">
                            <Label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Judul Buku</Label>
                            <Input readOnly value={bukuItem.data?.judul || ""} className="bg-gray-50/50 dark:bg-neutral-800/30 border-solid border-gray-200 dark:border-neutral-700 text-sm text-gray-700 dark:text-gray-300 h-9" placeholder="-" />
                          </div>
                          <div className="space-y-1.5 flex-[2]">
                            <Label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pengarang</Label>
                            <Input readOnly value={bukuItem.data?.pengarang || ""} className="bg-gray-50/50 dark:bg-neutral-800/30 border-solid border-gray-200 dark:border-neutral-700 text-sm text-gray-700 dark:text-gray-300 h-9" placeholder="-" />
                          </div>
                          <div className="space-y-1.5 flex-[1.5]">
                            <Label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Tahun</Label>
                            <Input readOnly value={bukuItem.data?.tahun_terbit || ""} className="bg-gray-50/50 dark:bg-neutral-800/30 border-solid border-gray-200 dark:border-neutral-700 text-sm text-gray-700 dark:text-gray-300 h-9" placeholder="-" />
                          </div>
                          <div className="space-y-1.5 flex-none min-w-[100px]">
                            <Label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Stok</Label>
                            <div className="flex items-center gap-2 h-9">
                              <Input readOnly value={bukuItem.data?.stok ?? ""} className="bg-gray-50/50 dark:bg-neutral-800/30 border-solid border-gray-200 dark:border-neutral-700 w-14 text-center text-sm text-gray-700 dark:text-gray-300 h-9 px-1" placeholder="-" />
                              {isStokHabis && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-destructive/10 text-red-700 border border-destructive/20 whitespace-nowrap">
                                  Stok Habis
                                </span>
                              )}
                              {!isStokHabis && bukuItem.data && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                                  Tersedia
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Delete Action */}
                        {data.buku_id[index] && (
                          <div className="flex-shrink-0 self-end xl:mb-[2px] mt-2 xl:mt-0">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => hapusBuku(index)}
                              className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 h-9 px-3 gap-1.5 shadow-sm text-xs"
                              title="Hapus buku dari daftar"
                            >
                              <Trash2 size={14} />
                              Hapus
                            </Button>
                          </div>
                        )}

                      </div>
                    )
                  })}

                </div>

              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    reset()
                    setDaftarBuku([
                      { id: null, kode_buku: "", data: null },
                      { id: null, kode_buku: "", data: null },
                      { id: null, kode_buku: "", data: null },
                    ])
                  }}
                  className="text-gray-600 bg-gray-50 hover:bg-gray-100 px-5 h-9 text-sm"
                >
                  Reset
                </Button>

                <Button
                  type="submit"
                  disabled={processing || !data.anggota_id || selectedCount === 0 || daftarBuku.some(b => b.data && b.data.stok <= 0)}
                  className="bg-primary hover:bg-primary/90 rounded-md px-6 h-9 text-sm shadow-sm"
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


