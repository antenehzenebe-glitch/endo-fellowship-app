import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './dashboard/**/*.{js,ts,jsx,tsx,mdx}',
    './procedures/**/*.{js,ts,jsx,tsx,mdx}',
    './evaluations/**/*.{js,ts,jsx,tsx,mdx}',
    './resources/**/*.{js,ts,jsx,tsx,mdx}',
    './modules/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Howard navy primary — canonical brand navy (#003a63), matches the
        // public landing page. 400/500/900 anchor the mid/deep navy gradient
        // stops already used across the app.
        primary: {
          DEFAULT: '#003a63',
          50: '#eef2f6',
          100: '#d6e1ec',
          200: '#b7cee1',
          300: '#7aa7c6',
          400: '#00598f',
          500: '#0a4f86',
          600: '#003a63',
          700: '#002a47',
          800: '#04263f',
          900: '#001f34',
        },
        // Howard crimson accent
        crimson: { DEFAULT: '#c8102e', dark: '#a50e26', 600: '#c8102e', 700: '#a50e26' },
        // Brand text colors
        ink: '#1B2733',
        muted: '#5C6B7A',
        success: { DEFAULT: '#16a34a', dark: '#15803d' },
        warning: '#F97316',
        error: '#EF4444',
      },
    },
  },
  plugins: [],
}
export default config
