"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "subtle";
}

export default function GlassContainer({
  children,
  className,
  variant = "default",
  ...props
}: GlassContainerProps) {
  const variants = {
    default: "backdrop-blur-xl bg-white/5 border border-white/10 shadow-glass",
    elevated: "backdrop-blur-2xl bg-white/10 border border-white/20 shadow-2xl",
    subtle: "backdrop-blur-md bg-white/5 border border-white/5",
  };

  return (
    <div
      className={cn(variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
