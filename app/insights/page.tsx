"use client";

import React from "react";

const MOST_WORN = [
  {
    name: "Camel Wool Coat", wears: 42, pct: 85,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmcynztBEETURBHMw2ZGHBB4kflPVd5evngrqD2jGwL8jZAaHHdJbb6MMXdGpWEyJOJ2H7i0RkV-0iCz3UCgb2ykYnfo3u3hcgLZSpsW1OFxbj7-ZiIRN5Rrp7QzbJEePFA9IXyRKhabPK9VfzO2Mh2ZUQecKcRJLzOUVLP9AMLkkLw4wvg6E3lNcm1F_gIw2o4qL5SeoGoYQhvBGpka1hw2-8bWBbIn9hExOhKYJzD_VvcIITLEycghN5PKy5AEzhQBA-5qHLFY69",
  },
  {
    name: "Selvedge Denim", wears: 38, pct: 70,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3B-_-6WJ7wO1kgHaPWf9pS8RnuXYiDm4t_0uFRkZi3Ci2Mm5zVMcQhiTXu9XwuJFph1TWb04WfHyY6PYNpOphDpR0W6XCyfAhZ6MeoXYyycXRvVctJATnSZrh5k3VFaYJzJCChTnz2_0qAi7etP802Y8vqOB4bAr2kAfdFbfLgBlf458X-Q88aU4ndd0VHhFtK82vrwIVcUU-_jkxKIsMHiZubzSG_7Swqg2dnSDpBfmnQ1lZUETPp5x_Pg4ICWcHm4JOkBT5sGji",
  },
  {
    name: "Organic Cotton Tee", wears: 35, pct: 65,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuANCuM7Td3IWGI6hBHF_nryf430Y8sflGxX_pTWwo6RYMULicQcsm3Yz2CD9uzHR9pFuPEpg6vl1ZZEq_JWnWA65Dav5zLLumprfxHsuuuUMqxM687S3m_sq7aCZkJ5cqo7nBEHA8f3rAI6LqfT6RdN603s-O5wFGUvBbcP5HVZ24s3dnm8Xo62KkZ15aHlo0zkfJCbTLQfXim4D202nSwhASUYBx-7a0EAWNxEHqF4uS9-7SMisGnFgTicZif0TBtCGYLNddMCnFkZ",
  },
  {
    name: "Minimalist Sneakers", wears: 31, pct: 55,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIblYUFQRmtQWqSKwILtylmeemWQ7_Jf71TiqPgvyKZSh4_oksKDpjalH7Wn4pbKMUc7QUKGV5UcL_zaJU5PHzj9VeurmPlddkCEvgKw0kEf3rTTDYZ2yyrf1-sUVJHh1zoThna-CoIov-CRHciXT3luyBKp_geslsGl_cnT7NhUvTvajTU5kJNOiM1C2lC0r2Q3KUY2_-S-hPAC9LL1savOD5GMQNrspf9hdvpC7iVO8If2GN0AeP7xghBn7RyWeBY4nZKGdiUDej",
  },
];

const CHART_BARS = [
  { h: "50%", color: "bg-primary/10", label: "Jan", tooltip: "$4.2k" },
  { h: "65%", color: "bg-secondary-container/40", label: "Feb" },
  { h: "45%", color: "bg-primary/30", label: "Mar" },
  { h: "75%", color: "bg-secondary-container/60", label: "Apr" },
  { h: "60%", color: "bg-primary/60", label: "May" },
  { h: "100%", color: "bg-primary", label: "Jun", tooltip: "$12.4k" },
];

const CATEGORIES = [
  { name: "Outerwear", pct: 45, color: "bg-primary" },
  { name: "Footwear", pct: 25, color: "bg-secondary" },
  { name: "Accessories", pct: 20, color: "bg-secondary-container" },
  { name: "Other", pct: 10, color: "bg-surface-container-highest" },
];

