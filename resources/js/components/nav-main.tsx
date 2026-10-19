import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { type NavGroup } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ groups = [] }: { groups: NavGroup[] }) {
    const page = usePage();

    return (
        <>
            {groups.map((group, index) => (
                <SidebarGroup key={group.title || index} className="px-2 py-0 mt-4 first:mt-0">
                    {group.title && (
                        <SidebarGroupLabel className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                            {group.title}
                        </SidebarGroupLabel>
                    )}
                    <SidebarMenu className="gap-1.5">
                        {group.items.map((item) => {
                            const isGroupActive = item.items?.some(subItem => page.url.startsWith(subItem.href)) || false;
                            const isActive = page.url.startsWith(item.href) || isGroupActive;

                            if (item.items && item.items.length > 0) {
                                return (
                                    <Collapsible
                                        key={item.title}
                                        asChild
                                        defaultOpen={isActive || item.isActive}
                                        className="group/collapsible"
                                    >
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton
                                                    tooltip={{ children: item.title }}
                                                    className="hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
                                                >
                                                    {item.icon && <item.icon />}
                                                    <span>{item.title}</span>
                                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items.map((subItem) => {
                                                        const isSubActive = page.url.startsWith(subItem.href);
                                                        return (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton 
                                                                    asChild 
                                                                    isActive={isSubActive}
                                                                    className={isSubActive ? '!bg-emerald-600/10 !text-emerald-700 dark:!text-emerald-400 font-medium' : 'hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400'}
                                                                >
                                                                    <Link href={subItem.href} prefetch>
                                                                        <span>{subItem.title}</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        );
                                                    })}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                );
                            }

                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive}
                                        tooltip={{ children: item.title }}
                                        className={isActive ? '!bg-emerald-600 !text-white hover:!bg-emerald-700 [&>svg]:text-white' : 'hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400'}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
