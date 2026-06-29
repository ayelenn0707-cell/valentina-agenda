"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/bottom-nav";
import CalendarView from "@/components/calendar-view";

export default function TurnosPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/check");
        const data = await res.json();
        if (!data.authenticated) {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setAuthChecked(true);
      }
    }
    checkAuth();
  }, [router]);

  if (!authChecked) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F0E8] min-h-screen">
        <div className="w-6 h-6 border-2 border-[#C4E0A2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] min-h-screen">
      <div className="flex-1 max-w-[393px] mx-auto w-full pb-24 px-4">
        {/* Header */}
        <div className="pt-6 pb-4">
          <h1 className="text-2xl font-bold text-[#1a1a1a]">📅 Turnos</h1>
        </div>

        <CalendarView />
      </div>

      {/* FAB */}
      <button className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[#C4E0A2] shadow-lg flex items-center justify-center text-2xl hover:bg-[#D4EAA8] transition-all active:scale-90 shadow-[#C4E0A2]/30">
        +
      </button>

      <BottomNav />
    </div>
  );
}
