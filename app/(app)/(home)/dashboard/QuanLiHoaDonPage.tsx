"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search, ChevronDown, ChevronUp, X,
  Receipt, CheckCircle2, Clock, XCircle,
  CalendarDays, User, ShoppingBag,
} from "lucide-react";
import { useRouteGuard } from "@/lib/useRouteGuard";

// ─── Types (theo DB thật) ──────────────────────────────────────────────────────
type TrangThaiHD = "ChuaThanhToan" | "DaThanhToan" | "DaHuy";
type PhuongThuc = "TienMat" | "ChuyenKhoan" | "The" | "ViDienTu" | null;

interface HoaDon {
  MaHD: number;
  MaDH: number;
  NgayLap: string;
  TongTien: number;
  TrangThai: TrangThaiHD;
  TenNhanVien: string;
  TenKhachHang: string | null;
  PhuongThuc: PhuongThuc;
}

interface ChiTietHD {
  MaBanh: number;
  TenBanh: string;
  KichThuoc: string;
  SoLuong: number;
  DonGia: number;
  ThanhTien: number;
}

interface HoaDonChiTiet extends HoaDon {
  SDT: string | null;
  DiaChi: string | null;
  LoaiTT: string | null;
  NgayTT: string | null;
  chiTiet: ChiTietHD[];
}

// ─── Mapping enums DB → hiển thị ──────────────────────────────────────────────
const STATUS_LABEL: Record<TrangThaiHD, string> = {
  ChuaThanhToan: "Chưa thanh toán",
  DaThanhToan: "Đã thanh toán",
  DaHuy: "Đã hủy",
};

const STATUS_STYLE: Record<TrangThaiHD, { color: string; bg: string; icon: React.ReactNode }> = {
  ChuaThanhToan: { color: "text-blue-500", bg: "bg-blue-50", icon: <Clock size={12} /> },
  DaThanhToan: { color: "text-green-600", bg: "bg-green-50", icon: <CheckCircle2 size={12} /> },
  DaHuy: { color: "text-red-500", bg: "bg-red-50", icon: <XCircle size={12} /> },
};

const PAYMENT_LABEL: Record<string, string> = {
  TienMat: "Tiền mặt",
  ChuyenKhoan: "Chuyển khoản",
  The: "Thẻ",
  ViDienTu: "Ví điện tử",
};

