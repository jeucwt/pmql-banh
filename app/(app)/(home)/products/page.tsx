"use client";

import { useState, useEffect } from "react";
import Navbar from "../navbar";
import ProductCard from "../product-card";
import SearchFilter from "../search-filter/page";
import { Footer } from "../footer/footer";
import { getDanhSachBanh, Banh } from "@/lib/api/banh";

export default function ProductsPage() {
  const [products, setProducts] = useState<Banh[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    getDanhSachBanh()
      .then((data) => setProducts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ backgroundColor: "#FFF8F0" }} className="min-h-screen flex flex-col">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full">
        <h1 className="text-4xl font-bold text-center mb-8" style={{ color: "#664930" }}>
          Tất Cả Sản Phẩm
        </h1>
        
        {/* Search Fillter */}
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categories={["all", ...Array.from(new Set(products.map(p => p.TenLoai))).filter(Boolean)]}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
        
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products
              .filter((p) =>
                (selectedCategory === "all" || p.TenLoai === selectedCategory) &&
                (p.TenBanh.toLowerCase().includes(searchTerm.toLowerCase()))
              )
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
}
