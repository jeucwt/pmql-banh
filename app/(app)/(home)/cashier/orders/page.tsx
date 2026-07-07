"use client";

import { useState, useEffect } from "react";
import { useRouteGuard } from "@/lib/useRouteGuard";
import Navbar from "../../navbar";
import { Footer } from "../../footer/footer";
import Link from "next/link";
import { Truck } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface DonHang {
    MaDH: number;
    NgayDat: string;
    TongTien: number;
    TrangThai: string;
    TenKhachHang: string | null;
}

interface DVVC {
    MaDVVC: number;
    TenDVVC: string;
}

export default function CashierOrdersPage() {
    const { loading } = useRouteGuard("cashier");
    const [orders, setOrders] = useState<DonHang[]>([]);
    const [dvvcs, setDvvcs] = useState<DVVC[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
    const [maDVVC, setMaDVVC] = useState<number | "">("");
    const [maVanDon, setMaVanDon] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("tiem_banh_token");
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch DVVC
            const resDvvc = await fetch(`${API_URL}/api/dvvc`, { headers });
            if (resDvvc.ok) setDvvcs(await resDvvc.json());

            // Fetch DonHang DangXuLy
            const resDh = await fetch(`${API_URL}/api/donhang/dangxuly`, { headers });
            if (resDh.ok) setOrders(await resDh.json());
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleAssignShipping(maDH: number) {
        if (!maDVVC || !maVanDon) {
            alert("Vui lòng chọn đơn vị vận chuyển và nhập mã vận đơn");
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem("tiem_banh_token");
            const res = await fetch(`${API_URL}/api/donhang/${maDH}/ship`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ maDVVC, maVanDon })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Lỗi cập nhật");
            }

            alert("Giao hàng thành công!");
            setSelectedOrder(null);
            setMaDVVC("");
            setMaVanDon("");
            fetchData();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return null;

    return (
        <div style={{ backgroundColor: "#FFF8F0" }} className="min-h-screen">
            <Navbar />
            <main className="max-w-5xl mx-auto px-6 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/cashier" className="text-sm hover:underline" style={{ color: "#997E67" }}>Thu ngân</Link>
                    <span style={{ color: "#997E67" }}>›</span>
                    <span className="text-sm font-semibold" style={{ color: "#664930" }}>Giao hàng</span>
                </div>

                <h1 className="text-2xl font-bold mb-6" style={{ color: "#664930" }}>Quản lý giao hàng</h1>

                {isLoading ? (
                    <p className="text-center text-[#997E67] py-10">Đang tải...</p>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20">
                        <Truck className="w-12 h-12 text-[#997E67] mx-auto mb-4 opacity-50" />
                        <p className="text-[#997E67]">Không có đơn hàng nào cần giao lúc này.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {orders.map(order => (
                            <div key={order.MaDH} className="bg-white rounded-2xl p-5 shadow-sm border border-[#CCBEB1]">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-bold text-lg" style={{ color: "#664930" }}>Đơn #{order.MaDH}</p>
                                        <p className="text-sm mt-1" style={{ color: "#997E67" }}>Khách: {order.TenKhachHang || "Khách hàng"}</p>
                                        <p className="text-sm" style={{ color: "#997E67" }}>Tổng tiền: {order.TongTien.toLocaleString("vi-VN")} ₫</p>
                                        <p className="text-xs mt-1" style={{ color: "#997E67" }}>{new Date(order.NgayDat).toLocaleString("vi-VN")}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                                        Đang xử lý
                                    </span>
                                </div>

                                {selectedOrder === order.MaDH ? (
                                    <div className="mt-4 p-4 bg-[#FFF8F0] rounded-xl border border-[#CCBEB1]">
                                        <p className="text-sm font-semibold mb-3" style={{ color: "#664930" }}>Nhập thông tin giao hàng</p>
                                        <select
                                            value={maDVVC}
                                            onChange={e => setMaDVVC(Number(e.target.value))}
                                            className="w-full mb-3 p-2.5 rounded-lg border border-[#CCBEB1] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#664930]"
                                            style={{ color: "#664930" }}
                                        >
                                            <option value="">-- Chọn ĐVVC --</option>
                                            {dvvcs.map(dv => (
                                                <option key={dv.MaDVVC} value={dv.MaDVVC}>{dv.TenDVVC}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Mã vận đơn..."
                                            value={maVanDon}
                                            onChange={e => setMaVanDon(e.target.value)}
                                            className="w-full mb-4 p-2.5 rounded-lg border border-[#CCBEB1] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#664930]"
                                            style={{ color: "#664930" }}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedOrder(null)}
                                                className="flex-1 py-2 text-sm font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                onClick={() => handleAssignShipping(order.MaDH)}
                                                disabled={submitting}
                                                className="flex-1 py-2 text-sm font-semibold rounded-lg text-white hover:opacity-90 disabled:opacity-50"
                                                style={{ backgroundColor: "#664930" }}
                                            >
                                                {submitting ? "Đang lưu..." : "Xác nhận"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setSelectedOrder(order.MaDH);
                                            setMaDVVC("");
                                            setMaVanDon("");
                                        }}
                                        className="w-full py-2.5 rounded-xl font-semibold text-sm mt-2 transition-all"
                                        style={{ backgroundColor: "#FFDBBB", color: "#664930" }}
                                    >
                                        Giao cho ĐVVC
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
