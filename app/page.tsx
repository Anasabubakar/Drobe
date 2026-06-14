"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Hero from "@/components/Hero";
import LandingLayout from "@/components/LandingLayout";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

export default function LandingPage() {
  return (
    <LandingLayout>
      <div className="relative z-10 flex flex-col items-center text-center space-y-10">
        <Hero 
          title="Drobe." 
          subtitle="Master your style. Your entire wardrobe, organized by AI, visualized in luxury."
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <Link href="/auth">
            <Button size="lg" className="px-12 py-4 text-lg">
              Get Started
            </Button>
          </Link>
          <Link href="/auth">
            <Button variant="secondary" size="lg" className="px-12 py-4 text-lg">
              Sign In
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 2 }}
          className="pt-20"
        >
          <Image 
            src="/images/svg-long-logo.svg" 
            alt="Drobe Logo" 
            width={120} 
            height={40} 
            className="opacity-20 grayscale hover:grayscale-0 transition-all duration-500"
          />
        </motion.div>
      </div>
    </LandingLayout>
  );
}
