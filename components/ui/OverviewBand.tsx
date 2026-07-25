// components/ui/OverviewBand.tsx
// The ONE overview band for the staff dashboard. Every center opens with this
// full-width summary band: an uppercase eyebrow, a plain-language title, a
// one-line takeaway ("what this means"), and a row of LARGE tone-coded
// numerals (text-3xl+, tabular-nums) that answer "how many?" before any card
// or table below.
//
// Tones mirror StatusPill: success = green, warning = amber, danger = crimson,
// default = navy. A zero count stays calm gray-500 (still ≥4.5:1 on white) so
// "0 behind" never shouts — the tone only appears when the bucket is non-empty.
// Color is never the only signal: every numeral is paired with its label.
import type { ReactNode } from 'react'

export type BandStat = {
  label: string
  value: number | string
  tone?: 'default' | 'success' | 'warning' | 'danger'
  /** Optional trailing context under the label, e.g. "of 12 possible". */
  sub?: string
}

const TONE_CLASS: Record<NonNullable<BandStat['tone']>, string> = {
  default: 'text-primary',
  success: 'text-green-700',
  warning: 'text-amber-700',
  danger: 'text-crimson',
}

function numeralClass(stat: BandStat): string {
  // Zero (or an em-dash placeholder) is deliberately quiet.
  if (stat.value === 0 || stat.value === '—') return 'text-gray-500'
  return TONE_CLASS[stat.tone ?? 'default']
}

export default function OverviewBand({
  eyebrow,
  title,
  takeaway,
  stats,
  aside,
}: {
  eyebrow: string
  title: string
  /** One plain-language sentence — the "so what" for the numbers. */
  takeaway: string
  stats: BandStat[]
  /** Optional right-aligned context next to the title (e.g. academic year). */
  aside?: ReactNode
}) {
  return (
    <section
      aria-label={`${title} overview`}
      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="border-b border-gray-100 px-5 pb-4 pt-5 sm:px-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-crimson">{eyebrow}</p>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="text-xl font-bold leading-tight text-ink">{title}</h2>
          {aside ? <span className="text-sm text-muted">{aside}</span> : null}
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{takeaway}</p>
      </div>
      <dl className="flex flex-col divide-y divide-gray-100 sm:flex-row sm:divide-x sm:divide-y-0">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-1 items-baseline gap-3 px-5 py-4 sm:flex-col sm:items-start sm:gap-1.5 sm:px-6">
            <dd className={`order-first text-3xl font-bold tabular-nums leading-none sm:text-4xl ${numeralClass(stat)}`}>
              {stat.value}
            </dd>
            <dt className="text-sm font-medium text-gray-600">
              {stat.label}
              {stat.sub ? <span className="block text-xs font-normal text-muted">{stat.sub}</span> : null}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  )
}
