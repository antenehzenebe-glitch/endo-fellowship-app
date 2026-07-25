// components/ui/StatusPill.tsx
// The ONE status pill for the staff dashboard. Replaces the per-center inline
// pill implementations (CommandCenter, PdCenter, EducationCenter, EvalSummary
// legend) so a given state always looks the same everywhere:
//   success = green, warning = amber, danger = red (red-600), neutral = gray,
//   info    = primary navy.
// Brand crimson deliberately stays OUT of the semantic tones so a status never
// camouflages as decoration (or vice versa).
// `solid` (default) is the high-emphasis treatment used on cards; `soft` is
// the low-emphasis tinted treatment used inside tables. Color is never the
// only signal — callers pair the pill with an icon and/or the label text.
import type { ReactNode } from 'react'

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

const SOLID: Record<StatusTone, string> = {
  success: 'bg-green-600 text-white',
  warning: 'bg-amber-400 text-amber-950',
  danger: 'bg-red-600 text-white',
  neutral: 'bg-gray-200 text-gray-700',
  info: 'bg-primary text-white',
}

const SOFT: Record<StatusTone, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-900',
  danger: 'bg-red-100 text-red-800',
  neutral: 'bg-gray-100 text-gray-700',
  info: 'bg-primary/10 text-primary',
}

export default function StatusPill({
  tone,
  variant = 'solid',
  icon,
  children,
  className = '',
}: {
  tone: StatusTone
  variant?: 'solid' | 'soft'
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  const tones = variant === 'soft' ? SOFT : SOLID
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-none ${tones[tone]} ${className}`}
    >
      {icon ? (
        <span aria-hidden="true" className="inline-flex items-center">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  )
}
