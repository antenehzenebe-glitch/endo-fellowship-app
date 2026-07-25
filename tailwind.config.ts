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
        // Howard navy primary — canonical brand color (audit P0-2, decision D3)
        // 50/100/600 anchored to the pre-existing stops; 700 keeps #04263f
        // (the existing hover shade). 200–500 interpolate 100→600, 800/900
        // deepen 700. `primary` with no step === 600 === #003a63.
        primary: {
          DEFAULT: '#003a63',
          50: '#eef2f6',
          100: '#d6e1ec',
          200: '#abc0d1',
          300: '#809db5',
          400: '#567d9a',
          500: '#2b5b7e',
          600: '#003a63',
          700: '#04263f',
          800: '#031c2e',
          900: '#02121e',
        },
        // Howard crimson accent; `dark` is the canonical hover shade (kills
        // the #a50e26 / #a60d26 / #a50d26 drift variants)
        crimson: { DEFAULT: '#c8102e', 600: '#c8102e', 700: '#a50e26', dark: '#a50e26' },
        // Ink & muted slate for body/secondary text
        ink: '#1B2733',
        muted: '#5C6B7A',
        // Warm paper canvas for the public landing's content sections
        cream: {
          DEFAULT: '#fefef9',
          50: '#fefef9',
          100: '#faf8ee',
          200: '#f3efdd',
          300: '#e7dfc4',
        },
        // Howard gold — the landing's golden system. 50/100 are the warm
        // parchment/mist backgrounds for content sections; 200 hairline rules;
        // 300–400 metallic accents for decorative marks and text on navy;
        // 600–700 are the AA-safe gold text shades on parchment (never use
        // light gold as text on parchment — pair with navy/ink instead).
        gold: {
          DEFAULT: '#c9a44e',
          50: '#fbf6e9',
          100: '#f4ead0',
          200: '#e9dab2',
          300: '#dcc385',
          400: '#c9a44e',
          500: '#a9832f',
          600: '#83671f',
          700: '#66511a',
        },
        success: { DEFAULT: '#16a34a', dark: '#15803d' },
        warning: '#F97316',
        error: '#EF4444',
      },
      fontFamily: {
        // next/font CSS variables, wired up in app/layout.tsx
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
