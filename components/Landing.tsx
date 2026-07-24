'use client';

// Public recruiting landing for the HUH Endocrinology, Diabetes & Metabolism
// Fellowship — bold editorial redesign: a single flowing scroll on a warm cream
// canvas with navy chrome, crimson accents, and full-bleed program photography.
//
// Fonts (Playfair Display + Open Sans) load via next/font in app/layout.tsx and
// reach this page through the --font-display / --font-body CSS variables and the
// font-display / font-body Tailwind tokens — no render-blocking @import here.
// Colors come from the design tokens only (primary / crimson / ink / muted /
// cream); npm run check:no-hex covers this file.
//
// Photography (uploaded by the program owner to /public/landing):
//   /landing/hero-main.jpg        — full-bleed hero
//   /landing/hero-columns.jpg     — "Why train here" backdrop
//   /landing/endocrine-network.jpg — services-section art
//
// EDIT placeholders are marked with {/* EDIT: ... */} / the LINKS map below.

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { DirectoryGroups, DirectoryPerson } from '@/lib/people';

const ERAS =
  'https://students-residents.aamc.org/applying-fellowships-eras/apply-fellowships-eras-system';

// ─────────────────────────────────────────────────────────────────────────────
// EDIT HERE — LINKS. Paste a URL to turn a "coming soon" resource into a live
// link. Leave '' (empty) and the row stays a non-clickable placeholder.
// ─────────────────────────────────────────────────────────────────────────────
const LINKS = {
  endoReq: '',     // ACGME Endocrinology, Diabetes & Metabolism program-requirements PDF
  eap: '',         // Confidential counseling / EAP
  wellness: '',    // Fellow wellness & time-away policy
  handbook: '',    // Fellow handbook
  milestones: '',  // Milestones & evaluation guide
  gme: '',         // Howard GME office policies
};

// Sticky subnav anchors, in page order.
const NAV = [
  { href: '#services', label: 'Services' },
  { href: '#training', label: 'Training' },
  { href: '#people', label: 'People' },
  { href: '#policies', label: 'Policies' },
];

// "By the numbers" — every fact below is taken from existing program copy.
const FACTS = [
  { value: '1867', label: 'Howard University founded on a mission of truth and service' },
  { value: '2', label: 'Years — one integrated curriculum, PGY-4 through PGY-5' },
  { value: 'ACGME', label: 'Accredited subspecialty fellowship' },
  { value: 'Small', label: 'A handful of fellows — high-touch by design' },
];

// "What you'll master" — clinical services, drawn from existing program copy.
const SERVICES = [
  {
    n: '01',
    title: 'Diabetes',
    desc: 'High-volume diabetes care — and a dedicated diabetes-technology clinic — in the community most affected by the disease.',
  },
  {
    n: '02',
    title: 'Thyroid & nodule',
    desc: 'A subspecialty thyroid & nodule clinic, from ultrasound evaluation through biopsy.',
  },
  {
    n: '03',
    title: 'Pituitary & adrenal',
    desc: 'Pituitary–adrenal disease in the subspecialty clinic — and adrenal crisis on the inpatient consult service.',
  },
  {
    n: '04',
    title: 'Bone & calcium',
    desc: 'Osteoporosis and metabolic bone disease in a diverse, high-need patient population.',
  },
  {
    n: '05',
    title: 'Obesity & metabolic medicine',
    desc: 'Metabolic disease care for the communities most affected by endocrine disease.',
  },
  {
    n: '06',
    title: 'Reproductive endocrinology',
    desc: 'Gonadal and reproductive endocrinology in the subspecialty clinic.',
  },
];

// "Why train here" — the program's four existing points, recomposed.
const WHY = [
  {
    n: '01',
    title: 'Breadth of pathology',
    desc: 'High-volume diabetes and thyroid care plus pituitary, adrenal, gonadal, and metabolic bone disease in a diverse patient population.',
  },
  {
    n: '02',
    title: 'Close mentorship',
    desc: 'A small class means you learn at the elbow of faculty — not buried in a large service.',
  },
  {
    n: '03',
    title: 'Scholarship & QI',
    desc: 'Protected time for quality-improvement and research, with mentorship toward abstracts, presentations, and board readiness.',
  },
  {
    n: '04',
    title: 'A mission that matters',
    desc: 'Care for the communities most affected by endocrine disease, at a historic academic medical center in Washington, D.C.',
  },
];

