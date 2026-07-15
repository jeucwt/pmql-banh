"use client";

import Navbar from "../navbar";
import { Footer } from "../footer/footer";

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: "#FFF8F0" }} className="min-h-screen flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 w-full text-center">
        <h1 className="text-4xl font-bold mb-6" style={{ color: "#664930" }}>
          Về Chúng Tôi
        </h1>
        <p className="text-lg mb-10 leading-relaxed" style={{ color: "#997E67" }}>
          Chào mừng bạn đến với Jeucwt&apos;s Bakery, nơi chúng tôi mang đến những chiếc bánh thơm ngon, chất lượng cao nhất bằng tất cả tâm huyết và đam mê. Mỗi chiếc bánh đều được làm từ những nguyên liệu tươi mới, an toàn và được tuyển chọn kỹ lưỡng.
        </p>

        <div className="grid md:grid-cols-2 gap-8 text-left">
          <div className="p-6 rounded-2xl bg-white shadow-sm border border-[#e8d5b0]">
            <h3 className="text-xl font-bold mb-4" style={{ color: "#664930" }}>
              Địa chỉ cửa hàng
            </h3>
            <p className="text-md mb-2" style={{ color: "#997E67" }}>
              <strong>Chi nhánh 1:</strong> 123 Đường Hoàng Quốc Việt, Cần Thơ
            </p>
            <p className="text-md" style={{ color: "#997E67" }}>
              <strong>Chi nhánh 2:</strong> 456 Đường Trần Hưng Đạo, Quận 5, TP. Hồ Chí Minh
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white shadow-sm border border-[#e8d5b0]">
            <h3 className="text-xl font-bold mb-4" style={{ color: "#664930" }}>
              Thông tin liên hệ
            </h3>
            <p className="text-md mb-2" style={{ color: "#997E67" }}>
              <strong>Hotline:</strong> 0123 456 789 (Hỗ trợ 24/7)
            </p>
            <p className="text-md mb-2" style={{ color: "#997E67" }}>
              <strong>Email:</strong> contact@jeucwtbakery.com
            </p>
            <p className="text-md" style={{ color: "#997E67" }}>
              <strong>Giờ mở cửa:</strong> 08:00 - 22:00 (Thứ 2 - Chủ Nhật)
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
