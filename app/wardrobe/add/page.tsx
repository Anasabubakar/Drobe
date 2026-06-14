"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import GlassContainer from "@/components/ui/GlassContainer";
import Card from "@/components/ui/Card";

export default function WardrobeAddPage() {
  return (
    <main className="min-h-screen p-6 pb-32 bg-void relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gold-mesh opacity-20 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-chalk tracking-tighter"
          >
            Expand Your Wardrobe
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-chalk/40 text-lg"
          >
            Choose your method of digitization.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full p-8 space-y-6 group cursor-pointer">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                📸
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-chalk">Single Item</h2>
                <p className="text-chalk/50 text-sm leading-relaxed">
                  Upload a clear photo of a single garment. Our AI will handle the rest.
                </p>
              </div>
              <Button variant="outline" className="w-full">Select Photo</Button>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full p-8 space-y-6 group cursor-pointer border-gold/30">
              <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🧺
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gold">Dump & Detect</h2>
                <p className="text-chalk/50 text-sm leading-relaxed">
                  The ultimate speed hack. Take one photo of a pile of clothes and let AI do the heavy lifting.
                </p>
              </div>
              <Button variant="primary" className="w-full">Start Batch Upload</Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
