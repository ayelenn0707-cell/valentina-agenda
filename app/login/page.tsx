"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const NUMPAD_KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "⌫"],
];

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleKeyPress = useCallback(
    async (key: string) => {
      if (loading) return;

      if (key === "⌫") {
        setPin((prev) => prev.slice(0, -1));
        setError("");
        return;
      }

      if (key === "") return;

      if (pin.length >= 4) return;

      const newPin = [...pin, key];
      setPin(newPin);

      if (newPin.length === 4) {
        setLoading(true);
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pin: newPin.join("") }),
          });

          const data = await res.json();

          if (data.ok) {
            router.push("/dashboard");
          } else {
            setError("PIN incorrecto");
            setPin([]);
          }
        } catch {
          setError("Error de conexión");
          setPin([]);
        } finally {
          setLoading(false);
        }
      }
    },
    [pin, loading, router],
  );

  return (
    <div className="relative flex-1 flex items-center justify-center min-h-screen overflow-hidden bg-[#F5F0E8]">
      {/* Aura circles */}
      <div className="absolute -top-40 -left-20 w-80 h-80 rounded-full bg-[#C4E0A2]/30 blur-3xl" />
      <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-[#C4E0A2]/20 blur-3xl" />
      <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-[#D4EAA8]/20 blur-3xl" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/50">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">💅</div>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">
              Valentina Agenda
            </h1>
            <p className="text-[#9CA3AF] mt-2 text-sm">
              Ingresá tu PIN
            </p>
          </div>

          {/* PIN dots */}
          <div className="flex justify-center gap-4 mb-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  pin[i]
                    ? "bg-[#C4E0A2] border-[#C4E0A2] scale-110"
                    : "bg-transparent border-[#9CA3AF]"
                }`}
              />
            ))}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-center text-[#EF4444] text-sm mb-4 animate-pulse">
              {error}
            </p>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center mb-4">
              <div className="w-6 h-6 border-2 border-[#C4E0A2] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Numpad */}
          <div className="mt-6">
            {NUMPAD_KEYS.map((row, rowIdx) => (
              <div key={rowIdx} className="flex justify-center gap-4 mb-3">
                {row.map((key) => (
                  <button
                    key={key || `empty-${rowIdx}`}
                    onClick={() => handleKeyPress(key)}
                    disabled={key === "" || loading}
                    className={`w-20 h-16 rounded-xl text-xl font-semibold transition-all duration-150 active:scale-95
                      ${
                        key === "⌫"
                          ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          : key
                            ? "bg-white border border-gray-200 text-[#1a1a1a] hover:bg-[#C4E0A2]/20 shadow-sm"
                            : "bg-transparent cursor-default"
                      }
                      ${loading ? "opacity-50" : ""}
                    `}
                  >
                    {key === "⌫" ? "⌫" : key}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
