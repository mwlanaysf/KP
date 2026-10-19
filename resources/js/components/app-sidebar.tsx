
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavGroup } from '@/types';
import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    FileText,
    RefreshCcw,
    CreditCard,
    Database,
    PieChart,
    UserCog,
    History,
} from 'lucide-react';
import AppLogo from './app-logo';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

const generalGroups = (role: string): NavGroup[] => {
    const groups: NavGroup[] = [
        {
            title: '',
            items: [
                { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
                { title: 'Peminjaman', href: '/peminjaman', icon: FileText },
                { title: 'Pengembalian', href: '/pengembalian', icon: RefreshCcw },
                { title: 'Denda', href: '/denda', icon: CreditCard },
                { title: 'Riwayat Transaksi', href: '/riwayat-transaksi', icon: History },
                {
                    title: 'Master Data',
                    href: '#',
                    icon: Database,
                    items: [
                        { title: 'Buku', href: '/buku' },
                        { title: 'Anggota', href: '/anggota' },
                        { title: 'Kategori Buku', href: '/kategori-buku' },
                        { title: 'Jurusan', href: '/jurusan' },
                    ],
                },
                { title: 'Laporan', href: '/laporan', icon: PieChart },
            ],
        },
    ];

    if (role === 'super_admin') {
        groups[0].items.push({ title: 'Pengguna', href: '/petugas', icon: UserCog });
    }

    return groups;
};

const kepalaSekolahGroups = (): NavGroup[] => [
    {
        title: '',
        items: [
            { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
            { title: 'Riwayat Transaksi', href: '/riwayat-transaksi', icon: History },
            {
                title: 'Master Data',
                href: '#',
                icon: Database,
                items: [
                    { title: 'Buku', href: '/buku' },
                    { title: 'Anggota', href: '/anggota' },
                    { title: 'Kategori Buku', href: '/kategori-buku' },
                    { title: 'Jurusan', href: '/jurusan' },
                ],
            },
            { title: 'Laporan', href: '/laporan', icon: PieChart },
        ],
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const role = auth.user?.role || 'admin';

    const groups = role === 'kepala_sekolah'
        ? kepalaSekolahGroups()
        : generalGroups(role);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={groups} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
