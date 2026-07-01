"use client";

import { useAuth } from "@/lib/AuthContext";
import { NavbarLanding } from "./navbar";
import { Footer } from "../footer/footer";
import { LandingCard } from "../landingcard/page";
import { Toast } from "../landingcard/toast";
import { LogInPrompt } from "../login/loginprompt";

const ROLE_LABELS: Record<string, string> = {
    admin: "Quan ly",
    warehouse: "Nhan vien kho",
    cashier: "Thu ngan",
};

export default function LandingPage() {
    const { user } = useAuth();

    return (
      <div className="min-h-screen flex flex-col bg-[#F5E6C3]">
        <NavbarLanding />
        <main className="flex-1 flex flex-col items-center justify-center py-16 px-8">
          <h1 className="text-4xl font-bold text-[#5A3E1B] mb-8">Chao mung den voi he thong quan li tiem banh</h1>
          <LandingCard />
          {!user && <LogInPrompt />}
        </main>

        <Footer />
      </div>
    );
}
