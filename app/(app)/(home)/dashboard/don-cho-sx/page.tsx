"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Hammer } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface DonHang {
    MaDH: number;
    NgayDat: string;
    TongTien: number;
    TenKhachHang: string | null;
}

export default function DonChoSXPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<DonHang[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("tiem_banh_token");
            const res = await fetch(`${API_URL}/api/admin/dashboard/donhang-cho-sx`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setOrders(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    const toggleSelect = (id: number) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleAll = () => {
        if (selectedIds.size === orders.length) setSelectedIds(newSet => new Set());
        else setSelectedIds(new Set(orders.map(o => o.MaDH)));
    };

    async function handleTaoLenh() {
        if (selectedIds.size === 0) {
            alert("Vui lòng chọn ít nhất một đơn hàng");
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("tiem_banh_token");
            const res = await fetch(`${API_URL}/api/admin/dashboard/tao-lenh-sx`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ danhSachMaDH: Array.from(selectedIds) })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Lỗi cập nhật");
            }

            alert("Đã chuyển các đơn hàng sang trạng thái Đang làm");
            setSelectedIds(new Set());
            fetchData();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-[#5A3E1B]">Đơn chờ sản xuất</h1>
                <button
                    onClick={handleTaoLenh}
                    disabled={isSubmitting || selectedIds.size === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-[#C8A84B] text-white rounded-lg font-semibold hover:bg-[#B0923E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Hammer className="w-5 h-5" />
                    {isSubmitting ? "Đang xử lý..." : "Tạo lệnh sản xuất"}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-[#E8DCC4] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F5F0E6] text-[#5A3E1B]">
                        <tr>
                            <th className="p-4 border-b border-[#E8DCC4] w-12 text-center">
                                <input
                                    type="checkbox"
                                    checked={orders.length > 0 && selectedIds.size === orders.length}
                                    onChange={toggleAll}
                                    className="w-4 h-4 accent-[#C8A84B]"
                                />
                            </th>
                            <th className="p-4 border-b border-[#E8DCC4] font-semibold">Mã đơn</th>
                            <th className="p-4 border-b border-[#E8DCC4] font-semibold">Khách hàng</th>
                            <th className="p-4 border-b border-[#E8DCC4] font-semibold">Ngày đặt</th>
                            <th className="p-4 border-b border-[#E8DCC4] font-semibold">Tổng tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-[#997E67]">Đang tải...</td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-[#997E67]">Không có đơn hàng nào chờ sản xuất.</td>
                            </tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order.MaDH} className="hover:bg-[#FCFAFC] transition-colors border-b border-[#E8DCC4] last:border-0">
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(order.MaDH)}
                                            onChange={() => toggleSelect(order.MaDH)}
                                            className="w-4 h-4 accent-[#C8A84B]"
                                        />
                                    </td>
                                    <td className="p-4 font-semibold text-[#5A3E1B]">#{order.MaDH}</td>
                                    <td className="p-4 text-[#5A3E1B]">{order.TenKhachHang || "Khách vãng lai"}</td>
                                    <td className="p-4 text-[#5A3E1B]">{new Date(order.NgayDat).toLocaleString("vi-VN")}</td>
                                    <td className="p-4 font-bold text-[#5A3E1B]">{order.TongTien.toLocaleString("vi-VN")} ₫</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
