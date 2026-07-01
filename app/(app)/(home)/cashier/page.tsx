"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search, ShoppingCart, Trash2, Plus, Minus,
  CreditCard, ChefHat, X, CheckCircle, Clock
} from "lucide-react";
import { useRouteGuard } from "@/lib/useRouteGuard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getToken() {
  return localStorage.getItem("tiem_banh_token");
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Size {
  MaSize: number;
  KichThuoc: string;
  GiaTien: number;
}

interface Banh {
  MaBanh: number;
  TenBanh: string;
  TenLoai: string;
  TrangThaiBanh: string;
  sizes: Size[];
}

interface CartItem {
  maBanh: number;
  maSize: number;
  tenBanh: string;
  kichThuoc: string;
  donGia: number;
  soLuong: number;
}

interface DonHangCho {
  MaDH: number;
  NgayDat: string;
  TongTien: number;
  TenKhachHang: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

function cartKey(maBanh: number, maSize: number) {
  return `${maBanh}-${maSize}`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ThuNganPage() {
  const { loading } = useRouteGuard("cashier");

  const [tab, setTab] = useState<"pos" | "doncho">("pos");

  // POS state
  const [products, setProducts] = useState<Banh[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);

  // Modal chọn size
  const [sizeModal, setSizeModal] = useState<Banh | null>(null);

  // Modal thanh toán
  const [payModal, setPayModal] = useState(false);
  const [pttt, setPttt] = useState<"TienMat" | "ChuyenKhoan" | "The">("TienMat");
  const [paying, setPaying] = useState(false);
  const [successHD, setSuccessHD] = useState<{ maHD: number; tongTien: number } | null>(null);

  // Đơn chờ state
  const [donChoList, setDonChoList] = useState<DonHangCho[]>([]);
  const [loadingDonCho, setLoadingDonCho] = useState(false);
  const [duyetId, setDuyetId] = useState<number | null>(null);

  // ── Fetch sản phẩm ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/api/banh`)
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .catch(console.error)
      .finally(() => setLoadingProducts(false));
  }, []);

  // ── Fetch đơn chờ khi chuyển tab ────────────────────────────────────────────
  useEffect(() => {
    if (tab !== "doncho") return;
    fetchDonCho();
  }, [tab]);

  async function fetchDonCho() {
    setLoadingDonCho(true);
    try {
      const res = await fetch(`${API_URL}/api/hoadon/donhang-cho`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setDonChoList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDonCho(false);
    }
  }

  // ── Cart logic ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return products;
    return products.filter((p) =>
      p.TenBanh.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  function addToCart(banh: Banh, size: Size) {
    const key = cartKey(banh.MaBanh, size.MaSize);
    setCart((prev) => {
      const exist = prev.find((c) => cartKey(c.maBanh, c.maSize) === key);
      if (exist) {
        return prev.map((c) =>
          cartKey(c.maBanh, c.maSize) === key ? { ...c, soLuong: c.soLuong + 1 } : c
        );
      }
      return [
        ...prev,
        {
          maBanh: banh.MaBanh,
          maSize: size.MaSize,
          tenBanh: banh.TenBanh,
          kichThuoc: size.KichThuoc,
          donGia: size.GiaTien,
          soLuong: 1,
        },
      ];
    });
    setSizeModal(null);
  }

  function changeQty(maBanh: number, maSize: number, delta: number) {
    const key = cartKey(maBanh, maSize);
    setCart((prev) =>
      prev
        .map((c) => cartKey(c.maBanh, c.maSize) === key ? { ...c, soLuong: c.soLuong + delta } : c)
        .filter((c) => c.soLuong > 0)
    );
  }

  function removeItem(maBanh: number, maSize: number) {
    const key = cartKey(maBanh, maSize);
    setCart((prev) => prev.filter((c) => cartKey(c.maBanh, c.maSize) !== key));
  }

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.donGia * i.soLuong, 0), [cart]);
  const discountAmt = useMemo(() => Math.round(subtotal * (discount / 100)), [subtotal, discount]);
  const total = subtotal - discountAmt;

