"use client";

import { useEffect, useState } from "react";

interface NotifProps {
  todayCount: number;
  todayTotal: number;
}

export default function Notifications({ todayCount, todayTotal }: NotifProps) {
  const [permission, setPermission] = useState<NotificationPermission | "unavailable">("default");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermission("unavailable");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted" && todayCount > 0) {
      new Notification("📅 Recordatorio Valentina", {
        body: `Tenés ${todayCount} turnos hoy por un total de $${todayTotal.toLocaleString("es-AR")}`,
        icon: "/icons/icon-192.svg",
      });
    }
  };

  const showReminder = () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification("📅 Recordatorio Valentina", {
        body: `Tenés ${todayCount} turnos hoy por un total de $${todayTotal.toLocaleString("es-AR")}`,
        icon: "/icons/icon-192.svg",
      });
    }
  };

  if (dismissed || permission === "unavailable") return null;

  return (
    <div style={{
      background: "#FFFBEB",
      border: "1px solid #FDE68A",
      borderRadius: 12,
      padding: "8px 12px",
      marginBottom: 12,
      fontSize: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    }}>
      <span>
        {permission === "granted"
          ? `🔔 Recordatorio: ${todayCount} turnos hoy`
          : permission === "denied"
          ? "🔔 Notificaciones bloqueadas — activalas desde la configuración del navegador"
          : "🔔 Activá notificaciones para recordatorios de turnos"}
      </span>
      <div style={{ display: "flex", gap: 6 }}>
        {permission === "default" && (
          <button onClick={requestPermission} style={{
            background: "#C4E0A2",
            border: "none",
            borderRadius: 8,
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}>
            Activar
          </button>
        )}
        {permission === "granted" && (
          <button onClick={showReminder} style={{
            background: "transparent",
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: "4px 10px",
            fontSize: 11,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}>
            Probar
          </button>
        )}
        <button onClick={() => setDismissed(true)} style={{
          background: "transparent",
          border: "none",
          fontSize: 14,
          cursor: "pointer",
          color: "#999",
          padding: "0 4px",
        }}>
          ✕
        </button>
      </div>
    </div>
  );
}
