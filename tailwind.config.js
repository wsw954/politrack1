/** @type {import('tailwindcss').Config} */

// tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem", // ~16px at base 16
        sm: "1rem",
        lg: "2rem",
        xl: "2rem",
        "2xl": "2.5rem",
      },
      // cap the readable line length; ~80rem = 1280px
      screens: {
        "2xl": "80rem",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
      },
      colors: {
        primary: {
          DEFAULT: "#2563eb", // Tailwind blue-600
          light: "#3b82f6", // blue-500
          dark: "#1e40af", // blue-800
        },
        accent: {
          DEFAULT: "#10b981", // Tailwind emerald-500
          light: "#34d399", // emerald-400
          dark: "#059669", // emerald-600
        },
        neutral: {
          light: "#f9fafb",
          dark: "#111827",
          muted: "#6b7280", // Tailwind gray-600
        },
      },
      spacing: {
        section: "3rem", // p-12
        container: "1rem", // px-4
      },
    },
  },
  plugins: [],
};
