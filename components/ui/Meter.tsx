// components/ui/Meter.tsx
// The ONE progress meter for the staff dashboard. Replaces the inline
// progress-bar markup so every bar carries proper role="progressbar" semantics
// and the same track/fill treatment. Fill color is token-driven (navy while in
// progress, green when the caller marks the target met); percentages are
// derived from value/max, clamped to 100. A zero max (no target set) falls
// back to a "logged anything at all" full/empty bar in the caller's tone —
// there is no special zero-target color.
import { NAVY, SUCCESS } from '@/lib/tokens'

export default function Meter({
  value,
  max,
  label,
  tone = 'primary',
  className = '',
}: {
  value: number
  max: number
  /** Accessible name, e.g. "Flexural testing: 3 logged of 5 minimum". */
  label: string
  tone?: 'primary' | 'success'
  className?: string
}) {
  const safeMax = max > 0 ? max : Math.max(value, 1)
  const pct = Math.min(100, Math.round((value / safeMax) * 100))
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={safeMax}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${pct}%`, backgroundColor: tone === 'success' ? SUCCESS : NAVY }}
      />
    </div>
  )
}
