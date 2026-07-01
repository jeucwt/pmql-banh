"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";

type Feature = "goods" | "cashier" | "warehouse";

export function useRouteGuard(requiredFeature: Feature) {
  const { user, loading, canAccess } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!canAccess(requiredFeature)) {
      router.replace("/");   // trả về landing, sẽ thấy thẻ bị khóa
    }
  }, [user, loading, requiredFeature]);

  return { user, loading };
}