"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../navbar";
import { Footer } from "../../footer/footer";
import { getChiTietBanh, Banh } from "@/lib/api/banh";



export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<Banh | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [ordering, setOrdering] = useState(false);
  const router = useRouter();


  useEffect(() => {
    getChiTietBanh(id)
      .then((data) => setProduct(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ backgroundColor: "#FFFDBBB" }} className="min-h-screen">
        <Navbar />
        <p className="text-center py-20" style={{ color: "#997E67" }}>
          Đang tải...
        </p>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ backgroundColor: "#FFF8F0" }} className="min-h-screen">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 py-20 text-center">
          <p style={{ color: "#664930" }} className="text-xl font-semibold">
            Không tìm thấy sản phẩm.
          </p>
          <Link href="/" style={{ color: "#997E67" }} className="mt-4 inline-block underline">
            ← Quay về trang chủ
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const giaHienThi = product.sizes?.length > 0
    ? Math.min(...product.sizes.map((s) => s.GiaTien))
    : 0;

  async function handleOrder() {
    if (!selectedSize) {
      alert("Vui lòng chọn size trước khi đặt hàng");
      return;
    }
    const token = localStorage.getItem("tiem_banh_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setOrdering(true);
    try {
      const res = await fetch("http://localhost:3001/api/donhang", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [{ maBanh: product!.MaBanh, maSize: selectedSize, soLuong: quantity }],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Đặt hàng thất bại");
        return;
      }

      router.push("/customer/orders");
    } catch {
      alert("Lỗi kết nối server");
    } finally {
      setOrdering(false);
    }
  }
  return (
    <div style={{ backgroundColor: "#FFF8F0" }} className="min-h-screen">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: "#997E67" }}>
          <Link href="/" className="hover:underline">
            Trang chủ
          </Link>
          <span>›</span>
          <span style={{ color: "#664930" }} className="font-semibold">
            {product.TenBanh}
          </span>
        </nav>

        {/* Product layout */}
        <div className="flex flex-col md:flex-row gap-10">
          {/* Image */}
          <div
            className="md:w-1/2 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: "#FFDBBB", minHeight: "360px" }}
          >
            {/* Placeholder hình ảnh */}
            <div className="flex flex-col items-center gap-3 opacity-40">
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="80" height="80" rx="16" fill="#CCBEB1" />
                <path
                  d="M20 55 L30 40 L40 48 L52 30 L60 55 Z"
                  fill="#997E67"
                />
                <circle cx="28" cy="30" r="6" fill="#997E67" />
              </svg>
              <span style={{ color: "#664930", fontSize: 13 }}>
                Hình ảnh sản phẩm
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="md:w-1/2 flex flex-col justify-between">
            {/* Title */}
            <div>
              <h1
                className="text-3xl font-bold mb-1"
                style={{ color: "#664930" }}
              >
                {product.TenBanh}
              </h1>
              <span
                className="inline-block text-xs px-3 py-0.5 rounded-full mb-4"
                style={{ backgroundColor: "#CCBEB1", color: "#664930" }}
              >
                {product.TenLoai}
              </span>

              {/* Size + Price */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-2" style={{ color: "#664930" }}>
                  Chọn size:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes?.map((s) => (
                    <button
                      key={s.MaSize}
                      onClick={() => setSelectedSize(s.MaSize)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all"
                      style={{
                        borderColor: selectedSize === s.MaSize ? "#664930" : "#CCBEB1",
                        backgroundColor: selectedSize === s.MaSize ? "#664930" : "transparent",
                        color: selectedSize === s.MaSize ? "#FFDBBB" : "#664930",
                      }}
                    >
                      {s.KichThuoc} — {s.GiaTien.toLocaleString("vi-VN")} ₫
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm mb-4 leading-relaxed" style={{ color: "#664930" }}>
                {product.MoTa}
              </p>

              {/* Quantity */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-sm font-medium" style={{ color: "#664930" }}>
                  Số lượng:
                </span>
                <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: "#CCBEB1" }}>
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-lg font-bold"
                    style={{ backgroundColor: "#CCBEB1", color: "#664930" }}
                  >−</button>
                  <span className="px-5 py-1.5 text-sm font-semibold" style={{ color: "#664930" }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 text-lg font-bold"
                    style={{ backgroundColor: "#CCBEB1", color: "#664930" }}
                  >+</button>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleOrder}
                disabled={ordering}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-85 active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: "#664930", color: "#FFDBBB" }}
              >
                {ordering ? "Đang đặt..." : "🛒 Mua ngay"}
              </button>
              <button
                className="flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-opacity hover:opacity-85 active:scale-95"
                style={{ borderColor: "#664930", color: "#664930", backgroundColor: "transparent" }}
              >
                Thêm vào giỏ hàng
              </button>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
