"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface NavItemProps {
  href: string;
  label: string;
  className?: string;
}

function NavItem({ href, label, className }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "text-label-md font-label-md transition-colors",
        isActive ? "text-primary" : "text-on-surface-variant hover:text-primary",
        className
      )}
    >
      {label}
    </Link>
  );
}

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop TopBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-surface/60 backdrop-blur-xl border-b border-white/10 shadow-sm hidden md:flex">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-headline-md font-headline-md font-bold tracking-tighter text-on-surface">
            DROBE
          </Link>
        </div>
        <nav className="flex gap-8">
          <NavItem href="#features" label="Features" />
          <NavItem href="#pricing" label="Pricing" />
          <NavItem href="#about" label="About" />
        </nav>
        <div className="flex gap-4">
          <Button variant="ghost" className="text-on-surface">Login</Button>
          <Button href="/auth">Get Started</Button>
        </div>
      </header>

      {/* Mobile BottomNav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-surface-container/60 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] rounded-t-2xl md:hidden">
        <MobileNavItem href="/wardrobe" label="Closet" icon="checkroom" />
        <MobileNavItem href="/outfits" label="Outfits" icon="styler" />
        <div className="relative -mt-12">
          <Link href="/wardrobe/add">
            <div className="bg-primary text-on-primary rounded-full p-3 shadow-[0_0_15px_rgba(192,193,255,0.4)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </Link>
        </div>
        <MobileNavItem href="/schedule" label="Schedule" icon="calendar_today" />
        <MobileNavItem href="/profile" label="Profile" icon="person" />
      </nav>
    </>
  );
}

function MobileNavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center p-2 transition-colors",
        isActive ? "text-primary" : "text-on-surface-variant"
      )}
    >
      <span className="material-symbols-outlined text-2xl">{icon}</span>
      <span className="text-[10px] font-label-sm mt-1">{label}</span>
    </Link>
  );
}
