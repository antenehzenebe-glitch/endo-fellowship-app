// components/ExternalHub.tsx
// Compact, prominent horizontal "launch bar" of the outbound destinations the
// program uses constantly, so nobody juggles browser tabs in clinic, didactics,
// or a CCC meeting. New Innovations is the crimson primary action (GME system of
// record); the endocrine societies are navy reference chips. Color is the only-
// meaningful kind: crimson = act here, navy = guideline reference. Every link
// opens in a new tab and is keyboard/screen-reader labeled; the blurb rides in
// title + aria-label so the bar stays scannable. Edit the arrays to change a
// destination. includeSocieties={false} renders New-Innovations-only (the PC).
import { NEW_INNOVATIONS_URL } from '@/lib/links'

type HubLink = { name: string; href: string; blurb: string }

const PROGRAM_SYSTEM: HubLink = {
  name: 'New Innovations',
  href: NEW_INNOVATIONS_URL,
  blurb: 'GME system of record - milestone evaluations, duty hours, scheduling.',
}

const SOCIETIES: HubLink[] = [
  { name: 'Endocrine Society', href: 'https://www.endocrine.org', blurb: 'Clinical Practice Guidelines and the ENDO meeting.' },
  { name: 'AACE', href: 'https://pro.aace.com', blurb: 'Clinical guidance, algorithms, and CME (Pro portal).' },
  { name: 'American Diabetes Association', href: 'https://professional.diabetes.org', blurb: 'Standards of Care in Diabetes and DiabetesPro.' },
  { name: 'American Thyroid Association', href: 'https://www.thyroid.org', blurb: 'Thyroid disease guidelines and professional resources.' },
  { name: 'Pituitary Society', href: 'https://pituitarysociety.org', blurb: 'Pituitary tumor guidelines, PTCOE, and education.' },
  { name: 'ASBMR', href: 'https://www.asbmr.org', blurb: 'Bone and mineral research - guidance and the Primer.' },
  { name: 'Bone Health & Osteoporosis Foundation', href: 'https://www.bonehealthandosteoporosis.org', blurb: 'Osteoporosis education, clinician tools, and FRAX.' },
  { name: 'Androgen Society', href: 'https://www.androgensociety.org', blurb: 'Testosterone deficiency (hypogonadism) and its treatment.' },
]

function LaunchGlyph() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true" className="shrink-0 opacity-60">
      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ExternalHub({ includeSocieties = true }: { includeSocieties?: boolean }) {
  return (
    <section aria-label="Quick links" className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#003a63" strokeWidth={2} aria-hidden="true" className="shrink-0">
          <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 1 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 1 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2 className="text-xs font-bold uppercase tracking-wide text-[#003a63]">Quick links</h2>
        <span className="hidden text-xs text-slate-400 sm:inline">- systems &amp; societies, each opens in a new tab</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 p-3">
        <a
          href={PROGRAM_SYSTEM.href}
          target="_blank"
          rel="noopener noreferrer"
          title={PROGRAM_SYSTEM.blurb}
          aria-label={PROGRAM_SYSTEM.name + ' - ' + PROGRAM_SYSTEM.blurb + ' (opens in a new tab)'}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-[#c8102e] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#a60d26] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c8102e] focus-visible:ring-offset-2"
        >
          {PROGRAM_SYSTEM.name}
          <LaunchGlyph />
        </a>

        {includeSocieties
          ? SOCIETIES.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.blurb}
                aria-label={s.name + ' - ' + s.blurb + ' (opens in a new tab)'}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[#003a63]/20 bg-white px-3 text-sm font-medium text-[#003a63] transition-colors hover:border-[#003a63]/50 hover:bg-[#003a63]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003a63] focus-visible:ring-offset-2"
              >
                {s.name}
                <LaunchGlyph />
              </a>
            ))
          : null}
      </div>
    </section>
  )
}
