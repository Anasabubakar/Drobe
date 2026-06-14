"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassContainer from "@/components/ui/GlassContainer";
import { Button } from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function WardrobePage() {
  const [items, setItems] = useState<any[]>([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Mock items for demo purposes
    setItems([
      { id: "1", name: "Silk Shirt", category: "top", color: "White", image_url: "https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?auto=format&fit=crop&q=80&w=500", clean_image_url: "https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?auto=format&fit=crop&q=80&w=500" },
      { id: "2", name: "Denim Jacket", category: "outerwear", color: "Blue", image_url: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&q=80&w=500", clean_image_url: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&q=80&w=500" },
      { id: "3", name: "Tailored Trousers", category: "bottom", color: "Black", image_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=500", clean_image_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=500" },
      { id: "4", name: "Leather Boots", category: "shoes", color: "Black", image_url: "https://images.unsplash.com/photo-1520639889313-7272a74b1c73?auto=format&fit=crop&q=80&w=500", clean_image_url: "https://images.unsplash.com/photo-1520639889313-7272a74b1c73?auto=format&fit=crop&q=80&w=500" },
    ]);
  }, []);

  const categories = ["All", "top", "bottom", "dress", "outerwear", "shoes", "accessory"];

  const filteredItems = items.filter((item) => {
    const matchesCategory = category === "All" || item.category === category;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen p-6 pb-32 bg-void relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gold-mesh opacity-20 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-chalk tracking-tighter">Your Closet</h1>
            <p className="text-chalk/40 font-medium uppercase tracking-widest text-xs">Curated Collection</p>
          </div>

          <div className="relative group">
            <input
              type="text"
              placeholder="Search wardrobe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-chalk focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex overflow-x-auto gap-3 pb-4 no-scrollbar"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                category === cat 
                  ? "bg-gold text-void shadow-gold-glow" 
                  : "bg-white/5 text-chalk/40 hover:text-chalk hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="group cursor-pointer">
                  <div className="aspect-[3/4] relative overflow-hidden rounded-t-2xl">
                    <img
                      src={item.clean_image_url || item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-60" />
                  </div>
                  <div className="p-4 space-y-1">
                    <p className="text-sm font-bold text-chalk truncate">{item.name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-chalk/40">{item.category} • {item.color}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredItems.length === 0 && (
          <div className="text-center py-32">
            <p className="text-chalk/20 text-xl font-medium">No items found in this category.</p>
          </div>
        )}
      </div>
    </main>
  );
}
