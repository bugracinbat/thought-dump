/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Vercel-inspired gradient palette
        primary: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
        accent: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        // Gradient colors inspired by Vercel
        gradient: {
          from: "#000000",
          via: "#111111",
          to: "#222222",
          accent: "#0070f3",
          pink: "#ff0080",
          cyan: "#00d9ff",
          violet: "#7c3aed",
          orange: "#ff6600",
        },
        // Background variations
        background: {
          primary: "#fafafa",
          secondary: "#f4f4f5",
          tertiary: "#ffffff",
        },
        // Border colors
        border: {
          primary: "#e4e4e7",
          secondary: "#d4d4d8",
          accent: "#0070f3",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "Fira Sans",
          "Droid Sans",
          "Helvetica Neue",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      backgroundImage: {
        // Vercel-inspired gradients
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-mesh": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "gradient-hero":
          "linear-gradient(135deg, #000000 0%, #111111 50%, #000000 100%)",
        "gradient-card": "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        "gradient-accent": "linear-gradient(135deg, #0070f3 0%, #00d9ff 100%)",
        "gradient-pink": "linear-gradient(135deg, #ff0080 0%, #7c3aed 100%)",
        "gradient-orange": "linear-gradient(135deg, #ff6600 0%, #ff0080 100%)",
      },
      boxShadow: {
        // Vercel-inspired shadows
        glow: "0 0 20px rgba(0, 112, 243, 0.3)",
        "glow-lg": "0 0 40px rgba(0, 112, 243, 0.4)",
        card: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
        "card-hover":
          "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
      animation: {
        gradient: "gradient 8s linear infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        gradient: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0px)", opacity: "1" },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#3f3f46",
            a: {
              color: "#0070f3",
              textDecoration: "none",
              "&:hover": {
                color: "#0051a2",
                textDecoration: "underline",
              },
            },
            h1: {
              color: "#18181b",
              fontWeight: "700",
            },
            h2: {
              color: "#18181b",
              fontWeight: "600",
            },
            h3: {
              color: "#27272a",
              fontWeight: "600",
            },
          },
        },
      },
    },
  },
  plugins: [],
};
