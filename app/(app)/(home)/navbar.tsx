"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["700"],
});

interface NavbarItemProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

const NavbarItem = ({ href, children, isActive }: NavbarItemProps) => {
  return (
    <Button
      variant="outline"
      asChild
      className={cn(
        "bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent px-3.5 text-lg transition-colors",
        isActive && "bg-[#664930] text-white hover:bg-[#997E67] hover:text-white"
      )}
    >
      <Link href={href}>
        {children}
      </Link>
    </Button>
  );
};

export default function Navbar() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const pathname = usePathname();

  return (
    <nav className="h-20 w-full flex items-center border-b justify-between font-medium bg-[#FFF3E0] px-6">

      {/* Logo */}
      <Link href="/" className="flex items-center">
        <span className={cn("text-3xl font-semibold cursor-pointer text-[#664930]", poppins.className)}>
          Jeucwt&apos;s Bakery
        </span>
      </Link>

      {/* Nav links (Căn giữa) */}
      <div className="items-center gap-2 hidden lg:flex">
        <NavbarItem href="/" isActive={pathname === "/"}>Trang chủ</NavbarItem>
        <NavbarItem href="/products" isActive={pathname === "/products"}>Sản phẩm</NavbarItem>
        <NavbarItem href="/about" isActive={pathname === "/about"}>Về chúng tôi</NavbarItem>

        {user?.role === "admin" && (
          <NavbarItem href="/dashboard" isActive={pathname === "/dashboard"}>Dashboard</NavbarItem>
        )}
        {(user?.role === "cashier" || user?.role === "admin") && (
          <NavbarItem href="/cashier" isActive={pathname === "/cashier"}>Bán hàng</NavbarItem>
        )}
      </div>

      {/* Auth + Cart (Bên phải) */}
      <div className="flex items-center gap-4">
        {user ? (
          // Nút User khi đã đăng nhập
          <Link
            href={user.role === "admin" ? "/dashboard" : user.role === "cashier" ? "/cashier" : "/customer"}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-[#664930] text-white hover:opacity-80 transition-opacity"
          >
            <span>👤</span>
            <span className="max-w-[120px] truncate">{user.name}</span>
          </Link>
        ) : (
          // Nút Login / Signup khi chưa đăng nhập
          <div className="hidden lg:flex items-center gap-2">
            <Button variant="ghost" asChild className="text-lg">
              <Link href="/login">Đăng nhập</Link>
            </Button>
            <Button variant="default" asChild className="text-lg bg-[#664930] text-white hover:bg-[#997E67] hover:text-white rounded-full px-6">
              <Link href="/signup">Đăng ký</Link>
            </Button>
          </div>
        )}

        {/* Giỏ hàng */}
        <Link href="/cart" className="relative text-2xl cursor-pointer text-[#664930] hover:opacity-75 transition-opacity">
          🛒
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center bg-red-600 text-white">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
