"use client";

import React from "react";
import { motion } from "framer-motion";
import GlassContainer from "@/components/ui/GlassContainer";
import { Button } from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function SchedulePage() {
  return (
    <main className="min-h-screen p-6 pb-32 bg-void relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gold-mesh opacity-20 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-chalk tracking-tighter">Weekly Plan</h1>
            <p className="text-chalk/40 font-medium uppercase tracking-widest text-xs">Your Routine, Perfected</p>
          </div>
          <Button variant="secondary" className="px-8">
            + Assign Outfit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full min-h-[300px] flex flex-col">
                <div className="p-4 border-b border-white/5">
                  <p className="text-xs font-bold text-gold uppercase tracking-widest">{day}</p>
                  <p className="text-lg font-bold text-chalk">14</p>
                </div>
                <div className="flex-1 p-2 space-y-2">
                  {idx === 0 && (
                    <div className="aspect-square rounded-xl bg-white/5 border border-white/10 overflow-hidden group cursor-pointer">
                       <img src="https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
