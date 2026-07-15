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
                            onClick={() => onSelect?.(category)}
                            aria-pressed={isActive}
                            style={
                                isActive
                                    ? { backgroundColor: "#664930", color: "#FFF8F0", borderColor: "#664930" }
                                    : { backgroundColor: "transparent", color: "#664930", borderColor: "#CCBEB1" }
                            }
                            className="whitespace-nowrap text-center px-4 py-2 text-sm rounded-full border transition-colors hover:opacity-80"
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};