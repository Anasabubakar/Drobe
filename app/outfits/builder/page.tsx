"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ClothingItem } from "@/types";

const SLOTS = ["Top", "Bottom", "Outerwear", "Shoes"] as const;
type Slot = typeof SLOTS[number];

const SLOT_CATEGORY_MAP: Record<Slot, string[]> = {
  Top: ["top"],
  Bottom: ["bottom", "dress"],
  Outerwear: ["outerwear"],
  Shoes: ["shoes"],
};

const OCCASIONS = [
  { value: "casual", label: "Casual" },
  { value: "work", label: "Work" },
  { value: "formal", label: "Formal" },
  { value: "gym", label: "Gym" },
  { value: "date", label: "Date" },
  { value: "other", label: "Other" },
];

export default function OutfitBuilderPage() {
  const router = useRouter();
  const [closet, setCloset] = useState<ClothingItem[]>([]);
  const [loadingCloset, setLoadingCloset] = useState(true);
  const [canvas, setCanvas] = useState<Partial<Record<Slot, ClothingItem>>>({});
  const [name, setName] = useState("");
  const [occasion, setOccasion] = useState("casual");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/wardrobe?category=all")
      .then(r => r.ok ? r.json() : { items: [] })
      .then(d => setCloset(d.items ?? []))
      .catch(() => setCloset([]))
      .finally(() => setLoadingCloset(false));
  }, []);

  const assignItem = (item: ClothingItem) => {
    const slot = SLOTS.find(s => SLOT_CATEGORY_MAP[s].includes(item.category));
    if (slot) setCanvas(prev => ({ ...prev, [slot]: item }));
  };

  const removeSlot = (slot: Slot) => {
    setCanvas(prev => { const n = { ...prev }; delete n[slot]; return n; });
  };

  const handleSave = async () => {
    if (!name.trim()) { setError("Please give your outfit a name"); return; }
    setSaving(true);
    setError(null);
    try {
      const item_ids = Object.values(canvas).map(i => i!.id);
      const res = await fetch("/api/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), occasion, item_ids }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Failed to save");
      }
      setSaved(true);
      setTimeout(() => router.push("/outfits"), 800);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-surface h-16 border-b border-outline-variant/10">
        <div className="flex items-center justify-between px-6 h-full max-w-7xl mx-auto">
          <Link href="/outfits">
            <button className="text-on-surface-variant hover:opacity-70 transition-opacity active:scale-95">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          </Link>
          <h1 className="text-headline-md font-headline-md tracking-tight" style={{ color: "#e75a66" }}>Outfit Builder</h1>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="text-white px-4 py-2 rounded-xl text-label-md font-label-md transition-all active:scale-95 hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#e75a66" }}
          >
            {saving ? "Saving…" : saved ? "Saved!" : "Save"}
          </button>
        </div>
      </header>

      <main className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Closet */}
          <aside className="lg:w-60 flex-none">
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mb-3">Closet</p>
            {loadingCloset ? (
              <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-square rounded-xl shimmer" />)}
              </div>
            ) : closet.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-[40px] text-on-surface-variant/30">checkroom</span>
                <p className="text-[12px] text-on-surface-variant mt-2">Add items to your closet first</p>
                <Link href="/wardrobe/add">
                  <button className="mt-3 text-label-sm font-label-sm font-semibold" style={{ color: "#e75a66" }}>Add Items</button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                {closet.map(item => (
                  <button
                    key={item.id}
                    onClick={() => assignItem(item)}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-surface-container hover:ring-2 transition-all active:scale-95"
                    style={{ ["--tw-ring-color" as string]: "#e75a66" }}
                    title={item.name}
                  >
                    <img src={item.clean_image_url || item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* Canvas */}
          <div className="flex-1">
            {/* Name + occasion */}
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Outfit name…"
                className="flex-1 h-10 px-4 bg-surface-container-low border border-outline-variant/20 rounded-xl text-body-md font-body-md outline-none focus:border-primary/40 transition-colors"
              />
              <select
                value={occasion}
                onChange={e => setOccasion(e.target.value)}
                className="h-10 px-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-body-md font-body-md outline-none focus:border-primary/40 transition-colors"
              >
                {OCCASIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {error && (
              <p className="text-error text-[13px] mb-3 bg-error-container rounded-xl px-4 py-2">{error}</p>
            )}

            <div className="bg-surface-container-lowest rounded-3xl p-4 soft-ambient-shadow border border-outline-variant/10 space-y-3">
              {SLOTS.map(slot => {
                const item = canvas[slot];
                return (
                  <div key={slot} className="flex items-center gap-4">
                    <span className="text-label-sm font-label-sm text-on-surface-variant/60 uppercase tracking-widest w-20 shrink-0">{slot}</span>
                    <div className={`flex-1 h-20 rounded-2xl border-2 border-dashed overflow-hidden transition-all ${item ? "border-transparent" : "border-outline-variant/25"}`}>
                      {item ? (
                        <div className="w-full h-full relative group">
                          <img src={item.clean_image_url || item.image_url} alt={item.name} className="w-full h-full object-cover rounded-2xl" />
                          <div className="absolute inset-0 bg-on-surface/0 group-hover:bg-on-surface/20 transition-colors rounded-2xl flex items-center justify-center">
                            <button onClick={() => removeSlot(slot)} className="opacity-0 group-hover:opacity-100 bg-white/90 rounded-full p-1 transition-opacity">
                              <span className="material-symbols-outlined text-[16px] text-on-surface">close</span>
                            </button>
                          </div>
                          <span className="absolute bottom-2 left-3 text-white text-[11px] font-semibold drop-shadow truncate max-w-[80%]">{item.name}</span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-on-surface-variant/30 text-[12px]">Tap an item to assign</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setCanvas({})}
                className="flex-1 h-12 border border-outline-variant/30 rounded-2xl text-label-md font-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className="flex-1 h-12 text-white rounded-2xl text-label-md font-label-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                style={{ backgroundColor: "#e75a66" }}
              >
                {saving ? "Saving…" : saved ? "Saved!" : "Save Outfit"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
