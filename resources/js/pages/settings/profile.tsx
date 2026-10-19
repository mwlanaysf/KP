import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState, useEffect } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { useInitials } from '@/hooks/use-initials';
import { Camera } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Profil', href: '/settings/profile' },
];

export default function Profile() {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, post, errors, processing, recentlySuccessful, reset, clearErrors } = useForm({
        name: auth.user.name,
        username: auth.user.username ?? '',
        avatar: null as File | null,
        _method: 'patch',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        if (recentlySuccessful) {
            setIsEditing(false);
            setAvatarPreview(null);
        }
    }, [recentlySuccessful]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('profile.update'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const handleCancel = () => {
        reset();
        clearErrors();
        setAvatarPreview(null);
        setIsEditing(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setData('avatar', file);
        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const currentAvatar = avatarPreview ?? auth.user.avatar ?? undefined;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil" />
            <SettingsLayout>
                <div className="max-w-xl bg-white p-6 rounded-md border border-border/50 shadow-sm">
                    <div className="mb-6 border-b border-border/40 pb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Informasi Profil</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {isEditing ? 'Perbarui informasi profil akun Anda.' : 'Detail profil akun Anda saat ini.'}
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Foto Profil */}
                        <div className="flex flex-col gap-3">
                            <Label>Foto Profil</Label>
                            <div className="flex items-center gap-4">
                                <div className="relative group shrink-0">
                                    <Avatar className="h-20 w-20 ring-1 ring-border">
                                        <AvatarImage src={currentAvatar} alt={auth.user.name} />
                                        <AvatarFallback className="text-xl bg-neutral-200 dark:bg-neutral-700">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer focus:outline-none"
                                            title="Ganti foto"
                                        >
                                            <Camera className="w-6 h-6 text-white" />
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {isEditing ? (
                                        <>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                Ganti Foto
                                            </Button>
                                            <p className="text-xs text-muted-foreground">JPG, PNG, atau WebP. Maks 2 MB.</p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-500">Avatar profil aktif saat ini.</p>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={!isEditing}
                                />
                            </div>
                            <InputError message={errors.avatar} />
                        </div>

                        {/* Nama Lengkap */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                className="mt-1 block w-full disabled:opacity-100 disabled:text-gray-900"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Masukkan nama lengkap"
                                disabled={!isEditing}
                            />
                            <InputError className="mt-1" message={errors.name} />
                        </div>

                        {/* Username */}
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                className="mt-1 block w-full disabled:opacity-100 disabled:text-gray-900"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Masukkan username"
                                disabled={!isEditing}
                            />
                            <InputError className="mt-1" message={errors.username} />
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-border/40 mt-2">
                            {!isEditing ? (
                                <Button type="button" onClick={() => setIsEditing(true)} variant="outline" className="text-gray-700">
                                    Edit Profil
                                </Button>
                            ) : (
                                <>
                                    <Button type="submit" disabled={processing}>
                                        Simpan
                                    </Button>
                                    <Button type="button" variant="outline" onClick={handleCancel} disabled={processing} className="text-gray-600">
                                        Batal
                                    </Button>
                                </>
                            )}

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-primary font-medium ml-2">Profil berhasil diperbarui.</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
