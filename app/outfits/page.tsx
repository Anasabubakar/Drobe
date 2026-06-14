"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { Outfit, ClothingItem } from "@/types";

const OCCASION_FILTERS = [
  { label: "All", value: "all" },
  { label: "Casual", value: "casual" },
  { label: "Work", value: "work" },
  { label: "Formal", value: "formal" },
  { label: "Gym", value: "gym" },
  { label: "Date", value: "date" },
];

type OutfitWithItems = Outfit & { items: ClothingItem[] };

function OutfitSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/10 soft-ambient-shadow">
      <div className="aspect-[3/4] shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-surface-container rounded shimmer w-2/3" />
        <div className="h-3 bg-surface-container rounded shimmer w-1/3" />
      </div>
    </div>
  );
}

export default function OutfitsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [outfits, setOutfits] = useState<OutfitWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchOutfits() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/outfits");
        if (!res.ok) throw new Error("Failed to load outfits");
        const data = await res.json();
        setOutfits(data.outfits ?? []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchOutfits();
  }, []);

  const filtered = activeFilter === "all"
    ? outfits
    : outfits.filter(o => o.occasion === activeFilter);

  const toggleLike = (id: string) =>
    setLiked(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/outfits?id=${id}`, { method: "DELETE" });
    if (res.ok) setOutfits(prev => prev.filter(o => o.id !== id));
  };

  return (
    <div className="bg-surface min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-surface h-16">
        <div className="flex justify-between items-center px-6 h-full w-full max-w-7xl mx-auto">
          <button className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="text-display-lg font-display-lg tracking-tighter" style={{ color: "#e75a66" }}>DROBE</h1>
          <button className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      <main className="pt-24 pb-32 max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-headline-lg-mobile font-headline-lg-mobile">Outfits</h2>
            <p className="text-on-surface-variant text-body-md font-body-md mt-1">
              {loading ? "Loading…" : `${outfits.length} saved ${outfits.length === 1 ? "outfit" : "outfits"}`}
            </p>
          </div>
          <Link href="/outfits/builder">
            <button
              className="flex items-center gap-1.5 h-10 px-4 text-white rounded-xl text-label-sm font-label-sm transition-all active:scale-95 hover:opacity-90"
              style={{ backgroundColor: "#e75a66" }}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Build
            </button>
          </Link>
        </div>

        {/* Occasion filter */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-8">
          {OCCASION_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className="flex-none px-4 py-2 rounded-full text-label-sm font-label-sm transition-all active:scale-95 border whitespace-nowrap"
              style={
                activeFilter === f.value
                  ? { backgroundColor: "#e75a66", color: "#fff", borderColor: "#e75a66" }
                  : { backgroundColor: "transparent", color: "#584141", borderColor: "rgba(140,113,113,0.2)" }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <OutfitSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-24 text-center">
            <span className="material-symbols-outlined text-[48px] text-error mb-3">error_outline</span>
            <p className="text-on-surface-variant">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <span className="material-symbols-outlined text-[64px] text-on-surface-variant/25 mb-4">styler</span>
            <p className="text-headline-md font-headline-md text-on-surface mb-2">
              {activeFilter === "all" ? "No outfits yet" : `No ${activeFilter} outfits`}
            </p>
            <p className="text-body-md font-body-md text-on-surface-variant mb-8">
              Build your first outfit from items in your closet
            </p>
            <Link href="/outfits/builder">
              <button className="px-8 py-3 text-white rounded-2xl text-label-md font-label-md transition-all active:scale-95" style={{ backgroundColor: "#e75a66" }}>
                Build an Outfit
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(outfit => {
              const previewImg = outfit.ai_preview_url
                ?? outfit.items?.[0]?.clean_image_url
                ?? outfit.items?.[0]?.image_url;
              const isLiked = liked.has(outfit.id);

              return (
                <div key={outfit.id} className="group relative rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/10 soft-ambient-shadow">
                  {/* Preview */}
                  <div className="relative aspect-[3/4] bg-surface-container overflow-hidden">
                    {previewImg ? (
                      <img src={previewImg} alt={outfit.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        {/* Mini item grid */}
                        {outfit.items && outfit.items.length > 0 ? (
                          <div className="grid grid-cols-2 gap-1 w-full h-full p-2">
                            {outfit.items.slice(0, 4).map(item => (
                              <div key={item.id} className="rounded-lg overflow-hidden bg-surface-container">
                                <img src={item.clean_image_url || item.image_url} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="material-symbols-outlined text-[40px] text-on-surface-variant/30">styler</span>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => toggleLike(outfit.id)}
                      className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{
                          color: isLiked ? "#e75a66" : "#584141",
                          fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0",
                        }}
                      >
                        favorite
                      </span>
                    </button>
                  </div>

                  <div className="p-3">
                    <p className="text-label-md font-label-md font-semibold text-on-surface truncate">{outfit.name}</p>
                    {outfit.occasion && (
                      <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mt-0.5 capitalize">{outfit.occasion}</p>
                    )}
                    <p className="text-[11px] text-on-surface-variant/60 mt-0.5">{outfit.items?.length ?? 0} pieces</p>
                  </div>

                  <button
                    onClick={() => handleDelete(outfit.id)}
                    className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant/40 hover:text-error transition-colors">delete</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
