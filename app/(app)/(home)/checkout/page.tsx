"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../navbar";
import { Footer } from "../footer/footer";
import { useCart } from "@/lib/CartContext";

interface CheckoutItem {
    maBanh: number;
    tenBanh: string;
    maSize: number;
    kichThuoc: string;
    giaTien: number;
    soLuong: number;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { clearCart } = useCart();
    
    const [items, setItems] = useState<CheckoutItem[]>([]);
    const [isCartCheckout, setIsCartCheckout] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [ordering, setOrdering] = useState(false);
    const [customerInfo, setCustomerInfo] = useState<{ HoTen: string, SDT: string, DiaChi: string } | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    
    useEffect(() => {
        const storedItems = sessionStorage.getItem("checkout_items");
        const storedIsCart = sessionStorage.getItem("is_cart_checkout");
        
        if (!storedItems) {
            router.push("/cart");
            return;
        }
        
        try {
            setItems(JSON.parse(storedItems));
            setIsCartCheckout(storedIsCart === "true");
        } catch (e) {
            router.push("/cart");
        }

        const token = localStorage.getItem("tiem_banh_token");
        if (token) {
            fetch("http://localhost:3001/api/kh/me", {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    setCustomerInfo(data);
                })
                .catch(console.error)
                .finally(() => setLoadingProfile(false));
        } else {
            router.push("/login");
        }
    }, [router]);

    const totalTien = items.reduce((sum, i) => sum + i.giaTien * i.soLuong, 0);

    async function handlePlaceOrder() {
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
                    items: items.map(i => ({ maBanh: i.maBanh, maSize: i.maSize, soLuong: i.soLuong })),
                    // phuongThucThanhToan: paymentMethod (backend might ignore this)
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.message || "Đặt hàng thất bại");
                return;
            }

            if (isCartCheckout) {
                clearCart();
            }
            
            sessionStorage.removeItem("checkout_items");
            sessionStorage.removeItem("is_cart_checkout");
            
            alert("Đặt hàng thành công!");
            router.push("/customer/orders");
        } catch (error) {
            alert("Lỗi kết nối server");
        } finally {
            setOrdering(false);
        }
    }

    if (items.length === 0) return null;

    return (
        <div style={{ backgroundColor: "#FFF8F0" }} className="min-h-screen flex flex-col">
            <Navbar />
            
            <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
                <h1 className="text-3xl font-bold mb-8" style={{ color: "#664930" }}>Thanh toán</h1>
                
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left side: Payment Method & Details */}
                    <div className="flex-1 flex flex-col gap-6">
                        {/* Delivery Address */}
                        <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: "#CCBEB1" }}>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#664930" }}>Địa chỉ giao hàng</h2>
                            
                            {loadingProfile ? (
                                <p className="text-sm text-[#997E67]">Đang tải thông tin...</p>
                            ) : !customerInfo?.DiaChi ? (
                                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
                                    <p className="text-rose-600 text-sm font-medium mb-3">Bạn chưa cập nhật địa chỉ giao hàng. Vui lòng cập nhật thông tin để tiếp tục đặt hàng.</p>
                                    <button
                                        onClick={() => router.push("/customer")}
                                        className="px-4 py-2 bg-rose-600 text-white text-sm font-bold rounded-lg hover:bg-rose-700 transition-colors"
                                    >
                                        Cập nhật địa chỉ ngay
                                    </button>
                                </div>
                            ) : (
                                <div className="text-sm" style={{ color: "#664930" }}>
                                    <p className="font-bold mb-1">{customerInfo.HoTen || "Khách hàng"}</p>
                                    <p className="mb-1">{customerInfo.SDT || "Chưa có số điện thoại"}</p>
                                    <p>{customerInfo.DiaChi}</p>
                                    <button
                                        onClick={() => router.push("/customer")}
                                        className="mt-3 text-xs underline font-medium hover:opacity-80"
                                        style={{ color: "#997E67" }}
                                    >
                                        Thay đổi địa chỉ
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Payment Methods */}
                        {customerInfo?.DiaChi && (
                            <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: "#CCBEB1" }}>
                                <h2 className="text-xl font-bold mb-4" style={{ color: "#664930" }}>Phương thức thanh toán</h2>
                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors hover:bg-[#FFF8F0]" style={{ borderColor: paymentMethod === "cash" ? "#664930" : "#CCBEB1", backgroundColor: paymentMethod === "cash" ? "#FFF8F0" : "white" }}>
                                        <input type="radio" name="payment" value="cash" checked={paymentMethod === "cash"} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4" style={{ accentColor: "#664930" }} />
                                        <span className="font-medium" style={{ color: "#664930" }}>Thanh toán tiền mặt khi nhận hàng</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors hover:bg-[#FFF8F0]" style={{ borderColor: paymentMethod === "transfer" ? "#664930" : "#CCBEB1", backgroundColor: paymentMethod === "transfer" ? "#FFF8F0" : "white" }}>
                                        <input type="radio" name="payment" value="transfer" checked={paymentMethod === "transfer"} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4" style={{ accentColor: "#664930" }} />
                                        <span className="font-medium" style={{ color: "#664930" }}>Chuyển khoản ngân hàng</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors hover:bg-[#FFF8F0]" style={{ borderColor: paymentMethod === "card" ? "#664930" : "#CCBEB1", backgroundColor: paymentMethod === "card" ? "#FFF8F0" : "white" }}>
                                        <input type="radio" name="payment" value="card" checked={paymentMethod === "card"} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4" style={{ accentColor: "#664930" }} />
                                        <span className="font-medium" style={{ color: "#664930" }}>Thanh toán bằng thẻ (Visa, Mastercard)</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right side: Order Summary */}
                    <div className="w-full md:w-1/3">
                        <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-8" style={{ borderColor: "#CCBEB1" }}>
                            <h2 className="text-xl font-bold mb-4" style={{ color: "#664930" }}>Tóm tắt đơn hàng</h2>
                            
                            <div className="flex flex-col gap-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start gap-4">
                                        <div>
                                            <p className="font-semibold text-sm" style={{ color: "#664930" }}>{item.tenBanh}</p>
                                            <p className="text-xs" style={{ color: "#997E67" }}>Size: {item.kichThuoc} x {item.soLuong}</p>
                                        </div>
                                        <p className="font-medium text-sm" style={{ color: "#664930" }}>
                                            {(item.giaTien * item.soLuong).toLocaleString("vi-VN")} ₫
                                        </p>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="border-t pt-4 mb-6" style={{ borderColor: "#CCBEB1" }}>
                                <div className="flex justify-between items-center mb-2">
                                    <span style={{ color: "#997E67" }}>Tạm tính</span>
                                    <span className="font-medium" style={{ color: "#664930" }}>{totalTien.toLocaleString("vi-VN")} ₫</span>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <span style={{ color: "#997E67" }}>Phí vận chuyển</span>
                                    <span className="font-medium" style={{ color: "#664930" }}>0 ₫</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold" style={{ color: "#664930" }}>Tổng cộng</span>
                                    <span className="text-xl font-bold" style={{ color: "#664930" }}>{totalTien.toLocaleString("vi-VN")} ₫</span>
                                </div>
                            </div>
                            
                            <button
                                onClick={handlePlaceOrder}
                                disabled={ordering || !customerInfo?.DiaChi}
                                className="w-full py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                style={{ backgroundColor: "#664930" }}
                            >
                                {ordering ? "Đang xử lý..." : (!customerInfo?.DiaChi ? "Vui lòng cập nhật địa chỉ" : "Xác nhận đặt hàng")}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}
