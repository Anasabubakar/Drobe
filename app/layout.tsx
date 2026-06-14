import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "Drobe — Your wardrobe, planned.",
  description: "Virtual wardrobe with AI try-on and weekly fit planning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="bg-surface-container-lowest text-on-surface font-body-md antialiased">
        <div className="ambient-glow" />
        <div className="ambient-glow-secondary" />
        <main className="relative z-10">
          {children}
        </main>
        <Navigation />
      </body>
    </html>
  );
}
