"use client";

import {useAuth} from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {Toast} from "./toast";

const Items=[
    {
        key: "goods" as const,
        label: "Quan li cua hang",
        href: "/dashboard",
    },
    {
        key: "warehouse" as const,
        label: "Quan li kho",
        href: "/materials",
    },
    {
        key: "cashier" as const,
        label: "Thu ngan",
        href: "/cashier",
    },
];

const ROLE_LABELS: Record<string, string> = {
    admin: "Quan ly",
    warehouse: "Nhan vien kho",
    cashier: "Thu ngan",
};

export function LandingCard() {
    const {user, canAccess} = useAuth();
    const router = useRouter();
    const [toast, setToast] = useState("");

    function handleClick(feat: typeof Items[0]) {
        if (!user) {router.push("/login"); return;}
        if (!canAccess(feat.key)){
            setToast(`Tai khoan "${ROLE_LABELS[user.role]}" khong co quyen truy cap chuc nang nay.`);
            setTimeout(() => setToast(""), 3000);
            return;
        }
        router.push(feat.href);
}

    return (
        <>
        <div className="flex gap-7 justify-center flex-wrap max-w-230 w-full ">
            {Items.map((feat) => {
                const allowed = user ? canAccess(feat.key) : null; // null = guest
                const isLocked = user !== null && !allowed;

                return (
                    <div 
                        key={feat.key}
                        onClick={() => handleClick(feat)}
                        className={[
                            "relative w-65 min-h-90 bg-[#EDE0CC] border-[1.5px] border-[#C8A84B]/40", 
                            "rounded-[18px] flex flex-col overflow-hidden transition-all duration-200",
                            "shadow-md cursor-pointer hover:shadow-lg",
                            isLocked 
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer hover:-translate-y-1.5 hover:shadow-lg hover:border-[#C8A84B]",
                        ].join(" ")}
                    >
                        {/* {Badge} */}
                        {!user && (
                            <span className="absolute top-3.5 right-3.5 bg-[#5C2D0A]/10 border-[1.5px] border-[#5C2D0A]/20 text-[#5C2D0A] text-xs font-bold px-2 py-0.5 rounded-full">
                                Chua dang nhap 
                            </span>
                        )}
                        {user && allowed &&(
                            <span className="absolute top-3.5 right-3.5 bg-green-100 border-[1.5px] border-green-300 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full">
                                Co the truy cap
                            </span>
                        )}
                        {user && isLocked && (
                            <span className="absolute top-3.5 right-3.5 bg-red-100 border-[1.5px] border-red-300 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full">
                                Khong the truy cap
                            </span>
                        )}
                        
                        {/* Icon
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[65%] text-[64px] opacity-25 pointer-events-none select-none">
                            {feat.icon}
                        </span> */}

                        {/* Content */}
                        <div className="flex-1 flex items-end p-6 relative z-10">
                            <div className="text-xl font-semibold text-white leading-snug mb-1.5 ">
                                {feat.label}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

         <Toast message={toast} />
        </>
    );  
}