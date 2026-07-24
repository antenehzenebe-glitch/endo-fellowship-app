// Design tokens for contexts where Tailwind classes can't be used:
// dynamic inline styles and print-stylesheet template strings.
//
// Brand values mirror theme.extend.colors in tailwind.config.ts — keep them
// in sync. Palette values mirror the Tailwind class of the same name
// (e.g. SLATE_300 === slate-300) and exist only so dynamic style objects can
// reference a single source instead of raw hexes. `npm run check:no-hex`
// guards the component directories against new hardcoded hexes.

// Brand tokens (tailwind.config.ts theme.extend.colors)
export const NAVY = '#003a63' // primary
export const CRIMSON = '#c8102e' // crimson
export const CRIMSON_DARK = '#a50e26' // crimson-dark
export const INK = '#1B2733' // ink
export const MUTED = '#5C6B7A' // muted
export const SUCCESS = '#16a34a' // success
export const SUCCESS_DARK = '#15803d' // success-dark
export const PRIMARY_50 = '#eef2f6' // primary-50

// Tailwind palette values used in dynamic inline styles / print CSS
export const SLATE_50 = '#f8fafc'
export const SLATE_100 = '#f1f5f9'
export const SLATE_200 = '#e2e8f0'
export const SLATE_300 = '#cbd5e1'
export const SLATE_400 = '#94a3b8'
export const SLATE_500 = '#64748b'
export const SLATE_600 = '#475569'
export const SLATE_700 = '#334155'
export const SLATE_800 = '#1e293b'
export const SLATE_900 = '#0f172a'
export const GRAY_200 = '#e5e7eb'
export const GRAY_300 = '#d1d5db'
export const GRAY_400 = '#9ca3af'
export const GRAY_500 = '#6b7280'
export const GRAY_700 = '#374151'
export const AMBER_100 = '#fef3c7'
export const AMBER_500 = '#f59e0b'
export const AMBER_700 = '#b45309'
export const ORANGE_50 = '#fff7ed'
export const RED_600 = '#dc2626'
export const RED_700 = '#b91c1c'
export const GREEN_100 = '#dcfce7'
export const GREEN_300 = '#86efac'
export const TEAL_700 = '#0f766e'
export const EMERALD_700 = '#047857'
export const VIOLET_700 = '#6d28d9'
export const BLUE_700 = '#1d4ed8'
export const WHITE = '#ffffff'
