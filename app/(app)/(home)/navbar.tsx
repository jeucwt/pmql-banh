import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";

export default function Navbar() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  return (
    <nav
      style={{ backgroundColor: "#664930" }}
      className="w-full h-[72px] flex items-center justify-between px-6"
    >
      {/* Logo */}
      <span
        style={{ backgroundColor: "#997E67", color: "#FFDBBB" }}
        className="px-5 py-2 rounded-full font-semibold text-lg tracking-wide"
      >
        Jeucwt&apos;s Bakery
      </span>

      {/* Nav links */}
      <div style={{ color: "#FFDBBB" }} className="flex gap-6 font-medium">
        <Link href="/" className="hover:opacity-75 transition-opacity">Home</Link>
        <Link href="/products" className="hover:opacity-75 transition-opacity">Sản phẩm</Link>
        <Link href="/about" className="hover:opacity-75 transition-opacity">About</Link>
        {user?.role === "admin" && (
          <Link
            href="/dashboard"
            className="hover:opacity-75 transition-opacity"
          >
            Dashboard
          </Link>
        )}
        {(user?.role === "cashier" || user?.role === "admin") && (
          <Link
            href="/cashier"
            className="hover:opacity-75 transition-opacity"
          >
            Bán hàng
          </Link>
        )}

      </div>

      {/* Auth + Cart */}
      <div className="flex items-center gap-4">
        {user ? (
          // Hiển thị Pill thông tin tài khoản khi đã đăng nhập
          <Link
            href={user.role === "admin" ? "/dashboard" : user.role === "cashier" ? "/cashier" : "/customer"}
            style={{ backgroundColor: "#997E67", color: "#FFDBBB" }}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            <span>👤</span>
            <span className="max-w-[120px] truncate">{user.name}</span>
          </Link>
        ) : (
          // Hiển thị Signup/Login khi chưa đăng nhập
          <>
            <Link href="/signup" style={{ color: "#FFDBBB" }} className="font-medium cursor-pointer hover:opacity-75">
              Signup
            </Link>
            <Link href="/login" style={{ color: "#FFDBBB" }} className="font-medium cursor-pointer hover:opacity-75">
              Login
            </Link>
          </>
        )}
        <Link href="/cart" className="relative text-2xl cursor-pointer" style={{ color: "#FFDBBB" }}>
          🛒
          {itemCount > 0 && (
            <span
              className="absolute -top-2 -right-2 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
              style={{ backgroundColor: "#C0392B", color: "#fff" }}
            >
              {itemCount}
            </span>
          )}
        </Link>
      </div>

    </nav>
  );
}