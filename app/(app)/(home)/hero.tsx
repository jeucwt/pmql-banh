import Link from "next/link";
import { Truck, Clock } from "lucide-react";

export function Hero() {
    return (
        <section
            style={{ backgroundColor: "#FFDBBB" }}
            className="rounded-2xl mx-6 mt-6 px-8 py-10 flex items-center justify-between flex-wrap gap-8"
        >
            <div className="max-w-md">
                <p className="text-sm font-medium mb-2" style={{ color: "#997E67" }}>
                    Jeucwt&apos;s Bakery
                </p>
                <h1 className="text-3xl font-medium mb-3 leading-snug" style={{ color: "#664930" }}>
                    Bánh tươi mỗi sáng, giao tận tay bạn
                </h1>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: "#664930" }}>
                    Đặt bánh online chỉ trong vài bước, theo dõi đơn hàng theo thời gian thực.
                </p>
                <div className="flex gap-3">
                    <Link
                        href="#products"
                        style={{ backgroundColor: "#664930", color: "#FFF8F0" }}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        Đặt bánh ngay
                    </Link>
                    <Link
                        href="/products"
                        style={{ borderColor: "#664930", color: "#664930" }}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium border hover:bg-white/40 transition-colors"
                    >
                        Xem thực đơn
                    </Link>
                    <Link
                        href="/about"
                        style={{ borderColor: "#664930", color: "#664930" }}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium border hover:bg-white/40 transition-colors"
                    >
                        Hiểu về chúng tôi
                    </Link>
                </div>
            </div>

            <div style={{ backgroundColor: "#FFF8F0" }} className="rounded-2xl p-5 flex gap-6">
                <div className="flex items-center gap-2">
                    <Truck className="size-5" style={{ color: "#664930" }} />
                    <span className="text-xs font-medium" style={{ color: "#664930" }}>Giao trong ngày</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="size-5" style={{ color: "#664930" }} />
                    <span className="text-xs font-medium" style={{ color: "#664930" }}>Làm mới mỗi sáng</span>
                </div>
            </div>
        </section>
    );
}