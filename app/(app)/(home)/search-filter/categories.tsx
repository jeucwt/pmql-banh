"use client";

import { useState } from "react";

interface CategoriesProps {
    categories?: string[];
    selectedCategory?: string;
    onSelect?: (slug: string) => void;
}

export const Categories = ({
    categories = ["all"],
    selectedCategory = "all",
    onSelect,
}: CategoriesProps) => {

    const handleSelect = (slug: string) => {
        onSelect?.(slug);
    };

    return (
        <div className="relative w-full">
            <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
                {categories.map((category) => {
                    const isActive = category === selectedCategory;
                    const label = category === "all" ? "Tất cả" : category;
                    return (
                        <button
                            key={category}
                            onClick={() => handleSelect(category)}
                            aria-pressed={isActive}
                            className={[
                                "whitespace-nowrap text-center p-4 hover:bg-[#FFFDBBB] hover:text-black flex items-center justify-between text-base font-medium rounded-md",
                                isActive
                                    ? "bg-[#FFFDBBB] text-black"
                                    : "",
                            ].join(" ")}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};