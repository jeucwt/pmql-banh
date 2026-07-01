"use client";

import { useState } from "react";

// ============================================================
// TYPES
// Sau này thay bằng type từ DB / API response của bạn
// ============================================================
interface Category {
    id: number;
    slug: string;
    label: string;
    icon: string; // tên class Tabler icon, vd: "ti-cake"
}

// ============================================================
// MOCKUP DATA
// Sau này fetch từ MySQL qua API:
//   const res = await fetch("/api/categories");
//   const data: Category[] = await res.json();
//
// Schema MySQL gợi ý:
//   CREATE TABLE categories (
//     id         INT PRIMARY KEY AUTO_INCREMENT,
//     slug       VARCHAR(100) UNIQUE NOT NULL,
//     label      VARCHAR(100) NOT NULL,
//     icon       VARCHAR(50),
//     sort_order INT DEFAULT 0
//   );
// ============================================================
const MOCK_CATEGORIES: Category[] = [
    { id: 1, slug: "all", label: "Tất cả", icon: "ti-grid-4" },
    { id: 2, slug: "banh-mi", label: "Bánh mì", icon: "ti-bread" },
    { id: 3, slug: "banh-ngot", label: "Bánh ngọt", icon: "ti-cake" },
    { id: 4, slug: "cupcake", label: "Cupcake", icon: "ti-ice-cream" },
    { id: 5, slug: "macaroon", label: "Macaroon", icon: "ti-circle" },
    { id: 6, slug: "croissant", label: "Croissant", icon: "ti-moon" },
    { id: 7, slug: "tiramisu", label: "Tiramisu", icon: "ti-glass-full" },
    { id: 8, slug: "cheesecake", label: "Cheesecake", icon: "ti-cheese" },
    { id: 9, slug: "donut", label: "Donut", icon: "ti-circle-dashed" },
    { id: 10, slug: "banh-kem", label: "Bánh kem", icon: "ti-sparkles" },
];

// ============================================================
// PROPS
// ============================================================
interface CategoriesProps {
    // Sau này truyền data từ server component hoặc fetch hook:
    //   <CategoriesBar data={categoriesFromDB} />
    data?: Category[];
    onSelect?: (slug: string) => void;
}

// ============================================================
// COMPONENT
// ============================================================
export const Categories = ({
    data = MOCK_CATEGORIES,
    onSelect,
}: CategoriesProps) => {
    const [activeSlug, setActiveSlug] = useState("all");

    const handleSelect = (slug: string) => {
        setActiveSlug(slug);
        onSelect?.(slug);
    };

    return (
        <div className="relative w-full">
            {/* Scroll container — ẩn scrollbar, scroll ngang trên mobile */}
            <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
                {data.map((category) => {
                    const isActive = category.slug === activeSlug;
                    return (
                        <button
                            key={category.id}
                            onClick={() => handleSelect(category.slug)}
                            aria-pressed={isActive}
                            className={[
                                "w-full text-center p-4 hover:bg-[#FFFDBBB] hover:text-black flex items-center justify-between text-base font-medium rounded-md",
                                isActive
                                    ? "bg-[#FFFDBBB] text-black"
                                    : "",
                            ].join(" ")}
                        >
                            {/* Icon — dùng Tabler icons (thêm CDN vào layout nếu chưa có) */}
                            <i className={`ti ${category.icon} text-[10px]`} aria-hidden="true" />
                            {category.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};