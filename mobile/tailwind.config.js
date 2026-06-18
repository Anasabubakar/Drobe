/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#e75a66",
        surface: "#fcfcfc",
        "surface-container": "#f5f5f5",
        "surface-container-low": "#eeeeee",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#1c1b1b",
        "on-surface-variant": "#49454f",
        "outline": "#79747e",
        "outline-variant": "#cac4d0",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
      },
    },
  },
  plugins: [],
};

