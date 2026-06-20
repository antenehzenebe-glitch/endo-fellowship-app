// components/ExternalHub.tsx
// One-tap "hub" of the outbound destinations the program uses constantly, so
// nobody juggles a dozen browser tabs in clinic, didactics, or a CCC meeting.
//   - Program system  : New Innovations (GME system of record) - crimson = action.
//   - Societies/guides : the endocrine subspecialty societies     - navy   = reference.
// Every link opens in a new tab (these leave the app) and is keyboard- and
// screen-reader-labeled; color is never the only signal - each card also carries
// an explicit "opens in new tab" glyph. To change a destination, edit the arrays
// below - that's the only edit needed.
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
  { name: 'Bone Health and Osteoporosis Foundation', href: 'https://www.bonehealthandosteoporosis.org', blurb: 'Osteoporosis education, clinician tools, and FRAX.' },
  { name: 'Androgen Society', href: 'https://www.androgensociety.org', blurb: 'Testosterone deficiency (hypogonadism) and its treatment.' },
]

function ExternalGlyph() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="shrink-0">
      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HubCard({ link, accent }: { link: HubLink; accent: 'navy' | 'crimson' }) {
  const ring = accent === 'crimson' ? 'border-[#c8102e]/30' : 'border-slate-200'
  const hoverBorder = accent === 'crimson' ? 'hover:border-[#c8102e]' : 'hover:border-[#003a63]/40'
  const titleColor = accent === 'crimson' ? 'text-[#c8102e]' : 'text-[#003a63]'
  const rail = accent === 'crimson' ? '#c8102e' : '#003a63'
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${link.name} (opens in a new tab)`}
      className={`group flex flex-col rounded-xl border border-l-4 ${ring} ${hoverBorder} bg-white p-4 shadow-sm transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003a63]`}
      style={{ borderLeftColor: rail }}
    >
      <span className={`flex items-center gap-1.5 font-semibold ${titleColor}`}>
        {link.name}
        <ExternalGlyph />
      </span>
      <span className="mt-1 text-sm leading-snug text-slate-600">{link.blurb}</span>
    </a>
  )
}

export default function ExternalHub({ includeSocieties = true }: { includeSocieties?: boolean }) {
  return (
    <section aria-label="Quick links" className="mt-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Quick links</h2>
      <p className="mt-0.5 text-sm text-slate-500">
        One place for the systems and societies we use most - each opens in a new tab.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <HubCard link={PROGRAM_SYSTEM} accent="crimson" />
        {includeSocieties ? SOCIETIES.map((s) => <HubCard key={s.href} link={s} accent="navy" />) : null}
      </div>
    </section>
  )
}
