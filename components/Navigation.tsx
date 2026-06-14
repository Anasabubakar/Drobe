"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "home_max_dots" },
  { href: "/wardrobe", label: "Closet", icon: "checkroom" },
  { href: "/outfits", label: "Outfits", icon: "styler" },
  { href: "/insights", label: "Insights", icon: "analytics" },
  { href: "/profile", label: "Profile", icon: "person" },
];

export default function Navigation() {
  const pathname = usePathname();
  const isHidden =
    pathname === "/" ||
    pathname === "/auth" ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/wardrobe/add");

  if (isHidden) return null;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-3 pb-6 glass-nav rounded-t-xl shadow-nav">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.label === "Home"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 transition-all duration-150 active:scale-90",
              isActive ? "text-primary font-semibold" : "text-on-surface-variant hover:text-primary"
            )}
          >
            <span
              className="material-symbols-outlined text-[24px]"
              style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" } : undefined}
            >
              {item.icon}
            </span>
            <span className="text-[11px] font-semibold tracking-wider uppercase leading-none">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
