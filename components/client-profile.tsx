"use client";

import { useState, useEffect } from "react";
import type { Client, Turno } from "@/lib/types";
import { fp, SL, EL } from "@/lib/types";

interface ClientProfileProps {
  clienteId: number;
  onBack: () => void;
}

export default function ClientProfile({ clienteId, onBack }: ClientProfileProps) {
  const [cliente, setCliente] = useState<Client | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [healthOpen, setHealthOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [clienteRes, turnosRes] = await Promise.all([
          fetch(`/api/clientes/${clienteId}`),
          fetch(`/api/turnos?cid=${clienteId}`),
        ]);

        if (clienteRes.ok) {
          const c: Client = await clienteRes.json();
          setCliente(c);
        }

        if (turnosRes.ok) {
          const t: Turno[] = await turnosRes.json();
          setTurnos(t);
        }
      } catch (e) {
        console.error("Error fetching client profile:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [clienteId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-[#C4E0A2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="text-center py-8 text-[#9CA3AF]">
        Cliente no encontrado
      </div>
    );
  }

  const activeTurnos = turnos.filter((t) => t.est !== "cancelado");
  const historial = activeTurnos.slice(0, 6);
  const proximoTurno = turnos.find((t) => t.est === "agendado" || t.est === "confirmado");

  return (
    <div>
      {/* Back */}
      <button
        onClick={onBack}
        className="text-sm text-[#9CA3AF] mb-4 hover:text-[#1a1a1a] transition-colors"
      >
        ← Clientes
      </button>

      {/* Avatar + Name */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-[#C4E0A2]/30 flex items-center justify-center text-4xl">
            👩
          </div>
          {cliente.fav === 1 && (
            <span className="absolute -top-1 -right-1 text-lg">⭐</span>
          )}
        </div>
        <h2 className="text-xl font-bold text-[#1a1a1a] mt-3">
          {cliente.nombre}
        </h2>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {cliente.wpp && (
          <div className="bg-white rounded-xl p-3 border border-[#f0f0f0]">
            <div className="text-xs text-[#9CA3AF]">WhatsApp</div>
            <div className="text-sm font-medium text-[#1a1a1a]">
              {cliente.wpp}
            </div>
          </div>
        )}
        {cliente.ig && (
          <div className="bg-white rounded-xl p-3 border border-[#f0f0f0]">
            <div className="text-xs text-[#9CA3AF]">Instagram</div>
            <div className="text-sm font-medium text-[#1a1a1a]">
              {cliente.ig}
            </div>
          </div>
        )}
        {cliente.edad > 0 && (
          <div className="bg-white rounded-xl p-3 border border-[#f0f0f0]">
            <div className="text-xs text-[#9CA3AF]">Edad</div>
            <div className="text-sm font-medium text-[#1a1a1a]">
              {cliente.edad} años
            </div>
          </div>
        )}
        {cliente.dir && (
          <div className="bg-white rounded-xl p-3 border border-[#f0f0f0]">
            <div className="text-xs text-[#9CA3AF]">Zona</div>
            <div className="text-sm font-medium text-[#1a1a1a]">
              {cliente.dir}
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {cliente.forma && (
          <span className="text-xs bg-[#C4E0A2]/40 text-[#1a1a1a] px-2.5 py-1 rounded-full font-medium">
            {cliente.forma}
          </span>
        )}
        {cliente.largo && (
          <span className="text-xs bg-[#C4E0A2]/40 text-[#1a1a1a] px-2.5 py-1 rounded-full font-medium">
            {cliente.largo}
          </span>
        )}
        {cliente.servHab && (
          <span className="text-xs bg-[#C4E0A2]/40 text-[#1a1a1a] px-2.5 py-1 rounded-full font-medium">
            {SL[cliente.servHab] || cliente.servHab}
          </span>
        )}
        {cliente.fav === 1 && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
            ⭐ Favorita
          </span>
        )}
        {cliente.nueva === 1 && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
            🆕 Nueva
          </span>
        )}
      </div>

      {/* Health Section */}
      {(cliente.alerg || cliente.emb === 1 || cliente.cond) && (
        <div className="mb-4">
          <button
            onClick={() => setHealthOpen(!healthOpen)}
            className="flex items-center justify-between w-full bg-white rounded-xl p-3 border border-[#f0f0f0]"
          >
            <span className="text-sm font-semibold text-[#1a1a1a]">
              🏥 Salud
            </span>
            <span className="text-[#9CA3AF] text-lg transition-transform duration-200"
              style={{ transform: healthOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              ▼
            </span>
          </button>
          {healthOpen && (
            <div className="mt-2 space-y-2 px-1">
              {cliente.alerg && (
                <div className="text-sm">
                  <span className="font-medium text-[#1a1a1a]">Alergias: </span>
                  <span className="text-[#9CA3AF]">{cliente.alerg}</span>
                </div>
              )}
              {cliente.emb === 1 && (
                <div className="text-sm text-amber-600 font-medium">
                  🤰 Embarazada
                </div>
              )}
              {cliente.cond && (
                <div className="text-sm">
                  <span className="font-medium text-[#1a1a1a]">
                    Condiciones:{" "}
                  </span>
                  <span className="text-[#9CA3AF]">{cliente.cond}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Próximo turno */}
      {proximoTurno && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[#1a1a1a] mb-2">
            📅 Próximo turno
          </h3>
          <div className="bg-white rounded-xl p-3 border border-[#C4E0A2]">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-[#1a1a1a]">
                  {new Date(proximoTurno.fec + "T12:00:00").toLocaleDateString(
                    "es-AR",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    },
                  )}
                </div>
                <div className="text-xs text-[#9CA3AF]">
                  {proximoTurno.hor} ·{" "}
                  {SL[proximoTurno.serv] || proximoTurno.serv} ·{" "}
                  {fp(proximoTurno.tot)}
                </div>
              </div>
              <div className="text-xs font-medium text-[#8BBC4A]">
                {EL[proximoTurno.est] || proximoTurno.est}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historial */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#1a1a1a] mb-2">
          📋 Historial
        </h3>
        {historial.length === 0 ? (
          <p className="text-sm text-[#9CA3AF]">Sin turnos previos</p>
        ) : (
          <div className="space-y-2">
            {historial.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl p-3 border border-[#f0f0f0]"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-[#1a1a1a]">
                      {new Date(t.fec + "T12:00:00").toLocaleDateString(
                        "es-AR",
                        {
                          day: "numeric",
                          month: "short",
                        },
                      )}{" "}
                      · {t.hor}
                    </div>
                    <div className="text-xs text-[#9CA3AF]">
                      {SL[t.serv] || t.serv}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#1a1a1a]">
                      {fp(t.tot)}
                    </div>
                    <div className="text-xs text-[#9CA3AF]">
                      {t.met === "efectivo" ? "💵" : t.met === "mercado_pago" ? "📱" : ""}
                      {" "}{EL[t.est] || t.est}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-8">
        <button className="flex-1 py-2.5 rounded-xl bg-gray-100 text-[#1a1a1a] font-medium text-sm hover:bg-gray-200 transition-colors">
          ✏️ Editar
        </button>
        <button className="flex-1 py-2.5 rounded-xl bg-[#C4E0A2] text-[#1a1a1a] font-medium text-sm hover:bg-[#D4EAA8] transition-colors">
          + Turno
        </button>
      </div>
    </div>
  );
}
