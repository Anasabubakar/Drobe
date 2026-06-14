"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { ClothingItem } from "@/types";

const CATEGORIES = ["All", "Tops", "Bottoms", "Outerwear", "Shoes", "Accessories", "Dresses"];
const CATEGORY_MAP: Record<string, string> = {
  All: "all", Tops: "top", Bottoms: "bottom",
  Outerwear: "outerwear", Shoes: "shoes", Accessories: "accessory", Dresses: "dress",
};

function Skeleton() {
  return <div className="aspect-[3/4] rounded-2xl shimmer" />;
}

export default function WardrobePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cat = CATEGORY_MAP[activeCategory] ?? "all";
      const res = await fetch(`/api/wardrobe?category=${cat}`);
      if (!res.ok) throw new Error("Failed to load wardrobe");
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = search.trim()
    ? items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/wardrobe?id=${id}`, { method: "DELETE" });
    if (res.ok) setItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className="bg-surface min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-surface h-16 border-b border-outline-variant/10">
        <div className="flex items-center gap-3 px-4 h-full max-w-7xl mx-auto">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px]">search</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search your closet..."
              className="w-full h-10 pl-10 pr-4 bg-surface-container-low rounded-xl border border-outline-variant/20 outline-none text-body-md font-body-md focus:border-primary/40 transition-colors"
            />
          </div>
          <Link href="/wardrobe/add">
            <button
              className="flex items-center gap-1 h-10 px-4 text-white rounded-xl text-label-md font-label-md transition-all active:scale-95 hover:opacity-90 flex-none"
              style={{ backgroundColor: "#e75a66" }}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add
            </button>
          </Link>
        </div>
      </header>

      <main className="pt-20 pb-32 max-w-7xl mx-auto">
        <div className="flex gap-2 overflow-x-auto px-4 py-4 hide-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-none px-4 py-2 rounded-full text-label-sm font-label-sm transition-all active:scale-95 whitespace-nowrap border"
              style={
                activeCategory === cat
                  ? { backgroundColor: "#e75a66", color: "#fff", borderColor: "#e75a66" }
                  : { backgroundColor: "transparent", color: "#584141", borderColor: "rgba(140,113,113,0.2)" }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="px-4">
          {!loading && !error && (
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mb-4">
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-24 text-center">
              <span className="material-symbols-outlined text-[48px] text-error mb-3">error_outline</span>
              <p className="text-on-surface-variant mb-4">{error}</p>
              <button onClick={fetchItems} className="text-label-md font-label-md font-semibold" style={{ color: "#e75a66" }}>
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-24 text-center">
              <span className="material-symbols-outlined text-[64px] text-on-surface-variant/25 mb-4">checkroom</span>
              <p className="text-headline-md font-headline-md text-on-surface mb-2">
                {search ? "No matches found" : "Your closet is empty"}
              </p>
              <p className="text-body-md font-body-md text-on-surface-variant mb-8">
                {search ? "Try a different search term" : "Add your first item to start building your digital wardrobe"}
              </p>
              {!search && (
                <Link href="/wardrobe/add">
                  <button className="px-8 py-3 text-white rounded-2xl text-label-md font-label-md transition-all active:scale-95" style={{ backgroundColor: "#e75a66" }}>
                    Add First Item
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(item => (
                <div key={item.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface-container soft-ambient-shadow">
                  <img
                    src={item.clean_image_url || item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
                    <p className="text-white text-label-sm font-label-sm font-semibold truncate">{item.name}</p>
                    <p className="text-white/70 text-[10px] uppercase tracking-wider mt-0.5 capitalize">{item.category}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                  >
                    <span className="material-symbols-outlined text-[15px] text-error">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
