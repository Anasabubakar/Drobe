"use client";

import React from "react";
import { motion } from "framer-motion";
import GlassContainer from "@/components/ui/GlassContainer";
import { Button } from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function OutfitBuilderPage() {
  return (
    <main className="min-h-screen p-6 pb-32 bg-void relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-12rem)]">
        
        {/* Sidebar: Closet Items */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto no-scrollbar pr-2">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-chalk">Closet</h2>
            <p className="text-chalk/40 text-sm">Drag items into the canvas</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="aspect-square p-1 cursor-grab active:cursor-grabbing">
                <img 
                  src={`https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&q=80&w=200`} 
                  className="w-full h-full object-cover rounded-lg" 
                  alt="item"
                />
              </Card>
            ))}
          </div>
        </div>

        {/* Main Canvas: Outfit Slots */}
        <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden flex flex-col">
          <div className="absolute top-6 left-6 text-chalk/20 font-bold uppercase tracking-widest text-xs">Canvas</div>
          
          <div className="flex-1 grid grid-rows-4 gap-4 p-8">
            {["Top", "Bottom", "Outerwear", "Shoes"].map((slot) => (
              <div key={slot} className="relative group">
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-chalk/20 uppercase tracking-widest">
                  {slot}
                </div>
                <div className="w-full h-full border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center group-hover:border-gold/30 transition-colors">
                  <span className="text-chalk/10 text-xs font-medium uppercase">Empty Slot</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-white/5 border-t border-white/10 flex justify-between items-center">
            <Button variant="secondary" size="sm">Clear</Button>
            <Button size="md">Save Outfit</Button>
          </div>
        </div>

        {/* Sidebar: AI & Tools */}
        <div className="lg:col-span-3 space-y-6">
          <GlassContainer className="p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-chalk">AI Stylist</h2>
              <p className="text-chalk/40 text-xs">Let intelligence design your looks</p>
            </div>

            <Button variant="primary" className="w-full py-6 text-lg shadow-gold-glow">
              Suggest Outfit
            </Button>

            <div className="pt-6 border-t border-white/10 space-y-4">
              <h3 className="text-xs font-bold text-chalk/40 uppercase tracking-widest">Quick Tools</h3>
              <Button variant="ghost" className="w-full justify-start">
                <span className="mr-2">✨</span> Virtual Try-On
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <span className="mr-2">📅</span> Schedule Look
              </Button>
            </div>
          </GlassContainer>
        </div>
      </div>
    </main>
  );
}
