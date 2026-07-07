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
        label: "Quan li san pham",
        href: "/dashboard/cakes",
    },
    {
        label: "Quan li kho",
        href: "/dashboard/materials",
    },
    {
        label: "Quan li hoa don",
        href: "/dashboard/bills",
    },
    {
        label: "Quan li san xuat",
        href: "/dashboard/sanxuat",
    },
    {
        label: "Quan li nhap kho",
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
                    <span> Logo </span>
                    <span> Banh</span>
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

