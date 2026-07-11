"use client";

import { useState, useMemo, useEffect } from "react";
import { SearchIcon, Plus, X, ChefHat, Package } from "lucide-react";

const API_BANH_ADMIN = "http://localhost:3001/api/admin/banh";

// ── Types ──────────────────────────────────────────────────
type Category = "Tất cả" | "Bánh Mì" | "Bánh Kem";

interface BanhApi {
    MaBanh: number;
    TenBanh: string;
    SoLuong: number;
    MoTa: string;
    MaLoai: number;
    TenLoai: string;
    TrangThaiBanh: string;
    HinhAnh: string | null;
    NgaySanXuat: string | null;
    congThucList: { maNL: number, dinhLuong: number }[];
    sizes: {
        MaSize: number;
        KichThuoc: string;
        GiaTien: number;
    }[];
}

interface SanPham {
    id: number;
    ten: string;
    moTa: string;
    
    soLuong: number;
    giaTu: number;
    ngaySanXuat: string | null,
    category: Exclude<Category, "Tất cả">;
    trangThaiBanh: string;
    sizes: BanhApi["sizes"];
    // ảnh placeholder dùng màu nền
    mauNen: string;
    hinhAnh: string | null;
}

function normalizeSizes(sizes: BanhApi["sizes"] | string | null): BanhApi["sizes"] {
    if (Array.isArray(sizes)) return sizes;
    if (typeof sizes === "string") {
        try {
            const parsed = JSON.parse(sizes);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
}

function mapBanhApiToSanPham(banh: BanhApi): SanPham {
    const sizes = normalizeSizes(banh.sizes);

    return {
        id: banh.MaBanh,
        ten: banh.TenBanh,
        moTa: banh.MoTa || "",
        
        soLuong: banh.SoLuong ?? 0,
        ngaySanXuat: banh.NgaySanXuat || null,
        giaTu: sizes.length > 0 ? Math.min(...sizes.map((size) => Number(size.GiaTien) || 0)) : 0,
        category: banh.TenLoai === "Bánh Kem" ? "Bánh Kem" : "Bánh Mì",
        trangThaiBanh: banh.TrangThaiBanh,
        sizes,
        mauNen: banh.TenLoai === "Bánh Kem" ? "#ffd6d6" : "#f5deb3",
        hinhAnh: banh.HinhAnh || null,
    };
}

interface KhoApi {
    MaNL: number;
    TenNL: string;
    DonViTinh: string;
}

interface FormData {
    ten: string;
    moTa: string;
    
    soLuong?: number,
    ngaySanXuat?: string,
    kichThuoc?: string;
    giaTien?: number;
    trangThaiBanh: string;
    congThucList: { maNL: number, dinhLuong: number }[];
    sizes: {
        kichThuoc: string;
        giaTien: number
    }[];
    hinhAnhUrl?: string;
    fileAnh?: File | null;
}


const CATEGORIES: Category[] = ["Tất cả", "Bánh Mì", "Bánh Kem"];

// ── Component ──────────────────────────────────────────────
export default function QuanLiSanPhamPage() {
    const [danhSach, setDanhSach] = useState<SanPham[]>([]);
    const [nguyenLieuList, setNguyenLieuList] = useState<KhoApi[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("")
    const [category, setCategory] = useState<Category>("Tất cả");

    // Modal cập nhật
    const [editTarget, setEditTarget] = useState<SanPham | null>(null);
    const [editForm, setEditForm] = useState<FormData>({
        ten: "",
        moTa: "",
        
        kichThuoc: "M",
        giaTien: 0,
        trangThaiBanh: "dang_ban",
        sizes: [],
        congThucList: [],
    });

    // Modal thêm mới
    const [showAdd, setShowAdd] = useState(false);
    const [addForm, setAddForm] = useState<
        FormData & {
            category: Exclude<Category, "Tất cả">;
            soLuong: number;
            kichThuoc: string;
            giaTien: number;
        }
    >({
        ten: "",
        moTa: "",
        
        trangThaiBanh: "dang_ban",
        category: "Bánh Mì",
        soLuong: 0,
        kichThuoc: "M",
        giaTien: 0,
        sizes: [],
        congThucList: [],
        fileAnh: null
    });

    function getToken() {
        return localStorage.getItem("tiem_banh_token");
    }

    async function fetchDanhSachBanh() {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(API_BANH_ADMIN, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            if (!res.ok) {
                throw new Error("Không thể tải danh sách bánh");
            }

            
            const resKho = await fetch("http://localhost:3001/api/admin/kho", {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (resKho.ok) {
                setNguyenLieuList(await resKho.json());
            }

            const data: BanhApi[] = await res.json();

            setDanhSach(data.map(mapBanhApiToSanPham));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void fetchDanhSachBanh();
    }, []);

    // ── Filter ─────────────────────────────────────────────
    const filtered = useMemo(() => {
        return danhSach
            .filter((sp) =>
                (category === "Tất cả" || sp.category === category) &&
                sp.ten.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a, b) => a.ten.localeCompare(b.ten, "vi"));
    }, [danhSach, category, search]);

    // ── Handlers ───────────────────────────────────────────
    async function openEdit(sp: SanPham) {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/admin/congthuc/${sp.id}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            const congThucData = res.ok ? await res.json() : [];
            const firstSize = sp.sizes[0];
            setEditTarget(sp);
            setEditForm({
                ten: sp.ten,
                moTa: sp.moTa,
                kichThuoc:
                    (firstSize && ((firstSize as any).KichThuoc ?? (firstSize as any).kichThuoc)) ||
                    "M",
                giaTien: Number(
                    (firstSize && ((firstSize as any).GiaTien ?? (firstSize as any).giaTien)) ?? 0
                ),
                trangThaiBanh: sp.trangThaiBanh || "dang_ban",
                sizes: (sp.sizes || []).map((s) => ({
                    kichThuoc: (s as any).KichThuoc ?? (s as any).kichThuoc ?? "",
                    giaTien: Number((s as any).GiaTien ?? (s as any).giaTien ?? 0),
                })),
                congThucList: congThucData.map((ct: any) => ({ maNL: ct.MaNL, dinhLuong: ct.DinhLuong })),
                hinhAnhUrl: sp.hinhAnh || undefined,
                fileAnh: null
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function uploadImage(file: File) {
        const formData = new window.FormData();
        formData.append("hinhAnh", file);
        const res = await fetch("http://localhost:3001/api/admin/banh/upload", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
            body: formData,
        });
        if (!res.ok) throw new Error("Upload ảnh thất bại");
        const data = await res.json();
        return data.url;
    }

    async function saveEdit() {
        if (!editTarget) return;
        try {
            let hinhAnh = editForm.hinhAnhUrl;
            if (editForm.fileAnh) {
                hinhAnh = await uploadImage(editForm.fileAnh);
            }

            const res = await fetch(`${API_BANH_ADMIN}/${editTarget.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                    tenBanh: editForm.ten,
                    moTa: editForm.moTa,
                    maLoai: editTarget.category === "Bánh Kem" ? 2 : 1,
                    trangThaiBanh: editForm.trangThaiBanh,
                    hinhAnh: hinhAnh,
                    sizes: editForm.sizes.map((s) => ({
                        kichThuoc: s.kichThuoc,
                        giaTien: Number(s.giaTien),
                    })),
                }),
            });
        
        if (res.ok) {
            await fetch(`http://localhost:3001/api/admin/congthuc/${editTarget.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({ nguyenLieu: editForm.congThucList })
            });
        }

        if (!res.ok) {
            setError("Không thể cập nhật bánh");
            return;
            return;
        }
        setEditTarget(null);
        await fetchDanhSachBanh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        }
    }

    async function saveAdd() {
        try {
            let hinhAnh = undefined;
            if (addForm.fileAnh) {
                hinhAnh = await uploadImage(addForm.fileAnh);
            }

            const res = await fetch(API_BANH_ADMIN, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                    tenBanh: addForm.ten,
                    moTa: addForm.moTa,
                    maLoai: addForm.category === "Bánh Kem" ? 2 : 1,
                    trangThaiBanh: addForm.trangThaiBanh,
                    hinhAnh: hinhAnh,
                    sizes: [
                        {
                            kichThuoc: addForm.kichThuoc,
                            giaTien: Number(addForm.giaTien),
                        },
                    ],
                }),
            });
            if (res.ok) {
                const { maBanh } = await res.json();
                await fetch(`http://localhost:3001/api/admin/congthuc/${maBanh}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
                    body: JSON.stringify({ nguyenLieu: addForm.congThucList })
                });
            } else {
                setError("Không thể thêm bánh");
                return;
            }
            setShowAdd(false);
            setAddForm({ ten: "", moTa: "", kichThuoc: "M", giaTien: 0, category: "Bánh Mì", soLuong: 0, trangThaiBanh: "dang_ban", sizes: [], congThucList: [], fileAnh: null });
            await fetchDanhSachBanh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        }
    }

    async function stopSelling(sp: SanPham) {
        const res = await fetch(`${API_BANH_ADMIN}/${sp.id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });
        if (!res.ok) {
            setError("Không thể ngừng bán bánh");
            return;
        }
        await fetchDanhSachBanh();
    }

    // ── Render ─────────────────────────────────────────────
    if (loading) {
        return <p className="text-sm text-[#8a6040]">Đang tải sản phẩm...</p>;
    }

    if (error) {
        return <p className="text-sm text-red-600">{error}</p>;
    }


    return (
        <div className="flex flex-col h-full gap-3 min-h-0">

            {/* Search + Categories */}
            <div className="bg-white rounded-2xl shadow-md px-5 py-4 shrink-0 flex flex-col gap-3">
                {/* Search bar */}
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a6040]" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-[#e8d5b0] rounded-xl text-[#3d1f0a] placeholder:text-[#b0906a] focus:outline-none focus:ring-1 focus:ring-[#c8860a] bg-[#fdf6e3]"
                    />
                </div>

                {/* Categories */}
                <div className="flex gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${category === cat
                                ? "bg-[#c8860a] text-white"
                                : "bg-[#f0e6d0] text-[#8a6040] hover:bg-[#e8d5b0]"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid sản phẩm */}
            <div className="flex-1 overflow-auto min-h-0">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#8a6040] gap-2">
                        <Package className="w-10 h-10 opacity-30" />
                        <p className="text-sm">Không tìm thấy sản phẩm</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-3">
                        {filtered.map((sp) => (
                            <div
                                key={sp.id}
                                className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col"
                            >
                                {/* Ảnh placeholder */}
                                {sp.hinhAnh ? (
                                    <img 
                                        src={`http://localhost:3001${sp.hinhAnh}`} 
                                        alt={sp.ten} 
                                        className="h-36 w-full object-cover shrink-0"
                                    />
                                ) : (
                                    <div
                                        className="h-36 flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: sp.mauNen }}
                                    >
                                        <ChefHat className="w-10 h-10 text-white opacity-60" />
                                    </div>
                                )}

                                {/* Info */}
                                <div className="px-4 py-3 flex flex-col gap-1 flex-1">
                                    <p className="text-sm font-semibold text-[#3d1f0a] leading-tight truncate">
                                        {sp.ten}
                                    </p>
                                    <p className="text-xs text-[#8a6040] line-clamp-2 leading-relaxed">
                                        {sp.moTa}
                                    </p>
                                    <p className="text-xs text-[#b0906a] mt-auto pt-1">
                                        Giá từ:{" "}
                                        <span className="font-semibold text-[#c8860a]">{sp.giaTu.toLocaleString("vi-VN")}đ</span>
                                    </p>
                                                                        <p className="text-xs text-[#8a6040]">                                        Tồn kho: <span className="font-semibold">{sp.soLuong}</span>                                    </p>
                                    <p className="text-[11px] text-[#8a6040]">
                                        Trạng thái:{" "}
                                        <span className="font-semibold">
                                            {sp.trangThaiBanh === "dang_ban" ? "Đang bán" : "Ngừng bán"}
                                        </span>
                                    </p>
                                </div>

                                {/* Button cập nhật */}
                                <div className="px-4 pb-3 grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => openEdit(sp)}
                                        className="py-1.5 text-xs font-medium rounded-lg border border-[#e8d5b0] text-[#8a6040] hover:bg-[#fdf6e3] transition-colors"
                                    >
                                        Cập nhật
                                    </button>
                                    <button
                                        onClick={() => stopSelling(sp)}
                                        disabled={sp.trangThaiBanh === "ngung_ban"}
                                        className="py-1.5 text-xs font-medium rounded-lg border border-[#e8d5b0] text-[#8a6040] hover:bg-[#fdf6e3] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Ngừng bán
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Button thêm mẫu bánh */}
            <div className="shrink-0 flex justify-end">
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#c8860a] text-white text-sm font-semibold rounded-xl shadow-md hover:bg-[#a86e08] transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Thêm mẫu bánh
                </button>
            </div>

            {/* ── Modal Cập nhật ── */}
            {editTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-[#fdf6e3] border-b border-[#e8d5b0]">
                            <h3 className="font-bold text-[#3d1f0a]">Cập nhật sản phẩm</h3>
                            <button onClick={() => setEditTarget(null)}>
                                <X className="w-5 h-5 text-[#8a6040] hover:text-[#3d1f0a]" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="px-6 py-5 flex flex-col gap-4">
                            <Field label="Hình ảnh">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setEditForm({ ...editForm, fileAnh: file });
                                    }}
                                    className={inputCls + " file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#f0e6d0] file:text-[#8a6040] hover:file:bg-[#e8d5b0]"}
                                />
                                {(editForm.fileAnh || editForm.hinhAnhUrl) && (
                                    <div className="mt-2 h-20 w-20 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                        <img 
                                            src={editForm.fileAnh ? URL.createObjectURL(editForm.fileAnh) : `http://localhost:3001${editForm.hinhAnhUrl}`} 
                                            alt="Preview" 
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                            </Field>
                            <Field label="Tên bánh">
                                <input
                                    value={editForm.ten}
                                    onChange={(e) => setEditForm({ ...editForm, ten: e.target.value })}
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="Mô tả">
                                <textarea
                                    rows={3}
                                    value={editForm.moTa}
                                    onChange={(e) => setEditForm({ ...editForm, moTa: e.target.value })}
                                    className={inputCls + " resize-none"}
                                />
                            </Field>
                            <Field label="Trạng thái">
                                <select
                                    value={editForm.trangThaiBanh}
                                    onChange={(e) => setEditForm({ ...editForm, trangThaiBanh: e.target.value })}
                                    className={inputCls}
                                >
                                    <option value="dang_ban">Đang bán</option>
                                    <option value="ngung_ban">Ngừng bán</option>
                                </select>
                            </Field>
                            
                            
                            <Field label="Công thức">
                                {editForm.congThucList.map((ct, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <select
                                            value={ct.maNL}
                                            onChange={(e) => {
                                                const next = [...editForm.congThucList];
                                                next[i].maNL = Number(e.target.value);
                                                setEditForm({ ...editForm, congThucList: next });
                                            }}
                                            className={inputCls + " flex-1"}
                                        >
                                            <option value={0} disabled>Chọn nguyên liệu</option>
                                            {nguyenLieuList.map((nl) => (
                                                <option key={nl.MaNL} value={nl.MaNL}>{nl.TenNL} ({nl.DonViTinh})</option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            value={ct.dinhLuong}
                                            onChange={(e) => {
                                                const next = [...editForm.congThucList];
                                                next[i].dinhLuong = Number(e.target.value);
                                                setEditForm({ ...editForm, congThucList: next });
                                            }}
                                            placeholder="Định lượng"
                                            className={inputCls + " w-24"}
                                        />
                                        <button
                                            onClick={() => setEditForm({
                                                ...editForm,
                                                congThucList: editForm.congThucList.filter((_, j) => j !== i)
                                            })}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setEditForm({
                                        ...editForm,
                                        congThucList: [...editForm.congThucList, { maNL: 0, dinhLuong: 0 }]
                                    })}
                                    className="text-xs text-[#c8860a] hover:underline mt-1"
                                >
                                    + Thêm nguyên liệu
                                </button>
                            </Field>

                            <Field label="Kích thước & Giá">
                                {editForm.sizes.map((s, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <input
                                            value={s.kichThuoc}
                                            onChange={(e) => {
                                                const next = [...editForm.sizes];
                                                next[i].kichThuoc = e.target.value;
                                                setEditForm({ ...editForm, sizes: next });
                                            }}
                                            placeholder="VD: M, 16cm"
                                            className={inputCls + " flex-1"}
                                        />
                                        <input
                                            type="number"
                                            value={s.giaTien}
                                            onChange={(e) => {
                                                const next = [...editForm.sizes];
                                                next[i].giaTien = Number(e.target.value);
                                                setEditForm({ ...editForm, sizes: next });
                                            }}
                                            placeholder="Giá"
                                            className={inputCls + " flex-1"}
                                        />
                                        <button
                                            onClick={() => setEditForm({
                                                ...editForm,
                                                sizes: editForm.sizes.filter((_, j) => j !== i)
                                            })}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setEditForm({
                                        ...editForm,
                                        sizes: [...editForm.sizes, { kichThuoc: "", giaTien: 0 }]
                                    })}
                                    className="text-xs text-[#c8860a] hover:underline mt-1"
                                >
                                    + Thêm size
                                </button>
                            </Field>

                            <Field label="Giá tiền">
                                <input
                                    type="number"
                                    min={0}
                                    value={editForm.giaTien}
                                    onChange={(e) => setEditForm({ ...editForm, giaTien: Number(e.target.value) })}
                                    placeholder="VD: 100000"
                                    className={inputCls}
                                />
                            </Field>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 px-6 pb-5">
                            <button
                                onClick={() => setEditTarget(null)}
                                className="flex-1 py-2 rounded-xl border border-[#e8d5b0] text-sm text-[#8a6040] hover:bg-[#fdf6e3] transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={saveEdit}
                                className="flex-1 py-2 rounded-xl bg-[#c8860a] text-white text-sm font-semibold hover:bg-[#a86e08] transition-colors"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal Thêm mới ── */}
            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-[#fdf6e3] border-b border-[#e8d5b0]">
                            <h3 className="font-bold text-[#3d1f0a]">Thêm mẫu bánh</h3>
                            <button onClick={() => setShowAdd(false)}>
                                <X className="w-5 h-5 text-[#8a6040] hover:text-[#3d1f0a]" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="px-6 py-5 flex flex-col gap-4">
                            <Field label="Hình ảnh">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setAddForm({ ...addForm, fileAnh: file });
                                    }}
                                    className={inputCls + " file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#f0e6d0] file:text-[#8a6040] hover:file:bg-[#e8d5b0]"}
                                />
                                {addForm.fileAnh && (
                                    <div className="mt-2 h-20 w-20 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                        <img 
                                            src={URL.createObjectURL(addForm.fileAnh)} 
                                            alt="Preview" 
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                            </Field>
                            <Field label="Tên bánh *">
                                <input
                                    value={addForm.ten}
                                    onChange={(e) => setAddForm({ ...addForm, ten: e.target.value })}
                                    placeholder="VD: Bánh Tiramisu"
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="Loại bánh">
                                <select
                                    value={addForm.category as string}
                                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value as Exclude<Category, "Tất cả"> })}
                                    className={inputCls}
                                >
                                    <option value="Bánh Mì">Bánh Mì</option>
                                    <option value="Bánh Kem">Bánh Kem</option>
                                </select>
                            </Field>
                            <Field label="Trạng thái">
                                <select
                                    value={addForm.trangThaiBanh}
                                    onChange={(e) => setAddForm({ ...addForm, trangThaiBanh: e.target.value })}
                                    className={inputCls}
                                >
                                    <option value="dang_ban">Đang bán</option>
                                    <option value="ngung_ban">Ngừng bán</option>
                                </select>
                            </Field>
                            <Field label="Mô tả">
                                <textarea
                                    rows={2}
                                    value={addForm.moTa}
                                    onChange={(e) => setAddForm({ ...addForm, moTa: e.target.value })}
                                    className={inputCls + " resize-none"}
                                />
                            </Field>
                            
                            
                            <Field label="Công thức">
                                {addForm.congThucList.map((ct, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <select
                                            value={ct.maNL}
                                            onChange={(e) => {
                                                const next = [...addForm.congThucList];
                                                next[i].maNL = Number(e.target.value);
                                                setAddForm({ ...addForm, congThucList: next });
                                            }}
                                            className={inputCls + " flex-1"}
                                        >
                                            <option value={0} disabled>Chọn nguyên liệu</option>
                                            {nguyenLieuList.map((nl) => (
                                                <option key={nl.MaNL} value={nl.MaNL}>{nl.TenNL} ({nl.DonViTinh})</option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            value={ct.dinhLuong}
                                            onChange={(e) => {
                                                const next = [...addForm.congThucList];
                                                next[i].dinhLuong = Number(e.target.value);
                                                setAddForm({ ...addForm, congThucList: next });
                                            }}
                                            placeholder="Định lượng"
                                            className={inputCls + " w-24"}
                                        />
                                        <button
                                            onClick={() => setAddForm({
                                                ...addForm,
                                                congThucList: addForm.congThucList.filter((_, j) => j !== i)
                                            })}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setAddForm({
                                        ...addForm,
                                        congThucList: [...addForm.congThucList, { maNL: 0, dinhLuong: 0 }]
                                    })}
                                    className="text-xs text-[#c8860a] hover:underline mt-1"
                                >
                                    + Thêm nguyên liệu
                                </button>
                            </Field>

                            <Field label="Kích thước *">
                                <input
                                    value={addForm.kichThuoc}
                                    onChange={(e) => setAddForm({ ...addForm, kichThuoc: e.target.value })}
                                    placeholder="VD: M, 16cm, 20cm"
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="Giá tiền *">
                                <input
                                    type="number"
                                    min={0}
                                    value={addForm.giaTien}
                                    onChange={(e) => setAddForm({ ...addForm, giaTien: Number(e.target.value) })}
                                    placeholder="VD: 100000"
                                    className={inputCls}
                                />
                            </Field>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 px-6 pb-5">
                            <button
                                onClick={() => setShowAdd(false)}
                                className="flex-1 py-2 rounded-xl border border-[#e8d5b0] text-sm text-[#8a6040] hover:bg-[#fdf6e3] transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={saveAdd}
                                disabled={!addForm.ten.trim()}
                                className="flex-1 py-2 rounded-xl bg-[#c8860a] text-white text-sm font-semibold hover:bg-[#a86e08] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Thêm
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

// ── Helper components ──────────────────────────────────────
const inputCls =
    "w-full px-3 py-2 text-sm border border-[#e8d5b0] rounded-xl text-[#3d1f0a] bg-[#fdf6e3] focus:outline-none focus:ring-1 focus:ring-[#c8860a] placeholder:text-[#b0906a]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#8a6040]">{label}</label>
            {children}
        </div>
    );
}