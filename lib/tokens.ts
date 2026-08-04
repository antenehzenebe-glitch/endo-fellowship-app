// lib/tokens.ts
// Canonical design-token color values for the rare places Tailwind classes
// can't reach: dynamic inline styles (e.g. a progress bar's `width: ${pct}%`
// sitting next to its background) and SVG presentation attributes.
// Prefer the Tailwind theme tokens (primary, crimson, ink, muted, success)
// in className strings. Values mirror tailwind.config.ts — keep in sync.
export const NAVY = '#003a63' // primary.DEFAULT
export const CRIMSON = '#c8102e' // crimson.DEFAULT
export const CRIMSON_DARK = '#a50e26' // crimson.dark
export const INK = '#1B2733' // ink
export const MUTED = '#5C6B7A' // muted
export const SUCCESS = '#16a34a' // success.DEFAULT
export const SUCCESS_DARK = '#15803d' // success.dark
// Status-rail / track colors for the dashboard pills & meters (mirrors the
// Tailwind palette stops used in classNames — amber-500, red-600, gray-400).
// Kept here so components never carry raw hex literals.
export const AMBER = '#f59e0b' // amber-500 — at-risk accent
export const RED = '#dc2626' // red-600 — behind/danger accent
export const GRAY_400 = '#9ca3af' // gray-400 — provisioning/neutral accent
export const AMBER_DARK = '#b45309' // amber-700 — warning text on light fills
export const SLATE_600 = '#475569' // slate-600 — neutral fallback tone
// Fellow-nav pill accents (components/FellowNav.tsx) — each dark enough for
// white text on the active (filled) pill; named for their Tailwind palette stops.
export const EMERALD_700 = '#047857'
export const VIOLET_700 = '#6d28d9'
export const BLUE_700 = '#1d4ed8'
export const RED_700 = '#b91c1c'
export const TEAL_700 = '#0f766e'
export const SLATE_700 = '#334155'
