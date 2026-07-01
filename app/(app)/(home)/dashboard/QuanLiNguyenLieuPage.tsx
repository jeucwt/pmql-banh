"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  AlertTriangle,
  Package,
  ChevronDown,
  ChevronUp,
  X,
  Edit2,
} from "lucide-react";

const API_KHO = "http://localhost:3001/api/admin/kho";

// ─── Types (khớp response thật từ backend) ────────────────────────────────
interface NguyenLieuApi {
  MaNL: number;
  TenNL: string;
  GiaNhap: string | number | null;
  SoLuongDonVi: number | null;
  DonViTinh: string | null;
  SoLuongTon: string | number;
  SoLuongToiThieu: string | number;
  CanhBao: number; // 0 | 1
}

interface NguyenLieu {
  id: number;
  ten: string;
  giaNhap: number;
  donViTinh: string;
  soLuongTon: number;
  soLuongToiThieu: number;
  canhBao: boolean;
}

function mapApiToNguyenLieu(item: NguyenLieuApi): NguyenLieu {
  return {
    id: item.MaNL,
    ten: item.TenNL,
    giaNhap: Number(item.GiaNhap) || 0,
    donViTinh: item.DonViTinh || "",
    soLuongTon: Number(item.SoLuongTon) || 0,
    soLuongToiThieu: Number(item.SoLuongToiThieu) || 0,
    canhBao: !!item.CanhBao,
  };
}

type SortKey = "ten" | "soLuongTon" | "soLuongToiThieu" | "giaNhap";

const EMPTY_FORM = {
  ten: "",
  giaNhap: 0,
  soLuongDonVi: 1,
  donViTinh: "kg",
  soLuongTon: 0,
  soLuongToiThieu: 0,
};

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmtVND = (n: number) => n.toLocaleString("vi-VN") + "đ";

