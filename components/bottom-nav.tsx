"use client";

import { useRouter, usePathname } from "next/navigation";

const TABS = [
  { id: "dashboard", label: "Hoy", icon: "🏠", path: "/dashboard" },
  { id: "turnos", label: "Turnos", icon: "📅", path: "/turnos" },
  { id: "clientes", label: "Clientas", icon: "👩", path: "/clientes" },
  { id: "caja", label: "Caja", icon: "💰", path: "/caja" },
  { id: "precios", label: "Precios", icon: "💲", path: "/precios" },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-2 pt-0 pointer-events-none">
      <div className="w-full max-w-[393px] mx-auto px-4 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-[#f0f0f0] px-2 py-1">
          <div className="flex justify-around items-center">
            {TABS.map((tab) => {
              const isActive = pathname === tab.path;
              return (
                <button
                  key={tab.id}
                  onClick={() => router.push(tab.path)}
                  className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 min-w-0 ${
                    isActive
                      ? "bg-[#C4E0A2] scale-105"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl leading-none">{tab.icon}</span>
                  <span
                    className={`text-[10px] mt-0.5 font-medium whitespace-nowrap ${
                      isActive ? "text-[#1a1a1a]" : "text-[#9CA3AF]"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
