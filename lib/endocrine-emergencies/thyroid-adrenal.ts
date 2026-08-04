// lib/endocrine-emergencies/thyroid-adrenal.ts
// Fellows' Survival Guide — thyroid & adrenal cluster: thyroid storm, myxedema
// coma, adrenal crisis, thyrotoxic periodic paralysis (TPP), pheochromocytoma crisis.
// EDUCATIONAL QUICK-REFERENCE ONLY. No PHI. See types.ts for the full notice.
//
// Guideline basis (reconciled 2026-08): ATA 2016 hyperthyroidism; JTA/JES 2016
// thyroid storm; ATA 2014 hypothyroidism; Endocrine Society 2016 primary AI;
// ESE/Endocrine Society 2024 joint guideline on glucocorticoid-induced AI;
// NICE NG243 (2024); Woodcock 2020 perioperative steroid cover; Endocrine
// Society 2014 PPGL; Lancet D&E 2023 catecholamine hypertensive crisis review.

import type { Emergency } from './types'

export const THYROID_ADRENAL_EMERGENCIES: Emergency[] = [
  // ───────────────────────────── ADRENAL ─────────────────────────────
  {
    id: 'adrenal-crisis',
    name: 'Adrenal Crisis (Acute Adrenal Insufficiency)',
    category: 'adrenal',
    summary: 'Acute glucocorticoid (and in primary disease, mineralocorticoid) deficiency causing shock that does not respond to fluids and pressors — a true "give hydrocortisone now, confirm later" emergency. Usually a known adrenal-insufficient patient under stress, an undiagnosed Addison patient, or abrupt steroid withdrawal — and roughly half of crises strike before the diagnosis is ever made.',
    firstActions: [
      'Hydrocortisone 100 mg IV (or IM) bolus STAT — before any labs, imaging, or stimulation test; there is no toxic dose of hydrocortisone in an emergency.',
      'Isotonic 0.9% saline 1 L IV over the first hour (NICE: over 30 min), then continue per hemodynamics — typically 2–4 L over 24 h; deaths occur when steroids are given but fluids are not.',
      'IV dextrose for hypoglycemia (5% dextrose in saline is a reasonable maintenance fluid); recheck glucose.',
      'If a cosyntropin stimulation test is still needed, bridge with DEXAMETHASONE 4 mg IV — it does not cross-react in the cortisol assay (no mineralocorticoid activity, so switch to hydrocortisone once testing is done).',
      'Then hydrocortisone 200 mg per 24 h — preferably continuous infusion, alternatively 50 mg IV/IM q6h — while you search for the trigger (cultures + empiric antibiotics if infection; review etomidate exposure, anticoagulation, checkpoint inhibitors).',
    ],
    features: [
      'Hypotension or shock poorly responsive to fluids and vasopressors — the cardinal feature; tachycardia, sometimes relative bradycardia. Working definition: ≥2 of hypotension (SBP <100 mmHg or ≥20 mmHg drop), nausea/vomiting, severe weakness, hyponatremia, hypoglycemia, hyperkalemia (primary only) — plus reversal after parenteral glucocorticoids.',
      'Nausea, vomiting, diffuse abdominal pain (can mimic an acute abdomen), fever, profound weakness, and confusion progressing to coma.',
      'A precipitating stress is usual: gastroenteritis (~23%) and other infection (~25%) lead, then surgery (~10%), missed steroid doses, or abrupt glucocorticoid withdrawal; ~50% of crises occur in patients not yet diagnosed.',
      'Chronic primary disease clues: hyperpigmentation (palmar creases, buccal mucosa, scars), vitiligo, weight loss, salt craving, postural dizziness.',
      'Suggestive labs: hyponatremia (Na ≤132 is a Delphi "Type A" criterion), hyperkalemia (primary only), hypoglycemia (more in central disease and children), mild hypercalcemia, prerenal azotemia, eosinophilia.',
    ],
    diagnosis: [
      'Clinical — TREAT FIRST, confirm later. Draw a paired cortisol (and ACTH, aldosterone, renin) BEFORE the first steroid ONLY if it will not delay treatment. The 2024 German Delphi definition: ≥1 Type A criterion (known AI or prior glucocorticoid therapy; Na ≤132; hyperkalemia) + ≥2 Type B criteria (severe weakness, impaired consciousness, nausea/vomiting, fever, SBP ≤100).',
      'Random (basal) cortisol: <3–5 µg/dL (<83–138 nmol/L) in a stressed or ill patient strongly supports adrenal insufficiency; >18 µg/dL (>500 nmol/L) makes acute insufficiency very unlikely; a morning value of 3–15 is indeterminate and needs stimulation testing.',
      '250 µg cosyntropin (ACTH) stimulation test once stable: cortisol at 0, 30 and 60 min; a peak <18 µg/dL (<500 nmol/L) confirms adrenal insufficiency.',
      'Localize the lesion: PRIMARY → high ACTH with low aldosterone and high renin, giving hyperkalemia, hyponatremia and hyperpigmentation; CENTRAL (secondary or tertiary) → low or inappropriately normal ACTH with an intact mineralocorticoid axis (normal potassium), no hyperpigmentation, and often other pituitary deficits.',
      'Do not miss TERTIARY (glucocorticoid-induced) AI — any chronic steroid formulation (oral, inhaled, topical, intra-articular) can suppress the axis; a patient on steroids presenting with collapse or vomiting may be in crisis even if never tested (ESE/Endocrine Society 2024 joint guideline emphasis).',
      'A NORMAL cosyntropin test does not exclude recent-onset central insufficiency (e.g., after pituitary surgery or apoplexy) — the adrenals take roughly 2 weeks to atrophy and may still respond.',
    ],
    management: [
      'Hydrocortisone 100 mg IV/IM immediately, then 200 mg/24h by continuous infusion (preferred) or 50 mg IV/IM q6h — identical across Endocrine Society 2016, ESE/ES 2024, and NICE NG243 2024. If hydrocortisone is unavailable: prednisolone ≥25 mg IV, or dexamethasone ~4 mg IV (bridge only).',
      'Isotonic saline 1 L in the first hour, then titrate to hemodynamics and electrolytes (typically 2–4 L/24h); add dextrose for hypoglycemia.',
      'Treat the trigger — sepsis is the most common; have a low threshold for cultures and empiric antibiotics. Review for etomidate, anticoagulation (adrenal hemorrhage), and immune checkpoint inhibitors.',
      'Mineralocorticoid timing: at ≥50–100 mg/day, hydrocortisone supplies enough mineralocorticoid effect — fludrocortisone is NOT needed acutely. RESUME fludrocortisone (50–300 µg/day) only when hydrocortisone is tapered below ~50 mg/day — and only in PRIMARY AI (never in secondary/tertiary).',
      'Correct hyponatremia cautiously: it often improves with cortisol and saline alone, and cortisol replacement triggers a water diuresis that can raise sodium quickly — keep within ≤8 mmol/L per 24 h to avoid osmotic demyelination.',
      'Continue 200 mg/24h until clinically recovered (typically 2–3 days), then taper (e.g., halve daily) to an oral DOUBLE-DOSE sick-day regimen until the trigger resolves, then maintenance — do not taper straight to maintenance the moment BP normalizes.',
    ],
    followUp: [
      'Establish maintenance replacement (hydrocortisone ~15–25 mg/day in 2–3 divided doses; fludrocortisone 50–300 µg/day for primary disease) and confirm the cause — autoimmune, adrenal hemorrhage, infiltration, drugs (checkpoint inhibitors, ketoconazole, etomidate), or pituitary disease.',
      'Sick-day rules: DOUBLE the usual oral dose for the duration of illness (triple for fever >39 °C); NICE NG243 specifies ≥40 mg/day oral hydrocortisone in 2–4 divided doses (or ≥10 mg/day prednisolone) during significant physiological stress. If vomiting or diarrhea prevents absorption → 100 mg IM hydrocortisone + emergency department.',
      'Every patient leaves with a steroid emergency card AND a hydrocortisone injection kit with training (NICE: provide 2–3 kits) plus a medical-alert identifier; arrange endocrine follow-up — crisis is preventable, and education is the prevention.',
    ],
    pearls: [
      'Never delay steroids for confirmatory testing — death is from untreated shock, not from one dose of hydrocortisone.',
      'Steroids without fluids kill too — isotonic saline is co-equal treatment, not an afterthought.',
      'Hypotension with hyponatremia and hyperkalemia (with or without hypoglycemia) is adrenal crisis until proven otherwise.',
      'Dexamethasone is the diagnostic bridge (no assay cross-reactivity) but has NO mineralocorticoid activity — never use it (or methylprednisolone) as sole chronic replacement in primary AI.',
      'Etomidate for intubation inhibits 11β-hydroxylase and can precipitate or worsen crisis — use an alternative induction agent or give stress-dose steroids in at-risk patients.',
      'Perioperative cover follows Woodcock 2020 (adopted by NICE 1.4.8) — see the stress-dose table; major surgery = 100 mg at induction then 200 mg/24h infusion.',
    ],
    tables: [
      {
        title: 'Stress-dose / sick-day steroid rules by scenario (Woodcock 2020; NICE NG243 2024)',
        columns: ['Scenario', 'Pre / during', 'After'],
        rows: [
          ['Sick day (outpatient illness)', 'Double usual oral dose (triple if fever >39 °C); NICE: ≥40 mg/day hydrocortisone in 2–4 doses', 'Until trigger resolves; vomiting/diarrhea → 100 mg IM hydrocortisone + ED'],
          ['Minor procedure, local anesthesia (skin lesion, cataract)', 'Extra oral dose (e.g., hydrocortisone 10 mg) 1 h before', 'Extra oral dose 1 h after, then usual dose'],
          ['Moderate / invasive (endoscopy, bowel prep, dental under GA)', 'Hydrocortisone 100 mg IV/IM just before (consider infusion for bowel prep)', 'Double usual oral dose ×24 h, then taper'],
          ['Major surgery / any GA', 'Hydrocortisone 100 mg IV at induction, then 200 mg/24 h continuous infusion (or 50 mg IV/IM q6h)', 'Continue 200 mg/24 h until eating/drinking, then double oral ≥48 h (up to 7 days after major surgery), then taper'],
          ['Labor & vaginal delivery', '100 mg IV/IM at onset of active labor + 200 mg/24 h infusion (or 50 mg q6h)', 'Double oral dose ≥48 h'],
        ],
        note: 'Infusion prep: 200 mg hydrocortisone (sodium succinate or phosphate — NOT acetate, slow onset) in 200 mL 0.9% saline or 5% dextrose. Use continuous infusion (not boluses) for patients on CYP3A4 inducers (rifampicin, anticonvulsants). Dexamethasone 6–8 mg single bolus is an alternative for patients maintained on prednisolone/dexamethasone, but is unsuitable in primary AI (no mineralocorticoid activity).',
      },
      {
        title: 'Primary vs central adrenal insufficiency',
        columns: ['Feature', 'Primary (adrenal / Addison)', 'Central (secondary or tertiary)'],
        rows: [
          ['ACTH', 'High', 'Low or inappropriately normal'],
          ['Aldosterone / renin', 'Low aldosterone, high renin', 'Normal (RAAS intact)'],
          ['Potassium', 'High', 'Normal'],
          ['Sodium', 'Low', 'Low (dilutional)'],
          ['Hyperpigmentation', 'Yes', 'No'],
          ['Mineralocorticoid need', 'Fludrocortisone required', 'Not required'],
          ['Associated clues', 'Vitiligo, other autoimmune disease', 'Other pituitary deficits, chronic glucocorticoid exposure'],
        ],
        note: 'Hyperkalemia and hyperpigmentation point to a primary adrenal process; their absence with other pituitary deficits — or any chronic steroid exposure — points central/tertiary.',
      },
    ],
    references: [
      {
        label: 'Diagnosis and Treatment of Primary Adrenal Insufficiency: An Endocrine Society Clinical Practice Guideline',
        source: 'Endocrine Society (Bornstein et al)',
        year: '2016',
        url: 'https://doi.org/10.1210/jc.2015-1710',
      },
      {
        label: 'ESE and Endocrine Society Joint Clinical Guideline: Diagnosis and Therapy of Glucocorticoid-Induced Adrenal Insufficiency',
        source: 'European Society of Endocrinology / Endocrine Society (Beuschlein et al)',
        year: '2024',
        url: 'https://doi.org/10.1210/clinem/dgae250',
      },
      {
        label: 'Adrenal insufficiency: identification and management (NG243)',
        source: 'NICE',
        year: '2024',
        url: 'https://www.nice.org.uk/guidance/ng243/chapter/recommendations',
      },
      {
        label: 'Guidelines for the management of glucocorticoids during the peri-operative period for patients with adrenal insufficiency',
        source: 'Association of Anaesthetists / RCP / Society for Endocrinology (Woodcock et al)',
        year: '2020',
        url: 'https://doi.org/10.1111/anae.14963',
      },
      {
        label: 'Endocrine emergency guidance: Emergency management of acute adrenal insufficiency (adrenal crisis) in adult patients',
        source: 'Society for Endocrinology (Arlt)',
        year: '2016',
        url: 'https://doi.org/10.1530/EC-16-0054',
      },
    ],
    lastReviewed: '2026-08',
  },

  // ───────────────────────────── THYROID ─────────────────────────────
  {
    id: 'thyroid-storm',
    name: 'Thyroid Storm',
    category: 'thyroid',
    summary: 'Decompensated, life-threatening thyrotoxicosis with multi-organ failure — hyperthermia, tachyarrhythmia and heart failure, CNS dysfunction, and GI/hepatic involvement. A CLINICAL diagnosis (do not wait for labs); mortality is 10–30% (Japan nationwide survey: 11.0% definite, 9.5% suspected).',
    firstActions: [
      'ICU admission with continuous telemetry; send TSH, free T4, free T3 — but treat on clinical suspicion (BWPS ≥45 or JTA TS1/TS2); hormone levels do not discriminate storm from uncomplicated thyrotoxicosis.',
      'β-blockade FIRST in most patients: propranolol 60–80 mg PO q4–6h; if decompensated low-output heart failure is a concern, use titratable esmolol (load 250–500 µg/kg IV, then 50–100 µg/kg/min) or withhold.',
      'Block synthesis: PTU 500–1000 mg PO/NG/PR load, then 250 mg q4h (also blocks T4→T3 conversion) — or methimazole 60–80 mg/day divided.',
      'Block release with iodine ≥1 HOUR AFTER the first thionamide dose: SSKI 5 drops (0.25 mL) PO q6h or Lugol solution 6–8 drops PO q6h — iodine first would fuel new hormone synthesis.',
      'Hydrocortisone 300 mg IV load, then 100 mg IV q8h — blocks T4→T3 conversion and treats relative adrenal insufficiency.',
      'Support the patient: acetaminophen + cooling blankets (NEVER aspirin/NSAIDs — they displace T4 from binding proteins), cautious IV crystalloid, O2, and start hunting/treating the trigger (cultures + early antibiotics if infection).',
    ],
    features: [
      'Hyperpyrexia, often >38.5–40 °C — a temperature out of proportion to any infection is a hallmark.',
      'Cardiovascular: marked sinus tachycardia, atrial fibrillation with rapid ventricular response, high-output then congestive heart failure, and hypotension or shock.',
      'CNS: agitation, anxiety, delirium, psychosis, seizures, progressing to stupor or coma; an apathetic presentation (AF, CHF, weight loss, confusion without fever or agitation) can occur in the elderly.',
      'GI and hepatic: nausea, vomiting, diarrhea, abdominal pain, and jaundice from hepatic congestion or dysfunction (a poor prognostic sign).',
      'Precipitants: infection, surgery (thyroid or non-thyroid), trauma, DKA, parturition, iodine load (contrast, amiodarone), abrupt antithyroid-drug withdrawal, radioactive iodine rarely, immune checkpoint inhibitors, or thyroid hormone overdose.',
    ],
    diagnosis: [
      'A clinical diagnosis: labs (suppressed TSH with elevated free T4 and/or T3) confirm thyrotoxicosis, but the DEGREE of hormone elevation does not separate storm from uncomplicated thyrotoxicosis — severity is clinical.',
      'Burch–Wartofsky Point Scale: ≥45 highly suggestive, 25–44 impending storm, <25 unlikely (table) — more sensitive but less specific than the Japanese criteria. Scores are frameworks, not absolute cutoffs: sepsis with multi-organ failure can score >45; treat on clinical judgment.',
      'Japan Thyroid Association (Akamizu) criteria grade TS1 (definite) and TS2 (suspected) from five symptom categories — CNS, fever ≥38 °C, tachycardia ≥130 bpm (or HR ≥130 in AF), CHF, GI/hepatic (table). When in doubt whether a feature is from the precipitant or the storm, attribute it to the storm.',
      'Send free T4, free/total T3, TSH, and TRAb if the cause is unknown, plus CBC, LFTs, glucose, and calcium; then hunt the precipitant (cultures, ECG, imaging as indicated).',
      'Titrate therapy to serial FREE T4 and free T3 — NOT TSH, which lags and stays suppressed.',
    ],
    management: [
      'Order matters — give a thionamide BEFORE iodine. Run all arms simultaneously in an ICU: (i) block adrenergic effects (β-blocker), (ii) block new synthesis (thionamide), (iii) block release (iodine, ≥1 h later), (iv) block T4→T3 conversion + cover relative adrenal insufficiency (glucocorticoid), (v) interrupt enterohepatic circulation (cholestyramine), (vi) supportive care + treat the trigger.',
      'β-blockade: propranolol 60–80 mg PO q4–6h (IV alternative 0.5–1 mg IV q2–5 min, max 10 mg) — high doses also blunt peripheral T4→T3 conversion. CAUTION in decompensated low-output heart failure (tachycardia may be compensatory): use short-half-life esmolol (load 250–500 µg/kg, then 50–100 µg/kg/min) or withhold; assess cardiac function early with echo/PoCUS. If β-blockers are contraindicated (severe asthma): non-DHP calcium-channel blocker (diltiazem).',
      'Thionamide: PTU 500–1000 mg PO/NG/PR load, then 250 mg q4h (blocks T4→T3 conversion — a theoretical advantage; lowers T3 ~45% in 24 h) OR methimazole 60–80 mg/day divided (e.g., 20–30 mg q6h). JTA survey data show no mortality difference between them; rectal compounding is an option if NPO. Skip antithyroid drugs entirely if the storm is from destructive thyroiditis (ineffective).',
      'Iodine ≥1 hour AFTER the thionamide: SSKI 5 drops (0.25 mL, ~250 mg iodide) PO q6h, or Lugol solution 6–8 drops PO q6h. Avoid in amiodarone-induced thyrotoxicosis and iodine-induced storm; beware hidden iodine (CT contrast, amiodarone) early in treatment. Lithium carbonate is the fallback if iodine is contraindicated (monitor levels).',
      'Glucocorticoid: hydrocortisone 300 mg IV load then 100 mg IV q8h (alternative dexamethasone 2 mg IV q6h) — reduces T4→T3 conversion, inhibits hormone synthesis, and treats relative adrenal insufficiency; taper when improving and confirm adrenal recovery before stopping.',
      'Enterohepatic blockade: cholestyramine 4 g PO QID — binds thyroid hormone in the gut; useful adjunct in severe cases, when ATDs are contraindicated, or in exogenous thyroid hormone overdose.',
      'Supportive: acetaminophen 500–650 mg + cooling blankets/ice packs for fever — NEVER aspirin or NSAIDs (they displace T4 from binding proteins and raise free hormone); cautious IV crystalloid (patients are often volume-depleted); treat heart failure and arrhythmia; cultures + early antibiotics if infection is suspected.',
      'Salvage if no improvement in 24–48 h: therapeutic plasma exchange (1–1.5× plasma volume with FFP replacement, daily or q2–3 days) — consider it early with multi-organ or acute liver failure — then EMERGENCY THYROIDECTOMY (prepare with β-blocker + steroid + iodine + cholestyramine). Typical responders improve within 12–24 h of adequate therapy.',
    ],
    followUp: [
      'ICU-level monitoring until the crisis resolves (usually 1–3 days); monitor for AF, high- vs low-output failure, DIC, rhabdomyolysis, and hepatic failure.',
      'Transition to DEFINITIVE therapy once stabilized — radioactive iodine or near-total thyroidectomy for Graves disease, surgery for toxic nodular disease. Note radioactive iodine must be deferred after an iodine load, so surgery may be favored; pre-op preparation is β-blocker + glucocorticoid + iodine, typically after ~5–7 days of control.',
      'Close endocrine follow-up; identify and prevent recurrence of the precipitant.',
    ],
    pearls: [
      'Thionamide BEFORE iodine — US practice delays iodine ≥1 h; iodine given first feeds hormone synthesis (Jod-Basedow).',
      'Never aspirin or NSAIDs for the fever (they raise free T4/T3 via protein-binding displacement) — acetaminophen and active cooling.',
      'Long-acting propranolol in unrecognized low-output heart failure can cause cardiovascular collapse — use titratable esmolol or defer; do not reflexively block a compensatory tachycardia.',
      'Do not wait for TFTs, and do not titrate to TSH — it stays suppressed; use free T4/T3.',
      'Anchoring on "sepsis without a source" is the classic miss — send thyroid tests and run the storm bundle in parallel when suspicion is high; and do not miss apathetic thyrotoxicosis in the elderly.',
      'Jaundice and a falling level of consciousness are poor prognostic signs.',
    ],
    tables: [
      {
        title: 'Burch–Wartofsky Point Scale (thyroid storm)',
        columns: ['Parameter', 'Findings → points'],
        rows: [
          ['Temperature (°F)', '99–99.9 = 5 · 100–100.9 = 10 · 101–101.9 = 15 · 102–102.9 = 20 · 103–103.9 = 25 · ≥104 = 30'],
          ['CNS effects', 'Absent = 0 · Mild/agitation = 10 · Moderate (delirium, psychosis, extreme lethargy) = 20 · Severe (seizure, coma) = 30'],
          ['GI–hepatic', 'Absent = 0 · Moderate (diarrhea, nausea/vomiting, abdominal pain) = 10 · Severe (unexplained jaundice) = 20'],
          ['Heart rate (bpm)', '90–109 = 5 · 110–119 = 10 · 120–129 = 15 · 130–139 = 20 · ≥140 = 25'],
          ['Heart failure', 'Absent = 0 · Mild (pedal edema) = 5 · Moderate (bibasilar rales) = 10 · Severe (pulmonary edema) = 15'],
          ['Atrial fibrillation', 'Absent = 0 · Present = 10'],
          ['Precipitant history', 'Absent = 0 · Present = 10'],
        ],
        note: 'Sum every category: ≥45 highly suggestive of thyroid storm · 25–44 impending · <25 unlikely. More sensitive, less specific than the JTA criteria — sepsis with multi-organ failure can exceed 45, so treat on judgment.',
      },
      {
        title: 'JTA (Akamizu) criteria — TS1 / TS2',
        columns: ['Grade', 'Requirements'],
        rows: [
          ['TS1 (definite)', 'Thyrotoxicosis + ≥1 CNS manifestation + ≥1 of fever / tachycardia / CHF / GI-hepatic; OR thyrotoxicosis + ≥3 of those four categories'],
          ['TS2 (suspected)', 'Thyrotoxicosis + ≥2 of fever / tachycardia / CHF / GI-hepatic (no CNS); OR meets TS1 except TFTs unavailable, in a patient with known thyroid disease + exophthalmos or goiter'],
        ],
        note: 'Category cutoffs: CNS = restlessness → coma (Japan Coma Scale ≥1 or GCS ≤14); fever ≥38 °C; HR ≥130 bpm (including in AF); CHF = pulmonary edema, rales >half lung fields, cardiogenic shock, NYHA IV or Killip ≥III; GI/hepatic = nausea/vomiting/diarrhea or total bilirubin ≥3.0 mg/dL. Exclude features clearly attributable to another disease — when in doubt, attribute to storm.',
      },
      {
        title: 'Thyroid storm — agents and doses',
        columns: ['Target', 'Agent', 'Dose'],
        rows: [
          ['β-adrenergic', 'Propranolol (or esmolol if CHF / need titratability)', '60–80 mg PO q4–6h; IV 0.5–1 mg q2–5 min, max 10 mg. Esmolol: load 250–500 µg/kg, then 50–100 µg/kg/min'],
          ['Block synthesis', 'PTU', '500–1000 mg PO/NG/PR load, then 250 mg q4h'],
          ['Block synthesis (alt)', 'Methimazole', '60–80 mg/day divided (e.g., 20–30 mg q6h)'],
          ['Block release', 'SSKI or Lugol — ≥1 h AFTER thionamide', 'SSKI 5 drops (0.25 mL) q6h; Lugol 6–8 drops q6h'],
          ['Reduce conversion + cover adrenals', 'Hydrocortisone', '300 mg IV load, then 100 mg IV q8h (alt: dexamethasone 2 mg IV q6h)'],
          ['Enterohepatic blockade', 'Cholestyramine', '4 g PO QID'],
          ['Fever', 'Acetaminophen + cooling', '500–650 mg; NEVER aspirin/NSAIDs (raise free T4)'],
          ['Salvage (no response in 24–48 h)', 'TPE → emergency thyroidectomy', 'FFP replacement, 1–1.5× plasma volume; prepare surgery with β-blocker + steroid + iodine + cholestyramine'],
        ],
        note: 'Give the thionamide before iodine. PTU, propranolol, and glucocorticoid all additionally reduce peripheral T4→T3 conversion. If β-blockers are contraindicated (severe asthma), use diltiazem.',
      },
    ],
    references: [
      {
        label: '2016 American Thyroid Association Guidelines for Diagnosis and Management of Hyperthyroidism and Other Causes of Thyrotoxicosis',
        source: 'American Thyroid Association (Ross et al)',
        year: '2016',
        url: 'https://doi.org/10.1089/thy.2016.0229',
      },
      {
        label: '2016 Guidelines for the management of thyroid storm (First edition)',
        source: 'Japan Thyroid Association / Japan Endocrine Society (Satoh et al)',
        year: '2016',
        url: 'https://doi.org/10.1507/endocrj.EJ16-0336',
      },
      {
        label: 'Diagnostic criteria, clinical features, and incidence of thyroid storm based on nationwide surveys',
        source: 'Akamizu et al, Thyroid',
        year: '2012',
        url: 'https://pubmed.ncbi.nlm.nih.gov/22690898/',
      },
      {
        label: 'Life-threatening thyrotoxicosis: Thyroid storm (Burch–Wartofsky Point Scale)',
        source: 'Burch & Wartofsky, Endocrinol Metab Clin North Am',
        year: '1993',
        url: 'https://pubmed.ncbi.nlm.nih.gov/8325286/',
      },
    ],
    lastReviewed: '2026-08',
  },

  {
    id: 'myxedema-coma',
    name: 'Myxedema Coma',
    category: 'thyroid',
    summary: 'Decompensated severe hypothyroidism — the mirror image of thyroid storm: altered mentation, hypothermia, and a precipitant, usually infection, cold exposure, or sedatives in an older patient in winter. "Coma" is a misnomer (it need not be present); mortality is 20–50%. Treat empirically — and give steroids BEFORE thyroid hormone.',
    firstActions: [
      'Hydrocortisone 100 mg IV FIRST (then 100 mg q8h), BEFORE or simultaneous with any thyroid hormone — restoring metabolic rate in unrecognized adrenal insufficiency precipitates adrenal crisis (draw a random cortisol/ACTH first only if it will not delay).',
      'ICU admission with continuous cardiac monitoring; low threshold for intubation + mechanical ventilation (hypoventilation/CO2 narcosis). Avoid sedatives and opioids.',
      'Levothyroxine IV load 200–400 µg (use the lower end, ~100–200 µg, in elderly, low body weight, or CAD/arrhythmia history), then 50–100 µg IV daily until oral is tolerated.',
      'PASSIVE rewarming with blankets only — no active external rewarming (peripheral vasodilation causes shock).',
      'IV dextrose for hypoglycemia; cautious isotonic saline for hypotension (vasopressors if refractory — response is blunted until thyroid hormone is on board).',
      'Cultures + liberal empiric antibiotics until infection is excluded — fever and leukocytosis may be absent.',
    ],
    features: [
      'Classic triad: (1) altered mental status (somnolence → stupor → coma; sometimes psychosis — "myxedema madness"), (2) hypothermia / defective thermoregulation (verify the thermometer reads low temperatures; fever may be absent despite sepsis), (3) an identifiable precipitant.',
      'Cardiovascular: bradycardia, hypotension, low-voltage ECG with QT prolongation, pericardial effusion, and reduced cardiac output.',
      'Respiratory: hypoventilation with hypercapnia and hypoxia (depressed central drive plus respiratory-muscle weakness; worse with obesity) — a leading cause of death.',
      'Other: non-pitting (myxedematous) edema, macroglossia, dry coarse skin, delayed DTR relaxation, ileus, urinary retention.',
      'Precipitants: infection (especially pneumonia or urosepsis), cold exposure, sedatives/opioids/tranquilizers, diuretics, myocardial infarction, stroke, GI bleeding, heart failure, amiodarone, lithium, and non-adherence to levothyroxine.',
    ],
    diagnosis: [
      'Clinical, in a hypothyroid context — do not wait for labs to begin treatment. The typical patient is an elderly woman in winter with a history of hypothyroidism, thyroidectomy, or radioactive iodine.',
      'Labs: a markedly elevated TSH with low free T4 (primary); a low or inappropriately normal TSH with low free T4 points to a CENTRAL cause or non-thyroidal illness (look for panhypopituitarism).',
      'Supporting findings: hyponatremia, hypoglycemia, anemia, elevated CK, hypercholesterolemia, elevated creatinine, and hypercapnia on blood gas.',
      'The Popoveniuc diagnostic score (table) can support the diagnosis — ≥60 highly suggestive — but it derives from a small retrospective cohort and was never prospectively validated; treat on clinical grounds.',
      'ALWAYS cover for coexisting adrenal insufficiency, particularly with central hypothyroidism or autoimmune polyglandular disease.',
    ],
    management: [
      'Hydrocortisone 100 mg IV q8h (range 50–100 mg q6–8h) FIRST — an ATA strong recommendation — continued until adrenal insufficiency is excluded (formal cosyntropin testing later).',
      'Levothyroxine (T4) IV load 200–400 µg (ATA strong recommendation; FDA label 300–500 µg), then maintenance ≈1.6 µg/kg/day × 75% while IV — practically 50–100 µg IV daily — until oral intake resumes, then 1.6 µg/kg PO daily.',
      'Optional liothyronine (T3), a weak recommendation: load 5–20 µg IV (5–10 µg if elderly or cardiac), then 2.5–10 µg IV q8h until clearly recovering — rationale is impaired T4→T3 conversion in severe illness. AVOID high doses: high serum T3 during treatment is associated with mortality (stay ≤75 µg/day; avoid an initial T4 load >500 µg).',
      'Airway and breathing: low threshold for intubation and mechanical ventilation for hypercapnia; avoid sedatives, opioids, and tranquilizers (prolonged clearance — they precipitate and prolong coma).',
      'Hypothermia: PASSIVE rewarming only. Hypotension: cautious crystalloid (aggressive fluids can unmask CHF and worsen hyponatremia); norepinephrine if refractory.',
      'Hyponatremia is usually dilutional (↑ADH, ↓GFR): isotonic saline + mild fluid restriction; reserve hypertonic 3% saline (100 mL boluses) for severe symptomatic cases, within standard correction limits. Hypoglycemia: IV dextrose.',
      'Precipitant search: blood/sputum/urine cultures, liberal empiric antibiotics until infection is excluded, medication review (sedatives, amiodarone, lithium, diuretics), and investigate GI bleed, stroke, and MI.',
    ],
    followUp: [
      'ICU mandatory; monitor volume status, sodium, glucose, ABG (CO2), urine output, and daily FREE T4 and T3 (not TSH). Expect hemodynamic and mental-status improvement over 24–72 h.',
      'If the patient remains comatose or vital functions have not improved at 24 h on T4 alone, ADD IV T3 (if not already started).',
      'Convert IV to oral levothyroxine when awake and absorbing (PO dose ≈ IV dose ÷ 0.75); determine why decompensation occurred (missed doses, intercurrent illness) and confirm primary vs central cause.',
    ],
    pearls: [
      'Hydrocortisone BEFORE levothyroxine — the classic fatal error is thyroid hormone first, precipitating adrenal crisis.',
      'PASSIVE rewarming only — active external rewarming triggers vasodilatory collapse.',
      'The patient often cannot mount fever or tachycardia — "sepsis without fever"; keep the antibiotic threshold low.',
      'Overly aggressive dosing kills: avoid T4 loads >500 µg and T3 >75 µg/day; go low in the elderly and in coronary disease.',
      'Hypoventilation with CO2 retention is a leading cause of death — watch the respiratory status and intubate early.',
      'Do not rely on TSH (it can be normal or low in central disease or non-thyroidal illness), and do not withhold treatment pending labs. Mortality remains high (~20–50%; US national data 2016–2020 confirm it, with MI and sepsis worsening outcomes).',
    ],
    tables: [
      {
        title: 'Popoveniuc myxedema coma diagnostic score',
        columns: ['Domain', 'Findings → points'],
        rows: [
          ['Temperature', '>35 °C = 0 · 32–35 °C = 10 · <32 °C = 20'],
          ['CNS', 'Somnolent/lethargic = 10 · Obtunded = 15 · Stupor = 20 · Coma/seizures = 30'],
          ['GI', 'Anorexia/abdominal pain/constipation = 5 · Decreased motility = 15 · Paralytic ileus = 20'],
          ['Precipitating event', 'Present = 10'],
          ['Cardiovascular', 'Bradycardia 50–59 / 40–49 / <40 = 10 / 20 / 30 · Other ECG changes = 10 · Pericardial/pleural effusion = 10 · Pulmonary edema = 15 · Cardiomegaly = 15 · Hypotension = 20'],
          ['Metabolic', 'Hyponatremia = 10 · Hypoglycemia = 10 · Hypoxemia = 10 · Hypercarbia = 10 · Decreased GFR = 10'],
        ],
        note: '≥60 diagnostic/highly suggestive · 25–59 supportive · <25 unlikely (≥60 was 100% sensitive, 85.7% specific in the derivation cohort). Caveat: derived from a small retrospective cohort (n=21), never prospectively validated — treat on clinical grounds, not the number.',
      },
      {
        title: 'Thyroid storm vs myxedema coma',
        columns: ['Feature', 'Thyroid storm', 'Myxedema coma'],
        rows: [
          ['Temperature', 'Hyperthermia (often >40 °C)', 'Hypothermia (often <35 °C)'],
          ['Heart rate', 'Tachycardia / atrial fibrillation', 'Bradycardia'],
          ['Mental status', 'Agitation, delirium, psychosis', 'Lethargy, obtundation, coma'],
          ['Common precipitant', 'Infection, surgery, iodine load/amiodarone, ATD withdrawal', 'Infection, cold, sedatives, missed T4'],
          ['Give steroids?', 'Yes — reduces T4→T3 conversion + relative adrenal insufficiency', 'Yes — cover adrenals BEFORE thyroid hormone'],
          ['Mortality', '10–30%', '20–50%'],
        ],
        note: 'Both are clinical diagnoses treated empirically, and both receive glucocorticoid — for different reasons.',
      },
    ],
    references: [
      {
        label: 'Guidelines for the Treatment of Hypothyroidism',
        source: 'American Thyroid Association Task Force (Jonklaas et al), Thyroid',
        year: '2014',
        url: 'https://doi.org/10.1089/thy.2014.0028',
      },
      {
        label: 'Myxedema and Coma (Severe Hypothyroidism)',
        source: 'Endotext (Wiersinga)',
        year: '2018',
        url: 'https://www.ncbi.nlm.nih.gov/books/NBK279007/',
      },
      {
        label: 'A diagnostic scoring system for myxedema coma',
        source: 'Popoveniuc et al, Endocrine Practice',
        year: '2014',
        url: 'https://doi.org/10.4158/EP13460.OR',
      },
      {
        label: 'Clinical features and outcomes of myxedema coma in patients hospitalized for hypothyroidism: analysis of the United States national inpatient sample',
        source: 'Chen et al, Thyroid',
        year: '2024',
        url: 'https://doi.org/10.1089/thy.2023.0559',
      },
      {
        label: 'Levothyroxine Sodium Injection [prescribing information]',
        source: 'FDA label',
        year: '2021',
        url: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2021/214253s000lbl.pdf',
      },
    ],
    lastReviewed: '2026-08',
  },

  {
    id: 'thyrotoxic-periodic-paralysis',
    name: 'Thyrotoxic Periodic Paralysis (TPP)',
    category: 'thyroid',
    summary: 'Acute hypokalemic paralysis triggered by thyrotoxicosis — a sudden intracellular potassium SHIFT, not a true deficit. Classically young Asian or Hispanic/Latino men after a carbohydrate load, alcohol, or exercise-then-rest; attacks stop completely once the patient is euthyroid. Propranolol, not potassium, is the key acute therapy.',
    firstActions: [
      'Continuous cardiac/telemetry monitoring and an ECG (U waves, ST depression, QT/QU prolongation, arrhythmia risk); check K, phosphate, and magnesium.',
      'Give a NON-SELECTIVE β-blocker — the key acute therapy: propranolol 20–40 mg PO q6h (severe attacks up to 3–4 mg/kg/day divided; IV propranolol 1 mg q10 min, max ~10 mg, if PO not feasible). It blunts adrenergic Na⁺/K⁺-ATPase stimulation and aborts paralysis WITHOUT rebound hyperkalemia.',
      'Replete potassium only cautiously, for severe weakness, respiratory involvement, or arrhythmia: oral KCl 15–30 mEq aliquots (typical total 60–120 mEq aborts most attacks); if IV is needed, KCl ≤10 mEq/h in NORMAL SALINE — never dextrose — with continuous ECG monitoring.',
      'Remove provocateurs: NO glucose-containing IV fluids, no high-carbohydrate load, no alcohol, no β-agonists, no steroids acutely — glucose drives insulin, which drives potassium back into cells.',
      'Replete magnesium if low (facilitates K retention and lowers arrhythmia risk); recheck potassium q2–4h during and after repletion — rebound hyperkalemia strikes ~40% of repleted patients.',
    ],
    features: [
      'Sudden, painless, symmetric flaccid paralysis — proximal > distal, legs first, often waking the patient from sleep or striking in the early morning — with hyporeflexia, lasting hours to days.',
      'Demographics: predominantly young men aged 20–40 of Asian or Hispanic/Latino ancestry (but it occurs in all groups), frequently with previously UNDIAGNOSED or subtle thyrotoxicosis (Graves disease most common).',
      'Triggers that drive potassium into cells: a high-carbohydrate meal, alcohol, strenuous exercise followed by rest, stress, glucose/insulin loads, corticosteroids, and β-agonists — mediated by insulin/adrenergic stimulation of Na⁺/K⁺-ATPase, whose activity thyroid hormone upregulates.',
      'Sensation and consciousness are preserved; respiratory and bulbar muscles are usually spared but are the life threat when involved.',
      'Signs of thyrotoxicosis (tachycardia, tremor, goiter) may be present but are often subtle or absent at the moment of paralysis.',
    ],
    diagnosis: [
      'Hypokalemia during the attack, often profound (K commonly <3.0, sometimes <2.0 mEq/L) — but WITHOUT total-body potassium depletion: the potassium is shifted intracellularly, not lost, so LOW urine potassium supports a shift rather than renal wasting.',
      'Biochemical thyrotoxicosis: suppressed TSH with elevated or high-normal free T4/T3 (most often Graves disease); check TSH, free T4, free T3 (and later TRAb/TSI) in EVERY young man with hypokalemic paralysis.',
      'Hypophosphatemia and (mild) hypomagnesemia commonly accompany it — also shift-driven.',
      'ECG for hypokalemic changes (U waves, ST depression, QT/QU prolongation) and arrhythmia.',
      'Separate it from familial (non-thyrotoxic) hypokalemic periodic paralysis — FHHPP starts younger (<20 y), runs in families, and the patient is euthyroid (table). Propranolol helps TPP but is NOT useful in FHHPP.',
    ],
    management: [
      'Non-selective β-blockade first: propranolol 20–40 mg PO q6h (severe attacks up to 3–4 mg/kg/day PO divided; a single 3 mg/kg PO dose aborted attacks in a small study — Lin & Lin 2001; IV 1 mg q10 min to ~10 mg if PO not feasible). It reverses the shift AND treats the underlying adrenergic thyrotoxic state.',
      'Cautious potassium repletion: mild–moderate attacks → oral KCl 15–30 mEq aliquots (total 60–120 mEq usually suffices); severe (respiratory involvement, arrhythmia, K <2.5) → IV KCl ≤10 mEq/h in normal saline (central or split peripheral lines) with continuous ECG monitoring and K checks q2–4h.',
      'Cap the cumulative dose (~≤90 mEq/24 h unless arrhythmia) — rebound hyperkalemia occurs in ~40% of repleted patients as potassium shifts back out of cells when the attack resolves.',
      'Replete magnesium if low; admit to telemetry for any attack with K <3.0, ECG changes, respiratory/bulbar involvement, or need for IV potassium; assess respiratory muscle strength (NIF/vital capacity) in severe attacks.',
      'Treat the underlying thyrotoxicosis — antithyroid drug (methimazole or PTU per standard care), then radioiodine or surgery — with a non-selective β-blocker bridge until euthyroid. This is the ONLY way to prevent recurrence.',
    ],
    followUp: [
      'Render the patient euthyroid — TPP does not recur in the euthyroid state, and chronic potassium supplements become unnecessary once the thyroid is controlled.',
      'Counsel on triggers (high-carbohydrate meals, alcohol, strenuous exercise followed by rest) until euthyroid.',
      'Watch potassium during recovery for late rebound hyperkalemia; arrange outpatient thyroid workup (TSH, free T4, free T3, TRAb/TSI) and a definitive management plan with endocrinology.',
    ],
    pearls: [
      'The potassium is SHIFTED, not lost — total-body potassium is normal; replete sparingly and anticipate rebound hyperkalemia in ~40%.',
      'NEVER mix potassium in dextrose-containing fluids — glucose → insulin → deeper shift; use normal saline and small aliquots, with propranolol as the anchor therapy.',
      'Propranolol is the safest way to break the paralysis; restoring euthyroidism is the cure — discharging without definitive thyrotoxicosis treatment guarantees recurrence.',
      'First attack may precede any hyperthyroid symptoms — check thyroid function in every young man with hypokalemic paralysis.',
      'Avoid acetazolamide (worsens hypokalemia), glucose loads, and β-agonists; remember propranolol does NOT help familial hypokalemic periodic paralysis.',
    ],
    tables: [
      {
        title: 'Thyrotoxic vs familial hypokalemic periodic paralysis',
        columns: ['Feature', 'Thyrotoxic PP', 'Familial hypokalemic PP'],
        rows: [
          ['Thyroid state', 'Thyrotoxic (suppressed TSH)', 'Euthyroid'],
          ['Inheritance', 'Sporadic / acquired (susceptibility variants, e.g. Kir2.6/KCNJ18)', 'Autosomal dominant channelopathy'],
          ['Typical onset', '20s–40s', 'Childhood / teens (<20 y)'],
          ['Demographics', 'Asian / Hispanic-Latino men', 'Family history, variable'],
          ['Cure', 'Treat the thyrotoxicosis — curable', 'No cure; avoid triggers'],
          ['Acute therapy', 'Propranolol (aborts the shift); cautious K in saline', 'Cautious K; acetazolamide in some — propranolol NOT useful'],
        ],
        note: 'Both present with episodic hypokalemic paralysis from a transcellular potassium shift; only TPP is curable — by restoring euthyroidism.',
      },
    ],
    references: [
      {
        label: 'Analytic review: Thyrotoxic periodic paralysis: a review',
        source: 'Pothiwala & Levine, Journal of Intensive Care Medicine',
        year: '2010',
        url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Pothiwala+Levine+thyrotoxic+periodic+paralysis',
      },
      {
        label: 'A 10-year analysis of thyrotoxic periodic paralysis in 135 patients: focus on symptomatology and precipitants',
        source: 'Chang et al, European Journal of Endocrinology',
        year: '2013',
        url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Chang+10-year+analysis+thyrotoxic+periodic+paralysis+135',
      },
      {
        label: 'Propranolol rapidly reverses paralysis, hypokalemia, and hypophosphatemia in thyrotoxic periodic paralysis',
        source: 'Lin & Lin, American Journal of Kidney Diseases',
        year: '2001',
        url: 'https://pubmed.ncbi.nlm.nih.gov/11228188/',
      },
      {
        label: 'Hypokalemia (periodic paralysis section)',
        source: 'EMCrit / IBCC (Farkas)',
        year: '2025',
        url: 'https://emcrit.org/ibcc/hypokalemia/',
      },
    ],
    lastReviewed: '2026-08',
  },

  // ───────────────────────── CATECHOLAMINE ─────────────────────────
  {
    id: 'pheo-crisis',
    name: 'Pheochromocytoma Crisis',
    category: 'catecholamine',
    summary: 'A catecholamine surge from a pheochromocytoma or paraganglioma causing severe, labile hypertension and end-organ damage — and sometimes paradoxical shock. The cardinal rule: α-blockade must precede β-blockade, or unopposed α-stimulation precipitates a hypertensive crisis. Target SBP <140 mmHg within the first hour.',
    firstActions: [
      'ICU with continuous arterial BP monitoring (arterial line) + telemetry; target SBP <140 mmHg within the first hour — pheo crisis is an exception to the usual ≤25% MAP-reduction rule.',
      'α-blockade FIRST: phentolamine 2.5–5 mg IV bolus at 1 mg/min, repeated q3–5 min PRN (or a titratable nicardipine infusion starting 5 mg/h; clevidipine is an alternative). Prefer short-acting, titratable IV agents — hemodynamics are labile.',
      'Add magnesium sulfate as an adjunct: load 40–60 mg/kg IV (max 6 g) over ~10 min, then 1–2 g/h infusion — it blocks catecholamine release, α-receptors, and L-type calcium channels (first-line agent in pregnancy).',
      'β-blockade (esmolol) ONLY after α-blockade is established, for catecholamine tachyarrhythmia — never labetalol monotherapy, never IV hydralazine.',
      'Volume repletion with isotonic crystalloid — chronic vasoconstriction leaves these patients volume-DEPLETED; avoid diuretics unless there is frank heart failure.',
      'If hypotension or shock supervenes, give a 1 L crystalloid bolus first, then VASOPRESSIN as the pressor of choice (it is not adrenoceptor-dependent).',
    ],
    features: [
      'The classic triad — episodic pounding headache, diaphoresis, and palpitations/tachycardia — with paroxysmal severe hypertension, ± pallor, anxiety, and hyperglycemia.',
      'End-organ injury: hypertensive encephalopathy, stroke, ACS / catecholamine (takotsubo-like) cardiomyopathy, flash pulmonary edema, aortic dissection, and AKI — pheochromocytoma multisystem crisis.',
      'Paradoxical HYPOTENSION/shock can dominate (adrenergic phenotype, dopamine secretion, post-α-blockade, catecholamine cardiomyopathy) — 23–30% of crisis patients develop shock during treatment.',
      'Triggers: tumor manipulation or surgery, anesthesia induction, drugs (metoclopramide, GLUCOCORTICOIDS, sympathomimetics, TCAs, unopposed β-blockers, some opioids), tyramine with MAOIs, and micturition (bladder paraganglioma).',
      'Suspect it in young, refractory, or paroxysmal hypertension, adrenal incidentaloma, and hereditary syndromes (MEN2, VHL, NF1, SDHx).',
    ],
    diagnosis: [
      'Biochemical confirmation with plasma free metanephrines or 24-h urinary fractionated metanephrines — draw during or after the crisis (levels are markedly elevated); do NOT delay crisis treatment for the result.',
      'Imaging (CT or MRI) localizes AFTER stabilization — never image first, and NEVER biopsy an adrenal mass.',
      'In an acute crisis the diagnosis may already be known or made clinically; treat the hemodynamics while confirming.',
      'Check metanephrines in unexplained labile blood pressure or shock — hypotensive presentations are the ones that get missed.',
    ],
    management: [
      'Acute control with short-acting titratable IV agents (table): phentolamine 2.5–5 mg IV boluses (onset 1–2 min, duration 10–30 min; competitive blocker — breakthrough hypertension possible, avoid in ischemic coronary disease), nicardipine 5 mg/h titrated by 2.5 mg/h q5 min to max 15 mg/h, or clevidipine (1–2 mg/h, double q90 s, max 32 mg/h). Sodium nitroprusside (0.5–1.5 µg/kg/min) is the preferred nitrate; magnesium sulfate is the adjunct (and first-line in pregnancy).',
      'Rate control ONLY after α-blockade is established: esmolol (bolus 500 µg/kg over 1 min, then 25–100 µg/kg/min infusion) for catecholamine tachyarrhythmias; alternatives IV metoprolol, amiodarone, or lidocaine for ventricular arrhythmia. A β-blocker given first removes β2-mediated vasodilation and leaves unopposed α-vasoconstriction → hypertensive crisis and pulmonary edema.',
      'Hypotension/shock during crisis or treatment: first exclude hypovolemia with a 1 L crystalloid bolus (volume-responsive hypotension is most common); if persistent, VASOPRESSIN is the pressor of choice; echo to assess catecholamine cardiomyopathy; consider mechanical circulatory support in refractory cardiogenic shock. Co-manage with endocrinology + cardiology.',
      'Transition to oral once controlled: doxazosin 1–2 mg BID titrated up as IV agents are weaned (max 32 mg/day), or phenoxybenzamine 10 mg BID (full non-competitive blockade takes ~5 days — it must never be sole acute therapy); after 2–3 days of oral α-blockade, add a β-blocker (metoprolol succinate 25–50 mg, titrated) if tachycardia persists. High-sodium diet + liberal fluids to re-expand volume.',
      'Definitive treatment is SURGICAL resection after adequate α-blockade (typically 7–14 days of preparation; targets ~<130/80 supine, SBP >90 standing, HR 60–80) by an experienced endocrine surgery/anesthesia team; metyrosine (250 mg once–twice daily, titrate to max 3–4 g/day) is an adjunct for refractory cases.',
    ],
    followUp: [
      'Complete biochemical confirmation and localization; refer for surgery with proper preoperative blockade — an unblocked patient is an intraoperative crisis waiting to happen.',
      'Genetic counseling and testing (a large fraction are hereditary — SDHx, VHL, RET/MEN2, NF1); lifelong biochemical surveillance for recurrence or metastasis.',
      'Monitor for hypotension after each escalation of therapy and after tumor removal; endocrinology + surgery + anesthesia co-management from the start.',
    ],
    pearls: [
      'NEVER give a β-blocker before α-blockade — and labetalol MONOTHERAPY counts as unopposed β-blockade (its IV α:β ratio is only 1:7). This is the single most important rule.',
      'Avoid IV hydralazine (cardiostimulatory) and routine diuretics (patients are intravascularly volume-depleted — fluids, not diuretics, unless heart failure).',
      'Drugs that can provoke a crisis: glucocorticoids, metoclopramide, sympathomimetics, opioid boluses (morphine), unopposed β-blockers, and unprepared anesthesia — and adrenal biopsy.',
      'The patient is volume-CONTRACTED despite hypertension; expect hypotension after α-blockade and after tumor removal, and volume-load beforehand.',
      'Do not anchor on hypertension — adrenergic tumors and catecholamine cardiomyopathy can present with hypotension or shock; vasopressin, not catecholamine pressors, is the agent of choice.',
      'A pheochromocytoma crisis masquerades as ACS, sepsis, or thyroid storm — consider it whenever severe hypertension is paroxysmal or labile.',
    ],
    tables: [
      {
        title: 'Acute blood-pressure control in pheochromocytoma crisis',
        columns: ['Agent', 'Dose', 'Notes'],
        rows: [
          ['Phentolamine (non-selective α1/α2 blocker)', 'Bolus 2.5–5 mg IV at 1 mg/min, repeat q3–5 min PRN (2.5–15 mg); infusion 20–100 mg/h', 'Onset 1–2 min, duration 10–30 min; competitive blocker — breakthrough possible; avoid in ischemic coronary disease'],
          ['Nicardipine (dihydropyridine CCB)', 'Start 5 mg/h IV, ↑2.5 mg/h q5 min PRN, max 15 mg/h', 'Most extensively used CCB for PPGL crisis; onset 1–5 min'],
          ['Clevidipine', 'Start 1–2 mg/h, double q90 s PRN, max 32 mg/h', 'Very titratable; caution with egg/soy allergy'],
          ['Sodium nitroprusside', '0.5–1.5 µg/kg/min start (max 10 µg/kg/min for ≤10 min)', 'Preferred nitrate in PPGL; cyanide toxicity with prolonged/high-dose use'],
          ['Magnesium sulfate (adjunct; first-line in pregnancy)', 'Load 40–60 mg/kg IV (max 6 g) over ~10 min, then 1–2 g/h', 'Blocks catecholamine release, α-receptors, L-type Ca channels; caution in neuromuscular disease'],
          ['Esmolol — ONLY after α-blockade established', 'Bolus 500 µg/kg over 1 min; infusion 25–100 µg/kg/min, titrate to 300 µg/kg/min PRN', 'For catecholamine tachyarrhythmias; NEVER labetalol monotherapy, NEVER hydralazine'],
        ],
        note: 'Continuous infusions are favored over boluses (labile hemodynamics). Urapidil (25–50 mg IV bolus; no reflex tachycardia) is a European alternative not available in the US. Hypotension: 1 L crystalloid bolus first, then vasopressin. Transition: doxazosin 1–2 mg BID titrated (max 32 mg/day) as IV agents wean; add a β-blocker only after 2–3 days of oral α-blockade; definitive cure is surgical resection after 7–14 days of blockade.',
      },
    ],
    references: [
      {
        label: 'Catecholamine-induced hypertensive crises: current insights and management',
        source: 'Nazari et al, Lancet Diabetes & Endocrinology',
        year: '2023',
        url: 'https://doi.org/10.1016/S2213-8587(23)00256-5',
      },
      {
        label: 'Pheochromocytoma and Paraganglioma: An Endocrine Society Clinical Practice Guideline',
        source: 'Endocrine Society (Lenders et al)',
        year: '2014',
        url: 'https://doi.org/10.1210/jc.2014-1498',
      },
      {
        label: 'Update on clinical characteristics in the evaluation of phaeochromocytoma and paraganglioma',
        source: 'Sbardella et al, Best Practice & Research Clinical Endocrinology & Metabolism',
        year: '2025',
        url: 'https://www.sciencedirect.com/science/article/pii/S1521690X24001295',
      },
      {
        label: 'Hypertensive Crisis',
        source: 'StatPearls (Peaston et al)',
        year: '2024',
        url: 'https://www.ncbi.nlm.nih.gov/books/NBK507701/',
      },
    ],
    lastReviewed: '2026-08',
  },
]