const PAYMENT_STYLE: Record<string, string> = {
  TienMat: "bg-[#f5ede0] text-[#8a6040]",
  ChuyenKhoan: "bg-blue-50 text-blue-600",
  The: "bg-purple-50 text-purple-600",
  ViDienTu: "bg-green-50 text-green-600",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("tiem_banh_token") : null;

const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const fmtVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const fmtDate = (s: string) =>
  new Date(s).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

const API_BASE = "http://localhost:3001/api/hoadon";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function QuanLiHoaDonPage() {
  const { loading: authLoading } = useRouteGuard("cashier");

  const [hoaDonList, setHoaDonList] = useState<HoaDon[]>([]);
  const [fetching, setFetching] = useState(true);
  const [chiTiet, setChiTiet] = useState<HoaDonChiTiet | null>(null);
  const [showChiTiet, setShowChiTiet] = useState(false);

  // Filter
  const [searchQ, setSearchQ] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterStatus, setFilterStatus] = useState<TrangThaiHD | "TatCa">("TatCa");

  // Sort
  const [sortKey, setSortKey] = useState<keyof HoaDon>("NgayLap");
  const [sortAsc, setSortAsc] = useState(false);

  // ── Fetch list ──
  const fetchHoaDon = async () => {
    setFetching(true);
    try {
      const res = await fetch(API_BASE, { headers: authHeader() });
      if (res.ok) setHoaDonList(await res.json());
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchHoaDon();
  }, [authLoading]);

  // ── Xem chi tiết ──
  const xemChiTiet = async (maHD: number) => {
    const res = await fetch(`${API_BASE}/${maHD}`, { headers: authHeader() });
    if (res.ok) {
      setChiTiet(await res.json());
      setShowChiTiet(true);
    }
  };

  // ── Filter + sort ──
  const filtered = useMemo(() => {
    let list = hoaDonList;

    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      list = list.filter(
        (h) =>
          String(h.MaHD).includes(q) ||
          (h.TenKhachHang || "").toLowerCase().includes(q)
      );
    }
    if (filterDay) list = list.filter((h) => new Date(h.NgayLap).getDate() === Number(filterDay));
    if (filterMonth) list = list.filter((h) => new Date(h.NgayLap).getMonth() + 1 === Number(filterMonth));
    if (filterYear) list = list.filter((h) => new Date(h.NgayLap).getFullYear() === Number(filterYear));
    if (filterStatus !== "TatCa") list = list.filter((h) => h.TrangThai === filterStatus);

    return [...list].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (av === bv) return 0;
      return (sortAsc ? 1 : -1) * (av < bv ? -1 : 1);
    });
  }, [hoaDonList, searchQ, filterDay, filterMonth, filterYear, filterStatus, sortKey, sortAsc]);

  const stats = useMemo(() => ({
    total: hoaDonList.length,
    done: hoaDonList.filter((h) => h.TrangThai === "DaThanhToan").length,
    pending: hoaDonList.filter((h) => h.TrangThai === "ChuaThanhToan").length,
    revenue: hoaDonList
      .filter((h) => h.TrangThai === "DaThanhToan")
      .reduce((s, h) => s + Number(h.TongTien), 0),
  }), [hoaDonList]);

  const handleSort = (key: keyof HoaDon) => {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ col }: { col: keyof HoaDon }) =>
    sortKey === col
      ? sortAsc ? <ChevronUp size={13} className="inline ml-0.5" /> : <ChevronDown size={13} className="inline ml-0.5" />
      : <ChevronDown size={13} className="inline ml-0.5 opacity-30" />;

  const thCls = "px-3 py-2.5 text-left text-xs font-semibold text-[#8a6040] cursor-pointer select-none hover:text-[#3d1f0a] transition-colors whitespace-nowrap";

  const hasFilter = searchQ || filterDay || filterMonth || filterYear || filterStatus !== "TatCa";
  const clearFilters = () => { setSearchQ(""); setFilterDay(""); setFilterMonth(""); setFilterYear(""); setFilterStatus("TatCa"); };

  if (authLoading) return <div className="p-8 text-center text-[#8a6040]">Đang tải...</div>;

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Tổng hóa đơn", value: stats.total, icon: <Receipt size={16} />, accent: false },
          { label: "Đã thanh toán", value: stats.done, icon: <CheckCircle2 size={16} />, accent: false },
          { label: "Chưa thanh toán", value: stats.pending, icon: <Clock size={16} />, accent: stats.pending > 0 },
          { label: "Doanh thu", value: fmtVND(stats.revenue), icon: <ShoppingBag size={16} />, accent: false, big: true },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-2xl shadow-md px-4 py-3 flex items-center gap-3 ${s.accent ? "ring-1 ring-blue-300" : ""}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s.accent ? "bg-blue-50 text-blue-500" : "bg-[#f5ede0] text-[#c8860a]"}`}>
              {s.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#8a6040]">{s.label}</p>
              <p className={`font-bold leading-tight truncate ${s.accent ? "text-blue-500" : "text-[#3d1f0a]"} ${s.big ? "text-base" : "text-xl"}`}>
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a6040]" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Mã hóa đơn hoặc tên khách..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-[#e8d5b0] rounded-xl bg-[#fdf6e3] focus:outline-none focus:ring-1 focus:ring-[#c8860a] text-[#3d1f0a] placeholder:text-[#8a6040]/60"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <CalendarDays size={14} className="text-[#8a6040]" />
          {[
            { placeholder: "Ngày", value: filterDay, set: setFilterDay, w: "w-16" },
            { placeholder: "Tháng", value: filterMonth, set: setFilterMonth, w: "w-16" },
            { placeholder: "Năm", value: filterYear, set: setFilterYear, w: "w-20" },
          ].map((f) => (
            <input
              key={f.placeholder}
              type="number"
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              placeholder={f.placeholder}
              className={`${f.w} px-2 py-2 text-sm border border-[#e8d5b0] rounded-xl bg-[#fdf6e3] focus:outline-none focus:ring-1 focus:ring-[#c8860a] text-[#3d1f0a] placeholder:text-[#8a6040]/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`}
            />
          ))}
        </div>

        <div className="flex gap-1.5">
          {(["TatCa", "ChuaThanhToan", "DaThanhToan", "DaHuy"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${filterStatus === s
                ? "bg-[#c8860a] text-white shadow-sm"
                : "bg-[#f0e6d0] text-[#8a6040] hover:bg-[#e8d5b0]"
                }`}
            >
              {s === "TatCa" ? "Tất cả" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        {hasFilter && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-[#f0e6d0] text-[#8a6040] hover:bg-[#e8d5b0] transition-colors"
          >
            <X size={12} /> Xóa lọc
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto bg-white rounded-2xl shadow-md">
        {fetching ? (
          <p className="text-center py-16 text-sm text-[#8a6040]">Đang tải...</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#fdf6e3] border-b border-[#e8d5b0]">
                <th className={thCls} onClick={() => handleSort("MaHD")}>Mã HĐ <SortIcon col="MaHD" /></th>
                <th className={thCls} onClick={() => handleSort("NgayLap")}>Ngày lập <SortIcon col="NgayLap" /></th>
                <th className={thCls} onClick={() => handleSort("TenKhachHang")}>Khách hàng <SortIcon col="TenKhachHang" /></th>
                <th className={thCls} onClick={() => handleSort("TenNhanVien")}>Nhân viên <SortIcon col="TenNhanVien" /></th>
                <th className={thCls} onClick={() => handleSort("TongTien")}>Tổng tiền <SortIcon col="TongTien" /></th>
                <th className={thCls} onClick={() => handleSort("PhuongThuc")}>Thanh toán <SortIcon col="PhuongThuc" /></th>
                <th className={thCls} onClick={() => handleSort("TrangThai")}>Trạng thái <SortIcon col="TrangThai" /></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-[#8a6040] text-sm">
                    Không tìm thấy hóa đơn nào.
                  </td>
                </tr>
              ) : (
                filtered.map((hd, idx) => {
                  const sc = STATUS_STYLE[hd.TrangThai];
                  return (
                    <tr
                      key={hd.MaHD}
                      onClick={() => xemChiTiet(hd.MaHD)}
                      className={`border-b border-[#e8d5b0]/60 hover:bg-[#fdf6e3] cursor-pointer transition-colors ${idx % 2 === 0 ? "" : "bg-[#fdf6e3]/40"}`}
                    >
                      <td className="px-3 py-2.5">
                        <span className="font-mono text-xs font-semibold text-[#c8860a]">#{hd.MaHD}</span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-[#3d1f0a] text-xs">
                        {fmtDate(hd.NgayLap)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-[#f5ede0] flex items-center justify-center shrink-0">
                            <User size={11} className="text-[#c8860a]" />
                          </div>
                          <span className="text-[#3d1f0a] text-xs">
                            {hd.TenKhachHang || "Khách vãng lai"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-[#8a6040]">{hd.TenNhanVien}</td>
                      <td className="px-3 py-2.5 font-bold text-[#c8860a] whitespace-nowrap">
                        {fmtVND(Number(hd.TongTien))}
                      </td>
                      <td className="px-3 py-2.5">
                        {hd.PhuongThuc ? (
                          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${PAYMENT_STYLE[hd.PhuongThuc] ?? "bg-gray-100 text-gray-600"}`}>
                            {PAYMENT_LABEL[hd.PhuongThuc] ?? hd.PhuongThuc}
                          </span>
                        ) : (
                          <span className="text-xs text-[#8a6040]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${sc.bg} ${sc.color}`}>
                          {sc.icon} {STATUS_LABEL[hd.TrangThai]}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        <div className="px-4 py-2.5 border-t border-[#e8d5b0] flex items-center justify-between">
          <span className="text-xs text-[#8a6040]">
            Hiển thị <span className="font-semibold text-[#3d1f0a]">{filtered.length}</span> / {hoaDonList.length} hóa đơn
          </span>
          <span className="text-xs text-[#8a6040]">
            Tổng lọc:{" "}
            <span className="font-bold text-[#c8860a]">
              {fmtVND(filtered.filter((h) => h.TrangThai === "DaThanhToan").reduce((s, h) => s + Number(h.TongTien), 0))}
            </span>
          </span>
        </div>
      </div>

      {/* ── Modal chi tiết (read-only) ── */}
      {showChiTiet && chiTiet && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8d5b0] shrink-0">
              <div>
                <h2 className="font-bold text-[#3d1f0a] text-base">Hóa đơn #{chiTiet.MaHD}</h2>
                <p className="text-xs text-[#8a6040] mt-0.5">{fmtDate(chiTiet.NgayLap)}</p>
              </div>
              <button onClick={() => setShowChiTiet(false)} className="p-1 rounded-lg hover:bg-[#f5ede0] text-[#8a6040]">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-4 flex flex-col gap-4 overflow-y-auto flex-1">
              {/* Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#fdf6e3]">
                  <p className="text-[#8a6040] mb-0.5">Khách hàng</p>
                  <p className="font-semibold text-[#3d1f0a]">{chiTiet.TenKhachHang || "Khách vãng lai"}</p>
                  {chiTiet.SDT && <p className="text-[#8a6040]">{chiTiet.SDT}</p>}
                </div>
                <div className="p-3 rounded-xl bg-[#fdf6e3]">
                  <p className="text-[#8a6040] mb-0.5">Nhân viên</p>
                  <p className="font-semibold text-[#3d1f0a]">{chiTiet.TenNhanVien}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#fdf6e3]">
                  <p className="text-[#8a6040] mb-0.5">Thanh toán</p>
                  <p className="font-semibold text-[#3d1f0a]">
                    {chiTiet.PhuongThuc ? PAYMENT_LABEL[chiTiet.PhuongThuc] : "—"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#fdf6e3]">
                  <p className="text-[#8a6040] mb-0.5">Trạng thái</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[chiTiet.TrangThai].bg} ${STATUS_STYLE[chiTiet.TrangThai].color}`}>
                    {STATUS_STYLE[chiTiet.TrangThai].icon} {STATUS_LABEL[chiTiet.TrangThai]}
                  </span>
                </div>
              </div>

              {/* Chi tiết sản phẩm */}
              <div>
                <p className="text-xs font-semibold text-[#8a6040] mb-2">Sản phẩm</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#fdf6e3] border-b border-[#e8d5b0]">
                      {["Tên bánh", "Size", "SL", "Đơn giá", "Thành tiền"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-[#8a6040]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chiTiet.chiTiet.map((ct, i) => (
                      <tr key={i} className="border-b border-[#e8d5b0]/60">
                        <td className="px-3 py-2 text-[#3d1f0a] font-medium">{ct.TenBanh}</td>
                        <td className="px-3 py-2 text-[#8a6040]">{ct.KichThuoc}</td>
                        <td className="px-3 py-2 text-[#3d1f0a]">{ct.SoLuong}</td>
                        <td className="px-3 py-2 text-[#8a6040]">{fmtVND(Number(ct.DonGia))}</td>
                        <td className="px-3 py-2 font-bold text-[#c8860a]">{fmtVND(Number(ct.ThanhTien))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#e8d5b0] flex justify-between items-center shrink-0">
              <span className="text-sm font-bold text-[#3d1f0a]">
                Tổng cộng: <span className="text-[#c8860a]">{fmtVND(Number(chiTiet.TongTien))}</span>
              </span>
              <button
                onClick={() => setShowChiTiet(false)}
                className="px-4 py-2 text-sm rounded-xl bg-[#f0e6d0] text-[#8a6040] hover:bg-[#e8d5b0] font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}