export default function InsightsPage() {
  return (
    <div className="bg-surface min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface h-16">
        <div className="flex justify-between items-center px-6 h-full w-full max-w-7xl mx-auto">
          <button className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95">
            <span className="material-symbols-outlined" style={{ color: "#e75a66" }}>menu</span>
          </button>
          <h1 className="text-display-lg font-display-lg tracking-tighter" style={{ color: "#e75a66" }}>
            DROBE
          </h1>
          <button className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95">
            <span className="material-symbols-outlined" style={{ color: "#e75a66" }}>notifications</span>
          </button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-7xl mx-auto">
        {/* Title */}
        <section className="mb-8">
          <h2 className="text-headline-lg-mobile font-headline-lg-mobile mb-2">Wardrobe Insights</h2>
          <p className="text-on-surface-variant text-body-md font-body-md">
            Data-driven styling for your curated collection.
          </p>
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Wardrobe Value Chart */}
          <div className="md:col-span-8 bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-highest" style={{ boxShadow: "0 20px 40px 0 rgba(51,51,51,0.04)" }}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mb-1">
                  Total Wardrobe Value
                </h3>
                <p className="text-headline-lg font-headline-lg" style={{ color: "#e75a66" }}>$12,450.00</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-tertiary text-label-md font-label-md flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">trending_up</span>
                  +12%
                </span>
                <span className="text-on-surface-variant text-[12px]">vs last month</span>
              </div>
            </div>

            {/* Bar chart */}
            <div className="h-48 w-full flex items-end gap-2 px-2">
              {CHART_BARS.map((bar) => (
                <div
                  key={bar.label}
                  className={`flex-1 ${bar.color} rounded-t-lg relative group transition-all hover:brightness-90`}
                  style={{ height: bar.h }}
                >
                  {bar.tooltip && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {bar.tooltip}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 px-2 text-on-surface-variant text-label-sm font-label-sm">
              {CHART_BARS.map((b) => <span key={b.label}>{b.label}</span>)}
            </div>
          </div>

          {/* Quick Insight */}
          <div className="md:col-span-4 text-on-primary rounded-2xl p-6 flex flex-col justify-between" style={{ backgroundColor: "#e75a66" }}>
            <div>
              <span
                className="material-symbols-outlined text-[32px] mb-4 block"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              <h3 className="text-headline-md font-headline-md mb-2 leading-tight text-white">
                Cost Per Wear Leader
              </h3>
              <p className="text-body-md font-body-md text-white/90">
                Your "Classic Silk Shirt" has reached an incredible $0.45 per wear.
              </p>
            </div>
            <button
              className="mt-6 bg-white px-6 py-3 rounded-2xl text-label-md font-label-md w-fit hover:opacity-90 active:scale-95 transition-all"
              style={{ color: "#e75a66" }}
            >
              View Item
            </button>
          </div>

          {/* Most Worn */}
          <div className="md:col-span-12 mt-4">
            <h3 className="text-headline-md font-headline-md mb-6">Most Worn Items</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {MOST_WORN.map((item) => (
                <div key={item.name} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-2 bg-surface-container">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-full text-label-sm font-label-sm font-semibold" style={{ color: "#e75a66" }}>
                      {item.wears} Wears
                    </div>
                  </div>
                  <h4 className="text-label-md font-label-md">{item.name}</h4>
                  <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.pct}%`, backgroundColor: "#e75a66" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="md:col-span-12 mt-4 bg-surface-container-low rounded-3xl p-8 border border-surface-container-highest" style={{ boxShadow: "0 20px 40px 0 rgba(51,51,51,0.04)" }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-headline-md font-headline-md">Category Distribution</h3>
                <p className="text-on-surface-variant text-body-md font-body-md mt-1">
                  Allocation of your investment across styles.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-2xl px-4 py-2 text-white text-label-md font-label-md" style={{ backgroundColor: "#e75a66" }}>
                  By Value
                </span>
                <span className="rounded-2xl px-4 py-2 border border-outline text-on-surface-variant text-label-md font-label-md hover:bg-surface-container-highest cursor-pointer transition-colors">
                  By Volume
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-12">
              {/* Donut Chart */}
              <div className="relative w-56 h-56 flex-none flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#e4e2e1" strokeDasharray="100, 100" strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#e75a66" strokeDasharray="45, 100" strokeLinecap="round" strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#8d4c41" strokeDasharray="25, 100" strokeDashoffset="-45" strokeLinecap="round" strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#ffac9d" strokeDasharray="30, 100" strokeDashoffset="-70" strokeLinecap="round" strokeWidth="3"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-headline-md font-headline-md">100%</span>
                  <span className="text-label-sm font-label-sm text-on-surface-variant uppercase">Portfolio</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 gap-x-12">
                {CATEGORIES.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-4">
                    <div className={`w-3 h-12 rounded-full ${cat.color}`} />
                    <div>
                      <h5 className="text-label-md font-label-md opacity-60">{cat.name}</h5>
                      <p className="text-headline-md font-headline-md leading-none">{cat.pct}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
