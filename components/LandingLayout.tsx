"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface LandingPageProps {
  children?: React.ReactNode;
}

export default function LandingLayout({ children }: LandingPageProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-void">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-gold-mesh pointer-events-none opacity-30" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {children}
      </div>
    </div>
  );
}
