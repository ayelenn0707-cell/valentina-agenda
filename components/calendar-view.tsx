"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Turno, Client } from "@/lib/types";
import { fp } from "@/lib/types";
import TurnoCard from "./turno-card";

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay() + 1); // Monday
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function getMonthDays(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay(); // 0=Sun
  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = [];

  for (let i = 0; i < startPad; i++) {
    week.push(null);
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return weeks;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getMonthFromWeek(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

interface DaySummary {
  date: Date;
  turnos: Turno[];
  total: number;
  canceled: number;
}

export default function CalendarView() {
  const [view, setView] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [clientes, setClientes] = useState<Map<number, Client>>(new Map());
  const [dayTurnos, setDayTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch turnos for visible range
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let fecDesde: string;
      let fecHasta: string;

      if (view === "week") {
        const days = getWeekDays(currentDate);
        fecDesde = formatDate(days[0]);
        fecHasta = formatDate(days[6]);
      } else {
        const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        fecDesde = formatDate(start);
        fecHasta = formatDate(end);
      }

      try {
        const [turnosRes, clientesRes] = await Promise.all([
          fetch(`/api/turnos?fecDesde=${fecDesde}&fecHasta=${fecHasta}`),
          fetch("/api/clientes"),
        ]);

        const turnosData: Turno[] = await turnosRes.json();
        const clientesData: Client[] = await clientesRes.json();

        setTurnos(turnosData);
        setClientes(new Map(clientesData.map((c) => [c.id, c])));
      } catch (e) {
        console.error("Error fetching calendar data:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [view, currentDate]);

  // Fetch day detail when selected
  useEffect(() => {
    if (!selectedDay) {
      setDayTurnos([]);
      return;
    }

    async function fetchDay() {
      try {
        const res = await fetch(`/api/turnos?fec=${selectedDay}`);
        const data: Turno[] = await res.json();
        setDayTurnos(data);
      } catch (e) {
        console.error("Error fetching day turnos:", e);
      }
    }

    fetchDay();
  }, [selectedDay]);

  const navigate = useCallback((direction: -1 | 1) => {
    setSelectedDay(null);
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (view === "week") {
        next.setDate(next.getDate() + 7 * direction);
      } else {
        next.setMonth(next.getMonth() + direction);
      }
      return next;
    });
  }, [view]);

  const today = useMemo(() => formatDate(new Date()), []);

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const monthWeeks = useMemo(
    () => getMonthDays(currentDate.getFullYear(), currentDate.getMonth()),
    [currentDate],
  );

  // Build day summaries for the week
  const weekSummaries: DaySummary[] = useMemo(() => {
    return weekDays.map((date) => {
      const dateStr = formatDate(date);
      const dayTurnos = turnos.filter((t) => t.fec === dateStr);
      return {
        date,
        turnos: dayTurnos,
        total: dayTurnos
          .filter((t) => t.est !== "cancelado")
          .reduce((sum, t) => sum + t.tot, 0),
        canceled: dayTurnos.filter((t) => t.est === "cancelado").length,
      };
    });
  }, [weekDays, turnos]);

  const renderWeekView = () => (
    <div>
      {/* Mon-Thu row */}
      <div className="flex gap-2 mb-2">
        {weekSummaries.slice(0, 4).map((day) =>
          renderDayCell(day),
        )}
      </div>
      {/* Fri-Sun row */}
      <div className="flex gap-2">
        {weekSummaries.slice(4).map((day) =>
          renderDayCell(day),
        )}
      </div>
    </div>
  );

  const renderDayCell = (day: DaySummary) => {
    const dateStr = formatDate(day.date);
    const isSelected = selectedDay === dateStr;
    const isToday = dateStr === today;

    return (
      <div
        key={dateStr}
        onClick={() => setSelectedDay(isSelected ? null : dateStr)}
        className={`semana-cell flex-1 ${
          isSelected ? "selected" : ""
        } ${isToday ? "today" : ""}`}
      >
        <div className="text-xs font-semibold text-[#9CA3AF] uppercase">
          {DAY_NAMES[day.date.getDay()]}
        </div>
        <div className="text-lg font-bold text-[#1a1a1a]">
          {day.date.getDate()}
        </div>
        <div className="text-xs font-medium text-[#1a1a1a]">
          {day.turnos.length > 0 ? `${day.turnos.length} turno${day.turnos.length !== 1 ? "s" : ""}` : "-"}
        </div>
        {day.total > 0 && (
          <div className="text-xs text-green-600 font-medium">
            {fp(day.total)}
          </div>
        )}
        {day.canceled > 0 && (
          <div className="text-xs text-red-500">
            {day.canceled} cancelado{day.canceled !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    );
  };

  const renderMonthView = () => (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((name) => (
          <div
            key={name}
            className="text-center text-xs font-semibold text-[#9CA3AF] py-1"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {monthWeeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
          {week.map((date, di) => {
            if (!date) return <div key={`e-${di}`} />;

            const dateStr = formatDate(date);
            const isToday = dateStr === today;
            const isSelected = selectedDay === dateStr;
            const dayTurnos = turnos.filter((t) => t.fec === dateStr);

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                className={`semana-cell text-xs p-1 min-h-[56px] ${
                  isSelected ? "selected" : ""
                } ${isToday ? "today" : ""}`}
              >
                <div className="font-bold text-[#1a1a1a]">
                  {date.getDate()}
                </div>
                {dayTurnos.length > 0 && (
                  <div className="text-[10px] text-[#1a1a1a] mt-0.5">
                    {dayTurnos.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  const renderDayDetail = () => {
    if (!selectedDay) return null;

    const active = dayTurnos.filter((t) => t.est !== "cancelado");
    const canceled = dayTurnos.filter((t) => t.est === "cancelado");

    const d = new Date(selectedDay + "T12:00:00");

    return (
      <div className="mt-4">
        <button
          onClick={() => setSelectedDay(null)}
          className="text-sm text-[#9CA3AF] mb-3 hover:text-[#1a1a1a] transition-colors"
        >
          ← Volver al calendario
        </button>
        <h3 className="text-lg font-bold text-[#1a1a1a] mb-3">
          {DAY_NAMES[d.getDay()]} {d.getDate()} de {MONTH_NAMES[d.getMonth()]}
        </h3>

        {active.length === 0 && canceled.length === 0 && (
          <p className="text-[#9CA3AF] text-sm">Sin turnos para este día</p>
        )}

        <div className="space-y-2">
          {active.map((turno) => (
            <TurnoCard
              key={turno.id}
              turno={turno}
              cliente={clientes.get(turno.cid)}
            />
          ))}
        </div>

        {canceled.length > 0 && (
          <>
            <div className="flex items-center gap-2 my-3">
              <div className="flex-1 h-px bg-red-200" />
              <span className="text-xs font-medium text-red-500">
                Cancelados
              </span>
              <div className="flex-1 h-px bg-red-200" />
            </div>
            <div className="space-y-2">
              {canceled.map((turno) => (
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
      </div>
    );
  };

  return (
    <div>
      {/* Navigation header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          ◀
        </button>

        <button
          onClick={() => {
            setSelectedDay(null);
            setCurrentDate(new Date());
          }}
          className="text-sm font-medium text-[#9CA3AF] hover:text-[#1a1a1a] transition-colors"
        >
          Hoy
        </button>

        <h2 className="text-lg font-bold text-[#1a1a1a]">
          {view === "week"
            ? `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
            : `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
        </h2>

        <button
          onClick={() => navigate(1)}
          className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          ▶
        </button>
      </div>

      {/* View toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
        <button
          onClick={() => { setView("week"); setSelectedDay(null); }}
          className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${
            view === "week"
              ? "bg-white shadow-sm text-[#1a1a1a]"
              : "text-[#9CA3AF]"
          }`}
        >
          Semana
        </button>
        <button
          onClick={() => { setView("month"); setSelectedDay(null); }}
          className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${
            view === "month"
              ? "bg-white shadow-sm text-[#1a1a1a]"
              : "text-[#9CA3AF]"
          }`}
        >
          Mes
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#C4E0A2] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {view === "week" ? renderWeekView() : renderMonthView()}
          {renderDayDetail()}
        </>
      )}
    </div>
  );
}
