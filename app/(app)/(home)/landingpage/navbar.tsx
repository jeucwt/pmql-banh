"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

const ROLE_LABELS: Record<string, string> = {
    admin: "Quản trị viên",
    warehouse: "Nhân viên kho",
    cashier: "Thu ngân",
};

export const NavbarLanding =() => {
    const { user, logout } = useAuth();
    
    return(
        <nav className="bg-[#E8C97A] border-b-2 border-[#C8A84B] h-14 flex items-center px-8 gap-3 sticky top-0 z-50" >
            <div className="flex items-center gap-2 text-base font-bold text-[#5A3E1B] no-underline">
                <span> Logo </span>
                <span> Banh</span>
            </div>
            <div className="flex-1 items-center gap-2 text-base font-bold text-[#543E1B] no-underline">Ten Tiem Banh</div>
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