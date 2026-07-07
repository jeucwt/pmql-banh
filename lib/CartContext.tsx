"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
    maBanh: number;
    tenBanh: string;
    maSize: number;
    kichThuoc: string;
    giaTien: number;
    soLuong: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, "soLuong">, soLuong: number) => void;
    updateQuantity: (maBanh: number, maSize: number, soLuong: number) => void;
    removeFromCart: (maBanh: number, maSize: number) => void;
    clearCart: () => void;
    totalTien: number;
    itemCount: number;
}

const CART_STORAGE_KEY = "tiem_banh_cart";
const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            if (saved) setItems(JSON.parse(saved));
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    function addToCart(item: Omit<CartItem, "soLuong">, soLuong: number) {
        setItems((prev) => {
            const existing = prev.find(
                (i) => i.maBanh === item.maBanh && i.maSize === item.maSize
            );
            if (existing) {
                return prev.map((i) =>
                    i.maBanh === item.maBanh && i.maSize === item.maSize
                        ? { ...i, soLuong: i.soLuong + soLuong }
                        : i
                );
            }
            return [...prev, { ...item, soLuong }];
        });
    }

    function updateQuantity(maBanh: number, maSize: number, soLuong: number) {
        if (soLuong <= 0) {
            removeFromCart(maBanh, maSize);
            return;
        }
        setItems((prev) =>
            prev.map((i) =>
                i.maBanh === maBanh && i.maSize === maSize ? { ...i, soLuong } : i
            )
        );
    }

    function removeFromCart(maBanh: number, maSize: number) {
        setItems((prev) =>
            prev.filter((i) => !(i.maBanh === maBanh && i.maSize === maSize))
        );
    }

    function clearCart() {
        setItems([]);
    }

    const totalTien = items.reduce((sum, i) => sum + i.giaTien * i.soLuong, 0);
    const itemCount = items.reduce((sum, i) => sum + i.soLuong, 0);

    return (
        <CartContext.Provider
            value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, totalTien, itemCount }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
    return ctx;
}