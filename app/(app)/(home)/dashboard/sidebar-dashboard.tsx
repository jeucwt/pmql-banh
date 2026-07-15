"use client";

import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DashBoardItems = [
    {
        label: "Doanh Thu",
        href: "/dashboard",
    },
    {
        label: "Quản lý sản phẩm",
        href: "/dashboard/cakes",
    },
    {
        label: "Quản lý kho nguyên liệu",
        href: "/dashboard/materials",
    },
    {
        label: "Quản lý hóa đơn",
        href: "/dashboard/bills",
    },
    {
        label: "Quản lý sản xuất",
        href: "/dashboard/sanxuat",
    },
    {
        label: "Quản lý nhập kho",
        href: "/dashboard/nhapkho",
    },
    {
        label: "Đơn chờ sản xuất",
        href: "/dashboard/don-cho-sx",
    }
];

export default function SideBarDashBoard() {
    const { user } = useAuth();
    const pathname = usePathname();

    return (
        <aside className=" h-full bg-[#EDE0CC] flex flex-col">

            {/* Name */}
            <div className="h-14 flex items-center px-5 gap-3 border-b border-[#C8A84B]">
                <div className="flex items-center gap-2 text-base font-bold text-[#5A3E1B] no-underline">
                    <a href="/" className="cursor-pointer" style={{ fontSize: 20, color: "#5C2D0A", fontWeight: 700, textDecoration: "none" }}>Jeucwt's Bakery</a>
                </div>
            </div>
            {/* Nav Links */}
            <nav className="flex-1 py-4 overflow-y-auto">
                {DashBoardItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={
                                `block px-5 py-3 text-[#5A3E1B] no-underline ${isActive ? "bg-[#C8A84B]/20 font-bold" : "hover:bg-[#C8A84B]/10"
                                }`
                            }

                        >
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>


        </aside>
    );
};

