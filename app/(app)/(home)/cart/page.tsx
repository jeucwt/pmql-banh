"use client";

import { useCart } from "@/lib/CartContext";
import Navbar from "../navbar";
import { Footer } from "../footer/footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartPage() {
    const { items, updateQuantity, removeFromCart, totalTien, clearCart } = useCart();
    const router = useRouter();
    const [ordering, setOrdering] = useState(false);

    async function handleCheckout() {
        if (items.length === 0) {
            alert("Giỏ hàng trống!");
            return;
        }

        const token = localStorage.getItem("tiem_banh_token");
        if (!token) {
            router.push("/login");
            return;
        }

        sessionStorage.setItem("checkout_items", JSON.stringify(items));
        sessionStorage.setItem("is_cart_checkout", "true");
        router.push("/checkout");
    }

    return (
        <div style={{ backgroundColor: "#FFF8F0" }} className="min-h-screen">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-8" style={{ color: "#664930" }}>Giỏ hàng của bạn</h1>

                {items.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="mb-4" style={{ color: "#997E67" }}>Giỏ hàng đang trống.</p>
                        <Link href="/products" className="underline font-semibold" style={{ color: "#664930" }}>
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ borderColor: "#CCBEB1", borderWidth: 1 }}>
                            <table className="w-full text-left border-collapse">
                                <thead style={{ backgroundColor: "#FFDBBB", color: "#664930" }}>
                                    <tr>
                                        <th className="py-4 px-6 font-semibold border-b border-[#CCBEB1]">Sản phẩm</th>
                                        <th className="py-4 px-6 font-semibold border-b border-[#CCBEB1] w-32 text-center">Đơn giá</th>
                                        <th className="py-4 px-6 font-semibold border-b border-[#CCBEB1] w-32 text-center">Số lượng</th>
                                        <th className="py-4 px-6 font-semibold border-b border-[#CCBEB1] w-32 text-right">Tổng</th>
                                        <th className="py-4 px-6 font-semibold border-b border-[#CCBEB1] w-16"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={`${item.maBanh}-${item.maSize}`} className="border-b last:border-0" style={{ borderColor: "#CCBEB1" }}>
                                            <td className="py-4 px-6">
                                                <p className="font-semibold text-lg" style={{ color: "#664930" }}>{item.tenBanh}</p>
                                                <p className="text-sm" style={{ color: "#997E67" }}>Size: {item.kichThuoc}</p>
                                            </td>
                                            <td className="py-4 px-6 text-center font-medium" style={{ color: "#664930" }}>
                                                {item.giaTien.toLocaleString("vi-VN")} ₫
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center border rounded-lg overflow-hidden" style={{ borderColor: "#CCBEB1" }}>
                                                    <button
                                                        onClick={() => updateQuantity(item.maBanh, item.maSize, item.soLuong - 1)}
                                                        className="px-2 py-1 font-bold transition-colors hover:bg-black/5"
                                                        style={{ color: "#664930" }}
                                                    >−</button>
                                                    <span className="px-3 py-1 text-sm font-semibold" style={{ color: "#664930" }}>
                                                        {item.soLuong}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.maBanh, item.maSize, item.soLuong + 1)}
                                                        className="px-2 py-1 font-bold transition-colors hover:bg-black/5"
                                                        style={{ color: "#664930" }}
                                                    >+</button>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right font-semibold" style={{ color: "#664930" }}>
                                                {(item.giaTien * item.soLuong).toLocaleString("vi-VN")} ₫
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <button
                                                    onClick={() => removeFromCart(item.maBanh, item.maSize)}
                                                    className="text-red-500 hover:text-red-700 font-bold px-2 py-1"
                                                    title="Xóa"
                                                >
                                                    ✕
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border" style={{ borderColor: "#CCBEB1" }}>
                            <div>
                                <Link href="/products" className="underline text-sm font-medium" style={{ color: "#997E67" }}>
                                    ← Tiếp tục mua sắm
                                </Link>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-sm font-medium mb-1" style={{ color: "#997E67" }}>Tổng thanh toán</p>
                                    <p className="text-2xl font-bold" style={{ color: "#664930" }}>
                                        {totalTien.toLocaleString("vi-VN")} ₫
                                    </p>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    disabled={ordering}
                                    className="px-8 py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                    style={{ backgroundColor: "#664930" }}
                                >
                                    {ordering ? "Đang xử lý..." : "Thanh toán"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
