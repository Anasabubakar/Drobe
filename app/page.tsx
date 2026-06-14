"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100dvh", overflow: "hidden", backgroundColor: "#111" }}>

      {/* Background hero image */}
      <img
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPY0BcU78hkYybsrXvFplH00DOIfR6z4jajifL8-11R-BBL-0xZESKjQ6kf3MLL_d6NUYkwZfCBuJpYHKIFxDX5Cei8vyRJCVnpRXi9YqP5kgd4IZfOrjkr1owDgbNKH0_HZVF9E8NxTAY-0MQO2ulYkdldOeBZN2UbePF_nH6ebL2_zeper-zsO5cqkEcGnrmsCNkBFejXh8hnJ2yiHjwiOpapG8cfdhIIkNFJGNfBz3yC17HtXjbsbBpyL7JO6Gp78tkSxUBJYV9"
        alt="Luxury wardrobe"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.72) 75%, rgba(0,0,0,0.88) 100%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "0 28px",
          paddingTop: "env(safe-area-inset-top, 16px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* Top logo */}
        <div style={{ paddingTop: 20 }}>
          <span
            style={{
              color: "#e75a66",
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            DROBE
          </span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Hero copy */}
        <div style={{ marginBottom: 40 }}>
          <h1
            style={{
              color: "#ffffff",
              fontSize: "clamp(36px, 8vw, 60px)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              fontFamily: "'Montserrat', sans-serif",
              marginBottom: 16,
            }}
          >
            Curated<br />simplicity<br />for your closet.
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 16,
              fontWeight: 400,
              lineHeight: 1.6,
              fontFamily: "'Montserrat', sans-serif",
              marginBottom: 40,
            }}
          >
            Decide what to wear in under 10 seconds.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link href="/auth" style={{ textDecoration: "none" }}>
              <button
                style={{
                  width: "100%",
                  height: 56,
                  backgroundColor: "#e75a66",
                  color: "#fff",
                  border: "none",
                  borderRadius: 16,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  fontFamily: "'Montserrat', sans-serif",
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(231,90,102,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                Get Started
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </Link>

            <Link href="/auth?mode=login" style={{ textDecoration: "none" }}>
              <button
                style={{
                  width: "100%",
                  height: 56,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  borderRadius: 16,
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  fontFamily: "'Montserrat', sans-serif",
                  cursor: "pointer",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Sign In
              </button>
            </Link>
          </div>

          {/* Footer note */}
          <p
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.35)",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.15em",
              fontFamily: "'Montserrat', sans-serif",
              marginTop: 28,
              textTransform: "uppercase",
            }}
          >
            Est. 2024 · Curated Elegance
          </p>
        </div>
      </div>
    </div>
  );
}
