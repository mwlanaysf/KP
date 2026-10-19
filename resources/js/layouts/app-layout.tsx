import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {

    const { props: pageProps } = usePage<any>();

    const displayedFlashId = useRef<string | null>(null);

    useEffect(() => {
        const flash = pageProps?.flash;
        if (flash?.id && flash.id !== displayedFlashId.current) {
            displayedFlashId.current = flash.id;
            if (flash?.success) toast.success(flash.success, { id: flash.id });
            if (flash?.error) toast.error(flash.error, { id: flash.id });
        }
    }, [pageProps?.flash]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Toaster position="top-right" />
        </AppLayoutTemplate>
    );
}
