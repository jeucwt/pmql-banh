"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Plus,
    X,
    Factory,
    AlertTriangle,
    Trash2,
    ChevronRight,
    Loader2,
} from "lucide-react";

const API_SANXUAT = "http://localhost:3001/api/admin/sanxuat";
const API_BANH = "http://localhost:3001/api/banh";

// ─── Types ──────────────────────────────────────────────────────────────────
interface PhieuApi {
    MaPSX: number;
    MaNV: number;
    NgaySanXuat: string;
    TrangThai: "ChoSanXuat" | "DangSanXuat" | "HoanThanh" | "DaHuy";
    TenNV: string | null;
    SoDongChiTiet: number;
}

interface ChiTietApi {
    MaPSX: number;
    MaBanh: number;
    SoLuong: number;
    SoLuongHoanThanh: number;
    TenBanh: string;
}

interface PhieuChiTietApi extends Omit<PhieuApi, "SoDongChiTiet"> {
    ChiTiet: ChiTietApi[];
}

interface BanhOption {
    MaBanh: number;
    TenBanh: string;
}

interface NguyenLieuThieu {
    TenNL: string;
    CanDung: number;
    SoLuongTon: number;
}

const TRANG_THAI_LABEL: Record<PhieuApi["TrangThai"], { label: string; color: string; bg: string }> = {
    ChoSanXuat: { label: "Chờ sản xuất", color: "text-yellow-600", bg: "bg-yellow-50" },
    DangSanXuat: { label: "Đang sản xuất", color: "text-blue-600", bg: "bg-blue-50" },
    HoanThanh: { label: "Hoàn thành", color: "text-green-600", bg: "bg-green-50" },
    DaHuy: { label: "Đã hủy", color: "text-red-600", bg: "bg-red-50" },
};

const fmtDate = (s: string) =>
    new Date(s).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

