"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Hammer, Truck } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface DonHang {
    MaDH: number;
    NgayDat: string;
    TongTien: number;
    TenKhachHang: string | null;
    isReady?: boolean; // Từ backend
}

export default function DonChoSXPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"ChoXacNhan" | "DangLam">("ChoXacNhan");
    
    const [ordersChoXacNhan, setOrdersChoXacNhan] = useState<DonHang[]>([]);
    const [ordersDangLam, setOrdersDangLam] = useState<DonHang[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    async function fetchData() {
        setIsLoading(true);
        setSelectedIds(new Set());
        try {
            const token = localStorage.getItem("tiem_banh_token");
            if (activeTab === "ChoXacNhan") {
                const res = await fetch(`${API_URL}/api/admin/dashboard/donhang-cho-sx`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) setOrdersChoXacNhan(await res.json());
            } else {
                const res = await fetch(`${API_URL}/api/admin/dashboard/donhang-dang-lam`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) setOrdersDangLam(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    const currentOrders = activeTab === "ChoXacNhan" ? ordersChoXacNhan : ordersDangLam;

    const toggleSelect = (id: number) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleAll = () => {
        const validOrders = activeTab === "DangLam" ? currentOrders.filter(o => o.isReady) : currentOrders;
        if (selectedIds.size === validOrders.length && validOrders.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(validOrders.map(o => o.MaDH)));
        }
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
            fetchData();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDiDonHang() {
        if (selectedIds.size === 0) {
            alert("Vui lòng chọn ít nhất một đơn hàng");
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("tiem_banh_token");
            const res = await fetch(`${API_URL}/api/admin/dashboard/di-don-hang-sx`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ danhSachMaDH: Array.from(selectedIds) })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Lỗi đi đơn hàng");
            }

            alert("Đã đi đơn hàng thành công, đơn đã chuyển sang trạng thái Đang xử lý");
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
                
                {activeTab === "ChoXacNhan" ? (
                    <button
                        onClick={handleTaoLenh}
                        disabled={isSubmitting || selectedIds.size === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-[#C8A84B] text-white rounded-lg font-semibold hover:bg-[#B0923E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Hammer className="w-5 h-5" />
                        {isSubmitting ? "Đang xử lý..." : "Tạo lệnh sản xuất"}
                    </button>
                ) : (
                    <button
                        onClick={handleDiDonHang}
                        disabled={isSubmitting || selectedIds.size === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-[#4CAF50] text-white rounded-lg font-semibold hover:bg-[#43A047] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Truck className="w-5 h-5" />
                        {isSubmitting ? "Đang xử lý..." : "Đi đơn hàng"}
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-[#E8DCC4] mb-6">
                <button 
                    onClick={() => setActiveTab("ChoXacNhan")}
                    className={`px-4 py-3 font-semibold text-sm transition-colors relative ${activeTab === "ChoXacNhan" ? "text-[#C8A84B]" : "text-[#997E67] hover:text-[#5A3E1B]"}`}
                >
                    Đơn chờ xác nhận
                    {activeTab === "ChoXacNhan" && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-[#C8A84B]"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab("DangLam")}
                    className={`px-4 py-3 font-semibold text-sm transition-colors relative ${activeTab === "DangLam" ? "text-[#C8A84B]" : "text-[#997E67] hover:text-[#5A3E1B]"}`}
                >
                    Đơn đang sản xuất
                    {activeTab === "DangLam" && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-[#C8A84B]"></div>}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-[#E8DCC4] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F5F0E6] text-[#5A3E1B]">
                        <tr>
                            <th className="p-4 border-b border-[#E8DCC4] w-12 text-center">
                                <input
                                    type="checkbox"
                                    checked={
                                        currentOrders.length > 0 && 
                                        (activeTab === "DangLam" 
                                            ? currentOrders.filter(o => o.isReady).length > 0 && selectedIds.size === currentOrders.filter(o => o.isReady).length
                                            : selectedIds.size === currentOrders.length)
                                    }
                                    onChange={toggleAll}
                                    className="w-4 h-4 accent-[#C8A84B]"
                                />
                            </th>
                            <th className="p-4 border-b border-[#E8DCC4] font-semibold">Mã đơn</th>
                            <th className="p-4 border-b border-[#E8DCC4] font-semibold">Khách hàng</th>
                            <th className="p-4 border-b border-[#E8DCC4] font-semibold">Ngày đặt</th>
                            <th className="p-4 border-b border-[#E8DCC4] font-semibold">Tổng tiền</th>
                            {activeTab === "DangLam" && (
                                <th className="p-4 border-b border-[#E8DCC4] font-semibold">Trạng thái bánh</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={activeTab === "DangLam" ? 6 : 5} className="p-8 text-center text-[#997E67]">Đang tải...</td>
                            </tr>
                        ) : currentOrders.length === 0 ? (
                            <tr>
                                <td colSpan={activeTab === "DangLam" ? 6 : 5} className="p-8 text-center text-[#997E67]">
                                    {activeTab === "ChoXacNhan" ? "Không có đơn hàng nào chờ xác nhận." : "Không có đơn hàng nào đang sản xuất."}
                                </td>
                            </tr>
                        ) : (
                            currentOrders.map(order => {
                                const disabledSelect = activeTab === "DangLam" && !order.isReady;

                                return (
                                <tr key={order.MaDH} className="hover:bg-[#FCFAFC] transition-colors border-b border-[#E8DCC4] last:border-0">
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(order.MaDH)}
                                            onChange={() => toggleSelect(order.MaDH)}
                                            disabled={disabledSelect}
                                            className="w-4 h-4 accent-[#C8A84B] disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="p-4 font-semibold text-[#5A3E1B]">#{order.MaDH}</td>
                                    <td className="p-4 text-[#5A3E1B]">{order.TenKhachHang || "Khách vãng lai"}</td>
                                    <td className="p-4 text-[#5A3E1B]">{new Date(order.NgayDat).toLocaleString("vi-VN")}</td>
                                    <td className="p-4 font-bold text-[#5A3E1B]">{order.TongTien.toLocaleString("vi-VN")} ₫</td>
                                    {activeTab === "DangLam" && (
                                        <td className="p-4">
                                            {order.isReady ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                    Đã đủ bánh
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                                    Thiếu bánh
                                                </span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            )})
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
