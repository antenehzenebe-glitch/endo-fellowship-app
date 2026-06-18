'use client';

// Public recruiting landing for the HUH Endocrinology, Diabetes & Metabolism Fellowship.
// Self-contained: all styles are scoped under .hu-land so nothing leaks into the rest
// of the app (or fights Tailwind). The logo lives at /public/logo.png -> referenced as /logo.png.
//
// EDIT placeholders are marked with {/* EDIT: ... */}.
//   • Intro video clips (Watch tab) — paste a YouTube/Vimeo <iframe>.
//   • Program Coordinator name + email, and the three fellows (People tab).
//   • Photos: drop headshots in /public/photos and swap the <span className="ph">XX</span>
//     for <img src="/photos/name.jpg" alt="Dr. ..." />.

import { useRef, useState } from 'react';

type TabId = 'overview' | 'watch' | 'training' | 'people' | 'policies';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'watch', label: 'Watch' },
  { id: 'training', label: 'Training' },
  { id: 'people', label: 'People' },
  { id: 'policies', label: 'Policies & Well-being' },
];

const ERAS =
  'https://students-residents.aamc.org/applying-fellowships-eras/apply-fellowships-eras-system';

// ─────────────────────────────────────────────────────────────────────────────
// EDIT HERE — VIDEOS. Paste a YouTube or Vimeo link to make a tile play.
// Accepts:  https://youtu.be/ID   ·   https://www.youtube.com/watch?v=ID
//           https://vimeo.com/ID  ·   or a full embed URL.
// Leave '' (empty) and the tile shows a tasteful "Video coming soon" state.
// ─────────────────────────────────────────────────────────────────────────────
const VIDEOS = {
  welcome: '',        // featured intro
  leadership: '',     // a message from leadership
  clinic: '',         // a day in clinic
  fellows: '',        // hear from our fellows
  inActionClinic: '', // clinic & procedures
  inActionConf: '',   // conferences & posters
  inActionTeach: '',  // teaching & community
  wellRetreat: '',    // retreat & socials
  wellSupport: '',    // well-being & support
  wellDC: '',         // life in D.C.
};

// ─────────────────────────────────────────────────────────────────────────────
// EDIT HERE — LINKS. Paste a URL to turn a "coming soon" resource into a live
// link. Leave '' (empty) and the card stays a non-clickable placeholder.
// ─────────────────────────────────────────────────────────────────────────────
const LINKS = {
  endoReq: '',     // ACGME Endocrinology, Diabetes & Metabolism program-requirements PDF
  eap: '',         // Confidential counseling / EAP
  wellness: '',    // Fellow wellness & time-away policy
  handbook: '',    // Fellow handbook
  milestones: '',  // Milestones & evaluation guide
  gme: '',         // Howard GME office policies
};

