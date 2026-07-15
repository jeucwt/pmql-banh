"use client";

import { useAuth } from "@/lib/AuthContext";
import { usePathname, useRouter } from "next/navigation";

const ROLE_LABELS: Record<string, string> = {
    admin: "Quản trị viên",

    cashier: "Thu ngân",
};

const PAGE_TITLES: Record<string, string> = {
    "/dashboard": "Doanh Thu",
    "/dashboard/cakes": "Quản lí sản phẩm",
    "/dashboard/materials": "Quản lí kho nguyên liệu",
    "/dashboard/bills": "Quản lí hóa đơn",
    "/dashboard/sanxuat": "Quản lí sản xuất",
    "/dashboard/nhapkho": "Quản lí nhập kho",
    "/dashboard/don-cho-sx": "Đơn chờ sản xuất",
};

export const NavbarDashBoard = () => {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const title = PAGE_TITLES[pathname] ?? "Dashboard";

    return (
        <nav className="h-14 bg-[#DEE0CC] flex items-center justify-between px-6 border-b" >

            <h1 className="text-[#FFFFFF] font-bold text-xl">{title}</h1>

            <div className="flex items-center gap-2">
                {user ? (
                    <>
                        <div className="flex items-center gap-2 bg-[#5C2D0A]/10 border border-[#5C2D0A]/20 rounded-full px-3 py-1">
                            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-md font-bold text-black">{user.name[0]}</div>
                            <div>
                                <div className="text-md font-bold text-black leading-tight">{user.name}</div>
                                <div className="text-xs font-bold text-black leading-tight">{ROLE_LABELS[user.role]}</div>
                            </div>
                        </div>
                        <button className="text-md font-bold text-[#5C2D0A] bg-[#5C2D0A]/10 border border-[#5C2D0A]/20 rounder-md px-3 py-1.5 cursor-pointer hover:bg-[#5C2D0A]/20 transition-colors " onClick={logout}>Đăng xuất</button>
                    </>
                ) : (
                    <>
                        <a href="/login" className="text-md font-bold text-[#5C2D0A] bg-[#5C2D0A]/10 border-[1.5px] border-[#5C2D0A]/25 rounded-md px-4 py-1.5 no-underline hover:bg-[#5C2D0A]/20 transition-colors">Đăng nhập</a>
                        <a href="/signup" className="text-md font-bold text-[#5C2D0A] bg-[#5C2D0A]/10 border border-[#5C2D0A]/20 rounded-md px-4 py-1.5 no-underline hover:bg-[#5C2D0A]/20 transition-colors">Đăng ký</a>
                    </>
                )}
            </div>

        </nav>
    );
};