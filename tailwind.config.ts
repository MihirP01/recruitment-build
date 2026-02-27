import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono]
      },
      colors: {
        brand: {
          50: "#f3f6f9",
          100: "#e7edf3",
          700: "#1f3a56",
          900: "#0f2238"
        }
      }
    }
  },
  plugins: []
};

export default config;
