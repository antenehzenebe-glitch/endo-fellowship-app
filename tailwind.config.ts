import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Howard Blue primary from DESIGN.md
        primary: {
          DEFAULT: '#0066CC',
          50: '#E6F0FF',
          100: '#CCE0FF',
          600: '#0066CC',
          700: '#0052A3',
          800: '#003D7A',
        },
        success: '#22C55E',
        warning: '#F97316',
        error: '#EF4444',
      },
    },
  },
  plugins: [],
};
export default config;
