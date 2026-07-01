"use client";

import DoanhThuPage from "./DoanhThuPage";
import { useRouteGuard } from "@/lib/useRouteGuard";

export default function DashboardPage() {
    const { loading } = useRouteGuard("goods");
    if (loading) return null;
    return <DoanhThuPage />;
}