"use client";

import React, { useState, useEffect } from "react";
import type { OutfitSchedule } from "@/types";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekDates(anchor: Date): Date[] {
  const day = anchor.getDay();
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isoDate(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function SchedulePage() {
  const [anchor, setAnchor] = useState(() => new Date());
  const [schedule, setSchedule] = useState<OutfitSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const weekDates = getWeekDates(anchor);
  const today = isoDate(new Date());

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/schedule?week=${isoDate(anchor)}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSchedule(data.schedule ?? []);
      } catch {
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [anchor]);

  const byDate = Object.fromEntries(
    schedule.map(s => [s.scheduled_date, s])
  );

  const prevWeek = () => {
    const d = new Date(anchor);
    d.setDate(d.getDate() - 7);
    setAnchor(d);
  };

  const nextWeek = () => {
    const d = new Date(anchor);
    d.setDate(d.getDate() + 7);
    setAnchor(d);
  };

  const clearDay = async (id: string) => {
    const res = await fetch(`/api/schedule?id=${id}`, { method: "DELETE" });
    if (res.ok) setSchedule(prev => prev.filter(s => s.id !== id));
  };

  const filledCount = weekDates.filter(d => byDate[isoDate(d)]).length;

  return (
    <div className="bg-surface min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-surface h-16 border-b border-outline-variant/10">
        <div className="flex items-center justify-between px-6 h-full max-w-7xl mx-auto">
          <button className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="text-headline-md font-headline-md tracking-tighter" style={{ color: "#e75a66" }}>DROBE</h1>
          <button className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      <main className="pt-24 pb-32 px-4 max-w-7xl mx-auto">
        {/* Title row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-headline-lg-mobile font-headline-lg-mobile">Weekly Plan</h2>
            <p className="text-on-surface-variant text-body-md font-body-md mt-0.5">
              {filledCount}/7 days planned
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={prevWeek} className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button onClick={nextWeek} className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Week header */}
        <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mb-4">
          {weekDates[0].toLocaleDateString("en", { month: "short", day: "numeric" })} – {weekDates[6].toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
        </p>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, idx) => {
            const ds = isoDate(date);
            const entry = byDate[ds];
            const isToday = ds === today;
            const outfit = entry?.outfits;
            const previewImg =
              outfit?.ai_preview_url ??
              outfit?.outfit_items?.[0]?.clothing_items?.clean_image_url ??
              outfit?.outfit_items?.[0]?.clothing_items?.image_url;

            return (
              <div key={ds} className="flex flex-col gap-1">
                <div
                  className={`text-center py-2 rounded-xl ${isToday ? "text-white" : ""}`}
                  style={isToday ? { backgroundColor: "#e75a66" } : undefined}
                >
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isToday ? "text-white/80" : "text-on-surface-variant"}`}>
                    {DAY_LABELS[idx]}
                  </p>
                  <p className={`text-label-md font-label-md font-bold ${isToday ? "text-white" : "text-on-surface"}`}>
                    {date.getDate()}
                  </p>
                </div>

                <div className={`relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface-container border transition-all ${isToday ? "border-primary/40" : "border-outline-variant/15"}`}>
                  {loading ? (
                    <div className="w-full h-full shimmer" />
                  ) : outfit && previewImg ? (
                    <>
                      <img src={previewImg} alt={outfit.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-on-surface/50 to-transparent" />
                      <p className="absolute bottom-2 left-2 right-2 text-white text-[9px] font-semibold leading-tight line-clamp-2">{outfit.name}</p>
                      <button
                        onClick={() => clearDay(entry.id)}
                        className="absolute top-1.5 right-1.5 bg-white/80 rounded-full p-0.5"
                      >
                        <span className="material-symbols-outlined text-[13px] text-on-surface">close</span>
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                      <span className="material-symbols-outlined text-[20px] text-on-surface-variant">add</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI banner */}
        <div className="mt-8 rounded-2xl p-5 flex items-center gap-4 soft-ambient-shadow bg-surface-container-lowest border border-outline-variant/10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-none" style={{ backgroundColor: "rgba(231,90,102,0.10)" }}>
            <span className="material-symbols-outlined text-[24px]" style={{ color: "#e75a66", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <div className="flex-1">
            <p className="text-label-md font-label-md font-semibold text-on-surface mb-0.5">Auto-Fill Your Week</p>
            <p className="text-[12px] text-on-surface-variant">Let AI plan all 7 days from your saved outfits.</p>
          </div>
          <button
            className="text-white px-4 py-2 rounded-xl text-label-sm font-label-sm font-semibold hover:opacity-90 active:scale-95 transition-all flex-none"
            style={{ backgroundColor: "#e75a66" }}
          >
            Auto-Fill
          </button>
        </div>
      </main>
    </div>
  );
}
