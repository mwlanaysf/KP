
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/50 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8 rounded-md bg-card px-8 py-10 shadow-sm ring-1 ring-border">
                    <div className="flex flex-col items-center gap-4">
                        <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                            <div className="mb-1 flex size-20 items-center justify-center overflow-hidden">
                                <img src="/images/logo-sekolah.png" alt="Logo Sekolah" className="size-full object-contain" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center mt-2">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">{description}</p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
