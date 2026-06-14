"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "featured";
}

export default function Card({ 
  children, 
  className, 
  variant = "default", 
  ...props 
}: CardProps) {
  const variants = {
    default: "bg-white/5 border border-white/10 hover:bg-white/10",
    featured: "bg-gold/10 border border-gold/20 shadow-gold-glow",
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={cn(
        "rounded-2xl overflow-hidden transition-all duration-300",
        variants[variant as keyof typeof variants],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