export default function Landing({
  groups,
  directoryError = false,
}: {
  groups: DirectoryGroups;
  // True when the directory query failed — the People section shows an honest
  // "temporarily unavailable" notice instead of fake empty tiers.
  directoryError?: boolean;
}) {
  const { leadership, faculty, fellows } = groups;
  const [navStuck, setNavStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Flip the subnav's stuck state (shadow + border) once the hero scrolls past.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setNavStuck(!entry.isIntersecting), {
      threshold: 0,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="hu-land bg-cream font-body text-ink antialiased">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ── 1 · HERO — full-bleed photograph, navy scrim, editorial headline ── */}
      <div id="top" className="relative flex min-h-svh flex-col bg-primary-900">
        <Image
          src="/landing/hero-main.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Navy gradient scrim for text contrast (left + bottom weighted). */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-primary-900/95 via-primary-900/70 to-primary-700/25"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-transparent to-primary-900/40"
        />

        {/* Slim top bar — wordmark + ghost Sign in, seated on the hero image. */}
        <header className="relative z-10">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-4 sm:px-8">
            <a
              href="#top"
              aria-label="HUH Endocrinology Fellowship — back to top"
              className="mr-auto inline-flex items-center gap-3 no-underline"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" aria-hidden="true" className="h-10 w-10 object-contain" />
              <span className="leading-tight">
                <span className="block font-display text-base font-bold text-white">
                  HUH Endocrinology
                </span>
                <span className="block text-[0.68rem] tracking-wide text-primary-200">
                  Diabetes &amp; Metabolism Fellowship
                </span>
              </span>
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-white/60 px-5 text-sm font-bold text-white no-underline transition-colors hover:bg-white/10"
            >
              Sign in
            </a>
          </div>
        </header>

        {/* Hero copy */}
        <div className="relative z-10 flex flex-1 items-center">
          <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-10 sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-200 sm:text-sm">
              Howard University Hospital · Washington, D.C.
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-[2.65rem] font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Become the endocrinologist your{' '}
              <span className="relative z-0 inline-block">
                community
                <span
                  aria-hidden="true"
                  className="absolute -inset-x-1 bottom-[0.04em] -z-10 h-[0.3em] bg-crimson"
                />
              </span>{' '}
              needs.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
              Rigorous clinical training and scholarship in Endocrinology, Diabetes &amp;
              Metabolism — at one of the nation&apos;s foremost academic medical centers, rooted
              in a legacy of service and health equity.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href={ERAS}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-crimson px-7 text-base font-bold text-white no-underline transition-colors hover:bg-crimson-dark"
              >
                Apply through ERAS ↗
              </a>
              <a
                href="#intro"
                className="inline-flex items-center justify-center rounded-lg border border-white/60 px-7 text-base font-bold text-white no-underline transition-colors hover:bg-white/10"
              >
                Explore the program ↓
              </a>
            </div>
            <p className="mt-9 text-sm font-semibold tracking-wide text-white/70">
              ACGME-accredited&nbsp;·&nbsp;PGY-4–PGY-5&nbsp;·&nbsp;Two-year curriculum
            </p>
          </div>
        </div>
      </div>

      {/* ── 2 · STICKY SUBNAV — appears once the hero scrolls away ── */}
      <div ref={sentinelRef} aria-hidden="true" className="h-px" />
      <nav
        aria-label="Program sections"
        className={
          'sticky top-0 z-40 border-b bg-cream/95 backdrop-blur transition-shadow ' +
          (navStuck ? 'border-primary-100 shadow-md' : 'border-transparent')
        }
      >
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-5 sm:px-8">
          <a
            href="#top"
            aria-label="HUH Endocrinology Fellowship — back to top"
            className="mr-2 inline-flex flex-none items-center no-underline"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" aria-hidden="true" className="h-8 w-8 object-contain" />
            <span className="ml-2 hidden font-display text-sm font-bold text-primary md:inline">
              HUH Endocrinology
            </span>
          </a>
          <div className="flex flex-1 items-center gap-1 overflow-x-auto">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex flex-none items-center px-3 text-sm font-bold text-muted no-underline underline-offset-8 transition-colors hover:text-primary hover:underline"
              >
                {item.label}
              </a>
            ))}
          </div>
          <a
            href={ERAS}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden flex-none items-center justify-center rounded-lg bg-crimson px-4 text-sm font-bold text-white no-underline transition-colors hover:bg-crimson-dark sm:inline-flex"
          >
            Apply ↗
          </a>
        </div>
      </nav>

      <main>
        {/* ── 3 · THE PROGRAM + BY THE NUMBERS — warm cream canvas ── */}
        <section id="intro" aria-labelledby="intro-h" className="scroll-mt-20">
          <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 md:py-32">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-crimson">
              The program
            </p>
            <h2
              id="intro-h"
              className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-primary sm:text-5xl"
            >
              A small, high-touch fellowship — rigorous training in the service of health equity.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              This is a small, high-touch program: a handful of fellows, direct faculty
              mentorship, broad pathology, and protected time for scholarship. You finish ready
              for the boards, for independent practice, and for the patients who need you most.
            </p>

            <dl className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-primary-100 pt-12 md:grid-cols-4">
              {FACTS.map((f) => (
                <div key={f.value} className="flex flex-col">
                  <dt className="order-2 mt-3 text-sm font-semibold leading-snug text-muted">
                    {f.label}
                  </dt>
                  <dd className="order-1 font-display text-4xl font-bold leading-none text-primary md:text-5xl">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── 4 · WHAT YOU'LL MASTER — services as an irregular editorial grid ── */}
        <section id="services" aria-labelledby="services-h" className="scroll-mt-20">
          <div className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8 md:pb-32">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-crimson">
              What you&apos;ll master
            </p>
            <h2
              id="services-h"
              className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-primary sm:text-5xl"
            >
              The full breadth of endocrine disease.
            </h2>

            <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-10">
              {/* Featured art — the endocrine feedback network. */}
              <figure className="lg:col-span-5">
                <div className="overflow-hidden rounded-2xl border border-primary-100">
                  <Image
                    src="/landing/endocrine-network.jpg"
                    alt="Engraved line-art of the thyroid, pituitary, pancreas, and adrenal glands connected in an endocrine feedback network."
                    width={1536}
                    height={964}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="h-auto w-full"
                  />
                </div>
                <figcaption className="mt-3 text-sm text-muted">
                  One interconnected system — trained as one interconnected discipline.
                </figcaption>
              </figure>

              {/* Numbered service rows — dividers, not cards. */}
              <ol className="lg:col-span-7">
                {SERVICES.map((s) => (
                  <li
                    key={s.n}
                    className="grid grid-cols-[3rem_1fr] gap-4 border-t border-primary-100 py-6 first:border-t-0 first:pt-0 sm:grid-cols-[4rem_1fr] lg:first:border-t lg:first:pt-6"
                  >
                    <span
                      aria-hidden="true"
                      className="font-display text-2xl font-bold leading-none text-crimson"
                    >
                      {s.n}
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-bold leading-snug text-primary sm:text-2xl">
                        {s.title}
                      </h3>
                      <p className="mt-2 max-w-xl leading-relaxed text-muted">{s.desc}</p>
                    </div>
                  </li>
                ))}
                <li className="border-t border-primary-100 pt-6">
                  <p className="text-sm leading-relaxed text-muted">
                    <span className="font-bold uppercase tracking-[0.14em] text-primary">
                      Procedures you&apos;ll own
                    </span>
                    <span aria-hidden="true"> — </span>
                    thyroid ultrasound &amp; FNA, continuous glucose monitor interpretation,
                    insulin-pump management, and DXA interpretation — logged and tracked against
                    program targets in your hub.
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* ── 5 · WHY TRAIN HERE — colonnade backdrop, four points ── */}
        <section id="why" aria-labelledby="why-h" className="relative scroll-mt-20 bg-primary-900">
          <Image
            src="/landing/hero-columns.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-primary-900/85" />
          <div className="relative mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 md:py-32">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-200">
              Why train here
            </p>
            <h2
              id="why-h"
              className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl"
            >
              Train where the need — and the teaching — is greatest.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              Howard University was founded in <strong className="text-white">1867</strong> on a
              mission of <strong className="text-white">truth and service</strong>. Diabetes,
              thyroid, and metabolic bone disease fall hardest on the communities Howard has
              always served — and there is no better place to learn to treat them than alongside
              the patients and faculty of Howard University Hospital in the nation&apos;s capital.
            </p>

            <ol className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-2">
              {WHY.map((w) => (
                <li key={w.n} className="border-l-2 border-crimson pl-6">
                  <span
                    aria-hidden="true"
                    className="font-display text-sm font-bold tracking-[0.2em] text-primary-200"
                  >
                    {w.n}
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-bold leading-snug text-white">
                    {w.title}
                  </h3>
                  <p className="mt-2 max-w-md leading-relaxed text-white/75">{w.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── 6 · TRAINING — the two-year arc ── */}
        <section id="training" aria-labelledby="training-h" className="scroll-mt-20">
          <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 md:py-32">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-crimson">
              The experience
            </p>
            <h2
              id="training-h"
              className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-primary sm:text-5xl"
            >
              What two years here looks like.
            </h2>

            <div className="mt-14 grid gap-12 md:grid-cols-2 md:gap-10">
              <div className="border-l-2 border-crimson pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
                  Year one · PGY-4
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold text-primary">Foundations</h3>
                <ul className="mt-4 space-y-3 leading-relaxed text-muted">
                  <li>
                    <strong className="font-semibold text-ink">Continuity clinic</strong> — a panel
                    you follow across both years: diabetes and general endocrinology, week in and
                    week out.
                  </li>
                  <li>
                    <strong className="font-semibold text-ink">Subspecialty clinics</strong> —
                    thyroid &amp; nodule, diabetes technology, metabolic bone, pituitary–adrenal,
                    and reproductive endocrinology.
                  </li>
                  <li>
                    <strong className="font-semibold text-ink">Inpatient consults</strong> — the
                    endocrine consult service: DKA, dysnatremias, adrenal crisis, inpatient
                    glycemic management.
                  </li>
                </ul>
              </div>
              <div className="border-l-2 border-crimson pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
                  Year two · PGY-5
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold text-primary">Mastery</h3>
                <ul className="mt-4 space-y-3 leading-relaxed text-muted">
                  <li>
                    <strong className="font-semibold text-ink">Procedures you&apos;ll own</strong>{' '}
                    — thyroid ultrasound &amp; FNA, CGM &amp; insulin pumps, and DXA
                    interpretation, logged and tracked against program targets in your hub.
                  </li>
                  <li>
                    <strong className="font-semibold text-ink">Mentored scholarship</strong> — a QI
                    or research project with faculty mentorship, aimed at regional and national
                    presentation.
                  </li>
                  <li>
                    <strong className="font-semibold text-ink">Board readiness</strong> — you
                    finish ready for the boards, for independent practice, and for the patients
                    who need you most.
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-14 border-t border-primary-100 pt-8">
              <p className="text-sm leading-relaxed text-muted">
                <span className="font-bold uppercase tracking-[0.14em] text-primary">
                  Didactics &amp; scholarship
                </span>
                <span aria-hidden="true"> — </span>
                weekly case conference, journal club, and structured board review built into the
                schedule, alongside protected time for quality-improvement and research.
              </p>
            </div>
          </div>
        </section>

        {/* ── 7 · PEOPLE — the live program directory ── */}
        <section id="people" aria-labelledby="people-h" className="scroll-mt-20">
          <div className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8 md:pb-32">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-crimson">
              Who you&apos;ll work with
            </p>
            <h2
              id="people-h"
              className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-primary sm:text-5xl"
            >
              Program leadership, faculty &amp; fellows.
            </h2>

            {directoryError ? (
              <p className="mt-8 text-muted">
                Our team directory is temporarily unavailable — please check back soon.
              </p>
            ) : (
              <>
                <DirectoryTier title="Leadership">
                  {leadership.map((p) => (
                    <PersonCard key={p.id} person={p} lead={p.category === 'faculty'} />
                  ))}
                </DirectoryTier>

                <DirectoryTier title="Faculty">
                  {faculty.length > 0 ? (
                    faculty.map((p) => <PersonCard key={p.id} person={p} />)
                  ) : (
                    <p className="col-span-full text-muted">Faculty profiles coming soon.</p>
                  )}
                </DirectoryTier>

                <DirectoryTier title="Current fellows">
                  {fellows.length > 0 ? (
                    fellows.map((p) => <PersonCard key={p.id} person={p} />)
                  ) : (
                    <p className="col-span-full text-muted">Fellow profiles coming soon.</p>
                  )}
                </DirectoryTier>
              </>
            )}
          </div>
        </section>

        {/* ── 8 · POLICIES & WELL-BEING ── */}
        <section
          id="policies"
          aria-labelledby="policies-h"
          className="scroll-mt-20 border-t border-primary-100"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 md:py-32">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-crimson">
              Standards &amp; support
            </p>
            <h2
              id="policies-h"
              className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-primary sm:text-5xl"
            >
              Held to ACGME standards. Built around your well-being.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              The requirements we train to, and the resources every fellow should know about.
            </p>

            <div className="mt-14 grid gap-12 lg:grid-cols-3 lg:gap-10">
              <PolicyGroup title="ACGME requirements & policies">
                <LinkRow
                  href="https://www.acgme.org/what-we-do/accreditation/common-program-requirements/"
                  title="Common Program Requirements"
                  desc="The standards every program meets — including Section VI on well-being."
                />
                <LinkRow
                  href="https://www.acgme.org/about-us/policies-and-procedures/"
                  title="ACGME Policies & Procedures"
                  desc="How accreditation, review, and program oversight work."
                />
                <LinkRow
                  href="https://www.acgme.org/residents-and-fellows/welcome/"
                  title="For Residents & Fellows"
                  desc="Your rights, how to raise a concern, and support from the ACGME."
                />
                <LinkRow
                  href={LINKS.endoReq}
                  title="Endo program requirements"
                  desc="ACGME Endocrinology, Diabetes & Metabolism program requirements."
                />
              </PolicyGroup>

              <PolicyGroup title="Fellow well-being">
                <LinkRow
                  href="https://www.acgme.org/education-and-resources/physician-well-being-resources/"
                  title="ACGME Well-Being Resources"
                  desc="Tools for burnout, mental health, and resilience — for individuals and programs."
                />
                <LinkRow
                  href={LINKS.eap}
                  title="Confidential counseling / EAP"
                  desc="Howard GME / employee assistance — confidential, 24/7."
                />
                <LinkRow
                  href={LINKS.wellness}
                  title="Fellow wellness & time-away"
                  desc="Program well-being policy and how to get covered."
                />
              </PolicyGroup>

              <PolicyGroup title="Program materials">
                <LinkRow
                  href={LINKS.handbook}
                  title="Fellow handbook"
                  desc="The program handbook for current fellows."
                />
                <LinkRow
                  href={LINKS.milestones}
                  title="Milestones & evaluation guide"
                  desc="How evaluations and ACGME milestones work here."
                />
                <LinkRow
                  href={LINKS.gme}
                  title="Howard GME office policies"
                  desc="Institutional graduate medical education policies."
                />
              </PolicyGroup>
            </div>
          </div>
        </section>

        {/* ── 9 · PRIVATE HUB BAND ── */}
        <section aria-labelledby="hub-h" className="bg-primary">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 md:py-24">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-200">
              For current fellows &amp; faculty
            </p>
            <h2
              id="hub-h"
              className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl"
            >
              The program runs on a private hub.
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-white/80">
              Behind sign-in, fellows log procedures and track progress toward graduation, faculty
              complete evaluations, and each incoming class is onboarded — all in one place. No
              patient data; fellow records only.
            </p>
            <a
              href="/login"
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-crimson px-7 text-base font-bold text-white no-underline transition-colors hover:bg-crimson-dark"
            >
              Sign in
            </a>
          </div>
        </section>
      </main>

      {/* ── 10 · FOOTER ── */}
      <footer className="bg-primary-900 text-primary-100">
        <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-16 sm:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <p className="font-display text-lg font-semibold text-white">
                Howard University Hospital
              </p>
              <p className="mt-1 text-sm">Endocrinology, Diabetes &amp; Metabolism Fellowship</p>
              <a
                href="https://maps.google.com/?q=2041+Georgia+Ave+NW,+Washington,+DC+20060"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center text-sm text-primary-100 underline-offset-4 hover:text-white hover:underline"
              >
                2041 Georgia Ave NW, Washington, DC 20060
              </a>
              <br />
              <a
                href="tel:+12028656100"
                className="inline-flex items-center text-sm text-primary-100 underline-offset-4 hover:text-white hover:underline"
              >
                (202) 865-6100
              </a>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-200">
                Apply
              </p>
              <a
                href={ERAS}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center text-sm text-primary-100 underline-offset-4 hover:text-white hover:underline"
              >
                Applications are accepted through ERAS ↗
              </a>
              <p className="mt-2 text-sm text-white/70">
                Questions?{' '}
                <a
                  href="mailto:jguzman@huhosp.org"
                  className="inline-flex items-center text-primary-100 underline-offset-4 hover:text-white hover:underline"
                >
                  Email the program coordinator
                </a>
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-200">
                Member hub
              </p>
              <a
                href="/login"
                className="mt-2 inline-flex items-center text-sm text-primary-100 underline-offset-4 hover:text-white hover:underline"
              >
                Sign in
              </a>
              <p className="mt-2 text-sm text-white/70">
                Invite-only · No PHI · fellow records only
              </p>
            </div>
          </div>
          <div className="mt-12 flex flex-wrap justify-between gap-2 border-t border-white/10 pt-6 text-xs tracking-wide">
            <span className="italic text-primary-200">Veritas et Utilitas — Truth and Service</span>
            <span>© 2026 Howard University Hospital · EDM Fellowship</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* One labeled tier of the directory (Leadership / Faculty / Current fellows). */
function DirectoryTier({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-14">
      <h3 className="border-b border-primary-100 pb-3 font-display text-xl font-bold text-primary">
        {title}
      </h3>
      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {children}
      </div>
    </div>
  );
}

/* One labeled cluster of policy/resource rows. */
function PolicyGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-xl font-bold text-primary">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

// Two initials from a display name (drops trailing credentials after a comma).
function initialsOf(name: string): string {
  const parts = name.replace(/,.*$/, '').trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

// One roster entry: uploaded headshot when present, else an initials placeholder.
// `lead` swaps the navy ring for crimson. Headshots carry a soft duotone cast
// that lifts to full color on hover/focus-within.
function PersonCard({ person, lead }: { person: DirectoryPerson; lead?: boolean }) {
  const name = person.fullName + (person.credentials ? `, ${person.credentials}` : '');
  return (
    <article className="group flex flex-col items-center gap-3 text-center">
      <div
        className={
          'grid h-28 w-28 flex-none place-items-center overflow-hidden rounded-full ring-2 ring-offset-4 ring-offset-cream transition-shadow md:h-32 md:w-32 ' +
          (lead ? 'bg-crimson/10 ring-crimson' : 'bg-primary-50 ring-primary-200')
        }
      >
        {person.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={person.photoUrl}
            alt={name}
            className="h-full w-full object-cover [object-position:50%_28%] saturate-[.82] transition-[filter] duration-200 group-hover:saturate-100"
          />
        ) : (
          <span
            aria-hidden="true"
            className={
              'font-display text-3xl font-bold ' + (lead ? 'text-crimson' : 'text-primary')
            }
          >
            {initialsOf(person.fullName)}
          </span>
        )}
      </div>
      <div>
        <div className="font-display text-lg font-bold leading-snug text-primary">{name}</div>
        {person.roleTitle ? (
          <div className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-crimson">
            {person.roleTitle}
          </div>
        ) : null}
      </div>
    </article>
  );
}

// One policy/resource row. Empty href (see LINKS above) renders as a
// non-clickable "coming soon" placeholder.
function LinkRow({ href, title, desc }: { href?: string; title: string; desc: string }) {
  const todo = !href || !href.trim();
  return (
    <a
      href={todo ? '#' : href}
      target={todo ? undefined : '_blank'}
      rel={todo ? undefined : 'noopener noreferrer'}
      aria-disabled={todo ? true : undefined}
      onClick={todo ? (e) => e.preventDefault() : undefined}
      className={
        'flex items-baseline justify-between gap-4 border-b border-primary-100 py-4 no-underline ' +
        (todo ? 'cursor-default' : 'group')
      }
    >
      <span>
        <span className="block font-display text-lg font-bold leading-snug text-primary">
          {title}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-muted">{desc}</span>
      </span>
      <span
        aria-hidden="true"
        className={
          'flex-none font-display text-lg ' + (todo ? 'text-muted' : 'text-crimson')
        }
      >
        {todo ? '·' : '↗'}
      </span>
    </a>
  );
}

// Scoped page behavior only — colors and type come from the design tokens.
// Smooth anchor scrolling (disabled under prefers-reduced-motion) and a
// high-contrast focus ring that follows the surrounding text color, so it
// stays visible on both the cream canvas and the navy chrome.
const CSS = `
.hu-land{scroll-behavior:smooth}
@media (prefers-reduced-motion:reduce){
  .hu-land{scroll-behavior:auto}
  .hu-land *{transition-duration:.01ms!important}
}
.hu-land :focus-visible{outline:2px solid currentColor;outline-offset:3px;border-radius:4px}
`;
