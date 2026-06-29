"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Client, Turno } from "@/lib/types";
import { SL } from "@/lib/types";
import BottomNav from "@/components/bottom-nav";
import ClientCard from "@/components/client-card";
import ClientProfile from "@/components/client-profile";

type FilterMode = "all" | "fav" | "new";

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Client[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth check
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/check");
        const data = await res.json();
        if (!data.authenticated) router.push("/login");
      } catch {
        router.push("/login");
      }
    }
    checkAuth();
  }, [router]);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [clientesRes, turnosRes] = await Promise.all([
          fetch("/api/clientes"),
          fetch("/api/turnos"),
        ]);
        const clientesData: Client[] = await clientesRes.json();
        const turnosData: Turno[] = await turnosRes.json();
        setClientes(clientesData);
        setTurnos(turnosData);
      } catch (e) {
        console.error("Error fetching clientes:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Get last service per client
  const lastServices = new Map<number, string>();
  for (const t of turnos) {
    if (!lastServices.has(t.cid)) {
      lastServices.set(t.cid, SL[t.serv] || t.serv);
    }
  }

  // Filtered clients
  const filtered = clientes.filter((c) => {
    if (filter === "fav" && c.fav !== 1) return false;
    if (filter === "new" && c.nueva !== 1) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.nombre.toLowerCase().includes(q);
    }
    return true;
  });

  // Profile view
  if (selectedId !== null) {
    return (
      <div className="flex-1 flex flex-col bg-[#F5F0E8] min-h-screen">
        <div className="flex-1 max-w-[393px] mx-auto w-full pb-24 px-4 pt-6">
          <ClientProfile
            clienteId={selectedId}
            onBack={() => setSelectedId(null)}
          />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] min-h-screen">
      <div className="flex-1 max-w-[393px] mx-auto w-full pb-24 px-4">
        {/* Header */}
        <div className="pt-6 pb-4">
          <h1 className="text-2xl font-bold text-[#1a1a1a]">👩 Clientes</h1>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {[
            { id: "all" as const, label: "Todas" },
            { id: "fav" as const, label: "⭐ Favoritas" },
            { id: "new" as const, label: "🆕 Nuevas" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f.id
                  ? "bg-[#C4E0A2] text-[#1a1a1a]"
                  : "bg-white text-[#9CA3AF] border border-[#f0f0f0]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buscar clienta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white rounded-xl border border-[#f0f0f0] py-2.5 px-4 text-sm text-[#1a1a1a] placeholder-[#9CA3AF] outline-none focus:border-[#C4E0A2] transition-colors"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#C4E0A2] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#9CA3AF] text-sm">
              {search ? "Sin resultados" : "Sin clientas"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((cliente) => (
              <ClientCard
                key={cliente.id}
                cliente={cliente}
                onClick={() => setSelectedId(cliente.id)}
                lastService={lastServices.get(cliente.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[#C4E0A2] shadow-lg flex items-center justify-center text-2xl hover:bg-[#D4EAA8] transition-all active:scale-90 shadow-[#C4E0A2]/30">
        +
      </button>

      <BottomNav />
    </div>
  );
}
