"use client";

import { useState, useMemo, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from "recharts";
import { fetchDoanhThu, fetchDonHang, fetchTopSanPham } from "@/lib/api/dashboard";

type Filter = "Ngay" | "Tuan" | "Thang" | "Nam";

const fmt = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export default function DoanhThuPage() {
    const [filter, setFilter] = useState<Filter>("Thang");
    const [tableData, setTableData] = useState<{ label: string; soHD: number; TongTien: number }[]>([]);
    const [bestSeller, setBestSeller] = useState<{ ten: string; SoLuong: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const [dt, sp] = await Promise.all([
                    fetchDoanhThu(filter),
                    fetchTopSanPham(filter),
                ]);

                setTableData(
                    dt.map((r: any) => ({
                        label: new Date(r.ngay).toLocaleDateString("vi-VN"),
                        soHD: Number(r.soHD),
                        TongTien: Number(r.tongTien),
                    }))
                );

                setBestSeller(
                    sp.map((r: any) => ({ ten: r.TenBanh, SoLuong: Number(r.tongBan) }))
                );
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [filter]);

    const tongDoanhThu = useMemo(
        () => tableData.reduce((sum, item) => sum + item.TongTien, 0),
        [tableData]
    );

    return (
        <div className="flex h-full gap-2.5">

            {/* Cột lớn */}
            <div className="flex-1 flex flex-col gap-2.5 min-w-0 min-h-0">

                {/* Hàng 1 */}
                <div className="flex gap-2.5 shrink-0">
                    {/* Tổng + bộ lọc */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white rounded-2xl shadow-md px-6 py-4 min-w-62.5">
                            <p className="text-sm text-[#8a6040] font-medium">Tổng Doanh Thu</p>
                            <h2 className="text-2xl font-bold text-[#c8860a] mt-1">
                                {loading ? "..." : fmt(tongDoanhThu)}
                            </h2>
                        </div>

                        <div className="flex items-center gap-3 bg-white rounded-2xl shadow-md px-4 py-3">
                            {(["Ngay", "Tuan", "Thang", "Nam"] as Filter[]).map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setFilter(option)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === option
                                            ? "bg-[#c8860a] text-white"
                                            : "bg-[#f0e6d0] text-[#8a6040] hover:bg-[#e8d5b0]"
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="flex-1 rounded-2xl shadow-md px-5 py-4 min-h-0">
                        <p className="text-md font-medium text-[#8a6040] mb-3">Biểu Đồ Doanh Thu</p>
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={tableData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" tick={{ fill: "#8a6040", fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis tickFormatter={(v) => fmt(v)} tick={{ fill: "#8a6040", fontSize: 12 }} tickLine={false} axisLine={false} width={48} />
                                <Tooltip
                                    formatter={(v: number) => [fmt(v), "Doanh thu"]}
                                    contentStyle={{ borderRadius: "8px", borderColor: "#e8d5b0", fontSize: 12 }}
                                    cursor={{ fill: "rgba(200, 134, 10, 0.1)" }}
                                />
                                <Bar dataKey="TongTien" fill="#c8860a" radius={[4, 4, 0, 0]} maxBarSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Hàng 2 — Bảng */}
                <div className="flex-1 bg-white rounded-2xl shadow-md overflow-hidden min-h-0">
                    <div className="h-full overflow-auto">
                        {loading ? (
                            <p className="text-center py-10 text-sm text-[#8a6040]">Đang tải...</p>
                        ) : tableData.length === 0 ? (
                            <p className="text-center py-10 text-sm text-[#8a6040]">Chưa có dữ liệu trong khoảng thời gian này.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 z-10">
                                    <tr className="border-b border-[#f0e6d0] bg-[#fdf6e3]">
                                        <th className="text-left px-5 py-3 text-[#8a6040] font-semibold">Ngày</th>
                                        <th className="text-left px-5 py-3 text-[#8a6040] font-semibold">Số Hóa Đơn</th>
                                        <th className="text-left px-5 py-3 text-[#8a6040] font-semibold">Tổng Tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map((row) => (
                                        <tr key={row.label} className="border-b border-[#f5ead5] hover:bg-[#fdf6e3] transition-colors">
                                            <td className="px-5 py-3 text-[#3d1f0a]">{row.label}</td>
                                            <td className="px-5 py-3 text-[#3d1f0a]">{row.soHD}</td>
                                            <td className="px-5 py-3 text-[#3d1f0a] font-semibold">{fmt(row.TongTien)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Bán chạy */}
            <div className="w-1/5 bg-white rounded-2xl shadow-md overflow-hidden shrink-0">
                <div className="px-4 py-3 border-b border-[#e8d5b0] bg-[#fdf6e3]">
                    <h2 className="text-[#3d1f0a] font-bold text-base">Bán Chạy</h2>
                </div>
                <div className="overflow-auto">
                    {loading ? (
                        <p className="text-center py-6 text-sm text-[#8a6040]">Đang tải...</p>
                    ) : bestSeller.length === 0 ? (
                        <p className="text-center py-6 text-sm text-[#8a6040]">Chưa có dữ liệu.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#f0e6d0] bg-[#fdf6e3]">
                                    <th className="text-left px-4 py-3 text-[#8a6040] font-semibold">Tên</th>
                                    <th className="text-left px-4 py-3 text-[#8a6040] font-semibold">SL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bestSeller.map((row, i) => (
                                    <tr key={row.ten} className="border-b border-[#f5ead5] hover:bg-[#fdf6e3] transition-colors">
                                        <td className="px-4 py-3 text-[#3d1f0a]">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                    style={{ background: i === 0 ? "#f5c97a" : "#e8d5b0", color: "#3d1f0a" }}
                                                >
                                                    {i + 1}
                                                </span>
                                                {row.ten}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-[#3d1f0a] font-semibold">{row.SoLuong}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}