// Normalize a pasted YouTube/Vimeo URL (or bare ID) into an embeddable URL.
function toEmbed(src?: string): string | null {
  const s = (src ?? '').trim();
  if (!s) return null;
  if (/\/embed\/|player\.vimeo\.com/.test(s)) return s; // already an embed URL
  const yt = s.match(/(?:youtu\.be\/|[?&]v=)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = s.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  if (/^[\w-]{6,}$/.test(s)) return `https://www.youtube.com/embed/${s}`; // bare YT id
  return s;
}

export default function Landing() {
  const [active, setActive] = useState<TabId>('overview');
  const barRef = useRef<HTMLDivElement>(null);

  function go(id: TabId, scroll = false) {
    setActive(id);
    if (scroll) barRef.current?.scrollIntoView({ block: 'start' });
  }

  function onTabKey(e: React.KeyboardEvent, i: number) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const n =
      e.key === 'ArrowRight' ? (i + 1) % TABS.length : (i - 1 + TABS.length) % TABS.length;
    setActive(TABS[n].id);
  }

  return (
    <div className="hu-land">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="topbar">
        <div className="wrap topbar-inner">
          <a className="brand" href="#top" aria-label="HUH Endocrinology Fellowship home">
            <img className="brand-mark" src="/logo.png" alt="" aria-hidden="true" />
            <span>
              <b>HUH Endocrinology</b>
              <span>Diabetes &amp; Metabolism Fellowship</span>
            </span>
          </a>
        </div>
      </header>
      <span id="top" />

      <section className="hero">
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Howard University Hospital · Washington, D.C.</p>
            <h1>
              Become the endocrinologist your <u>community</u> needs.
            </h1>
            <p className="lead">
              A subspecialty fellowship in Endocrinology, Diabetes &amp; Metabolism — rigorous
              clinical training and scholarship at one of the nation&apos;s foremost academic
              medical centers, rooted in a legacy of service and health equity.
            </p>
            <div className="hero-cta">
              <a className="btn btn-red" href="/login">
                Sign in
              </a>
              <a
                className="btn btn-ghost-light"
                href="#overview"
                onClick={(e) => {
                  e.preventDefault();
                  go('overview', true);
                }}
              >
                Explore the program
              </a>
            </div>
            <div className="hero-meta">
              <span>ACGME-accredited</span>
              <span>·</span>
              <span>PGY-4 / PGY-5</span>
              <span>·</span>
              <span>Two-year fellowship</span>
            </div>
          </div>
          <div className="hero-emblem" aria-hidden="true">
            <img src="/logo.png" alt="" />
          </div>
        </div>
      </section>

      <nav className="tabsbar" aria-label="Sections" ref={barRef}>
        <div className="wrap">
          <div className="tablist" role="tablist" aria-label="Program sections">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                className="tab"
                role="tab"
                aria-selected={active === t.id}
                onClick={() => go(t.id)}
                onKeyDown={(e) => onTabKey(e, i)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="wrap">
        {/* OVERVIEW */}
        <section className="panel" role="tabpanel" hidden={active !== 'overview'}>
          <div className="phead">
            <p className="eyebrow">Why train here</p>
            <h2>Train where the need — and the teaching — is greatest.</h2>
          </div>
          <div className="prose">
            <p>
              Howard University was founded in <strong>1867</strong> on a mission of{' '}
              <strong>truth and service</strong>. Diabetes, thyroid, and metabolic bone disease fall
              hardest on the communities Howard has always served — and there is no better place to
              learn to treat them than alongside the patients and faculty of Howard University
              Hospital in the nation&apos;s capital.
            </p>
            <p>
              This is a small, high-touch program: a handful of fellows, direct faculty mentorship,
              broad pathology, and protected time for scholarship. You finish ready for the boards,
              for independent practice, and for the patients who need you most.
            </p>
          </div>
          <div className="grid cards-top">
            <div className="card">
              <div className="ico"><IconBreadth /></div>
              <h3>Breadth of pathology</h3>
              <p>
                High-volume diabetes and thyroid care plus pituitary, adrenal, gonadal, and
                metabolic bone disease in a diverse patient population.
              </p>
            </div>
            <div className="card">
              <div className="ico"><IconUsers /></div>
              <h3>Close mentorship</h3>
              <p>A small class means you learn at the elbow of faculty — not buried in a large service.</p>
            </div>
            <div className="card">
              <div className="ico"><IconCap /></div>
              <h3>Scholarship &amp; QI</h3>
              <p>
                Protected time for quality-improvement and research, with mentorship toward
                abstracts, presentations, and board readiness.
              </p>
            </div>
            <div className="card">
              <div className="ico red"><IconHeart /></div>
              <h3>A mission that matters</h3>
              <p>
                Care for the communities most affected by endocrine disease, at a historic academic
                medical center in Washington, D.C.
              </p>
            </div>
          </div>

          <div className="sub-row">
            <h3>Program leadership</h3>
            <button className="btn-link" onClick={() => go('people', true)}>
              Meet the full team →
            </button>
          </div>
          <div className="grid grid-3">
            <article className="card person">
              <div className="headshot lead">
                <span className="ph">GN</span>
              </div>
              <div>
                <div className="name">Dr. Gail Nunlee-Bland</div>
                <div className="role">Chief, Endocrinology, Diabetes &amp; Metabolism</div>
              </div>
            </article>
            <article className="card person">
              <div className="headshot lead">
                <span className="ph">WO</span>
              </div>
              <div>
                <div className="name">Dr. Wolali Odonkor</div>
                <div className="role">Program Director</div>
              </div>
            </article>
            <article className="card person">
              <div className="headshot lead">
                <span className="ph">AZ</span>
              </div>
              <div>
                <div className="name">Anteneh Zenebe, MD, FACE</div>
                <div className="role">Associate Program Director</div>
              </div>
            </article>
            <article className="card person">
              <div className="headshot">
                <span className="ph">PC</span>
              </div>
              <div>
                <div className="name">[Program Coordinator]</div>
                <div className="role">Program Coordinator</div>
              </div>
            </article>
          </div>

          <div className="band" style={{ marginTop: 46 }}>
            <p className="eyebrow" style={{ color: '#9fc0dd' }}>
              For current fellows &amp; faculty
            </p>
            <h3>The program runs on a private hub.</h3>
            <p>
              Behind sign-in, fellows log procedures and track progress toward graduation, faculty
              complete evaluations, and each incoming class is onboarded — all in one place. No
              patient data; fellow records only.
            </p>
            <a className="btn btn-red" href="/login">
              Sign in
            </a>
          </div>
        </section>

        {/* WATCH */}
        <section className="panel" role="tabpanel" hidden={active !== 'watch'}>
          <div className="phead">
            <p className="eyebrow">In their words</p>
            <h2>Meet the program.</h2>
            <p>
              A few minutes with the people you&apos;d train with — faculty, fellows, and a look
              around Howard University Hospital.
            </p>
          </div>
          <VideoTile featured label="Welcome to the program" src={VIDEOS.welcome} />
          <div className="grid grid-3">
            <VideoTile label="A message from leadership" src={VIDEOS.leadership} />
            <VideoTile label="A day in clinic" src={VIDEOS.clinic} />
            <VideoTile label="Hear from our fellows" src={VIDEOS.fellows} />
          </div>

          <h3 className="subhead">Fellows in action</h3>
          <p style={{ color: '#6a808c', fontSize: '.98rem', margin: '0 0 14px', maxWidth: 680 }}>
            Snapshots of training life — clinic and procedures, posters and conferences, teaching and community.
          </p>
          <div className="grid grid-3">
            <VideoTile label="Clinic & procedures" src={VIDEOS.inActionClinic} />
            <VideoTile label="Conferences & posters" src={VIDEOS.inActionConf} />
            <VideoTile label="Teaching & community" src={VIDEOS.inActionTeach} />
          </div>

          <h3 className="subhead">Wellness</h3>
          <p style={{ color: '#6a808c', fontSize: '.98rem', margin: '0 0 14px', maxWidth: 680 }}>
            How the program looks after its people — retreats and socials, well-being and support, life in D.C.
          </p>
          <div className="grid grid-3">
            <VideoTile label="Retreat & socials" src={VIDEOS.wellRetreat} />
            <VideoTile label="Well-being & support" src={VIDEOS.wellSupport} />
            <VideoTile label="Life in D.C." src={VIDEOS.wellDC} />
          </div>

        </section>

        {/* TRAINING */}
        <section className="panel" role="tabpanel" hidden={active !== 'training'}>
          <div className="phead">
            <p className="eyebrow">The experience</p>
            <h2>What two years here looks like.</h2>
          </div>
          <h3 className="subhead" style={{ marginTop: 0 }}>
            Clinical training
          </h3>
          <div className="grid">
            <div className="card">
              <h3>Continuity clinic</h3>
              <p>A panel you follow across both years — diabetes and general endocrinology, week in and week out.</p>
            </div>
            <div className="card">
              <h3>Subspecialty clinics</h3>
              <p>Thyroid &amp; nodule, diabetes technology, metabolic bone, pituitary–adrenal, and reproductive endocrinology.</p>
            </div>
            <div className="card">
              <h3>Inpatient consults</h3>
              <p>Lead the endocrine consult service — DKA, dysnatremias, adrenal crisis, inpatient glycemic management.</p>
            </div>
          </div>
          <h3 className="subhead">Procedures you&apos;ll own</h3>
          <div className="grid">
            <div className="card">
              <h3>Thyroid ultrasound &amp; FNA</h3>
              <p>Nodule evaluation and biopsy, logged and tracked against program targets in your hub.</p>
            </div>
            <div className="card">
              <h3>CGM &amp; insulin pumps</h3>
              <p>Continuous glucose monitor interpretation and pump management for modern diabetes care.</p>
            </div>
            <div className="card">
              <h3>DXA interpretation</h3>
              <p>Bone density reading for osteoporosis and metabolic bone disease.</p>
            </div>
          </div>
          <h3 className="subhead">Didactics &amp; scholarship</h3>
          <div className="grid grid-2">
            <div className="card">
              <h3>Weekly teaching</h3>
              <p>Case conference, journal club, and structured board review built into the schedule.</p>
            </div>
            <div className="card">
              <h3>Mentored scholarship</h3>
              <p>A QI or research project with faculty mentorship, aimed at regional and national presentation.</p>
            </div>
          </div>
        </section>

        {/* PEOPLE */}
        <section className="panel" role="tabpanel" hidden={active !== 'people'}>
          <div className="phead">
            <p className="eyebrow">Who you&apos;ll work with</p>
            <h2>Program leadership, faculty &amp; fellows.</h2>
          </div>
          {/* ADD PHOTOS: drop files in /public/photos and swap <span className="ph">XX</span>
              for <img src="/photos/name.jpg" alt="Dr. ..." /> */}
          <h3 className="subhead" style={{ marginTop: 0 }}>
            Leadership
          </h3>
          <div className="grid">
            <Person initials="GN" lead name="Dr. Gail Nunlee-Bland" role="Chief, Endocrinology, Diabetes & Metabolism" focus="Director, Diabetes Treatment Center · Pediatric endocrinology" />
            <Person initials="WO" lead name="Dr. Wolali Odonkor" role="Program Director" focus="[Focus area]" />
            <Person
              initials="AZ"
              lead
              name="Anteneh Zenebe, MD, FACE"
              role="Associate Program Director"
              focus="Endocrinology & medical education"
            />
            <article className="card person">
              <div className="headshot">
                <span className="ph">PC</span>
              </div>
              <div>
                <div className="name">[Program Coordinator]</div>
                <div className="role">Program Coordinator</div>
                <div className="meta">
                  <a href="mailto:coordinator@huhep.org">[coordinator@email]</a>
                </div>
              </div>
            </article>
          </div>

          <h3 className="subhead">Faculty</h3>
          <div className="grid">
            <Person initials="VG" name="Dr. Vijay Ganta" role="Attending" focus="[Focus area]" />
            <Person initials="PT" name="Dr. Parisa Takalloo" role="Attending" focus="[Focus area]" />
          </div>

          <h3 className="subhead">Current fellows</h3>
          <div className="grid">
            {/* EDIT: real fellow names + PGY */}
            <Person initials="F1" name="[Fellow, MD]" pgy="PGY-4" focus="[Scholarly interest]" />
            <Person initials="F2" name="[Fellow, MD]" pgy="PGY-4" focus="[Scholarly interest]" />
            <Person initials="F3" name="[Fellow, MD]" pgy="PGY-5" focus="[Scholarly interest]" />
          </div>
        </section>

        {/* POLICIES & WELL-BEING */}
        <section className="panel" role="tabpanel" hidden={active !== 'policies'}>
          <div className="phead">
            <p className="eyebrow">Standards &amp; support</p>
            <h2>Held to ACGME standards. Built around your well-being.</h2>
            <p>The requirements we train to, and the resources every fellow should know about.</p>
          </div>

          <h3 className="subhead" style={{ marginTop: 0 }}>
            ACGME requirements &amp; policies
          </h3>
          <div className="grid">
            <LinkCard
              href="https://www.acgme.org/what-we-do/accreditation/common-program-requirements/"
              title="Common Program Requirements"
              desc="The standards every program meets — including Section VI on well-being."
            />
            <LinkCard
              href="https://www.acgme.org/about-us/policies-and-procedures/"
              title="ACGME Policies & Procedures"
              desc="How accreditation, review, and program oversight work."
            />
            <LinkCard
              href="https://www.acgme.org/residents-and-fellows/welcome/"
              title="For Residents & Fellows"
              desc="Your rights, how to raise a concern, and support from the ACGME."
            />
            <LinkCard href={LINKS.endoReq} title="Endo program requirements" desc="ACGME Endocrinology, Diabetes & Metabolism program requirements." />
          </div>

          <h3 className="subhead">Fellow well-being</h3>
          <div className="grid">
            <LinkCard
              href="https://www.acgme.org/education-and-resources/physician-well-being-resources/"
              title="ACGME Well-Being Resources"
              desc="Tools for burnout, mental health, and resilience — for individuals and programs."
            />
            <LinkCard href={LINKS.eap} title="Confidential counseling / EAP" desc="Howard GME / employee assistance — confidential, 24/7." />
            <LinkCard href={LINKS.wellness} title="Fellow wellness & time-away" desc="Program well-being policy and how to get covered." />
          </div>

          <h3 className="subhead">Program materials</h3>
          <div className="grid">
            <LinkCard href={LINKS.handbook} title="Fellow handbook" desc="The program handbook for current fellows." />
            <LinkCard href={LINKS.milestones} title="Milestones & evaluation guide" desc="How evaluations and ACGME milestones work here." />
            <LinkCard href={LINKS.gme} title="Howard GME office policies" desc="Institutional graduate medical education policies." />
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <b>Howard University Hospital</b>
              <span className="line">Endocrinology, Diabetes &amp; Metabolism Fellowship</span>
              <a
                className="line"
                href="https://maps.google.com/?q=2041+Georgia+Ave+NW,+Washington,+DC+20060"
                target="_blank"
                rel="noopener"
              >
                2041 Georgia Ave NW, Washington, DC 20060
              </a>
              <a className="line" href="tel:+12028656100">
                (202) 865-6100
              </a>
            </div>
            <div>
              <div className="ft">Apply</div>
              <a className="line" href={ERAS} target="_blank" rel="noopener">
                Applications are accepted through ERAS ↗
              </a>
              <span className="line" style={{ color: 'rgba(255,255,255,.7)' }}>
                Questions? <a href="mailto:coordinator@huhep.org">Email the program coordinator</a>
              </span>
            </div>
            <div>
              <div className="ft">Member hub</div>
              <a className="line" href="/login">
                Sign in
              </a>
              <span className="line" style={{ color: 'rgba(255,255,255,.7)' }}>
                Invite-only · No PHI · fellow records only
              </span>
            </div>
          </div>
          <div className="foot-bottom">
            <span className="motto">Veritas et Utilitas — Truth and Service</span>
            <span>© 2026 Howard University Hospital · EDM Fellowship</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

/* Feature-card icons (stroke = currentColor; tint set by .ico in CSS) */
function IconBreadth() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
      <path d="M16 4a3 3 0 0 1 0 6" />
      <path d="M20.5 20c0-2.6-1.4-4.8-3.5-5.6" />
    </svg>
  );
}

function IconCap() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4L2 9l10 5 10-5-10-5z" />
      <path d="M6 11.5V16c0 1.2 2.7 3 6 3s6-1.8 6-3v-4.5" />
      <path d="M22 9v5" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20S3.5 15 3.5 8.8C3.5 6 5.6 4.3 8 4.3c1.7 0 3.1 1 4 2.2.9-1.2 2.3-2.2 4-2.2 2.4 0 4.5 1.7 4.5 4.5C20.5 15 12 20 12 20z" />
    </svg>
  );
}

