"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../../navbar";
import { Footer } from "../../../footer/footer";

interface ChiTiet {
    MaDH: number;
    MaBanh: number;
    MaSize: number;
    SoLuong: number;
    DonGia: string;
    TenBanh: string;
    KichThuoc: string;
}

interface DonHang {
    MaDH: number;
    NgayDat: string;
    TongTien: string;
    TrangThai: string;
    MaKH: number;
    MaDVVC: number | null;
    TenDVVC?: string;
    MaVanDon?: string;
}

const TRANG_THAI_LABEL: Record<string, { label: string; color: string }> = {
    ChoXacNhan: { label: "Chờ xác nhận", color: "#997E67" },
    DangXuLy: { label: "Đang xử lý", color: "#E67E22" },
    DangLam: { label: "Đang làm", color: "#F1C40F" },
    DangGiao: { label: "Đang giao", color: "#2980B9" },
    DaGiao: { label: "Đã giao", color: "#27AE60" },
    HoanThanh: { label: "Hoàn thành", color: "#8E44AD" },
    DaHuy: { label: "Đã hủy", color: "#C0392B" },
};

export default function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [donHang, setDonHang] = useState<DonHang | null>(null);
    const [chiTiet, setChiTiet] = useState<ChiTiet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("tiem_banh_token");
        if (!token) {
            router.push("/login");
            return;
        }

        fetch(`http://localhost:3001/api/donhang/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Không tìm thấy đơn hàng");
                return res.json();
            })
            .then((data) => {
                setDonHang(data.donHang);
                setChiTiet(data.chiTiet);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div style={{ backgroundColor: "#FFF8F0" }} className="min-h-screen">
                <Navbar />
                <p className="text-center py-20" style={{ color: "#997E67" }}>Đang tải...</p>
                <Footer />
            </div>
        );
    }

    if (error || !donHang) {
        return (
            <div style={{ backgroundColor: "#FFF8F0" }} className="min-h-screen">
                <Navbar />
                <main className="max-w-4xl mx-auto px-6 py-20 text-center">
                    <p className="text-xl font-semibold" style={{ color: "#664930" }}>
                        Không tìm thấy đơn hàng.
                    </p>
                    <Link href="/customer/orders" style={{ color: "#997E67" }} className="mt-4 inline-block underline">
                        ← Quay về danh sách đơn
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    const trangThai = TRANG_THAI_LABEL[donHang.TrangThai] ?? {
        label: donHang.TrangThai,
        color: "#997E67",
    };
    const ngayDat = new Date(donHang.NgayDat).toLocaleDateString("vi-VN");
    const tongTien = Number(donHang.TongTien).toLocaleString("vi-VN");

    return (
        <div style={{ backgroundColor: "#FFF8F0" }} className="min-h-screen">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/" style={{ color: "#997E67" }} className="text-sm hover:underline">
                        Trang chủ
                    </Link>
                    <span style={{ color: "#997E67" }}>›</span>
                    <Link href="/customer/orders" style={{ color: "#997E67" }} className="text-sm hover:underline">
                        Đơn hàng của tôi
                    </Link>
                    <span style={{ color: "#997E67" }}>›</span>
                    <span className="text-sm font-semibold" style={{ color: "#664930" }}>
                        Đơn #{donHang.MaDH}
                    </span>
                </div>

                {/* Order header */}
                <div
                    className="rounded-2xl p-6 mb-6 flex items-center justify-between"
                    style={{ backgroundColor: "#FFDBBB" }}
                >
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: "#664930" }}>
                            Đơn #{donHang.MaDH}
                        </h1>
                        <p className="text-sm mt-1" style={{ color: "#997E67" }}>
                            Ngày đặt: {ngayDat}
                        </p>
                        {donHang.TenDVVC && (
                            <p className="text-sm mt-1" style={{ color: "#997E67" }}>
                                Đơn vị VC: {donHang.TenDVVC} {donHang.MaVanDon ? `(Mã: ${donHang.MaVanDon})` : ""}
                            </p>
                        )}
                    </div>
                    <span
                        className="text-sm px-4 py-1.5 rounded-full font-semibold"
                        style={{ backgroundColor: "#CCBEB1", color: trangThai.color }}
                    >
                        {trangThai.label}
                    </span>
                </div>

                {/* Chi tiết sản phẩm */}
                <div className="rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: "#FFDBBB" }}>
                    <div className="px-6 py-4 border-b" style={{ borderColor: "#CCBEB1" }}>
                        <h2 className="font-bold" style={{ color: "#664930" }}>Sản phẩm</h2>
                    </div>

                    {chiTiet.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between px-6 py-4 border-b last:border-b-0"
                            style={{ borderColor: "#CCBEB1" }}
                        >
                            <div>
                                <p className="font-semibold text-sm" style={{ color: "#664930" }}>
                                    {item.TenBanh}
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: "#997E67" }}>
                                    Size: {item.KichThuoc} · SL: {item.SoLuong}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs" style={{ color: "#997E67" }}>
                                    {Number(item.DonGia).toLocaleString("vi-VN")} ₫ × {item.SoLuong}
                                </p>
                                <p className="font-bold text-sm mt-0.5" style={{ color: "#664930" }}>
                                    {(Number(item.DonGia) * item.SoLuong).toLocaleString("vi-VN")} ₫
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tổng tiền */}
                <div
                    className="rounded-2xl px-6 py-4 flex items-center justify-between"
                    style={{ backgroundColor: "#CCBEB1" }}
                >
                    <span className="font-bold text-base" style={{ color: "#664930" }}>
                        Tổng tiền
                    </span>
                    <span className="font-bold text-lg" style={{ color: "#664930" }}>
                        {tongTien} ₫
                    </span>
                </div>

                {/* Back button */}
                <div className="mt-6">
                    <Link
                        href="/customer/orders"
                        className="text-sm hover:underline"
                        style={{ color: "#997E67" }}
                    >
                        ← Quay về danh sách đơn
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}