// ─── Main Page ────────────────────────────────────────────────────────────
export default function SanXuatPage() {
    const [phieus, setPhieus] = useState<PhieuApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [detail, setDetail] = useState<PhieuChiTietApi | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [actionError, setActionError] = useState("");
    const [thieuNL, setThieuNL] = useState<NguyenLieuThieu[] | null>(null);

    const [showAdd, setShowAdd] = useState(false);
    const [banhOptions, setBanhOptions] = useState<BanhOption[]>([]);
    const [addItems, setAddItems] = useState<{ maBanh: number; soLuong: number }[]>([]);
    const [saving, setSaving] = useState(false);

    function getToken() {
        return localStorage.getItem("tiem_banh_token");
    }
    function authHeaders() {
        return { Authorization: `Bearer ${getToken()}` };
    }

    async function fetchPhieus() {
        try {
            setLoading(true);
            setError("");
            const res = await fetch(API_SANXUAT, { headers: authHeaders() });
            if (!res.ok) throw new Error("Không thể tải danh sách phiếu sản xuất");
            setPhieus(await res.json());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void fetchPhieus();
    }, []);

    // ── Detail modal ──
    async function openDetail(maPSX: number) {
        setDetailLoading(true);
        setActionError("");
        setThieuNL(null);
        try {
            const res = await fetch(`${API_SANXUAT}/${maPSX}`, { headers: authHeaders() });
            if (!res.ok) throw new Error("Không thể tải chi tiết phiếu");
            setDetail(await res.json());
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        } finally {
            setDetailLoading(false);
        }
    }

    async function chuyenTrangThai(maPSX: number, trangThai: string) {
        setActionError("");
        setThieuNL(null);
        try {
            const res = await fetch(`${API_SANXUAT}/${maPSX}/trangthai`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify({ trangThai }),
            });
            const data = await res.json();
            if (res.status === 422) {
                setThieuNL(data.thieu || []);
                return;
            }
            if (!res.ok) throw new Error(data.message || "Không thể chuyển trạng thái");
            await fetchPhieus();
            if (detail) await openDetail(maPSX);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        }
    }

    // ── Add modal ──
    async function openAdd() {
        setAddItems([{ maBanh: 0, soLuong: 1 }]);
        setShowAdd(true);
        if (banhOptions.length === 0) {
            try {
                const res = await fetch(API_BANH);
                if (res.ok) {
                    const data = await res.json();
                    setBanhOptions(data.map((b: any) => ({ MaBanh: b.MaBanh, TenBanh: b.TenBanh })));
                }
            } catch {
                // im lặng — modal vẫn dùng được, chỉ là select trống
            }
        }
    }

    function updateItem(idx: number, patch: Partial<{ maBanh: number; soLuong: number }>) {
        setAddItems((items) => items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
    }

    async function saveAdd() {
        const valid = addItems.filter((it) => it.maBanh > 0 && it.soLuong > 0);
        if (valid.length === 0) return;
        setSaving(true);
        try {
            const res = await fetch(API_SANXUAT, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify({
                    maNV: 1,
                    danhSachBanh: valid.map((it) => ({ maBanh: it.maBanh, soLuong: it.soLuong })),
                }),
            });
            if (!res.ok) throw new Error("Không thể tạo phiếu sản xuất");
            setShowAdd(false);
            await fetchPhieus();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        } finally {
            setSaving(false);
        }
    }

    const sorted = useMemo(
        () => [...phieus].sort((a, b) => new Date(b.NgaySanXuat).getTime() - new Date(a.NgaySanXuat).getTime()),
        [phieus]
    );

    if (loading) {
        return <p className="text-sm text-[#8a6040]">Đang tải phiếu sản xuất...</p>;
    }

    return (
        <div className="flex flex-col gap-4 h-full">

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5">
                    {error}
                </div>
            )}

            {/* ── Toolbar ── */}
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold text-[#3d1f0a]">Phiếu sản xuất</h1>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#c8860a] text-white text-sm font-medium rounded-xl shadow-sm hover:bg-[#b5780a] transition-colors"
                >
                    <Plus size={15} />
                    Tạo phiếu mới
                </button>
            </div>

            {/* ── List ── */}
            <div className="flex-1 overflow-auto bg-white rounded-2xl shadow-md">
                {sorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#8a6040] gap-2 py-16">
                        <Factory className="w-10 h-10 opacity-30" />
                        <p className="text-sm">Chưa có phiếu sản xuất nào</p>
                    </div>
                ) : (
                    <table className="w-full border-collapse text-sm">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-[#fdf6e3] border-b border-[#e8d5b0]">
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#8a6040]">Mã phiếu</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#8a6040]">Ngày lập</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#8a6040]">Nhân viên</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#8a6040]">Số dòng SP</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#8a6040]">Trạng thái</th>
                                <th className="px-4 py-2.5 w-8"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((p, idx) => {
                                const t = TRANG_THAI_LABEL[p.TrangThai];
                                return (
                                    <tr
                                        key={p.MaPSX}
                                        onClick={() => openDetail(p.MaPSX)}
                                        className={`border-b border-[#e8d5b0]/60 hover:bg-[#fdf6e3] cursor-pointer transition-colors ${idx % 2 === 0 ? "" : "bg-[#fdf6e3]/40"}`}
                                    >
                                        <td className="px-4 py-2.5 font-medium text-[#3d1f0a]">#{p.MaPSX}</td>
                                        <td className="px-4 py-2.5 text-[#8a6040] text-xs whitespace-nowrap">{fmtDate(p.NgaySanXuat)}</td>
                                        <td className="px-4 py-2.5 text-[#8a6040]">{p.TenNV || `NV #${p.MaNV}`}</td>
                                        <td className="px-4 py-2.5 text-[#8a6040]">{p.SoDongChiTiet}</td>
                                        <td className="px-4 py-2.5">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.bg} ${t.color}`}>
                                                {t.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-[#8a6040]"><ChevronRight size={16} /></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ── Detail Modal ── */}
            {(detail || detailLoading) && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8d5b0] shrink-0">
                            <h2 className="font-bold text-[#3d1f0a] text-base">
                                {detail ? `Phiếu sản xuất #${detail.MaPSX}` : "Đang tải..."}
                            </h2>
                            <button
                                onClick={() => { setDetail(null); setActionError(""); setThieuNL(null); }}
                                className="p-1 rounded-lg hover:bg-[#f5ede0] text-[#8a6040]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="px-6 py-4 overflow-auto flex-1">
                            {detailLoading && (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-5 h-5 animate-spin text-[#c8860a]" />
                                </div>
                            )}

                            {detail && !detailLoading && (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-[#8a6040]">
                                            Ngày lập: <span className="font-medium text-[#3d1f0a]">{fmtDate(detail.NgaySanXuat)}</span>
                                        </span>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TRANG_THAI_LABEL[detail.TrangThai].bg} ${TRANG_THAI_LABEL[detail.TrangThai].color}`}>
                                            {TRANG_THAI_LABEL[detail.TrangThai].label}
                                        </span>
                                    </div>

                                    {actionError && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2">
                                            {actionError}
                                        </div>
                                    )}

                                    {thieuNL && thieuNL.length > 0 && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2.5 flex flex-col gap-1.5">
                                            <span className="flex items-center gap-1.5 text-orange-600 text-xs font-semibold">
                                                <AlertTriangle size={13} />
                                                Không đủ nguyên liệu
                                            </span>
                                            {thieuNL.map((nl, i) => (
                                                <p key={i} className="text-xs text-orange-700">
                                                    {nl.TenNL}: cần {nl.CanDung.toLocaleString()}, còn {nl.SoLuongTon.toLocaleString()}
                                                </p>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs font-semibold text-[#8a6040]">Danh sách sản phẩm</p>
                                        {detail.ChiTiet.map((ct, i) => (
                                            <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#fdf6e3] rounded-xl text-sm">
                                                <span className="text-[#3d1f0a] font-medium">{ct.TenBanh}</span>
                                                <span className="text-[#8a6040] text-xs">
                                                    {ct.SoLuongHoanThanh}/{ct.SoLuong}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {detail && !detailLoading && (
                            <div className="flex items-center gap-2 px-6 py-4 border-t border-[#e8d5b0] shrink-0">
                                {detail.TrangThai === "ChoSanXuat" && (
                                    <>
                                        <button
                                            onClick={() => chuyenTrangThai(detail.MaPSX, "DaHuy")}
                                            className="px-4 py-2 text-sm rounded-xl bg-[#f0e6d0] text-[#8a6040] hover:bg-[#e8d5b0] font-medium transition-colors"
                                        >
                                            Hủy phiếu
                                        </button>
                                        <button
                                            onClick={() => chuyenTrangThai(detail.MaPSX, "DangSanXuat")}
                                            className="flex-1 py-2 text-sm rounded-xl bg-[#c8860a] text-white font-medium hover:bg-[#b5780a] transition-colors"
                                        >
                                            Bắt đầu sản xuất
                                        </button>
                                    </>
                                )}
                                {detail.TrangThai === "DangSanXuat" && (
                                    <>
                                        <button
                                            onClick={() => chuyenTrangThai(detail.MaPSX, "DaHuy")}
                                            className="px-4 py-2 text-sm rounded-xl bg-[#f0e6d0] text-[#8a6040] hover:bg-[#e8d5b0] font-medium transition-colors"
                                        >
                                            Hủy phiếu
                                        </button>
                                        <button
                                            onClick={() => chuyenTrangThai(detail.MaPSX, "HoanThanh")}
                                            className="flex-1 py-2 text-sm rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
                                        >
                                            Hoàn thành
                                        </button>
                                    </>
                                )}
                                {(detail.TrangThai === "HoanThanh" || detail.TrangThai === "DaHuy") && (
                                    <button
                                        onClick={() => { setDetail(null); setActionError(""); setThieuNL(null); }}
                                        className="flex-1 py-2 text-sm rounded-xl bg-[#f0e6d0] text-[#8a6040] hover:bg-[#e8d5b0] font-medium transition-colors"
                                    >
                                        Đóng
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Add Modal ── */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8d5b0]">
                            <h2 className="font-bold text-[#3d1f0a] text-base">Tạo phiếu sản xuất</h2>
                            <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-[#f5ede0] text-[#8a6040]">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="px-6 py-4 flex flex-col gap-3 max-h-[50vh] overflow-auto">
                            {addItems.map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <select
                                        value={item.maBanh}
                                        onChange={(e) => updateItem(idx, { maBanh: Number(e.target.value) })}
                                        className="flex-1 px-3 py-2 text-sm border border-[#e8d5b0] rounded-xl bg-[#fdf6e3] focus:outline-none focus:ring-1 focus:ring-[#c8860a] text-[#3d1f0a]"
                                    >
                                        <option value={0}>Chọn bánh...</option>
                                        {banhOptions.map((b) => (
                                            <option key={b.MaBanh} value={b.MaBanh}>{b.TenBanh}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        min={1}
                                        value={item.soLuong}
                                        onChange={(e) => updateItem(idx, { soLuong: Number(e.target.value) })}
                                        className="w-20 px-3 py-2 text-sm border border-[#e8d5b0] rounded-xl bg-[#fdf6e3] focus:outline-none focus:ring-1 focus:ring-[#c8860a] text-[#3d1f0a]"
                                    />
                                    <button
                                        onClick={() => setAddItems((items) => items.filter((_, i) => i !== idx))}
                                        disabled={addItems.length === 1}
                                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#8a6040] hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => setAddItems((items) => [...items, { maBanh: 0, soLuong: 1 }])}
                                className="text-xs text-[#c8860a] hover:underline self-start"
                            >
                                + Thêm sản phẩm
                            </button>
                        </div>

                        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#e8d5b0]">
                            <button
                                onClick={() => setShowAdd(false)}
                                className="px-4 py-2 text-sm rounded-xl bg-[#f0e6d0] text-[#8a6040] hover:bg-[#e8d5b0] transition-colors font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={saveAdd}
                                disabled={saving || addItems.every((it) => it.maBanh === 0)}
                                className="px-4 py-2 text-sm rounded-xl bg-[#c8860a] text-white font-medium hover:bg-[#b5780a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving && <Loader2 size={14} className="animate-spin" />}
                                Tạo phiếu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}