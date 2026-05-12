/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#eb0000",
          dark: "#b30000",
          light: "#ff3333",
          glow: "rgba(235, 0, 0, 0.15)",
        },
        surface: {
          DEFAULT: "#050505",
          card: "#0a0a0a",
          elevated: "#111111",
          border: "#1d1d20",
          hover: "#18181a",
        },
        text: {
          primary: "#ffffff",
          secondary: "#96979c",
          muted: "#555555",
        },
      },
      fontFamily: {
        heading: ['"Orbitron"', "sans-serif"],
        body: ['"Space Grotesk"', "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
