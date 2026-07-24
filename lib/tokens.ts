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
