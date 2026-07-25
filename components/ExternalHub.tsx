// components/ExternalHub.tsx
// Slim quick-links toolbar — deliberately demoted from a card to a single
// quiet line so it supports the page instead of competing with the centers.
// One primary action (New Innovations, the GME system of record, filled
// crimson) plus the endocrine societies as small text links separated by dots;
// on a phone the society row scrolls horizontally (scroll-snap) instead of
// wrapping into a wall of chips. Every link opens in a new tab and is
// keyboard/screen-reader labeled; the blurb rides in title + aria-label so the
// bar stays scannable. Edit the arrays to change a destination.
// includeSocieties={false} renders New-Innovations-only (the PC).
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
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true" className="shrink-0 opacity-70">
      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ExternalHub({ includeSocieties = true }: { includeSocieties?: boolean }) {
  return (
    <section aria-label="Quick links" className="flex flex-wrap items-center gap-x-5 gap-y-1">
      {/* Primary action: the GME system of record. The only filled control in
          the toolbar so it reads first; societies stay quiet text links. */}
      <a
        href={PROGRAM_SYSTEM.href}
        target="_blank"
        rel="noopener noreferrer"
        title={PROGRAM_SYSTEM.blurb}
        aria-label={PROGRAM_SYSTEM.name + ' - ' + PROGRAM_SYSTEM.blurb + ' (opens in a new tab)'}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-crimson px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-crimson-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson focus-visible:ring-offset-2"
      >
        {PROGRAM_SYSTEM.name}
        <LaunchGlyph />
      </a>

      {includeSocieties ? (
        <nav
          aria-label="Endocrine societies"
          className="flex min-w-0 flex-1 items-center gap-x-2 overflow-x-auto whitespace-nowrap snap-x snap-proximity [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {SOCIETIES.map((s, i) => (
            <span key={s.href} className="inline-flex snap-start items-center gap-x-2">
              {i > 0 ? (
                <span aria-hidden="true" className="text-gray-300">
                  ·
                </span>
              ) : null}
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.blurb}
                aria-label={s.name + ' - ' + s.blurb + ' (opens in a new tab)'}
                className="inline-flex min-h-[44px] items-center rounded-md text-sm font-medium text-muted underline-offset-4 transition-colors hover:text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {s.name}
              </a>
            </span>
          ))}
        </nav>
      ) : null}
    </section>
  )
}