const stockStatus = (stock: number, min: number) => {
  if (stock === 0) return { label: "Hết hàng", color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" };
  if (stock < min) return { label: "Sắp hết", color: "text-orange-500", bg: "bg-orange-50", dot: "bg-orange-400" };
  if (stock < min * 1.5) return { label: "Thấp", color: "text-yellow-600", bg: "bg-yellow-50", dot: "bg-yellow-400" };
  return { label: "Đủ hàng", color: "text-green-600", bg: "bg-green-50", dot: "bg-green-500" };
};

function StockBar({ stock, min }: { stock: number; min: number }) {
  const pct = min > 0 ? Math.min(100, Math.round((stock / (min * 3)) * 100)) : 100;
  const s = stockStatus(stock, min);
  const barColor =
    s.label === "Hết hàng" ? "bg-red-400" :
      s.label === "Sắp hết" ? "bg-orange-400" :
        s.label === "Thấp" ? "bg-yellow-400" : "bg-green-400";
  return (
    <div className="w-full h-1.5 bg-[#e8d5b0] rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function QuanLiNguyenLieuPage() {
  const [ingredients, setIngredients] = useState<NguyenLieu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("ten");
  const [sortAsc, setSortAsc] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  function getToken() {
    return localStorage.getItem("tiem_banh_token");
  }

  async function fetchDanhSach() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(API_KHO, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Không thể tải danh sách nguyên liệu");
      const data: NguyenLieuApi[] = await res.json();
      setIngredients(data.map(mapApiToNguyenLieu));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchDanhSach();
  }, []);

  // ── Derived ──
  const filtered = useMemo(() => {
    let list = ingredients;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.ten.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av === bv) return 0;
      const res = av < bv ? -1 : 1;
      return sortAsc ? res : -res;
    });
  }, [ingredients, search, sortKey, sortAsc]);

  const lowStockCount = useMemo(
    () => ingredients.filter((i) => i.canhBao).length,
    [ingredients]
  );

  // ── Handlers ──
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(true); }
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowAddModal(true);
  };

  const openEdit = (ing: NguyenLieu) => {
    setForm({
      ten: ing.ten,
      giaNhap: ing.giaNhap,
      soLuongDonVi: 1,
      donViTinh: ing.donViTinh,
      soLuongTon: ing.soLuongTon,
      soLuongToiThieu: ing.soLuongToiThieu,
    });
    setEditId(ing.id);
    setShowAddModal(true);
  };

  async function handleSave() {
    if (!form.ten.trim()) return;
    const body = {
      tenNL: form.ten,
      giaNhap: form.giaNhap,
      soLuongDonVi: form.soLuongDonVi,
      donViTinh: form.donViTinh,
      soLuongTon: form.soLuongTon,
      soLuongToiThieu: form.soLuongToiThieu,
    };
    const url = editId !== null ? `${API_KHO}/${editId}` : API_KHO;
    const method = editId !== null ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setError(editId !== null ? "Không thể cập nhật nguyên liệu" : "Không thể thêm nguyên liệu");
      return;
    }
    setShowAddModal(false);
    await fetchDanhSach();
  }

  async function confirmDelete() {
    if (deleteId === null) return;
    const res = await fetch(`${API_KHO}/${deleteId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) {
      setError("Không thể xóa nguyên liệu (có thể đang dùng trong công thức)");
      setDeleteId(null);
      return;
    }
    setDeleteId(null);
    await fetchDanhSach();
  }

  // ── Sort indicator ──
  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col
      ? (sortAsc ? <ChevronUp size={13} className="inline ml-0.5" /> : <ChevronDown size={13} className="inline ml-0.5" />)
      : <ChevronDown size={13} className="inline ml-0.5 opacity-30" />;

  const thCls = `px-3 py-2.5 text-left text-xs font-semibold text-[#8a6040] cursor-pointer select-none hover:text-[#3d1f0a] transition-colors whitespace-nowrap`;

  if (loading) {
    return <p className="text-sm text-[#8a6040]">Đang tải nguyên liệu...</p>;
  }

  return (
    <div className="flex flex-col gap-4 h-full">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl shadow-md px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#f5ede0] text-[#c8860a]">
            <Package size={16} />
          </div>
          <div>
            <p className="text-xs text-[#8a6040]">Tổng nguyên liệu</p>
            <p className="text-xl font-bold leading-tight text-[#3d1f0a]">{ingredients.length}</p>
          </div>
        </div>
        <div className={`bg-white rounded-2xl shadow-md px-4 py-3 flex items-center gap-3 ${lowStockCount > 0 ? "ring-1 ring-orange-300" : ""}`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${lowStockCount > 0 ? "bg-orange-100 text-orange-500" : "bg-[#f5ede0] text-[#c8860a]"}`}>
            <AlertTriangle size={16} />
          </div>
          <div>
            <p className="text-xs text-[#8a6040]">Sắp / hết hàng</p>
            <p className={`text-xl font-bold leading-tight ${lowStockCount > 0 ? "text-orange-500" : "text-[#3d1f0a]"}`}>{lowStockCount}</p>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-50">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a6040]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm nguyên liệu..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-[#e8d5b0] rounded-xl bg-[#fdf6e3] focus:outline-none focus:ring-1 focus:ring-[#c8860a] text-[#3d1f0a] placeholder:text-[#8a6040]/60"
          />
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#c8860a] text-white text-sm font-medium rounded-xl shadow-sm hover:bg-[#b5780a] transition-colors ml-auto shrink-0"
        >
          <Plus size={15} />
          Thêm nguyên liệu
        </button>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto bg-white rounded-2xl shadow-md">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#fdf6e3] border-b border-[#e8d5b0]">
              <th className={thCls} onClick={() => handleSort("ten")}>Tên nguyên liệu <SortIcon col="ten" /></th>
              <th className={thCls} onClick={() => handleSort("soLuongTon")}>Tồn kho <SortIcon col="soLuongTon" /></th>
              <th className={thCls} onClick={() => handleSort("soLuongToiThieu")}>Tối thiểu <SortIcon col="soLuongToiThieu" /></th>
              <th className={thCls} onClick={() => handleSort("giaNhap")}>Giá nhập <SortIcon col="giaNhap" /></th>
              <th className="px-3 py-2.5 text-xs font-semibold text-[#8a6040] text-right w-20">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-16 text-[#8a6040] text-sm">
                  Không tìm thấy nguyên liệu nào.
                </td>
              </tr>
            )}
            {filtered.map((ing, idx) => {
              const s = stockStatus(ing.soLuongTon, ing.soLuongToiThieu);
              return (
                <tr
                  key={ing.id}
                  className={`border-b border-[#e8d5b0]/60 hover:bg-[#fdf6e3] transition-colors group ${idx % 2 === 0 ? "" : "bg-[#fdf6e3]/40"}`}
                >
                  <td className="px-3 py-2.5">
                    <span className="font-medium text-[#3d1f0a]">{ing.ten}</span>
                  </td>

                  <td className="px-3 py-2.5 min-w-27.5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#3d1f0a]">{ing.soLuongTon.toLocaleString()}</span>
                        <span className="text-[#8a6040] text-xs ml-1">{ing.donViTinh}</span>
                        <span className={`ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${s.bg} ${s.color}`}>
                          {s.label}
                        </span>
                      </div>
                      <StockBar stock={ing.soLuongTon} min={ing.soLuongToiThieu} />
                    </div>
                  </td>

                  <td className="px-3 py-2.5 text-[#8a6040]">
                    {ing.soLuongToiThieu.toLocaleString()} {ing.donViTinh}
                  </td>

                  <td className="px-3 py-2.5 font-semibold text-[#c8860a]">
                    {fmtVND(ing.giaNhap)}
                  </td>

                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(ing)}
                        className="p-1.5 rounded-lg hover:bg-[#f5ede0] text-[#8a6040] hover:text-[#c8860a] transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteId(ing.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#8a6040] hover:text-red-500 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="px-4 py-2.5 border-t border-[#e8d5b0] flex items-center justify-between">
          <span className="text-xs text-[#8a6040]">
            Hiển thị <span className="font-semibold text-[#3d1f0a]">{filtered.length}</span> / {ingredients.length} nguyên liệu
          </span>
          {lowStockCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-orange-500 font-medium">
              <AlertTriangle size={12} />
              {lowStockCount} nguyên liệu cần nhập thêm
            </span>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8d5b0]">
              <h2 className="font-bold text-[#3d1f0a] text-base">
                {editId !== null ? "Cập nhật nguyên liệu" : "Thêm nguyên liệu mới"}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-[#f5ede0] text-[#8a6040]">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-4 flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-[#8a6040] mb-1 block">Tên nguyên liệu *</label>
                <input
                  value={form.ten}
                  onChange={(e) => setForm((f) => ({ ...f, ten: e.target.value }))}
                  placeholder="VD: Bột mì đa dụng"
                  className="w-full px-3 py-2 text-sm border border-[#e8d5b0] rounded-xl bg-[#fdf6e3] focus:outline-none focus:ring-1 focus:ring-[#c8860a] text-[#3d1f0a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#8a6040] mb-1 block">Đơn vị tính</label>
                  <input
                    value={form.donViTinh}
                    onChange={(e) => setForm((f) => ({ ...f, donViTinh: e.target.value }))}
                    placeholder="VD: kg, lít, cái"
                    className="w-full px-3 py-2 text-sm border border-[#e8d5b0] rounded-xl bg-[#fdf6e3] focus:outline-none focus:ring-1 focus:ring-[#c8860a] text-[#3d1f0a]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8a6040] mb-1 block">Giá nhập (VND)</label>
                  <input
                    type="number" min={0}
                    value={form.giaNhap}
                    onChange={(e) => setForm((f) => ({ ...f, giaNhap: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-[#e8d5b0] rounded-xl bg-[#fdf6e3] focus:outline-none focus:ring-1 focus:ring-[#c8860a] text-[#3d1f0a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#8a6040] mb-1 block">Tồn kho hiện tại</label>
                  <input
                    type="number" min={0}
                    value={form.soLuongTon}
                    onChange={(e) => setForm((f) => ({ ...f, soLuongTon: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-[#e8d5b0] rounded-xl bg-[#fdf6e3] focus:outline-none focus:ring-1 focus:ring-[#c8860a] text-[#3d1f0a]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8a6040] mb-1 block">Tồn kho tối thiểu</label>
                  <input
                    type="number" min={0}
                    value={form.soLuongToiThieu}
                    onChange={(e) => setForm((f) => ({ ...f, soLuongToiThieu: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-[#e8d5b0] rounded-xl bg-[#fdf6e3] focus:outline-none focus:ring-1 focus:ring-[#c8860a] text-[#3d1f0a]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#e8d5b0]">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm rounded-xl bg-[#f0e6d0] text-[#8a6040] hover:bg-[#e8d5b0] transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={!form.ten.trim()}
                className="px-4 py-2 text-sm rounded-xl bg-[#c8860a] text-white font-medium hover:bg-[#b5780a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editId !== null ? "Lưu thay đổi" : "Thêm nguyên liệu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId !== null && (() => {
        const target = ingredients.find((i) => i.id === deleteId);
        return (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <Trash2 size={22} />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-[#3d1f0a] text-base mb-1">Xóa nguyên liệu?</h3>
                <p className="text-sm text-[#8a6040]">
                  Bạn có chắc muốn xóa <span className="font-semibold text-[#3d1f0a]">"{target?.ten}"</span> khỏi danh sách không? Hành động này không thể hoàn tác.
                </p>
              </div>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2 text-sm rounded-xl bg-[#f0e6d0] text-[#8a6040] hover:bg-[#e8d5b0] font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 text-sm rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}