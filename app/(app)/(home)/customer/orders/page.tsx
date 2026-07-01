"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../navbar";
import { Footer } from "../../footer/footer";
import { useRouter } from "next/navigation";

interface DonHang {
    MaDH: number;
    NgayDat: string;
    TongTien: string;
    TrangThai: string;
    MaKH: number;
    MaDVVC: number | null;
}

const TRANG_THAI_LABEL: Record<string, { label: string; color: string }> = {
    ChoXacNhan: { label: "Chờ xác nhận", color: "#997E67" },
    DangGiao: { label: "Đang giao", color: "#2980B9" },
    DaGiao: { label: "Đã giao", color: "#27AE60" },
    DaHuy: { label: "Đã hủy", color: "#C0392B" },
};

export default function CustomerOrdersPage() {
    const [orders, setOrders] = useState<DonHang[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("tiem_banh_token");
        if (!token) {
            router.push("/login");
            return;
        }

        fetch("http://localhost:3001/api/donhang/me", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Không thể tải đơn hàng");
                return res.json();
            })
            .then((data) => setOrders(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ backgroundColor: "#FFF8F0" }} className="min-h-screen">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/" style={{ color: "#997E67" }} className="text-sm hover:underline">
                        Trang chủ
                    </Link>
                    <span style={{ color: "#997E67" }}>›</span>
                    <span className="text-sm font-semibold" style={{ color: "#664930" }}>
                        Đơn hàng của tôi
                    </span>
                </div>

                <h1 className="text-2xl font-bold mb-6" style={{ color: "#664930" }}>
                    Đơn hàng của tôi
                </h1>

                {/* Loading */}
                {loading && (
                    <p className="text-center py-20" style={{ color: "#997E67" }}>
                        Đang tải...
                    </p>
                )}

                {/* Error */}
                {error && (
                    <p className="text-center py-20 text-red-500">{error}</p>
                )}

                {/* Empty */}
                {!loading && !error && orders.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-lg mb-4" style={{ color: "#997E67" }}>
                            Bạn chưa có đơn hàng nào.
                        </p>
                        <Link
                            href="/"
                            className="px-6 py-2 rounded-xl font-semibold text-sm"
                            style={{ backgroundColor: "#664930", color: "#FFDBBB" }}
                        >
                            Mua sắm ngay
                        </Link>
                    </div>
                )}

                {/* Order list */}
                {!loading && !error && orders.length > 0 && (
                    <div className="flex flex-col gap-4">
                        {orders.map((order) => {
                            const trangThai = TRANG_THAI_LABEL[order.TrangThai] ?? {
                                label: order.TrangThai,
                                color: "#997E67",
                            };
                            const ngayDat = new Date(order.NgayDat).toLocaleDateString("vi-VN");
                            const tongTien = Number(order.TongTien).toLocaleString("vi-VN");

                            return (
                                <Link
                                    key={order.MaDH}
                                    href={`/customer/orders/${order.MaDH}`}
                                    className="block rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                                    style={{ backgroundColor: "#FFDBBB" }}
                                >
                                    <div className="flex items-center justify-between">
                                        {/* Left */}
                                        <div>
                                            <p className="font-bold text-base" style={{ color: "#664930" }}>
                                                Đơn #{order.MaDH}
                                            </p>
                                            <p className="text-xs mt-1" style={{ color: "#997E67" }}>
                                                Ngày đặt: {ngayDat}
                                            </p>
                                        </div>

                                        {/* Right */}
                                        <div className="text-right">
                                            <p className="font-bold text-sm" style={{ color: "#664930" }}>
                                                {tongTien} ₫
                                            </p>
                                            <span
                                                className="inline-block text-xs px-3 py-0.5 rounded-full mt-1 font-medium"
                                                style={{ backgroundColor: "#CCBEB1", color: trangThai.color }}
                                            >
                                                {trangThai.label}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}