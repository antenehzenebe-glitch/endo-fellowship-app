import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    // Routes + shared components + feature folders. New feature folders
    // (evaluations/, resources/, dashboard/) must be added here or Tailwind
    // will purge their classes in production builds.
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './procedures/**/*.{js,ts,jsx,tsx,mdx}',
    './evaluations/**/*.{js,ts,jsx,tsx,mdx}',
    './resources/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Howard Blue primary per DESIGN.md
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
}
export default config
