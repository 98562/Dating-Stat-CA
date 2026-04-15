import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#fcfaf7",
          100: "#f6f1ea",
          200: "#e9decd",
          300: "#d4c1a7"
        },
        ink: {
          900: "#192126",
          700: "#41515d",
          500: "#667985"
        },
        accent: {
          50: "#effaf8",
          100: "#d5f1ec",
          500: "#1f7a6f",
          700: "#13574f"
        },
        gold: {
          100: "#f6ecd4",
          300: "#d9b46a",
          500: "#a97b28"
        }
      },
      boxShadow: {
        card: "0 18px 50px -24px rgba(25, 33, 38, 0.28)",
        soft: "0 10px 30px -18px rgba(25, 33, 38, 0.22)"
      },
      borderRadius: {
        xl2: "1.5rem"
      },
      backgroundImage: {
        "dashboard-grid":
          "linear-gradient(to right, rgba(25,33,38,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(25,33,38,0.05) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
