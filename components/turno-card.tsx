"use client";

import type { Turno, Client } from "@/lib/types";
import { fp, SL, PL } from "@/lib/types";

interface TurnoCardProps {
  turno: Turno;
  cliente?: Client;
  isCanceled?: boolean;
  onClick?: () => void;
}

function statusIcon(est: string, pg: string): string {
  if (est === "cancelado") return "❌";
  if (est === "completado" || pg === "pagado") return "✅";
  if (pg === "seña" || pg === "mitad") return "⏳";
  return "📌";
}

function paymentIcon(met: string): string {
  if (met === "efectivo") return "💵";
  if (met === "mercado_pago") return "📱";
  return "";
}

function borderColor(est: string): string {
  if (est === "cancelado") return "border-l-red-500";
  if (est === "completado") return "border-l-green-500";
  if (est === "confirmado") return "border-l-amber-500";
  return "border-l-[#C4E0A2]";
}

export default function TurnoCard({
  turno,
  cliente,
  isCanceled,
  onClick,
}: TurnoCardProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 bg-white rounded-xl border border-[#f0f0f0] border-l-4 ${borderColor(turno.est)} cursor-pointer hover:shadow-md transition-all active:scale-[0.98] ${isCanceled ? "opacity-70" : ""}`}
    >
      {/* Time */}
      <div className="text-center min-w-[48px]">
        <div className="text-sm font-semibold text-[#1a1a1a]">{turno.hor}</div>
      </div>

      {/* Status icon */}
      <div className="text-lg">{statusIcon(turno.est, turno.pg)}</div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-[#1a1a1a] truncate">
          {cliente?.nombre ?? "Sin cliente"}
        </div>
        <div className="text-xs text-[#9CA3AF] truncate">
          {SL[turno.serv] || turno.serv}
          {turno.reconst > 0 && ` + Reconst (${turno.reconst})`}
          <span className="mx-1">·</span>
          {paymentIcon(turno.met) && `${paymentIcon(turno.met)} `}
          {PL[turno.pg] || turno.pg}
        </div>
        {isCanceled && turno.mot && (
          <div className="text-xs text-red-500 truncate mt-0.5">
            {turno.mot}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="text-right">
        <div className="font-bold text-sm text-[#1a1a1a]">
          {fp(turno.tot)}
        </div>
      </div>
    </div>
  );
}
