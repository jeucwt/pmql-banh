// app/(app)/(home)/dashboard/layout.tsx
import SidebarDashboard from "./sidebar-dashboard";
import { NavbarDashBoard } from "./navbar-dashboard";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-white gap-[10px] p-[10px]">
            <div className="w-1/5 rounded-2xl overflow-hidden shadow-xl shrink-0">
                <SidebarDashboard />
            </div>
            <div className="flex flex-col flex-1 overflow-hidden rounded-2xl shadow-xl bg-[#fdf6e3]">
                <NavbarDashBoard />
                <main className="flex-1 overflow-auto p-6">
                    {children}   
                </main>
            </div>
        </div>
    );
}