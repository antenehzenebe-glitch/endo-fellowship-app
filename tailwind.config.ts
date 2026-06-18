import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './dashboard/**/*.{js,ts,jsx,tsx,mdx}',
    './procedures/**/*.{js,ts,jsx,tsx,mdx}',
    './evaluations/**/*.{js,ts,jsx,tsx,mdx}',
    './resources/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Howard navy primary — matches the public landing page
        primary: { DEFAULT: '#003a63', 50: '#eef2f6', 100: '#d6e1ec', 600: '#003a63', 700: '#04263f', 800: '#04263f' },
        // Howard crimson accent
        crimson: { DEFAULT: '#c8102e', 600: '#c8102e', 700: '#a50e26' },
        success: '#22C55E',
        warning: '#F97316',
        error: '#EF4444',
      },
    },
  },
  plugins: [],
}
export default config
