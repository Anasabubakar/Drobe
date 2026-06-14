"use client";

import React from "react";
import { motion } from "framer-motion";
import GlassContainer from "@/components/ui/GlassContainer";
import { Button } from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function OutfitsPage() {
  return (
    <main className="min-h-screen p-6 pb-32 bg-void relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gold-mesh opacity-20 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-chalk tracking-tighter">Lookbook</h1>
            <p className="text-chalk/40 font-medium uppercase tracking-widest text-xs">Curated Combinations</p>
          </div>
          <Button variant="secondary" className="px-8">
            + New Outfit
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="overflow-hidden">
                <div className="aspect-video bg-white/5 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent opacity-60" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-2 py-1 rounded-md bg-gold text-void text-[10px] font-bold uppercase tracking-widest">
                      Casual
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="text-lg font-bold text-chalk">Weekend Vibe #{i}</h3>
                  <p className="text-sm text-chalk/50">3 Items • Created yesterday</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
