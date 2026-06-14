"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const PREFERENCE_ITEMS = [
  { icon: "tune", label: "Wardrobe Preferences" },
  { icon: "devices", label: "Connected Devices" },
  { icon: "settings", label: "Account Settings" },
];

const SUPPORT_ITEMS = [
  { icon: "help_center", label: "Help Center" },
  { icon: "verified_user", label: "Privacy & Terms" },
];

function SettingsGroup({ items }: { items: { icon: string; label: string }[] }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden soft-ambient-shadow">
      {items.map((item, i) => (
        <button
          key={item.label}
          className={`w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors active:scale-[0.99] group ${i < items.length - 1 ? "border-b border-surface-container-highest" : ""}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center" style={{ color: "#e75a66" }}>
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            </div>
            <span className="text-body-lg font-body-lg text-on-surface">{item.label}</span>
          </div>
          <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
        </button>
      ))}
    </div>
  );
}

interface Stats { items: number; outfits: number }

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({ items: 0, outfits: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const [wardrobeRes, outfitsRes] = await Promise.all([
          fetch("/api/wardrobe?category=all"),
          fetch("/api/outfits"),
        ]);
        const [wardrobeData, outfitsData] = await Promise.all([
          wardrobeRes.ok ? wardrobeRes.json() : { items: [] },
          outfitsRes.ok ? outfitsRes.json() : { outfits: [] },
        ]);
        setStats({
          items: wardrobeData.items?.length ?? 0,
          outfits: outfitsData.outfits?.length ?? 0,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const displayName = user?.user_metadata?.full_name
    ?? user?.email?.split("@")[0]
    ?? "Your Profile";

  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const STATS_DATA = [
    { label: "Items", value: stats.items },
    { label: "Outfits", value: stats.outfits },
    { label: "Collections", value: 0 },
  ];

  return (
    <div className="bg-surface min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-surface h-16">
        <div className="flex justify-between items-center px-6 h-full w-full max-w-7xl mx-auto">
          <span className="material-symbols-outlined cursor-pointer active:scale-95 transition-transform" style={{ color: "#e75a66" }}>menu</span>
          <h1 className="text-headline-md font-headline-md tracking-tighter" style={{ color: "#e75a66" }}>DROBE</h1>
          <span className="material-symbols-outlined cursor-pointer active:scale-95 transition-transform" style={{ color: "#e75a66" }}>notifications</span>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
        {/* Profile Hero */}
        <section className="flex flex-col items-center mb-10">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-surface-container-highest ring-1 ring-primary/10 bg-surface-container flex items-center justify-center">
              {loading ? (
                <div className="w-full h-full shimmer" />
              ) : (
                <span className="text-2xl font-bold" style={{ color: "#e75a66" }}>{initials}</span>
              )}
            </div>
            <div
              className="absolute bottom-1 right-1 text-white p-1.5 shadow-lg cursor-pointer active:scale-90 transition-transform rounded-xl"
              style={{ backgroundColor: "#e75a66" }}
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </div>
          </div>

          {loading ? (
            <div className="h-7 w-40 shimmer rounded-lg mb-3" />
          ) : (
            <h2 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface mb-1">{displayName}</h2>
          )}

          <p className="text-body-md font-body-md text-on-surface-variant">{user?.email}</p>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {STATS_DATA.map(stat => (
            <div key={stat.label} className="bg-white p-4 rounded-2xl text-center soft-ambient-shadow">
              {loading ? (
                <div className="h-8 shimmer rounded mb-1" />
              ) : (
                <p className="text-[24px] font-bold" style={{ color: "#e75a66" }}>{stat.value}</p>
              )}
              <p className="text-label-sm font-label-sm text-on-surface-variant">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="space-y-2">
          <h3 className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest ml-2 mb-2">Preferences</h3>
          <SettingsGroup items={PREFERENCE_ITEMS} />

          <h3 className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest ml-2 mt-6 mb-2">Support</h3>
          <SettingsGroup items={SUPPORT_ITEMS} />

          <button
            onClick={handleSignOut}
            className="w-full py-5 text-center text-label-md font-label-md font-semibold rounded-2xl hover:opacity-70 transition-opacity mt-2"
            style={{ color: "#e75a66" }}
          >
            Log Out
          </button>
        </div>
      </main>
    </div>
  );
}
