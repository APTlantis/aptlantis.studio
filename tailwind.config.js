/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        atl: {
          void: "#050913",
          deep: "#0B1728",
          abyss: "#172536",
          slate: "#262F39",
          iron: "#40423F",
          navy: "#192E46",
          steel: "#29384A",
          ridge: "#36485A",
          smoke: "#53606A",
          stone: "#7E827E",
          bluegray: "#627786",
          mist: "#768892",
          frost: "#98A2A2",
          silver: "#B9C9C5",
          archive: "#E1E7DB",
          success: "#8FBFA7",
          warning: "#D7C58A",
          danger: "#D48E8E",
        },
        // Custom colors for distribution buttons
        burgundy: {
          500: "#9C2542", // Matte burgundy (light mode)
          600: "#8C1D36", // Hover state for light mode
          700: "#6D1429", // Darker burgundy (dark mode)
          800: "#5D0F20", // Hover state for dark mode
        },
        chalk: {
          500: "#9370DB", // Chalk purple (light mode)
          600: "#8A62D9", // Hover state for light mode
          700: "#7B52CC", // Darker chalk purple (dark mode)
          800: "#6A40BF", // Hover state for dark mode
        },
        navy: {
          500: "#3A4A6B", // Chalky navy (light mode)
          600: "#324260", // Hover state for light mode
          700: "#2A3A55", // Darker chalky navy (dark mode)
          800: "#22324A", // Hover state for dark mode
        },
        forest: {
          500: "#2E5D4B", // Forest green (light mode)
          600: "#265040", // Hover state for light mode
          700: "#1E4435", // Darker forest green (dark mode)
          800: "#16382A", // Hover state for dark mode
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        slideIn: "slideIn 0.3s ease-out forwards",
        fadeIn: "fadeIn 0.5s ease-out forwards",
        scaleIn: "scaleIn 0.3s ease-out forwards",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateY(100%)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
