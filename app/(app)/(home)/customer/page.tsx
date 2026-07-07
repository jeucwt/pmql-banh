"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

interface CustomerProfile {
    TenDangNhap: string;
    Email: string;
    HoTen: string;
    SDT: string;
    DiaChi: string;
}

export default function CustomerProfilePage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<CustomerProfile>({
        TenDangNhap: "",
        Email: "",
        HoTen: "",
        SDT: "",
        DiaChi: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Load thông tin khách hàng từ backend
    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }

        async function fetchProfile() {
            try {
                const token = localStorage.getItem("tiem_banh_token");
                const res = await fetch("http://localhost:3001/api/kh/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setProfile({
                        TenDangNhap: data.TenDangNhap || "",
                        Email: data.Email || "",
                        HoTen: data.HoTen || "",
                        SDT: data.SDT || "",
                        DiaChi: data.DiaChi || ""
                    });
                }
            } catch (err) {
                console.error("Lỗi khi tải thông tin cá nhân", err);
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [user, router]);

    // Xử lý lưu thông tin thay đổi
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const token = localStorage.getItem("tiem_banh_token");
            const res = await fetch("http://localhost:3001/api/kh/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    HoTen: profile.HoTen,
                    SDT: profile.SDT,
                    DiaChi: profile.DiaChi,
                    Email: profile.Email
                })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: "success", text: data.message || "Lưu thông tin thành công!" });
            } else {
                setMessage({ type: "error", text: data.message || "Có lỗi xảy ra khi lưu." });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Không thể kết nối đến máy chủ." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: "#664930" }}></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 bg-[#FFF8F0] min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* SIDEBAR BÊN TRÁI */}
                <div className="md:col-span-1 bg-white rounded-2xl p-6 shadow-xs border" style={{ borderColor: "#CCBEB1" }}>
                    <div className="flex flex-col items-center border-b pb-6 mb-6" style={{ borderColor: "#CCBEB1" }}>
                        <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-3" style={{ backgroundColor: "#FFDBBB", color: "#664930" }}>
                            {profile.HoTen ? profile.HoTen.charAt(0).toUpperCase() : "?"}
                        </div>
                        <h3 className="font-semibold text-lg" style={{ color: "#664930" }}>{profile.TenDangNhap || "Khách hàng"}</h3>
                    </div>

                    <nav className="space-y-2">
                        <button className="w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition" style={{ backgroundColor: "#FFDBBB", color: "#664930" }}>
                            <span>Thông tin tài khoản</span>
                        </button>
                        <button
                            onClick={() => router.push("/customer/orders")}
                            className="w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl transition hover:opacity-80"
                            style={{ color: "#997E67" }}
                        >
                            <span>Đơn hàng của tôi</span>
                        </button>
                        <button className="w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl transition hover:opacity-80" style={{ color: "#997E67" }}>
                            <span>Thay đổi mật khẩu</span>
                        </button>
                        <button
                            onClick={logout}
                            className="w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl transition hover:opacity-80 text-red-500"
                        >
                            <span>Đăng xuất</span>
                        </button>
                    </nav>
                </div>

                {/* CONTAINER FORM BÊN PHẢI */}
                <div className="md:col-span-3 bg-white rounded-2xl p-8 shadow-xs border" style={{ borderColor: "#CCBEB1" }}>
                    <h2 className="text-2xl font-bold mb-6" style={{ color: "#664930" }}>Thông tin khách hàng</h2>

                    {message && (
                        <div className={`p-4 mb-6 rounded-xl text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                            {message.type === "success" ? "✅ " : "❌ "} {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "#997E67" }}>Họ tên</label>
                                <input
                                    type="text"
                                    value={profile.HoTen}
                                    onChange={(e) => setProfile({ ...profile, HoTen: e.target.value })}
                                    placeholder="Nhập họ và tên"
                                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: "#CCBEB1", color: "#664930" }}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "#997E67" }}>Số điện thoại</label>
                                <input
                                    type="text"
                                    value={profile.SDT}
                                    onChange={(e) => setProfile({ ...profile, SDT: e.target.value })}
                                    placeholder="Nhập số điện thoại"
                                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: "#CCBEB1", color: "#664930" }}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2" style={{ color: "#997E67" }}>Email</label>
                                <input
                                    type="email"
                                    value={profile.Email}
                                    onChange={(e) => setProfile({ ...profile, Email: e.target.value })}
                                    placeholder="name@example.com"
                                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: "#CCBEB1", color: "#664930" }}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-3 font-medium rounded-full shadow-md hover:opacity-90 transition duration-200 disabled:opacity-50"
                                style={{ backgroundColor: "#664930", color: "#FFDBBB" }}
                            >
                                {saving ? "Đang lưu..." : "Lưu thông tin"}
                            </button>
                        </div>
                    </form>

                    {/* ĐỊA CHỈ GIAO HÀNG */}
                    <div className="mt-10 pt-10 border-t" style={{ borderColor: "#CCBEB1" }}>
                        <h3 className="text-xl font-bold mb-4" style={{ color: "#664930" }}>Địa chỉ giao hàng</h3>

                        <div className="space-y-4">
                            {profile.DiaChi ? (
                                <div className="p-4 rounded-xl border flex justify-between items-center" style={{ borderColor: "#CCBEB1", backgroundColor: "#FFF8F0" }}>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-xl">📍</span>
                                        <span style={{ color: "#664930" }}>{profile.DiaChi}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newAddress = prompt("Nhập địa chỉ mới:", profile.DiaChi);
                                            if (newAddress !== null) {
                                                setProfile({ ...profile, DiaChi: newAddress });
                                            }
                                        }}
                                        className="text-sm font-semibold hover:underline"
                                        style={{ color: "#997E67" }}
                                    >
                                        Chỉnh sửa
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm" style={{ color: "#997E67" }}>Chưa cập nhật địa chỉ giao hàng.</p>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    const address = prompt("Nhập địa chỉ giao hàng của bạn:");
                                    if (address) {
                                        setProfile({ ...profile, DiaChi: address });
                                    }
                                }}
                                className="mt-2 flex items-center space-x-2 px-6 py-2.5 font-medium rounded-full transition hover:opacity-90"
                                style={{ backgroundColor: "#664930", color: "#FFDBBB" }}
                            >
                                <span>Thêm địa chỉ</span>
                                <span>→</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
