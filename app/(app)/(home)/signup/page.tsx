"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    const res = await signup(name, email, password);
    setLoading(false);
    if (res.ok) router.push("/");
    else setError(res.error ?? "Đăng ký thất bại.");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5E6C3]">
      {/* Navbar */}
      <div className="flex justify-start w-full py-4 px-6">
        <div className="gap-4 flex items-center">
          <a href="/" className="cursor-pointer" style={{ fontSize: 20, color: "#5C2D0A", fontWeight: 700, textDecoration: "none" }}>Jeucwt's Bakery</a>
        </div>
        <a
          href="/login"
          className="ml-auto"
          style={{ fontSize: 20, color: "#5C2D0A", fontWeight: 700, textDecoration: "none" }}
        >
          Đăng nhập →
        </a>
      </div>

      {/* Form */}
      <div className="min-h-screen flex items-center justify-center bg-[#F5E6C3]">
        <div className="bg-[#ffffff] p-8 rounded-md shadow-md w-full max-w-md max-h-fit flex flex-col">
          <h1 className="text-2xl font-bold text-center mb-6" style={{ color: "#5A3E1B" }}>
            Đăng ký
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <p style={{ color: "#c0392b", fontSize: 14, textAlign: "center" }}>{error}</p>}
            <div className="bg-[#ffffff] rounded-md px-4 py-2 mb-4 flex flex-col gap-3">

              <div className="flex flex-col gap-1">
                <p className="text-bold text-md">Họ và tên</p>
                <input
                  className="border border-[#C8A84B] rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-[#C8A84B]/50"
                  type="text"
                  placeholder="Điền tên của bạn vào đây"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-bold text-md">Email</p>
                <input
                  className="border border-[#C8A84B] rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-[#C8A84B]/50"
                  type="email"
                  placeholder="Example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-bold text-md">Mật khẩu</p>
                <input
                  className="border border-[#C8A84B] rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-[#C8A84B]/50"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-bold text-md">Xác nhận mật khẩu</p>
                <input
                  className="border border-[#C8A84B] rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-[#C8A84B]/50"
                  type="password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                className="text-md border rounded-full px-4 py-2 bg-amber-100 w-full hover:bg-amber-200"
                type="submit"
                disabled={loading}
              >
                {loading ? <span>Đang xử lý...</span> : "Đăng ký"}
              </button>

            </div>
          </form>

          {/* Redirect to login */}
          <p className="text-center text-sm mt-2" style={{ color: "#888" }}>
            Đã có tài khoản?{" "}
            <a href="/login" style={{ color: "#5C2D0A", fontWeight: 700, textDecoration: "none" }}>
              Đăng nhập ngay !
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}