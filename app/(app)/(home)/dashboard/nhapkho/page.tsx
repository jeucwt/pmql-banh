"use client";
import { useEffect, useState } from "react";
import { useRouteGuard } from "@/lib/useRouteGuard";

// ───── Types ─────
interface NhaCungCap {
    MaNCC: number;
    TenNCC: string;
    SDT: string;
    DiaChi: string;
    Email?: string;
}

interface NguyenLieu {
    MaNL: number;
    TenNL: string;
    DonViTinh: string;
}

interface DongChiTiet {
    maNL: number;
    tenNL: string;
    donViTinh: string;
    soLuong: number;
    donGia: number;
}

interface PhieuNhap {
    MaPN: number;
    NgayNhap: string;
    TongTien: number;
    TenNCC: string;
    MaNCC: number;
    TenNhanVien: string;
    SoDongNguyenLieu: number;
}

interface ChiTietPhieu extends PhieuNhap {
    SDT_NCC: string;
    chiTiet: {
        MaNL: number;
        TenNL: string;
        DonViTinh: string;
        SoLuong: number;
        DonGia: number;
        ThanhTien: number;
    }[];
}

// ───── Helpers ─────
const API_BASE = "http://localhost:3001/api/admin";

const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("tiem_banh_token") : null;

const authHeader = () => ({ Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" });

const formatMoney = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const formatDate = (d: string) =>
    new Date(d).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

// ───── Page ─────
export default function PhieuNhapPage() {
    const { loading } = useRouteGuard("warehouse");

    // Tab
    const [tab, setTab] = useState<"phieunhap" | "nhacc">("phieunhap");

    // ── Phiếu nhập ──
    const [phieuList, setPhieuList] = useState<PhieuNhap[]>([]);
    const [chiTiet, setChiTiet] = useState<ChiTietPhieu | null>(null);
    const [showChiTiet, setShowChiTiet] = useState(false);

    // Modal tạo phiếu
    const [showTao, setShowTao] = useState(false);
    const [nccList, setNccList] = useState<NhaCungCap[]>([]);
    const [nlList, setNlList] = useState<NguyenLieu[]>([]);
    const [formMaNCC, setFormMaNCC] = useState<number | "">("");
    const [dongList, setDongList] = useState<DongChiTiet[]>([
        { maNL: 0, tenNL: "", donViTinh: "", soLuong: 1, donGia: 0 },
    ]);
    const [taoLoading, setTaoLoading] = useState(false);
    const [taoError, setTaoError] = useState("");

    // ── Nhà cung cấp ──
    const [nccManage, setNccManage] = useState<NhaCungCap[]>([]);
    const [showNccModal, setShowNccModal] = useState(false);
    const [editingNCC, setEditingNCC] = useState<NhaCungCap | null>(null);
    const [nccForm, setNccForm] = useState({ tenNCC: "", sdt: "", diaChi: "", email: "" });
    const [nccError, setNccError] = useState("");

    // ── Fetch ──
    const fetchPhieu = async () => {
        const res = await fetch(`${API_BASE}/phieunhap`, { headers: authHeader() });
        if (res.ok) setPhieuList(await res.json());
    };

    const fetchNCC = async () => {
        const res = await fetch(`${API_BASE}/nhacc`, { headers: authHeader() });
        if (res.ok) {
            const data = await res.json();
            setNccList(data);
            setNccManage(data);
        }
    };

    const fetchNL = async () => {
        const res = await fetch(`${API_BASE}/kho`, { headers: authHeader() });
        if (res.ok) {
            const data = await res.json();
            setNlList(data.map((item: any) => ({ MaNL: item.MaNL, TenNL: item.TenNL, DonViTinh: item.DonViTinh })));
        }
    };

    useEffect(() => {
        if (!loading) {
            fetchPhieu();
            fetchNCC();
            fetchNL();
        }
    }, [loading]);

    // ── Chi tiết phiếu ──
    const xemChiTiet = async (maPN: number) => {
        const res = await fetch(`${API_BASE}/phieunhap/${maPN}`, { headers: authHeader() });
        if (res.ok) {
            setChiTiet(await res.json());
            setShowChiTiet(true);
        }
    };

    // ── Tạo phiếu ──
    const openTaoPhieu = () => {
        setFormMaNCC("");
        setDongList([{ maNL: 0, tenNL: "", donViTinh: "", soLuong: 1, donGia: 0 }]);
        setTaoError("");
        setShowTao(true);
    };

    const chonNguyenLieu = (idx: number, maNL: number) => {
        const nl = nlList.find((n) => n.MaNL === maNL);
        setDongList((prev) =>
            prev.map((d, i) =>
                i === idx ? { ...d, maNL, tenNL: nl?.TenNL || "", donViTinh: nl?.DonViTinh || "" } : d
            )
        );
    };

    const updateDong = (idx: number, field: "soLuong" | "donGia", val: number) => {
        setDongList((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: val } : d)));
    };

    const themDong = () =>
        setDongList((prev) => [...prev, { maNL: 0, tenNL: "", donViTinh: "", soLuong: 1, donGia: 0 }]);

    const xoaDong = (idx: number) =>
        setDongList((prev) => prev.filter((_, i) => i !== idx));

    const tongTienForm = dongList.reduce((s, d) => s + d.soLuong * d.donGia, 0);

    const submitTaoPhieu = async () => {
        if (!formMaNCC) return setTaoError("Vui lòng chọn nhà cung cấp");
        if (dongList.some((d) => !d.maNL)) return setTaoError("Vui lòng chọn nguyên liệu cho tất cả dòng");
        if (dongList.some((d) => d.soLuong <= 0 || d.donGia <= 0)) return setTaoError("Số lượng và đơn giá phải > 0");

        setTaoLoading(true);
        setTaoError("");
        const res = await fetch(`${API_BASE}/phieunhap`, {
            method: "POST",
            headers: authHeader(),
            body: JSON.stringify({
                maNCC: formMaNCC,
                danhSachNguyenLieu: dongList.map(({ maNL, soLuong, donGia }) => ({ maNL, soLuong, donGia })),
            }),
        });
        setTaoLoading(false);
        if (res.ok) {
            setShowTao(false);
            fetchPhieu();
        } else {
            const err = await res.json();
            setTaoError(err.message || "Lỗi tạo phiếu");
        }
    };

    // ── CRUD NCC ──
    const openThemNCC = () => {
        setEditingNCC(null);
        setNccForm({ tenNCC: "", sdt: "", diaChi: "", email: "" });
        setNccError("");
        setShowNccModal(true);
    };

    const openSuaNCC = (ncc: NhaCungCap) => {
        setEditingNCC(ncc);
        setNccForm({ tenNCC: ncc.TenNCC, sdt: ncc.SDT, diaChi: ncc.DiaChi, email: ncc.Email || "" });
        setNccError("");
        setShowNccModal(true);
    };

    const submitNCC = async () => {
        if (!nccForm.tenNCC || !nccForm.sdt || !nccForm.diaChi)
            return setNccError("Vui lòng điền đầy đủ thông tin bắt buộc");

        const url = editingNCC ? `${API_BASE}/nhacc/${editingNCC.MaNCC}` : `${API_BASE}/nhacc`;
        const method = editingNCC ? "PUT" : "POST";

        const res = await fetch(url, { method, headers: authHeader(), body: JSON.stringify(nccForm) });
        if (res.ok) {
            setShowNccModal(false);
            fetchNCC();
        } else {
            const err = await res.json();
            setNccError(err.message || "Lỗi lưu nhà cung cấp");
        }
    };

    const xoaNCCHandler = async (ncc: NhaCungCap) => {
        if (!confirm(`Xóa nhà cung cấp "${ncc.TenNCC}"?`)) return;
        const res = await fetch(`${API_BASE}/nhacc/${ncc.MaNCC}`, { method: "DELETE", headers: authHeader() });
        if (res.ok) {
            fetchNCC();
        } else {
            const err = await res.json();
            alert(err.message);
        }
    };

    if (loading) return <div className="p-8 text-center" style={{ color: "#664930" }}>Đang tải...</div>;

    return (
        <div className="min-h-screen p-6" style={{ background: "#FFF8F0" }}>
            <h1 className="text-2xl font-bold mb-6" style={{ color: "#664930" }}>
                Nhập Kho & Nhà Cung Cấp
            </h1>

            {/* Tab */}
            <div className="flex gap-2 mb-6">
                {(["phieunhap", "nhacc"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className="px-5 py-2 rounded-lg font-medium transition-colors"
                        style={
                            tab === t
                                ? { background: "#664930", color: "#fff" }
                                : { background: "#CCBEB1", color: "#664930" }
                        }
                    >
                        {t === "phieunhap" ? "Phiếu Nhập" : "Nhà Cung Cấp"}
                    </button>
                ))}
            </div>

            {/* ═══ TAB PHIẾU NHẬP ═══ */}
            {tab === "phieunhap" && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm" style={{ color: "#997E67" }}>
                            Tổng: {phieuList.length} phiếu nhập
                        </p>
                        <button
                            onClick={openTaoPhieu}
                            className="px-4 py-2 rounded-lg font-medium text-white"
                            style={{ background: "#c8860a" }}
                        >
                            + Tạo phiếu nhập
                        </button>
                    </div>

                    <div className="rounded-xl overflow-hidden shadow-sm" style={{ background: "#fff" }}>
                        <table className="w-full text-sm">
                            <thead style={{ background: "#CCBEB1" }}>
                                <tr>
                                    {["Mã PN", "Ngày nhập", "Nhà cung cấp", "Nhân viên", "Số NL", "Tổng tiền"].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: "#664930" }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {phieuList.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center" style={{ color: "#997E67" }}>
                                            Chưa có phiếu nhập nào
                                        </td>
                                    </tr>
                                ) : (
                                    phieuList.map((p) => (
                                        <tr
                                            key={p.MaPN}
                                            className="border-t cursor-pointer hover:opacity-80"
                                            style={{ borderColor: "#FFDBBB" }}
                                            onClick={() => xemChiTiet(p.MaPN)}
                                        >
                                            <td className="px-4 py-3 font-medium" style={{ color: "#664930" }}>#{p.MaPN}</td>
                                            <td className="px-4 py-3" style={{ color: "#664930" }}>{formatDate(p.NgayNhap)}</td>
                                            <td className="px-4 py-3" style={{ color: "#664930" }}>{p.TenNCC}</td>
                                            <td className="px-4 py-3" style={{ color: "#997E67" }}>{p.TenNhanVien}</td>
                                            <td className="px-4 py-3" style={{ color: "#997E67" }}>{p.SoDongNguyenLieu} loại</td>
                                            <td className="px-4 py-3 font-semibold" style={{ color: "#c8860a" }}>
                                                {formatMoney(p.TongTien)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ═══ TAB NHÀ CUNG CẤP ═══ */}
            {tab === "nhacc" && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm" style={{ color: "#997E67" }}>
                            Tổng: {nccManage.length} nhà cung cấp
                        </p>
                        <button
                            onClick={openThemNCC}
                            className="px-4 py-2 rounded-lg font-medium text-white"
                            style={{ background: "#c8860a" }}
                        >
                            + Thêm nhà cung cấp
                        </button>
                    </div>

                    <div className="rounded-xl overflow-hidden shadow-sm" style={{ background: "#fff" }}>
                        <table className="w-full text-sm">
                            <thead style={{ background: "#CCBEB1" }}>
                                <tr>
                                    {["Tên NCC", "SĐT", "Địa chỉ", "Email", ""].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: "#664930" }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {nccManage.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center" style={{ color: "#997E67" }}>
                                            Chưa có nhà cung cấp nào
                                        </td>
                                    </tr>
                                ) : (
                                    nccManage.map((n) => (
                                        <tr key={n.MaNCC} className="border-t" style={{ borderColor: "#FFDBBB" }}>
                                            <td className="px-4 py-3 font-medium" style={{ color: "#664930" }}>{n.TenNCC}</td>
                                            <td className="px-4 py-3" style={{ color: "#664930" }}>{n.SDT}</td>
                                            <td className="px-4 py-3" style={{ color: "#997E67" }}>{n.DiaChi}</td>
                                            <td className="px-4 py-3" style={{ color: "#997E67" }}>{n.Email || "—"}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openSuaNCC(n)}
                                                        className="px-3 py-1 rounded text-sm font-medium"
                                                        style={{ background: "#FFDBBB", color: "#664930" }}
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => xoaNCCHandler(n)}
                                                        className="px-3 py-1 rounded text-sm font-medium"
                                                        style={{ background: "#fee2e2", color: "#dc2626" }}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ═══ MODAL CHI TIẾT PHIẾU NHẬP ═══ */}
            {showChiTiet && chiTiet && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl" style={{ background: "#FFF8F0" }}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold" style={{ color: "#664930" }}>
                                    Phiếu Nhập #{chiTiet.MaPN}
                                </h2>
                                <p className="text-sm mt-1" style={{ color: "#997E67" }}>
                                    {formatDate(chiTiet.NgayNhap)} · {chiTiet.TenNhanVien}
                                </p>
                            </div>
                            <button onClick={() => setShowChiTiet(false)} className="text-2xl leading-none" style={{ color: "#997E67" }}>×</button>
                        </div>

                        <div className="p-3 rounded-lg mb-4" style={{ background: "#FFDBBB" }}>
                            <p className="font-semibold" style={{ color: "#664930" }}>{chiTiet.TenNCC}</p>
                            <p className="text-sm" style={{ color: "#997E67" }}>SĐT: {chiTiet.SDT_NCC}</p>
                        </div>

                        <table className="w-full text-sm mb-4">
                            <thead style={{ background: "#CCBEB1" }}>
                                <tr>
                                    {["Nguyên liệu", "ĐVT", "Số lượng", "Đơn giá", "Thành tiền"].map((h) => (
                                        <th key={h} className="px-3 py-2 text-left font-semibold" style={{ color: "#664930" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {chiTiet.chiTiet.map((ct) => (
                                    <tr key={ct.MaNL} className="border-t" style={{ borderColor: "#FFDBBB" }}>
                                        <td className="px-3 py-2" style={{ color: "#664930" }}>{ct.TenNL}</td>
                                        <td className="px-3 py-2" style={{ color: "#997E67" }}>{ct.DonViTinh}</td>
                                        <td className="px-3 py-2" style={{ color: "#664930" }}>{ct.SoLuong}</td>
                                        <td className="px-3 py-2" style={{ color: "#997E67" }}>{formatMoney(ct.DonGia)}</td>
                                        <td className="px-3 py-2 font-semibold" style={{ color: "#c8860a" }}>{formatMoney(ct.ThanhTien)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="text-right font-bold text-lg" style={{ color: "#664930" }}>
                            Tổng cộng: {formatMoney(chiTiet.TongTien)}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ MODAL TẠO PHIẾU NHẬP ═══ */}
            {showTao && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" style={{ background: "#FFF8F0" }}>
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold" style={{ color: "#664930" }}>Tạo Phiếu Nhập</h2>
                            <button onClick={() => setShowTao(false)} className="text-2xl leading-none" style={{ color: "#997E67" }}>×</button>
                        </div>

                        {/* Chọn NCC */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1" style={{ color: "#664930" }}>
                                Nhà cung cấp <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formMaNCC}
                                onChange={(e) => setFormMaNCC(Number(e.target.value))}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                style={{ borderColor: "#CCBEB1", color: "#664930" }}
                            >
                                <option value="">-- Chọn nhà cung cấp --</option>
                                {nccList.map((n) => (
                                    <option key={n.MaNCC} value={n.MaNCC}>{n.TenNCC}</option>
                                ))}
                            </select>
                        </div>

                        {/* Danh sách nguyên liệu */}
                        <div className="mb-2">
                            <label className="block text-sm font-medium mb-2" style={{ color: "#664930" }}>
                                Danh sách nguyên liệu <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                                {dongList.map((dong, idx) => (
                                    <div key={idx} className="flex gap-2 items-center p-3 rounded-lg" style={{ background: "#FFDBBB" }}>
                                        <select
                                            value={dong.maNL || ""}
                                            onChange={(e) => chonNguyenLieu(idx, Number(e.target.value))}
                                            className="flex-1 border rounded-lg px-2 py-1.5 text-sm"
                                            style={{ borderColor: "#CCBEB1", color: "#664930" }}
                                        >
                                            <option value="">-- Chọn NL --</option>
                                            {nlList.map((nl) => (
                                                <option key={nl.MaNL} value={nl.MaNL}>
                                                    {nl.TenNL} ({nl.DonViTinh})
                                                </option>
                                            ))}
                                        </select>

                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            placeholder="Số lượng"
                                            value={dong.soLuong}
                                            onChange={(e) => updateDong(idx, "soLuong", Number(e.target.value))}
                                            className="w-24 border rounded-lg px-2 py-1.5 text-sm"
                                            style={{ borderColor: "#CCBEB1", color: "#664930" }}
                                        />

                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Đơn giá"
                                            value={dong.donGia}
                                            onChange={(e) => updateDong(idx, "donGia", Number(e.target.value))}
                                            className="w-32 border rounded-lg px-2 py-1.5 text-sm"
                                            style={{ borderColor: "#CCBEB1", color: "#664930" }}
                                        />

                                        {dongList.length > 1 && (
                                            <button
                                                onClick={() => xoaDong(idx)}
                                                className="px-2 py-1 rounded text-sm"
                                                style={{ background: "#fee2e2", color: "#dc2626" }}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={themDong}
                                className="mt-2 text-sm px-3 py-1.5 rounded-lg"
                                style={{ background: "#CCBEB1", color: "#664930" }}
                            >
                                + Thêm dòng
                            </button>
                        </div>

                        {/* Tổng tiền preview */}
                        <div className="text-right my-3 font-semibold" style={{ color: "#664930" }}>
                            Tổng tiền: <span style={{ color: "#c8860a" }}>{formatMoney(tongTienForm)}</span>
                        </div>

                        {taoError && (
                            <p className="text-sm text-red-600 mb-3 p-2 rounded-lg bg-red-50">{taoError}</p>
                        )}

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowTao(false)}
                                className="px-4 py-2 rounded-lg text-sm"
                                style={{ background: "#CCBEB1", color: "#664930" }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={submitTaoPhieu}
                                disabled={taoLoading}
                                className="px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
                                style={{ background: "#c8860a" }}
                            >
                                {taoLoading ? "Đang lưu..." : "Xác nhận nhập kho"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ MODAL THÊM/SỬA NCC ═══ */}
            {showNccModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="rounded-2xl p-6 w-full max-w-md shadow-xl" style={{ background: "#FFF8F0" }}>
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold" style={{ color: "#664930" }}>
                                {editingNCC ? "Sửa nhà cung cấp" : "Thêm nhà cung cấp"}
                            </h2>
                            <button onClick={() => setShowNccModal(false)} className="text-2xl leading-none" style={{ color: "#997E67" }}>×</button>
                        </div>

                        {[
                            { key: "tenNCC", label: "Tên NCC", required: true },
                            { key: "sdt", label: "SĐT", required: true },
                            { key: "diaChi", label: "Địa chỉ", required: true },
                            { key: "email", label: "Email", required: false },
                        ].map(({ key, label, required }) => (
                            <div key={key} className="mb-3">
                                <label className="block text-sm font-medium mb-1" style={{ color: "#664930" }}>
                                    {label} {required && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="text"
                                    value={nccForm[key as keyof typeof nccForm]}
                                    onChange={(e) => setNccForm((f) => ({ ...f, [key]: e.target.value }))}
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                    style={{ borderColor: "#CCBEB1", color: "#664930" }}
                                />
                            </div>
                        ))}

                        {nccError && (
                            <p className="text-sm text-red-600 mb-3 p-2 rounded-lg bg-red-50">{nccError}</p>
                        )}

                        <div className="flex gap-3 justify-end mt-4">
                            <button
                                onClick={() => setShowNccModal(false)}
                                className="px-4 py-2 rounded-lg text-sm"
                                style={{ background: "#CCBEB1", color: "#664930" }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={submitNCC}
                                className="px-5 py-2 rounded-lg text-sm font-medium text-white"
                                style={{ background: "#c8860a" }}
                            >
                                {editingNCC ? "Lưu thay đổi" : "Thêm mới"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}