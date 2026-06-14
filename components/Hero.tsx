"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroProps {
  title: string;
  subtitle: string;
  className?: string;
}

export default function Hero({ title, subtitle, className }: HeroProps) {
  return (
    <div className={cn("flex flex-col items-center text-center space-y-6", className)}>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-5xl md:text-7xl font-bold text-chalk tracking-tighter"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="text-xl text-chalk/60 max-w-2xl"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
