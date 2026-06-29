"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Precio } from "@/lib/types";
import { fp, SL } from "@/lib/types";
import BottomNav from "@/components/bottom-nav";
import Modal from "@/components/modal";

export default function PreciosPage() {
  const router = useRouter();
  const [precios, setPrecios] = useState<Precio[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Precio | null>(null);
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

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

  async function fetchPrecios() {
    try {
      const res = await fetch("/api/precios");
      const data: Precio[] = await res.json();
      setPrecios(data);
    } catch (e) {
      console.error("Error fetching precios:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPrecios();
  }, []);

  function openAdd() {
    setEditing(null);
    setFormName("");
    setFormPrice("");
    setModalOpen(true);
  }

  function openEdit(p: Precio) {
    setEditing(p);
    setFormName(p.serv);
    setFormPrice(String(p.pre));
    setModalOpen(true);
  }

  async function handleSave() {
    if (!formName.trim() || !formPrice.trim()) return;
    setSaving(true);

    try {
      if (editing) {
        await fetch(`/api/precios/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serv: formName.trim(), pre: parseInt(formPrice) }),
        });
      } else {
        await fetch("/api/precios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serv: formName.trim(),
            pre: parseInt(formPrice),
            act: 1,
          }),
        });
      }

      setModalOpen(false);
      fetchPrecios();
    } catch (e) {
      console.error("Error saving precio:", e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`/api/precios/${id}`, {
        method: "DELETE",
      });
      setDeleteConfirm(null);
      fetchPrecios();
    } catch (e) {
      console.error("Error deleting precio:", e);
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0E8] min-h-screen">
      <div className="flex-1 max-w-[393px] mx-auto w-full pb-24 px-4">
        {/* Header */}
        <div className="pt-6 pb-4">
          <h1 className="text-2xl font-bold text-[#1a1a1a]">💲 Precios</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#C4E0A2] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : precios.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#9CA3AF] text-sm">
              Sin precios configurados
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {precios.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl p-3 border border-[#f0f0f0] flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-[#1a1a1a]">
                    {SL[p.serv] || p.serv}
                  </div>
                  <div className="text-lg font-bold text-[#1a1a1a]">
                    {fp(p.pre)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm hover:bg-gray-200 transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(p.id)}
                    className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-sm hover:bg-red-100 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete confirm */}
        {deleteConfirm !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl p-6 mx-4 max-w-xs w-full shadow-xl">
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">
                ¿Eliminar precio?
              </h3>
              <p className="text-sm text-[#9CA3AF] mb-4">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-[#1a1a1a] font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openAdd}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[#C4E0A2] shadow-lg flex items-center justify-center text-2xl hover:bg-[#D4EAA8] transition-all active:scale-90 shadow-[#C4E0A2]/30"
      >
        +
      </button>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar precio" : "Nuevo servicio"}
      >
        <div className="space-y-4">
          {/* Service name selector */}
          <div>
            <label className="text-sm font-medium text-[#1a1a1a] block mb-1">
              Servicio
            </label>
            <select
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full bg-gray-50 rounded-xl border border-[#f0f0f0] py-2.5 px-4 text-sm text-[#1a1a1a] outline-none focus:border-[#C4E0A2] transition-colors"
            >
              <option value="">Seleccionar...</option>
              {Object.entries(SL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Price input */}
          <div>
            <label className="text-sm font-medium text-[#1a1a1a] block mb-1">
              Precio ($)
            </label>
            <input
              type="number"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
              placeholder="0"
              className="w-full bg-gray-50 rounded-xl border border-[#f0f0f0] py-2.5 px-4 text-sm text-[#1a1a1a] outline-none focus:border-[#C4E0A2] transition-colors"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 text-[#1a1a1a] font-medium text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!formName.trim() || !formPrice.trim() || saving}
              className="flex-1 py-2.5 rounded-xl bg-[#C4E0A2] text-[#1a1a1a] font-medium text-sm disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </Modal>

      <BottomNav />
    </div>
  );
}
