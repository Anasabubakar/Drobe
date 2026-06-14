"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ButtonProps extends HTMLMotionProps<"button"> {
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Button({ 
  className, 
  variant = "primary", 
  size = "md", 
  children, 
  href,
  ...props 
}: ButtonProps) {
  const variants = {
    primary: "bg-gold text-void hover:bg-gold-light shadow-gold-glow",
    secondary: "bg-white/10 text-chalk hover:bg-white/20 backdrop-blur-md",
    ghost: "bg-transparent text-chalk/70 hover:text-chalk hover:bg-white/5",
    outline: "bg-transparent border border-gold/50 text-gold hover:bg-gold/10",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base font-semibold",
  };

  const content = (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant as keyof typeof variants],
        sizes[size as keyof typeof sizes],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
