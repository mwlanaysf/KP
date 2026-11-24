import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
    id: number;
    name: string;
    username: string;
    role: string;
    status: string;
}

interface Props {
    user: User;
}

export default function PetugasEdit({ user }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        username: user.username,
        password: '',
        password_confirmation: '',
        role: user.role,
        status: user.status,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('petugas.update', user.id));
    };

    return (
        <AppLayout>
            <Head title="Pengguna" />
            <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">
                <Breadcrumbs
                    breadcrumbs={[
                        { title: 'Dashboard', href: route('dashboard') },
                        { title: 'Pengguna', href: route('petugas.index') },
                        { title: 'Edit', href: route('petugas.edit', user.id) },
                    ]}
                />

                <div className="flex items-center justify-between border-b border-border/40 pb-5 mb-2">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Pengguna</h1>
                        <p className="text-sm text-gray-500">Perbarui informasi akun pengguna atau reset password.</p>
                    </div>
                    <Button variant="outline" asChild className="gap-2 text-gray-600 hover:bg-gray-100">
                        <Link href={route('petugas.index')}>
                            <ArrowLeft size={16} />
                            Kembali
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border bg-white shadow-sm">
                    <form onSubmit={submit} className="flex flex-col gap-6 p-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Pengguna</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Masukkan nama"
                                required
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="Masukkan username"
                                    required
                                />
                                {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select value={data.role} onValueChange={(val) => setData('role', val)}>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Pilih Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {user.role === 'super_admin' && (
                                            <SelectItem value="super_admin">Admin</SelectItem>
                                        )}
                                        <SelectItem value="admin">Petugas</SelectItem>
                                        <SelectItem value="kepala_sekolah">Kepala Sekolah</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
                            </div>
                        </div>

                        <div className="pt-4 border-t mt-4">
                            <h3 className="text-lg font-medium">Ubah Password</h3>
                            <p className="text-sm text-gray-500 mb-4">Kosongkan jika tidak ingin mengubah password.</p>
                            
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password Baru</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Ketik password baru"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                                    <div className="relative">
                                        <Input
                                            id="password_confirmation"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="Ulangi password baru"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {(errors as Record<string, string>).password_confirmation && <p className="text-sm text-destructive">{(errors as Record<string, string>).password_confirmation}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-1">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="aktif">Aktif</SelectItem>
                                        <SelectItem value="nonaktif">Nonaktif</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-6">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => window.location.reload()}
                                className="text-gray-600 bg-gray-50 hover:bg-gray-100"
                            >
                                Reset
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
