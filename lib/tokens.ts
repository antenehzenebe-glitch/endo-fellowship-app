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
// Tailwind palette stops used in classNames — amber-500, red-600, gray-400,
// gray-200). Kept here so components never carry raw hex literals.
export const AMBER = '#f59e0b' // amber-500 — at-risk accent
export const RED = '#dc2626' // red-600 — behind/danger accent
export const GRAY_400 = '#9ca3af' // gray-400 — provisioning/neutral accent
export const GRAY_200 = '#e5e7eb' // gray-200 — meter/ring track