function Person({
  initials,
  name,
  role,
  focus,
  pgy,
  lead,
}: {
  initials: string;
  name: string;
  role?: string;
  focus?: string;
  pgy?: string;
  lead?: boolean;
}) {
  return (
    <article className="card person">
      <div className={'headshot' + (lead ? ' lead' : '')}>
        <span className="ph">{initials}</span>
      </div>
      <div>
        <div className="name">{name}</div>
        {role ? <div className="role">{role}</div> : null}
        {pgy ? <span className="pgy">{pgy}</span> : null}
        {focus ? <div className="focus">{focus}</div> : null}
      </div>
    </article>
  );
}

function LinkCard({
  href,
  title,
  desc,
}: {
  href?: string;
  title: string;
  desc: string;
}) {
  const todo = !href || !href.trim();
  return (
    <a
      className={'card linkcard' + (todo ? ' todo' : '')}
      href={todo ? '#' : href}
      target={todo ? undefined : '_blank'}
      rel={todo ? undefined : 'noopener'}
      aria-disabled={todo ? true : undefined}
      onClick={todo ? (e) => e.preventDefault() : undefined}
    >
      <span className="lk-t">{title}</span>
      <span className="lk-d">{desc}</span>
    </a>
  );
}

function VideoTile({
  label,
  src,
  featured,
}: {
  label: string;
  src?: string;
  featured?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const embed = toEmbed(src);
  return (
    <div className={'video16x9' + (featured ? ' video-featured' : '')}>
      {embed && playing ? (
        <iframe
          src={embed + (embed.includes('?') ? '&' : '?') + 'autoplay=1'}
          title={label}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button
          type="button"
          className={'video-ph' + (embed ? ' video-ready' : '')}
          onClick={() => embed && setPlaying(true)}
          disabled={!embed}
          aria-label={embed ? 'Play video: ' + label : label + ' — video coming soon'}
        >
          <span className="play" aria-hidden="true">
            <PlayIcon />
          </span>
          <span className="vlabel">{label}</span>
          <span className="vhint">{embed ? 'Tap to play' : 'Video coming soon'}</span>
        </button>
      )}
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:wght@500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&display=swap');
.hu-land{--blue:#003a63;--blue-deep:#04263f;--blue-tint:#eef2f6;--red:#e51937;--red-btn:#c8102e;--red-ink:#b3142c;--gray:#6a808c;--ink:#16242f;--bg:#f6f8fa;--surface:#ffffff;--border:#e2e7ec;--shadow:0 1px 2px rgba(4,38,63,.05),0 10px 28px rgba(4,38,63,.07);background:var(--bg);color:var(--ink);font-family:"Open Sans",system-ui,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased;scroll-behavior:smooth}
.hu-land *{box-sizing:border-box}
@media (prefers-reduced-motion:reduce){.hu-land{scroll-behavior:auto}.hu-land *{transition:none!important}}
.hu-land .wrap{width:100%;max-width:1120px;margin:0 auto;padding:0 22px}
.hu-land h1,.hu-land h2,.hu-land h3{font-family:"Source Serif 4",Georgia,serif;color:var(--blue);line-height:1.14;margin:0;font-weight:600}
.hu-land .eyebrow{font-size:.74rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--red-ink);margin:0 0 .65rem}
.hu-land a{color:var(--blue)}
.hu-land .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:"Open Sans",sans-serif;font-weight:700;font-size:.96rem;padding:12px 22px;border-radius:8px;border:1px solid transparent;text-decoration:none;cursor:pointer;min-height:46px;transition:background .15s,color .15s,border-color .15s}
.hu-land .btn-red{background:var(--red-btn);color:#fff}.hu-land .btn-red:hover{background:#a50e26}
.hu-land .btn-ghost-light{background:transparent;color:#fff;border-color:rgba(255,255,255,.55)}.hu-land .btn-ghost-light:hover{background:rgba(255,255,255,.12)}
.hu-land .btn-link{background:none;border:none;color:var(--blue);font-weight:700;cursor:pointer;font-family:"Open Sans",sans-serif;font-size:.95rem;padding:8px 0}.hu-land .btn-link:hover{color:var(--red-ink)}
.hu-land :focus-visible{outline:3px solid rgba(229,25,55,.5);outline-offset:2px;border-radius:6px}
.hu-land .topbar{position:sticky;top:0;z-index:50;background:rgba(246,248,250,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--border)}
.hu-land .topbar-inner{display:flex;align-items:center;gap:14px;min-height:66px}
.hu-land .brand{display:flex;align-items:center;gap:11px;text-decoration:none;margin-right:auto}
.hu-land .brand-mark{width:40px;height:40px;object-fit:contain;flex:none}
.hu-land .brand b{font-family:"Source Serif 4",serif;font-weight:700;color:var(--blue);font-size:1rem;display:block;line-height:1.1}
.hu-land .brand span{font-size:.67rem;color:var(--gray);letter-spacing:.02em}
.hu-land .topbar .btn{padding:9px 18px;min-height:40px;font-size:.9rem}
.hu-land .hero{position:relative;overflow:hidden;background:linear-gradient(160deg,var(--blue-deep),var(--blue));color:#fff;border-bottom:4px solid var(--red)}
.hu-land .hero-inner{position:relative;z-index:1;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:34px;padding:64px 0}
.hu-land .hero-copy{flex:1 1 440px;max-width:640px}
.hu-land .hero .eyebrow{color:#9fc0dd}
.hu-land .hero h1{color:#fff;font-size:clamp(2.3rem,5.6vw,3.7rem);letter-spacing:-.01em}
.hu-land .hero h1 u{text-decoration:none;box-shadow:inset 0 -.28em 0 var(--red)}
.hu-land .hero .lead{color:rgba(255,255,255,.86);font-size:clamp(1.05rem,2.1vw,1.28rem);margin:20px 0 28px;max-width:600px}
.hu-land .hero-cta{display:flex;flex-wrap:wrap;gap:12px}
.hu-land .hero-meta{margin-top:26px;font-size:.8rem;color:rgba(255,255,255,.72);letter-spacing:.02em;display:flex;flex-wrap:wrap;gap:6px 16px}
.hu-land .hero-emblem{flex:0 0 auto;width:clamp(190px,26vw,300px);display:grid;place-items:center}
.hu-land .hero-emblem img{width:100%;height:auto;object-fit:contain;filter:drop-shadow(0 18px 40px rgba(0,0,0,.42))}
@media (max-width:720px){.hu-land .hero-emblem{order:-1;width:172px;margin-bottom:2px}}
.hu-land .tabsbar{position:sticky;top:65px;z-index:40;background:var(--surface);border-bottom:1px solid var(--border)}
.hu-land .tablist{display:flex;gap:2px;overflow-x:auto;scrollbar-width:none}.hu-land .tablist::-webkit-scrollbar{display:none}
.hu-land .tab{flex:none;appearance:none;background:none;border:none;cursor:pointer;font-family:"Open Sans",sans-serif;font-size:.95rem;font-weight:700;color:var(--gray);padding:16px 16px;border-bottom:3px solid transparent;white-space:nowrap}
.hu-land .tab:hover{color:var(--blue)}.hu-land .tab[aria-selected="true"]{color:var(--blue);border-bottom-color:var(--red)}
.hu-land .panel{padding:56px 0}.hu-land .panel[hidden]{display:none}
.hu-land .phead{max-width:680px;margin-bottom:36px}
.hu-land .phead h2{font-size:clamp(1.7rem,4vw,2.35rem)}
.hu-land .phead p{color:var(--gray);margin:12px 0 0;font-size:1.06rem}
.hu-land .prose p{max-width:680px;margin:0 0 16px}.hu-land .prose p:last-child{margin-bottom:0}.hu-land .prose strong{color:var(--blue)}
.hu-land .grid{display:grid;gap:18px;grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}
.hu-land .grid-2{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.hu-land .grid-3{grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.hu-land .cards-top{margin-top:34px}
.hu-land .card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:22px;box-shadow:var(--shadow)}
.hu-land .card h3{font-size:1.18rem;margin-bottom:8px}.hu-land .card p{color:var(--gray);margin:0;font-size:.96rem}
.hu-land .subhead{font-family:"Source Serif 4",serif;font-weight:600;color:var(--blue);font-size:1.15rem;margin:36px 0 14px}
.hu-land .sub-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:46px 0 14px}
.hu-land .sub-row h3{font-family:"Source Serif 4",serif;font-weight:600;color:var(--blue);font-size:1.15rem;margin:0}
.hu-land .video16x9{position:relative;aspect-ratio:16/9;background:var(--blue-tint);border:1px solid var(--border);border-radius:14px;overflow:hidden;box-shadow:var(--shadow)}
.hu-land .video16x9 iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.hu-land .video-ph{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:16px}
.hu-land .video-ph .play{width:62px;height:62px;border-radius:50%;background:var(--red-btn);display:grid;place-items:center;box-shadow:0 8px 20px rgba(4,38,63,.18)}
.hu-land .video-ph .play svg{width:24px;height:24px;color:#fff;margin-left:3px}
.hu-land .video-ph .vlabel{font-family:"Source Serif 4",serif;font-weight:700;font-size:1.05rem;color:var(--blue)}
.hu-land .video-ph .vhint{font-size:.82rem;color:var(--gray);max-width:260px}
.hu-land .video-featured{margin-bottom:18px}
.hu-land .person{display:flex;gap:15px;align-items:flex-start}
.hu-land .headshot{width:84px;height:84px;border-radius:16px;flex:none;background:var(--blue-tint);border:1px solid var(--border);display:grid;place-items:center;overflow:hidden}
.hu-land .headshot .ph{font-family:"Source Serif 4",serif;font-weight:700;color:var(--blue);font-size:1.2rem;letter-spacing:.02em}
.hu-land .headshot img{width:100%;height:100%;object-fit:cover}
.hu-land .headshot.lead{box-shadow:0 0 0 3px var(--surface),0 0 0 5px var(--red)}
.hu-land .person .name{font-family:"Source Serif 4",serif;font-weight:700;color:var(--blue);font-size:1.1rem;line-height:1.2}
.hu-land .person .role{font-size:.7rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--red-ink);margin-top:4px}
.hu-land .person .focus{color:var(--gray);font-size:.93rem;margin-top:5px}
.hu-land .person .meta{font-size:.85rem;margin-top:6px}.hu-land .person .meta a{color:var(--blue);font-weight:600}
.hu-land .pgy{display:inline-block;font-size:.68rem;font-weight:700;letter-spacing:.05em;color:var(--gray);border:1px solid var(--border);border-radius:999px;padding:2px 9px;margin-top:5px}
.hu-land .linkcard{display:flex;flex-direction:column;gap:6px;text-decoration:none}
.hu-land .linkcard .lk-t{font-family:"Source Serif 4",serif;font-weight:700;color:var(--blue);font-size:1.05rem;display:flex;align-items:center;gap:7px}
.hu-land .linkcard .lk-d{color:var(--gray);font-size:.92rem}
.hu-land .linkcard .lk-t::after{content:"↗";color:var(--red-ink);font-size:.85em}
.hu-land .linkcard.todo .lk-t::after{content:"·";color:var(--gray)}
.hu-land a.card:hover{border-color:#cdd8e1}
.hu-land .band{background:var(--blue);color:#fff;border-radius:18px;padding:38px;margin-top:42px}
.hu-land .band h3{color:#fff;font-size:1.5rem}
.hu-land .band p{color:rgba(255,255,255,.82);max-width:560px;margin:10px 0 22px}
.hu-land footer{background:var(--blue-deep);color:rgba(255,255,255,.78);padding:46px 0 36px;margin-top:8px}
.hu-land .foot-grid{display:grid;gap:26px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.hu-land footer b{color:#fff;font-family:"Source Serif 4",serif;font-weight:600;font-size:1.05rem}
.hu-land footer a{color:#cfe0ee;text-decoration:none}.hu-land footer a:hover{color:#fff;text-decoration:underline}
.hu-land footer .ft{font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9fc0dd;margin-bottom:10px}
.hu-land footer .line{display:block;margin:3px 0;font-size:.93rem}
.hu-land footer .motto{font-style:italic;color:#9fc0dd}
.hu-land .foot-bottom{border-top:1px solid rgba(255,255,255,.12);margin-top:30px;padding-top:18px;font-size:.78rem;letter-spacing:.02em;display:flex;flex-wrap:wrap;gap:6px 18px;justify-content:space-between}

/* ─── Hierarchy tune-up (screenshots 1–4) ─── */
.hu-land .topbar-inner{min-height:76px}
.hu-land .brand-mark{width:56px;height:56px}
.hu-land .brand b{font-size:1.22rem}
.hu-land .brand span{font-size:.74rem}
.hu-land .hero .eyebrow{font-size:.86rem;letter-spacing:.16em;color:#bcd6ee}
.hu-land .tabsbar{top:75px;box-shadow:0 6px 14px rgba(4,38,63,.06)}
.hu-land .tab{font-size:1.02rem;color:var(--ink);padding:18px 20px;border-bottom-width:4px}
.hu-land .tab:hover{color:var(--blue);background:rgba(0,58,99,.04)}
.hu-land .tab[aria-selected="true"]{background:rgba(229,25,55,.05)}
.hu-land .hero-meta{font-size:.9rem;font-weight:600;color:rgba(255,255,255,.85)}
.hu-land .sub-row h3,
.hu-land .subhead{font-size:1.6rem;position:relative;padding-left:16px}
.hu-land .sub-row h3::before,
.hu-land .subhead::before{content:"";position:absolute;left:0;top:.16em;bottom:.16em;width:5px;border-radius:3px;background:var(--red)}

/* ─── Landing refinements (premium pass) ─── */
/* softer card shadow */
.hu-land{--shadow:0 1px 2px rgba(4,38,63,.04),0 8px 22px rgba(4,38,63,.06)}
/* brand bar stays at the top but is NOT sticky -> it scrolls away instead of floating over the text */
.hu-land .topbar{position:static;background:var(--surface)}
/* with the header non-sticky, pin the section tabs to the very top */
.hu-land .tabsbar{top:0}
/* esteemed display serif for the big headings, tighter leading */
.hu-land .hero h1{font-family:"Playfair Display","Source Serif 4",Georgia,serif;line-height:1.06;letter-spacing:-.012em}
.hu-land .phead h2{font-family:"Playfair Display","Source Serif 4",Georgia,serif;line-height:1.1}
/* Sign-in button: darker red + subtle lift on hover */
.hu-land .btn-red{transition:background .15s,transform .15s,box-shadow .15s}
.hu-land .btn-red:hover{background:#a50e26;transform:translateY(-1px);box-shadow:0 6px 16px rgba(200,16,46,.32)}
/* hero emblem: drop the harsh glow for a soft, natural shadow */
.hu-land .hero-emblem img{filter:drop-shadow(0 10px 22px rgba(0,0,0,.22))}
/* let the Why-train-here prose breathe a little wider */
.hu-land .prose p{max-width:760px}
/* roomier, rounder feature cards */
.hu-land .card{padding:28px;border-radius:16px}
/* thematic icon chip atop a card */
.hu-land .card .ico{width:46px;height:46px;border-radius:12px;display:grid;place-items:center;background:var(--blue-tint);color:var(--blue);margin-bottom:15px}
.hu-land .card .ico svg{width:24px;height:24px}
.hu-land .card .ico.red{background:#fdecef;color:var(--red-ink)}
/* leadership avatars: soft red tint, red initials, no harsh ring */
.hu-land .headshot.lead{background:#fdecef;border-color:#f3c8ce;box-shadow:none}
.hu-land .headshot.lead .ph{color:var(--red-ink)}
/* people cards: centered, symmetrical (avatar over name/title) */
.hu-land .person{display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px}
/* hero logo: it's a transparent PNG that disappears on navy -> seat it on a soft
   white medallion (padded, gentle shadow) so it reads clearly, no harsh ring */
.hu-land .hero-emblem{aspect-ratio:1;border-radius:50%;background:#fff;padding:26px;box-shadow:0 16px 40px rgba(0,0,0,.28),inset 0 0 0 1px rgba(255,255,255,.6);width:clamp(180px,24vw,264px)}
.hu-land .hero-emblem img{width:100%;height:100%;object-fit:contain;filter:none}
@media (max-width:720px){.hu-land .hero-emblem{width:168px;padding:20px}}
/* playable video tiles: the placeholder is now a real button */
.hu-land button.video-ph{appearance:none;border:0;background:transparent;width:100%;height:100%;font:inherit;color:inherit;cursor:default}
.hu-land button.video-ph.video-ready{cursor:pointer}
.hu-land .video-ph .play{transition:transform .15s,box-shadow .15s}
.hu-land button.video-ph.video-ready:hover .play{transform:scale(1.07);box-shadow:0 10px 26px rgba(4,38,63,.28)}
.hu-land button.video-ph.video-ready:hover .vhint{color:var(--red-ink)}
`;