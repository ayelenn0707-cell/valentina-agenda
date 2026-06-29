"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Turno, Client } from "@/lib/types";
import { fp, PL } from "@/lib/types";
import BottomNav from "@/components/bottom-nav";
import TurnoCard from "@/components/turno-card";
import Modal from "@/components/modal";

type Period = "dia" | "semana" | "mes";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function getBounds(period: Period): { desde: string; hasta: string; label: string } {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  if (period === "dia") {
    return {
      desde: todayStr,
      hasta: todayStr,
      label: `${today.getDate()} de ${MONTH_NAMES[today.getMonth()]}`,
    };
  }

  if (period === "semana") {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      desde: start.toISOString().slice(0, 10),
      hasta: end.toISOString().slice(0, 10),
      label: `Semana del ${start.getDate()} al ${end.getDate()} de ${MONTH_NAMES[today.getMonth()]}`,
    };
  }

  // mes
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return {
    desde: start.toISOString().slice(0, 10),
    hasta: end.toISOString().slice(0, 10),
    label: `${MONTH_NAMES[today.getMonth()]} ${today.getFullYear()}`,
  };
}

export default function CajaPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("dia");
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [clientes, setClientes] = useState<Map<number, Client>>(new Map());
  const [loading, setLoading] = useState(true);
  const [unclassifiedModalOpen, setUnclassifiedModalOpen] = useState(false);

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

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const bounds = getBounds(period);
        const [turnosRes, clientesRes] = await Promise.all([
          fetch(`/api/turnos?fecDesde=${bounds.desde}&fecHasta=${bounds.hasta}`),
          fetch("/api/clientes"),
        ]);
        const turnosData: Turno[] = await turnosRes.json();
        const clientesData: Client[] = await clientesRes.json();
        setTurnos(turnosData);
        setClientes(new Map(clientesData.map((c) => [c.id, c])));
      } catch (e) {
        console.error("Error fetching caja data:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [period]);

  const completedTurnos = turnos.filter((t) => t.est === "completado");
  const total = completedTurnos.reduce((s, t) => s + t.tot, 0);
  const efectivo = completedTurnos
    .filter((t) => t.met === "efectivo")
    .reduce((s, t) => s + t.tot, 0);
  const mp = completedTurnos
    .filter((t) => t.met === "mercado_pago")
    .reduce((s, t) => s + t.tot, 0);

  // Unclassified: turnos without payment method (met === "")
  const unclassified = turnos.filter(
    (t) => t.est !== "cancelado" && (t.met === "" || t.met === "pendiente"),
  );

  // Group by day for detail
  const dayGroups = new Map<string, Turno[]>();
  for (const t of turnos.filter((t) => t.est !== "cancelado")) {
    const existing = dayGroups.get(t.fec) || [];
    existing.push(t);
    dayGroups.set(t.fec, existing);
  }
  const sortedDays = Array.from(dayGroups.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] min-h-screen">
      <div className="flex-1 max-w-[393px] mx-auto w-full pb-24 px-4">
        {/* Header */}
        <div className="pt-6 pb-4">
          <h1 className="text-2xl font-bold text-[#1a1a1a]">💰 Caja</h1>
        </div>

        {/* Period toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          {(["dia", "semana", "mes"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${
                period === p
                  ? "bg-white shadow-sm text-[#1a1a1a]"
                  : "text-[#9CA3AF]"
              }`}
            >
              {p === "dia" ? "Día" : p === "semana" ? "Semana" : "Mes"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#C4E0A2] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Period label */}
            <p className="text-sm text-[#9CA3AF] mb-4">
              {getBounds(period).label}
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white rounded-xl p-3 border border-[#f0f0f0]">
                <div className="text-xs text-[#9CA3AF]">Total</div>
                <div className="text-lg font-bold text-[#1a1a1a] mt-1">
                  {fp(total)}
                </div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-[#f0f0f0]">
                <div className="text-xs text-[#9CA3AF]">💵 Efectivo</div>
                <div className="text-lg font-bold text-green-600 mt-1">
                  {fp(efectivo)}
                </div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-[#f0f0f0]">
                <div className="text-xs text-[#9CA3AF]">📱 M. Pago</div>
                <div className="text-lg font-bold text-blue-600 mt-1">
                  {fp(mp)}
                </div>
              </div>
            </div>

            {/* Unclassified warning */}
            {unclassified.length > 0 && (
              <button
                onClick={() => setUnclassifiedModalOpen(true)}
                className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-left hover:bg-amber-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-amber-700">
                      ⚠️ {unclassified.length} turno{unclassified.length !== 1 ? "s" : ""} sin método de pago
                    </div>
                    <div className="text-xs text-amber-600 mt-0.5">
                      Tocá para clasificar
                    </div>
                  </div>
                  <span className="text-amber-400 text-lg">›</span>
                </div>
              </button>
            )}

            {/* Day detail */}
            {sortedDays.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#9CA3AF] text-sm">
                  Sin turnos para este período
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedDays.map(([fec, dayTurnos]) => {
                  const dayTotal = dayTurnos.reduce((s, t) => s + t.tot, 0);
                  const dayEf = dayTurnos
                    .filter((t) => t.met === "efectivo")
                    .reduce((s, t) => s + t.tot, 0);
                  const dayMp = dayTurnos
                    .filter((t) => t.met === "mercado_pago")
                    .reduce((s, t) => s + t.tot, 0);
                  const date = new Date(fec + "T12:00:00");
                  const dayName = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][date.getDay()];

                  return (
                    <div key={fec}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-[#1a1a1a]">
                          {dayName} {date.getDate()}
                        </h3>
                        <div className="text-right">
                          <div className="text-sm font-bold text-[#1a1a1a]">
                            {fp(dayTotal)}
                          </div>
                          <div className="text-xs text-[#9CA3AF]">
                            💵 {fp(dayEf)} · 📱 {fp(dayMp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-[#9CA3AF] mb-1">
                        {dayTurnos.length} turno{dayTurnos.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Unclassified modal */}
      <Modal
        isOpen={unclassifiedModalOpen}
        onClose={() => setUnclassifiedModalOpen(false)}
        title="Clasificar pagos"
      >
        {unclassified.length === 0 ? (
          <p className="text-sm text-[#9CA3AF]">Todos los turnos tienen método de pago ✅</p>
        ) : (
          <div className="space-y-2">
            {unclassified.map((t) => (
              <TurnoCard
                key={t.id}
                turno={t}
                cliente={clientes.get(t.cid)}
              />
            ))}
          </div>
        )}
      </Modal>

      <BottomNav />
    </div>
  );
}
