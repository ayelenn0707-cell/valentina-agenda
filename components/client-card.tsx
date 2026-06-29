"use client";

import type { Client } from "@/lib/types";

interface ClientCardProps {
  cliente: Client;
  onClick: () => void;
  lastService?: string;
}

export default function ClientCard({
  cliente,
  onClick,
  lastService,
}: ClientCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#f0f0f0] cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-[#C4E0A2]/30 flex items-center justify-center text-2xl">
          👩
        </div>
        {cliente.fav === 1 && (
          <span className="absolute -top-1 -right-1 text-xs">⭐</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-sm text-[#1a1a1a] truncate">
            {cliente.nombre}
          </span>
          {cliente.fav === 1 && (
            <span className="text-xs">⭐</span>
          )}
          {cliente.nueva === 1 && (
            <span className="text-[10px] bg-[#C4E0A2] text-[#1a1a1a] px-1.5 py-0.5 rounded-full font-medium">
              🆕
            </span>
          )}
        </div>
        {lastService && (
          <div className="text-xs text-[#9CA3AF] truncate">
            Último: {lastService}
          </div>
        )}
      </div>

      {/* Arrow */}
      <div className="text-[#9CA3AF] text-lg">›</div>
    </div>
  );
}
