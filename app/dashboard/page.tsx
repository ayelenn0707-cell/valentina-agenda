"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Turno, Client } from "@/lib/types";
import { fp } from "@/lib/types";
import BottomNav from "@/components/bottom-nav";
import TurnoCard from "@/components/turno-card";
import Notifications from "@/components/notifications";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getWeekBounds(): { desde: string; hasta: string } {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + 1); // Monday
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { desde: formatDate(start), hasta: formatDate(end) };
}

export default function DashboardPage() {
  const router = useRouter();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [weekTurnos, setWeekTurnos] = useState<Turno[]>([]);
  const [clientes, setClientes] = useState<Map<number, Client>>(new Map());
  const [loading, setLoading] = useState(true);

  // Auth check on mount
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
      }
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const today = formatDate(new Date());
        const week = getWeekBounds();

        const [turnosRes, weekRes, clientesRes] = await Promise.all([
          fetch(`/api/turnos?fec=${today}`),
          fetch(`/api/turnos?fecDesde=${week.desde}&fecHasta=${week.hasta}`),
          fetch("/api/clientes"),
        ]);

        const turnosData: Turno[] = await turnosRes.json();
        const weekData: Turno[] = await weekRes.json();
        const clientesData: Client[] = await clientesRes.json();

        setTurnos(turnosData);
        setWeekTurnos(weekData);
        setClientes(new Map(clientesData.map((c) => [c.id, c])));
      } catch (e) {
        console.error("Error fetching dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const today = new Date();
  const dayName = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][today.getDay()];
  const dateStr = `${dayName} ${today.getDate()} de ${MONTH_NAMES[today.getMonth()]}`;

  const activeTurnos = turnos.filter((t) => t.est !== "cancelado");
  const canceledTurnos = turnos.filter((t) => t.est === "cancelado");
  const todayTotal = activeTurnos.reduce((sum, t) => sum + t.tot, 0);

  const weekTotal = weekTurnos
    .filter((t) => t.est !== "cancelado")
    .reduce((sum, t) => sum + t.tot, 0);

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] min-h-screen">
      <div className="flex-1 max-w-[393px] mx-auto w-full pb-24 px-4">
        {/* Header */}
        <div className="pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a1a]">
                💅 Valentina
              </h1>
              <p className="text-sm text-[#9CA3AF] mt-0.5">{dateStr}</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <Notifications todayCount={activeTurnos.length} todayTotal={todayTotal} />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#C4E0A2] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-xl p-3 border border-[#f0f0f0]">
                <div className="text-xs text-[#9CA3AF]">Turnos</div>
                <div className="text-xl font-bold text-[#1a1a1a] mt-1">
                  {activeTurnos.length}
                </div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-[#f0f0f0]">
                <div className="text-xs text-[#9CA3AF]">Hoy</div>
                <div className="text-xl font-bold text-green-600 mt-1">
                  {fp(todayTotal)}
                </div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-[#f0f0f0]">
                <div className="text-xs text-[#9CA3AF]">Semana</div>
                <div className="text-xl font-bold text-[#1a1a1a] mt-1">
                  {fp(weekTotal)}
                </div>
              </div>
            </div>

            {/* Turnos del día */}
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-3">
              Turnos del día
            </h2>

            {activeTurnos.length === 0 && canceledTurnos.length === 0 && (
              <div className="text-center py-8">
                <p className="text-[#9CA3AF] text-sm">Sin turnos para hoy</p>
              </div>
            )}

            <div className="space-y-2">
              {activeTurnos.map((turno) => (
                <TurnoCard
                  key={turno.id}
                  turno={turno}
                  cliente={clientes.get(turno.cid)}
                />
              ))}
            </div>

            {/* Canceled */}
            {canceledTurnos.length > 0 && (
              <>
                <div className="flex items-center gap-2 my-4">
                  <div className="flex-1 h-px bg-red-200" />
                  <span className="text-xs font-medium text-red-500">
                    Cancelados
                  </span>
                  <div className="flex-1 h-px bg-red-200" />
                </div>
                <div className="space-y-2">
                  {canceledTurnos.map((turno) => (
                    <TurnoCard
                      key={turno.id}
                      turno={turno}
                      cliente={clientes.get(turno.cid)}
                      isCanceled
                    />
                  ))}
                </div>
              </>
            )}
          </>
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
