export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-white overflow-hidden p-0.5 shadow-sm shrink-0">
                <img src="/images/logo-sekolah.png" alt="Logo SMK" className="size-full object-contain" />
            </div>
            <div className="ml-2 grid flex-1 text-left whitespace-nowrap">
                <span className="mb-0 truncate leading-tight font-bold text-[14px]">Perpus SMK Merdeka</span>
                <span className="truncate text-[11px] text-muted-foreground font-medium">Ulujami</span>
            </div>
        </>
    );
}
