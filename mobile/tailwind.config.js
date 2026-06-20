/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Drobe brand palette
        primary: "#E75A66",        // Primary Crimson
        "primary-light": "#F26E80", // Medium Pink
        accent: "#FCA99A",          // Pink-Orange Accent
        charcoal: "#333333",        // Deep Charcoal

        // Surfaces (warm off-white system)
        surface: "#FCFCFC",
        "surface-container": "#F5F5F5",
        "surface-container-low": "#EEEEEE",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-highest": "#E8E8E8",

        // Text
        "on-surface": "#1C1B1B",
        "on-surface-variant": "#49454F",
        "on-surface-muted": "#79747E",

        // Lines
        outline: "#79747E",
        "outline-variant": "#CAC4D0",

        // Status
        error: "#BA1A1A",
        "error-container": "#FFDAD6",
        success: "#1B873F",
        warning: "#B45309",
      },
      fontFamily: {
        sans: ["System"],
        display: ["System"],
      },
    },
  },
  plugins: [],
};
