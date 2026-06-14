"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { Outfit, ClothingItem } from "@/types";

type OutfitWithItems = Outfit & { items: ClothingItem[] };

function OutfitCard({ outfit }: { outfit: OutfitWithItems }) {
  const [liked, setLiked] = React.useState(false);
  const items = outfit.items ?? [];

  const getImg = (i: number) =>
    items[i]?.clean_image_url ?? items[i]?.image_url ?? null;

  return (
    <div className="bg-surface-container-lowest rounded-2xl soft-ambient-shadow snap-start min-w-[300px] p-2 flex-none border border-outline-variant/10">
      {outfit.ai_preview_url ? (
        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-surface-container mb-3">
          <img src={outfit.ai_preview_url} alt={outfit.name} className="w-full h-full object-cover" />
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {items.length >= 3 ? (
            <>
              <div className="aspect-square bg-surface-container rounded-xl overflow-hidden">
                {getImg(0) && <img src={getImg(0)!} alt={items[0].name} className="w-full h-full object-cover" />}
              </div>
              <div className="aspect-square bg-surface-container rounded-xl overflow-hidden">
                {getImg(1) && <img src={getImg(1)!} alt={items[1].name} className="w-full h-full object-cover" />}
              </div>
              <div className="col-span-2 aspect-[2/1] bg-surface-container rounded-xl overflow-hidden">
                {getImg(2) && <img src={getImg(2)!} alt={items[2].name} className="w-full h-full object-cover" />}
              </div>
            </>
          ) : (
            <div className="col-span-2 aspect-[2/1] bg-surface-container rounded-xl overflow-hidden">
              {getImg(0) && <img src={getImg(0)!} alt={items[0].name} className="w-full h-full object-cover" />}
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-[2/1] bg-surface-container rounded-xl mb-3 flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px] text-on-surface-variant/30">styler</span>
        </div>
      )}

      <div className="flex justify-between items-center px-1">
        <div>
          <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">{outfit.name}</span>
          {outfit.occasion && (
            <span className="text-[10px] text-on-surface-variant/50 ml-2 capitalize">{outfit.occasion}</span>
          )}
        </div>
        <button onClick={() => setLiked(!liked)} className="active:scale-90 transition-transform">
          <span
            className="material-symbols-outlined text-xl"
            style={{
              color: liked ? "#e75a66" : undefined,
              fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            favorite
          </span>
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [outfits, setOutfits] = useState<OutfitWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/outfits")
      .then(r => r.ok ? r.json() : { outfits: [] })
      .then(d => setOutfits(d.outfits ?? []))
      .catch(() => setOutfits([]))
      .finally(() => setLoading(false));
  }, []);

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

      <main className="pt-24 pb-32 max-w-7xl mx-auto lg:px-16 px-4">
        {/* Hero CTA */}
        <section className="flex flex-col items-center text-center py-10">
          <div className="relative w-full max-w-sm mx-auto aspect-[3/4] rounded-3xl overflow-hidden mb-8 soft-ambient-shadow">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAU_76Iz-L-CRP_sPLAlqJxJ0MMHT1xt09lBq6h0Oxu8J_9ylFM8oy9j9FIhmSu6rpLdB6ux3be0zhGbxpYad7UH3pAZoGZ770DVGQJ4dowyTZfZh55Qud4pi5YVYBSZBvsOkJE_ejJ_kpDYbnDhWpxQST6xwI8DdllfkcbdmxMkLsiZOWl5FfSRK5S0So2t5_Pwqnc9oGtmjf3QsvUis3Xg1s5P28wKSbVPZinju1uXJsh7Hiz4CrJCsMbVL0nKYgxabKDJ0a8Gnag"
              alt="Minimalist Fashion"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/20 to-transparent" />
          </div>
          <Link href="/outfits">
            <button
              className="text-white px-8 py-4 rounded-2xl text-headline-md font-headline-md soft-ambient-shadow active:scale-95 transition-all hover:opacity-90"
              style={{ backgroundColor: "#e75a66" }}
            >
              Get Dressed Now
            </button>
          </Link>
        </section>

        {/* Quick Picks */}
        <section className="mt-6">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">Quick Picks</h2>
            <Link href="/outfits">
              <button className="text-label-md font-label-md hover:underline decoration-2 underline-offset-4" style={{ color: "#e75a66" }}>
                View All
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
              {[1, 2, 3].map(i => (
                <div key={i} className="min-w-[300px] flex-none rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/10">
                  <div className="shimmer h-48 w-full" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 shimmer rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : outfits.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-2xl p-8 text-center border border-outline-variant/10 soft-ambient-shadow">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-3 block">styler</span>
              <p className="text-label-md font-label-md text-on-surface-variant mb-4">
                No outfits yet — build your first look
              </p>
              <Link href="/outfits/builder">
                <button className="px-6 py-2.5 text-white rounded-xl text-label-md font-label-md transition-all active:scale-95" style={{ backgroundColor: "#e75a66" }}>
                  Build Outfit
                </button>
              </Link>
            </div>
          ) : (
            <div className="flex overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory gap-3">
              {outfits.slice(0, 6).map(outfit => (
                <OutfitCard key={outfit.id} outfit={outfit} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