  // ── Thanh toán tại quầy ──────────────────────────────────────────────────────
  async function handleThanhToan() {
    setPaying(true);
    try {
      const res = await fetch(`${API_URL}/api/hoadon/tai-quay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          items: cart.map((c) => ({
            maBanh: c.maBanh,
            maSize: c.maSize,
            soLuong: c.soLuong,
          })),
          phuongThucThanhToan: pttt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccessHD({ maHD: data.maHD, tongTien: data.tongTien });
      setCart([]);
      setDiscount(0);
      setPayModal(false);
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    } finally {
      setPaying(false);
    }
  }

  // ── Duyệt đơn chờ ───────────────────────────────────────────────────────────
  async function handleDuyetDon(maDH: number) {
    setDuyetId(maDH);
    try {
      const res = await fetch(`${API_URL}/api/hoadon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ maDH, phuongThucThanhToan: "TienMat" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      // Reload danh sách
      fetchDonCho();
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    } finally {
      setDuyetId(null);
    }
  }

  if (loading) return null;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* ── Tabs ──────────────────────────────────────────────────────────────── */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("pos")}
          className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${tab === "pos"
            ? "bg-[#664930] text-white shadow"
            : "bg-[#FFDBBB] text-[#664930] hover:bg-[#CCBEB1]"
            }`}
        >
          🛒 Bán tại quầy
        </button>
        <button
          onClick={() => setTab("doncho")}
          className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${tab === "doncho"
            ? "bg-[#664930] text-white shadow"
            : "bg-[#FFDBBB] text-[#664930] hover:bg-[#CCBEB1]"
            }`}
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Đơn chờ duyệt
            {donChoList.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {donChoList.length}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* ── TAB: POS ──────────────────────────────────────────────────────────── */}
      {tab === "pos" && (
        <div className="flex gap-5 flex-1 min-h-0">
          {/* LEFT: Product Grid */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#997E67]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full pl-9 pr-4 py-2.5 border border-[#CCBEB1] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#664930] text-sm text-[#664930] placeholder:text-[#997E67]/60"
                />
              </div>
              <div className="text-xs text-[#997E67] whitespace-nowrap bg-white border border-[#CCBEB1] rounded-xl px-3 py-2.5">
                {filtered.length} sản phẩm
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {loadingProducts ? (
                <div className="flex items-center justify-center h-40 text-[#997E67]">
                  Đang tải sản phẩm...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filtered.map((p) => {
                    const minPrice = p.sizes.length > 0
                      ? Math.min(...p.sizes.map((s) => s.GiaTien))
                      : 0;
                    const inCart = cart.some((c) => c.maBanh === p.MaBanh);
                    return (
                      <button
                        key={p.MaBanh}
                        onClick={() => setSizeModal(p)}
                        className={`relative bg-white rounded-2xl shadow-md p-4 text-left transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 border-2 ${inCart ? "border-[#664930]" : "border-transparent"
                          }`}
                      >
                        {inCart && (
                          <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#664930] text-white text-[10px] font-bold flex items-center justify-center">
                            {cart.filter((c) => c.maBanh === p.MaBanh).reduce((s, c) => s + c.soLuong, 0)}
                          </span>
                        )}
                        <div className="text-4xl mb-3 flex items-center justify-center h-14">
                          <ChefHat className="w-10 h-10 text-[#CCBEB1]" />
                        </div>
                        <p className="text-[#664930] font-semibold text-sm leading-tight mb-1 line-clamp-2">
                          {p.TenBanh}
                        </p>
                        <p className="text-[#997E67] text-xs mb-1">{p.TenLoai}</p>
                        <p className="text-[#664930] font-bold text-sm">
                          {p.sizes.length > 1 ? "từ " : ""}{formatVND(minPrice)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
              {!loadingProducts && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-[#997E67]/50 gap-2">
                  <span className="text-5xl">🔍</span>
                  <p className="text-sm">Không tìm thấy sản phẩm</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Cart */}
          <div className="w-72 xl:w-80 flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-[#CCBEB1]">
            <div className="bg-[#664930] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <ShoppingCart className="w-5 h-5" />
                <span className="font-bold text-base">Hóa đơn</span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => { setCart([]); setDiscount(0); }}
                  className="text-white/70 hover:text-white text-xs underline"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-[#997E67]/40 gap-2">
                  <ShoppingCart className="w-10 h-10" />
                  <p className="text-sm">Chưa có sản phẩm</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={cartKey(item.maBanh, item.maSize)}
                    className="flex items-center gap-3 bg-[#FFF8F0] rounded-xl p-2.5 border border-[#FFDBBB]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[#664930] font-semibold text-xs leading-tight truncate">{item.tenBanh}</p>
                      <p className="text-[#997E67] text-[10px]">{item.kichThuoc}</p>
                      <p className="text-[#664930] font-bold text-xs mt-0.5">{formatVND(item.donGia)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => changeQty(item.maBanh, item.maSize, -1)} className="w-6 h-6 rounded-lg bg-white border border-[#CCBEB1] flex items-center justify-center hover:bg-[#FFDBBB]">
                        <Minus className="w-3 h-3 text-[#997E67]" />
                      </button>
                      <span className="w-6 text-center text-[#664930] font-bold text-sm">{item.soLuong}</span>
                      <button onClick={() => changeQty(item.maBanh, item.maSize, 1)} className="w-6 h-6 rounded-lg bg-white border border-[#CCBEB1] flex items-center justify-center hover:bg-[#FFDBBB]">
                        <Plus className="w-3 h-3 text-[#997E67]" />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.maBanh, item.maSize)} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-rose-50">
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-[#CCBEB1] px-4 py-4 space-y-3 bg-[#FFF8F0]">
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#997E67] whitespace-nowrap font-medium">Giảm giá (%)</label>
                <input
                  type="number" min={0} max={100} value={discount}
                  onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-16 ml-auto text-right px-2 py-1 border border-[#CCBEB1] rounded-lg bg-white text-sm text-[#664930] focus:outline-none focus:ring-1 focus:ring-[#664930]"
                />
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-[#997E67]">
                  <span>Tạm tính</span>
                  <span className="font-medium text-[#664930]">{formatVND(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Giảm {discount}%</span>
                    <span className="font-medium">-{formatVND(discountAmt)}</span>
                  </div>
                )}
                <div className="border-t border-[#CCBEB1] pt-2 flex justify-between items-center">
                  <span className="font-bold text-[#664930]">Tổng cộng</span>
                  <span className="font-extrabold text-[#664930] text-lg">{formatVND(total)}</span>
                </div>
              </div>
              <button
                disabled={cart.length === 0}
                onClick={() => setPayModal(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#664930] text-white font-semibold text-sm shadow-md transition-all hover:bg-[#997E67] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CreditCard className="w-4 h-4" />
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Đơn chờ ──────────────────────────────────────────────────────── */}
      {tab === "doncho" && (
        <div className="flex-1 overflow-y-auto">
          {loadingDonCho ? (
            <div className="flex items-center justify-center h-40 text-[#997E67]">Đang tải...</div>
          ) : donChoList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-[#997E67]/50 gap-2">
              <CheckCircle className="w-10 h-10" />
              <p className="text-sm">Không có đơn nào chờ duyệt</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {donChoList.map((don) => (
                <div key={don.MaDH} className="bg-white rounded-2xl border border-[#CCBEB1] p-4 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#664930]">Đơn #{don.MaDH}</span>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Chờ xác nhận</span>
                  </div>
                  <div className="text-sm text-[#997E67] space-y-1">
                    <p>Khách: <span className="text-[#664930] font-medium">{don.TenKhachHang ?? "Khách vãng lai"}</span></p>
                    <p>Ngày đặt: <span className="text-[#664930]">{new Date(don.NgayDat).toLocaleString("vi-VN")}</span></p>
                    <p>Tổng tiền: <span className="font-bold text-[#664930]">{formatVND(don.TongTien)}</span></p>
                  </div>
                  <button
                    onClick={() => handleDuyetDon(don.MaDH)}
                    disabled={duyetId === don.MaDH}
                    className="w-full py-2 rounded-xl bg-[#664930] text-white font-semibold text-sm hover:bg-[#997E67] transition-all disabled:opacity-50"
                  >
                    {duyetId === don.MaDH ? "Đang duyệt..." : "✓ Duyệt & thanh toán"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: Chọn size ──────────────────────────────────────────────────── */}
      {sizeModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#664930] text-lg">{sizeModal.TenBanh}</h3>
              <button onClick={() => setSizeModal(null)} className="text-[#997E67] hover:text-[#664930]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-[#997E67] mb-4">Chọn kích thước:</p>
            <div className="flex flex-col gap-2">
              {sizeModal.sizes.map((size) => (
                <button
                  key={size.MaSize}
                  onClick={() => addToCart(sizeModal, size)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border-2 border-[#CCBEB1] hover:border-[#664930] hover:bg-[#FFF8F0] transition-all"
                >
                  <span className="font-semibold text-[#664930]">{size.KichThuoc}</span>
                  <span className="font-bold text-[#664930]">{formatVND(size.GiaTien)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Thanh toán ─────────────────────────────────────────────────── */}
      {payModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#664930] text-lg">Xác nhận thanh toán</h3>
              <button onClick={() => setPayModal(false)} className="text-[#997E67] hover:text-[#664930]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-2xl font-extrabold text-[#664930] text-center mb-4">{formatVND(total)}</p>
            <p className="text-sm text-[#997E67] mb-2">Phương thức thanh toán:</p>
            <div className="flex gap-2 mb-6">
              {(["TienMat", "ChuyenKhoan", "The"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPttt(p)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${pttt === p ? "border-[#664930] bg-[#664930] text-white" : "border-[#CCBEB1] text-[#664930] hover:border-[#664930]"
                    }`}
                >
                  {p === "TienMat" ? "Tiền mặt" : p === "ChuyenKhoan" ? "Chuyển khoản" : "Thẻ"}
                </button>
              ))}
            </div>
            <button
              onClick={handleThanhToan}
              disabled={paying}
              className="w-full py-3 rounded-xl bg-[#664930] text-white font-bold text-base hover:bg-[#997E67] transition-all disabled:opacity-50"
            >
              {paying ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: Thành công ─────────────────────────────────────────────────── */}
      {successHD && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-[#664930] text-xl mb-1">Thanh toán thành công!</h3>
            <p className="text-[#997E67] text-sm mb-1">Mã hóa đơn: <span className="font-bold text-[#664930]">#{successHD.maHD}</span></p>
            <p className="text-[#997E67] text-sm mb-5">Tổng tiền: <span className="font-bold text-[#664930]">{formatVND(successHD.tongTien)}</span></p>
            <button
              onClick={() => setSuccessHD(null)}
              className="w-full py-2.5 rounded-xl bg-[#664930] text-white font-semibold hover:bg-[#997E67] transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}