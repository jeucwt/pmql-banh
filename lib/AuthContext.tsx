"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole = "admin" | "customer" | "cashier";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  canAccess: (feature: "goods" | "warehouse" | "cashier") => boolean;
}

// ─── Role → allowed features ──────────────────────────────────────────────────
const ROLE_ACCESS: Record<UserRole, Array<"goods" | "warehouse" | "cashier">> = {
  admin: ["goods", "warehouse", "cashier"],
  cashier: ["cashier"],
  customer: [],
};


// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

// Hàm ánh xạ Database -> Frontend
function mapDbRoleToFrontend(dbRole: string): UserRole {
  if (dbRole === "QuanLy") return "admin";
  if (dbRole === "NhanVienBanHang") return "cashier";
  if (dbRole === "KhachHang") return "customer";
  return "customer";
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Restore session from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tiem_banh_user");
      if (saved) setUser(JSON.parse(saved));
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  // Hàm đăng nhập 
  async function login(email: string, password: string) {
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.message || "Tên đăng nhập hoặc mật khẩu không đúng." };
      }
      // Lưu JWT Token nhận về từ Backend
      localStorage.setItem("tiem_banh_token", data.token);
      const mappedRole = mapDbRoleToFrontend(data.role);
      const loggedInUser: User = {
        id: String(data.maTK),
        name: data.tenDangNhap,
        email: email,
        role: mappedRole,
      };
      setUser(loggedInUser);
      localStorage.setItem("tiem_banh_user", JSON.stringify(loggedInUser));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: "Không thể kết nối đến server backend." };
    }
  }

  // Hàm đăng kí (Khách hàng)
  async function signup(name: string, email: string, password: string) {
    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name, // Sử dụng email làm tên đăng nhập
          password: password,
          email: email,
          username: email,
          phone: "",
          address: ""
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.message || "Đăng ký thất bại." };
      }
      // Đăng nhập luôn sau khi đăng ký thành công
      return await login(email, password);
    } catch (err) {
      return { ok: false, error: "Không thể kết nối đến server " };
    }
  }

  // Hàm đăng xuất
  function logout() {
    setUser(null);
    localStorage.removeItem("tiem_banh_user");
    router.push("/login");
  }

  // Hàm kiểm tra quyền truy cập
  function canAccess(feature: "goods" | "warehouse" | "cashier") {
    if (!user) return false;
    return ROLE_ACCESS[user.role].includes(feature) ?? false;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}