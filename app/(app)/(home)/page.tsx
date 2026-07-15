"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "./navbar";
import ProductCard from "./product-card";
import SearchFilter from "./search-filter/page";
import { Footer } from "./footer/footer";
import { getDanhSachBanh, Banh } from "@/lib/api/banh"
import { Hero } from "./hero";

export default function Page() {
  const [products, setProducts] = useState<Banh[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    getDanhSachBanh()
      .then((data) => setProducts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ backgroundColor: "#FFF8F0" }} className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />

      <main id="products" className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-3xl font-bold" style={{ color: "#664930" }}>
            Sản Phẩm Nổi Bật
          </h2>
          <Link href="/products" className="text-sm font-semibold hover:underline" style={{ color: "#c8860a" }}>
            Xem tất cả →
          </Link>
        </div>
        {loading && (
          <p className="text-center py-10" style={{ color: "#997E67" }}>
            Đang tải sản phẩm...
          </p>
        )}
        {error && (
          <p className="text-center py-10 text-red-500">{error}</p>
        )}

        {/* Tải bánh */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {products
              .slice(0, 4)
              .map((p) => {
                const giaThapNhat = p.sizes?.length > 0
                  ? Math.min(...p.sizes.map((s) => s.GiaTien))
                  : null;
                return (
                    <ProductCard
                      key={p.MaBanh}
                      id={String(p.MaBanh)}
                      name={p.TenBanh}
                      description={p.MoTa}
                      price={giaThapNhat}
                      imageUrl={p.HinhAnh}
                    />
                );
              })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};