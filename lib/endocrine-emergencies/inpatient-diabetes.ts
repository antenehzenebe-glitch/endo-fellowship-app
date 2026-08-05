// lib/endocrine-emergencies/inpatient-diabetes.ts
// Fellows' Survival Guide — INPATIENT DM cluster: ward/ICU glycemic targets
// and insulin regimens, steroids/nutrition support/non-insulin agents, and
// perioperative care & discharge planning.
// EDUCATIONAL QUICK-REFERENCE ONLY. No PHI. See types.ts for the full notice.
//
// Guideline basis (reconciled 2026-08): ADA Standards of Care in Diabetes—2026
// §16 "Diabetes Care in the Hospital" (released December 2025 — adds the new
// perioperative Recs 16.14/16.15 and updates discharge Rec 16.18), the 2024
// ADA/EASD/JBDS/AACE/DTS hyperglycemic-crises consensus (IV→SC transition
// data), and JBDS-IP 08 (steroid hyperglycemia, rev. Jan 2023). See
// `references` on each topic for the exact citations.

import type { Emergency } from './types'

export const INPATIENT_DIABETES_TOPICS: Emergency[] = [
  {
    id: 'inpatient-targets-insulin',
    name: 'Inpatient Diabetes Management — Targets & Insulin Regimens (ADA 2026)',
    category: 'inpatient',
    summary: 'The core ward and ICU playbook from ADA Standards of Care 2026 §16: A1C on admission, a treatment threshold of 180 mg/dL, targets of 140–180 (ICU) and 100–180 (ward), basal-bolus instead of sliding scale, and a safe IV→SC transition. Master this card and you answer most inpatient diabetes pages.',
    firstActions: [
      'State the diabetes type on admission and check an A1C in every patient with diabetes or any glucose >140 mg/dL who has no result in the prior 3 months (Rec 16.1) — an A1C ≥6.5% means the diabetes predated the admission rather than being pure stress hyperglycemia.',
      'Order through validated CPOE order sets with weight-based dosing and titration guidance — never free-text insulin orders (Rec 16.2) — and consult the diabetes/glucose management team when available (Rec 16.3).',
      'Set the target by location: ICU 140–180 mg/dL (Rec 16.5a); non-ICU ward 100–180 mg/dL (Rec 16.5b).',
      'Start or intensify therapy for PERSISTENT hyperglycemia ≥180 mg/dL confirmed on two occasions within 24 h (Recs 16.4a/b) — not for a single 210.',
      'Match the insulin regimen to nutrition and acuity: eating → basal + prandial + correction (Rec 16.9); NPO/poor intake → basal + correction (Rec 16.8b); critically ill → continuous IV insulin infusion (Rec 16.8a). Correction-only ("sliding scale") is discouraged (Rec 16.10).',
    ],
    features: [
      'Assess diabetes self-management knowledge and behaviors on admission, and teach during the stay — especially when the regimen is changing; discharge success is built on the ward.',
      'Review the whole picture daily: glucose trajectory, nutritional intake, glucocorticoids/pressors, renal function, and illness severity — the regimen written on day 1 is almost never right on day 3.',
      'Fasting glucose <100 mg/dL predicts hypoglycemia within the next 24 h — reduce basal insulin preemptively.',
      'Looser targets (up to 250 mg/dL) are acceptable in terminal illness, advanced kidney failure/dialysis, high hypoglycemia risk, or very labile glucose — the goal there is avoiding symptomatic extremes, not hitting a number.',
      'Ward goals translate practically to fasting <140 mg/dL and random <180 mg/dL; tighter individualized goals only if achievable without significant hypoglycemia.',
    ],
    diagnosis: [
      'Inpatient hyperglycemia = any glucose >140 mg/dL. Admission A1C ≥6.5% suggests diabetes preceded hospitalization; a normal A1C with high glucose points to stress hyperglycemia — both are still treated at the ≥180 mg/dL threshold.',
      'Monitoring cadence: POC glucose before meals and at bedtime if eating; q4–6h if NPO or on continuous feeds; hourly while on an IV insulin infusion.',
      'CGM: patients on a personal CGM may continue it in hospital when clinically appropriate (expanded discussion in the 2026 Standards) — confirm with POC glucose for insulin-dosing decisions, discrepancies, or critical values.',
      'Insulin pumps / AID systems: continue only if the patient is alert and able to self-manage, has stable intake and supplies, and the pump settings are documented in the chart; otherwise switch to SC basal-bolus (or an IV infusion if critically ill).',
      'Hypoglycemia severity (Levels 1–3) is defined in the Hypoglycemia card — any glucose <70 mg/dL on the ward must trigger a treatment-plan review (Rec 16.13).',
    ],
    management: [
      'Critically ill (ICU): continuous IV regular-insulin infusion through a validated written or computerized protocol is the standard (Rec 16.8a) — target 140–180 mg/dL. If the patient eats while on the drip, add SC rapid-acting prandial coverage to smooth infusion-rate swings and hypoglycemia risk.',
      'Non-ICU, eating: basal + prandial + correction (Rec 16.9). Starting TDD ≈0.3–0.5 U/kg/day — use the lower end (0.2–0.3) for elderly, frail, CKD, or insulin-naive patients; higher for insulin resistance (obesity, steroids, infection). Split ~50% basal (glargine q24h, or detemir/degludec) / ~50% prandial rapid-acting divided across meals.',
      'Non-ICU, NPO or poor intake: basal + correction (Rec 16.8b) — NEVER stop basal insulin in type 1 diabetes, even when NPO (DKA can recur within hours).',
      'Correction insulin alone (sliding scale) is discouraged for most patients (Rec 16.10): it is purely reactive, treats hyperglycemia after it happens, and is linked to more hypo- AND hyperglycemia than scheduled regimens.',
      'Adjust daily, proactively: fold the previous day\'s correction and prandial totals into the next day\'s scheduled doses; change one component at a time with a stated reason.',
      'Hypoglycemia system (Recs 16.12–16.13): a nurse-initiated protocol treats any glucose <70 mg/dL immediately, episodes are documented and tracked for quality improvement, and the plan is revised after every value <70 — embed hypoglycemia treatment inside all insulin and infusion orders.',
    ],
    followUp: [
      'IV → SC transition: give SC basal insulin 2 h BEFORE stopping the infusion (2–4 h overlap when recovering from DKA/HHS) to prevent rebound hyperglycemia and recurrent ketosis.',
      'Early basal (glargine 0.15–0.3 U/kg SC alongside the infusion) shortens drip duration and length of stay without more hypoglycemia — especially valuable in type 1 diabetes.',
      'Set the transition TDD from the home regimen if it was adequate, weight-based dosing, or the stable infusion rate over the prior 6–8 h extrapolated to 24 h (then use ~70–80%).',
      'Cross-reference the DKA, euglycemic DKA, HHS, and Hypoglycemia cards in this guide for the emergency states; see the Perioperative & Discharge card for the new 2026 recommendations and the hand-off home.',
    ],
    pearls: [
      'A patient who needed correction doses yesterday needs scheduled insulin today — correction-only prescribing is the most common inpatient diabetes error.',
      'Never hold basal insulin in type 1 diabetes for NPO status, procedures, or a "normal" glucose.',
      'The admission A1C is both a diagnostic test (new vs pre-existing diabetes) and a discharge-planning tool — a high A1C means the home regimen was failing before this admission.',
      'Fasting <100 mg/dL on the ward is tomorrow\'s hypoglycemia — cut the basal tonight.',
      'Glucose up to 250 mg/dL can be acceptable at the end of life or on dialysis; the target shifts to symptom avoidance.',
    ],
    tables: [
      {
        title: 'Glycemic targets by clinical setting (ADA 2026 §16)',
        columns: ['Setting', 'Glycemic target', 'Notes'],
        rows: [
          ['ICU / critically ill', '140–180 mg/dL (7.8–10.0 mmol/L)', 'Rec 16.5a (A); tighter 110–140 only in selected patients (e.g. cardiac surgery) if achievable without hypoglycemia'],
          ['Non-ICU ward', '100–180 mg/dL (5.6–10.0 mmol/L)', 'Rec 16.5b (B); practically fasting <140, random <180'],
          ['Perioperative (NEW 2026)', '100–180 mg/dL', 'Rec 16.15 — before, during, and after surgery'],
          ['Treatment threshold', '≥180 mg/dL ×2 within 24 h', 'Recs 16.4a/b — the trigger to start or intensify insulin'],
          ['Terminally ill / advanced CKD / high hypo risk', 'Individualized; up to 250 acceptable', 'Avoid symptomatic hyper- and hypoglycemia'],
        ],
        note: 'Start from these defaults, then individualize for nutrition, steroids, pressors, renal function, and illness trajectory.',
      },
      {
        title: 'Building the subcutaneous basal-bolus regimen',
        columns: ['Component', 'How to dose', 'Notes'],
        rows: [
          ['Total daily dose (TDD)', '0.3–0.5 U/kg/day to start', '0.2–0.3 U/kg if elderly/frail/CKD/insulin-naive; higher with obesity, steroids, infection'],
          ['Basal (~50% TDD)', 'Glargine q24h (or detemir/degludec)', 'Never hold in type 1, even NPO'],
          ['Prandial (~50% TDD)', 'Rapid-acting analog divided before meals', 'Hold if the meal is not eaten; match to carbohydrate intake'],
          ['Correction', 'Rapid-acting per sensitivity scale, AC/HS', 'Adjunct to — never a substitute for — scheduled insulin'],
          ['NPO regimen', 'Basal + correction only', 'Rec 16.8b; zero the prandial, keep the basal'],
          ['Daily titration', 'Fold yesterday\'s prandial + correction totals into today\'s scheduled doses', 'Proactive beats reactive'],
        ],
        note: 'Dose reductions for CKD are real: lower insulin clearance — start low and titrate to pattern.',
      },
      {
        title: 'IV → SC insulin transition rules',
        columns: ['Step', 'Rule'],
        rows: [
          ['Basal overlap', 'Give SC basal 2 h before stopping the drip (2–4 h for DKA/HHS)'],
          ['Early basal option', 'Glargine 0.15–0.3 U/kg alongside the infusion shortens drip duration and rebound hyperglycemia'],
          ['TDD from the drip', 'Stable rate over the prior 6–8 h → extrapolate to 24 h → take ~70–80% as TDD'],
          ['TDD alternatives', 'Home regimen (if previously adequate) or weight-based 0.3–0.5 U/kg/day'],
          ['After transition', 'Glucose q4–6h and titrate; resume prandial doses with the first meal'],
        ],
        note: 'The 2-hour overlap exists because IV regular insulin\'s effect dissipates within minutes of stopping the drip.',
      },
    ],
    references: [
      {
        label: '16. Diabetes Care in the Hospital: Standards of Care in Diabetes—2026',
        source: 'American Diabetes Association — Diabetes Care',
        year: '2026',
        url: 'https://diabetesjournals.org/care/article/49/Supplement_1/S339/163925/16-Diabetes-Care-in-the-Hospital-Standards-of-Care',
      },
      {
        label: '16. Diabetes Care in the Hospital: Standards of Care in Diabetes—2025',
        source: 'American Diabetes Association — Diabetes Care',
        year: '2025',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11635037/',
      },
      {
        label: 'Hyperglycemic Crises in Adults With Diabetes: A Consensus Report',
        source: 'ADA/EASD/JBDS/AACE/DTS — Diabetologia',
        year: '2024',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11343900/',
      },
    ],
    lastReviewed: '2026-08',
  },
  {
    id: 'inpatient-special-situations',
    name: 'Inpatient Diabetes — Steroids, Nutrition Support & Non-Insulin Agents',
    category: 'inpatient',
    summary: 'The three highest-yield special situations on the wards: steroid-induced hyperglycemia (match the insulin curve to the steroid curve), enteral/TPN feeding (match insulin to the feed — and protect against interrupted feeds), and which home non-insulin agents to hold, continue, or never start. DPP-4 inhibitors are the one oral class with real inpatient evidence.',
    firstActions: [
      'Patient starting prednisone ≥20 mg/day (or equivalent)? Anticipate hyperglycemia 4–8 h after each dose — fasting glucose is often normal, then climbs through the afternoon and evening; monitor before lunch/dinner (q6h if >180 mg/dL).',
      'Glucose persistently ≥180 mg/dL on steroids: with once-daily morning prednisone start MORNING NPH (≈10 U or 0.1 U/kg) or a basal analog with prandial emphasis; titrate 10–20% daily.',
      'Enteral feeds: continuous → basal daily + regular insulin q6h; cycled/nocturnal → NPH at feed start ± regular q4–6h during feeds; bolus feeds → rapid-acting before each bolus.',
      'TPN: put regular insulin IN the bag (start ~1 U per 10 g dextrose) plus SC correction; fold the correction totals into the next day\'s bag.',
      'Triage the home med list now: hold GLP-1 RA in acute illness; SGLT2 inhibitor only for a heart-failure indication after recovery; hold metformin for contrast/AKI/hypoxia; do not start sulfonylureas inpatient.',
    ],
    features: [
      'Steroid pattern: near-normal fasting glucose with a midday-to-evening peak after once-daily morning prednisone — a fasting-only glucose check misses it entirely.',
      'Dexamethasone (long-acting) or divided steroid doses → round-the-clock hyperglycemia → think long-acting basal ± prandial, not NPH alone.',
      'The effect is dose-dependent and starts within hours; about 1 in 10 patients without known diabetes develops steroid-induced diabetes on supraphysiologic doses (>5 mg prednisolone-equivalent).',
      'Enteral pattern: continuous feeds give steady glucose — but an interrupted feed on scheduled feed-matched insulin is a hypoglycemia setup.',
      'TPN hyperglycemia tracks the dextrose load; insulin in the bag smooths the curve far better than chasing it with correction doses.',
    ],
    diagnosis: [
      'Treat steroid hyperglycemia at the same ≥180 mg/dL threshold (ADA); JBDS screens everyone on >5 mg prednisolone-equivalent with BG q6h initially and treats persistent >12 mmol/L (~216 mg/dL) on two occasions in 24 h.',
      'Screen patients without known diabetes on supraphysiologic steroids: baseline A1C, then daily glucose timed to the peak (pre-lunch or pre-dinner).',
      'If steroids stop and glucose normalizes, still screen for diabetes ≥6 weeks later — and delay A1C until 3 months out, because recent hyperglycemia skews it.',
      'A steroid wean is a glucose wean: falling glucose during the taper means insulin must be tapered in parallel.',
    ],
    management: [
      'Once-daily morning prednisone → MORNING NPH, whose intermediate profile mirrors the steroid curve: start 10 U or 0.1 U/kg and titrate 10–20% daily; an alternative is basal glargine with meal-emphasis dosing.',
      'Dexamethasone or divided steroid doses → long-acting basal (glargine/degludec) ± prandial rapid-acting.',
      'Already on insulin → expect to raise the total dose 20–40% on supraphysiologic steroids, and more on pulse dosing.',
      'Taper the steroid → taper the insulin in parallel (glucose falls before the taper ends); the predictable error is steroid down, insulin unchanged, hypoglycemia at 2 a.m.',
      'Continuous enteral feeds: basal analog daily + REGULAR insulin q6h (or rapid-acting q4h). Cycled feeds: NPH at feed start + regular q4–6h while feeds run. Bolus feeds: rapid-acting before each bolus.',
      'Feeds interrupted? Stop the feed-matched insulin immediately, start D10 IV if needed, and recheck glucose q1–2h — most enteral hypoglycemia is "insulin on, feeds off."',
      'TPN: regular insulin in the bag starting ~1 U per 10 g dextrose + SC correction scale; add about two-thirds of the previous day\'s correction total to the next bag.',
      'Non-insulin agents (ADA 2026): DPP-4 inhibitors (sitagliptin, or linagliptin — no renal dose adjustment) ± basal are a safe, simpler option for stable non-ICU patients with mild-moderate hyperglycemia (admission glucose <180–200 mg/dL); avoid saxagliptin/alogliptin in heart failure. SGLT2 inhibitors: not for inpatient glycemic control, but initiate/continue for HEART FAILURE once the acute illness resolves (Rec 16.11, A) — avoid in ketosis, prolonged fasting, and peri-op. GLP-1 RA: hold in acutely ill inpatients. Metformin: hold for iodinated contrast or renal deterioration (eGFR <30). Do not initiate sulfonylureas on variable intake.',
    ],
    followUp: [
      'Discharge on a tapering steroid: down-titrate insulin with the taper and arrange primary-care review within 1–2 weeks.',
      'If steroid-induced hyperglycemia resolves, screen for diabetes ≥6 weeks after cessation; if it persists, continue monitoring until normoglycemia or a formal diagnosis.',
      'Feeds weaned to oral intake → shift from feed-matched insulin to a prandial basal-bolus schedule.',
      'Restart SGLT2i/GLP-1 RA outpatient once recovered and eating; confirm metformin restart 48 h after contrast with stable renal function.',
    ],
    pearls: [
      'Check the right glucose: steroid hyperglycemia lives at lunch and dinner, not fasting.',
      'The steroid taper and the insulin taper travel together — delink them and you manufacture hypoglycemia.',
      '"Feeds held" is an insulin order, not just a nursing note: stop feed-matched insulin and cover with D10.',
      'Linagliptin needs no renal adjustment — the tidy DPP-4 choice in CKD.',
      'Insulin in the TPN bag prevents the chase; correction-only behind a TPN bag is sliding-scale thinking.',
    ],
    tables: [
      {
        title: 'Match the insulin to the steroid',
        columns: ['Steroid pattern', 'Glucose curve', 'Insulin choice'],
        rows: [
          ['Once-daily morning prednisone/prednisolone', 'Afternoon–evening peak, near-normal fasting', 'Morning NPH 10 U or 0.1 U/kg, titrate 10–20%/day (or basal + prandial emphasis)'],
          ['Dexamethasone / divided daily doses', 'Round-the-clock elevation', 'Long-acting basal (glargine/degludec) ± prandial rapid-acting'],
          ['High-dose pulse (e.g. methylprednisolone)', 'Marked rise for 24–48 h', 'Increase total insulin 20–40%; IV infusion if severe'],
          ['Tapering course', 'Glucose falls before the taper ends', 'Taper insulin in parallel; anticipate hypoglycemia'],
        ],
        note: 'JBDS 08 (rev. Jan 2023): NPH mirrors once-daily steroid pharmacokinetics; a short-acting sulfonylurea (gliclazide) is a UK-endorsed alternative in milder type-2 cases — insulin is preferred when hyperglycemia is marked.',
      },
      {
        title: 'Insulin for nutrition support',
        columns: ['Nutrition', 'Insulin plan', 'Safety rule'],
        rows: [
          ['Continuous enteral feeds', 'Basal analog daily + regular insulin q6h (or rapid-acting q4h)', 'Feeds stopped → stop feed insulin + start D10, recheck q1–2h'],
          ['Cycled / nocturnal feeds', 'NPH at feed start + regular q4–6h during the cycle', 'Match insulin duration to the feed window'],
          ['Bolus feeds', 'Rapid-acting analog before each bolus', 'Treat like meals'],
          ['TPN', 'Regular insulin in the bag (~1 U/10 g dextrose) + SC correction', 'Add ~two-thirds of prior-day correction into the next bag'],
        ],
        note: 'Feed interruptions are the dominant hypoglycemia mechanism — pair every feed-matched insulin order with a "what to do if feeds stop" instruction.',
      },
      {
        title: 'Home agents on the admission med list (ADA 2026)',
        columns: ['Class', 'Inpatient verdict'],
        rows: [
          ['Metformin', 'Hold for iodinated contrast, AKI (eGFR <30), hypoxia/sepsis; restart 48 h post-contrast if renal function stable'],
          ['Sulfonylurea', 'Do not start inpatient — hypoglycemia risk on variable intake'],
          ['DPP-4 inhibitor', 'May use ± basal for mild-moderate hyperglycemia in stable non-ICU patients; linagliptin needs no renal adjustment; avoid saxagliptin/alogliptin in HF'],
          ['SGLT2 inhibitor', 'Not for glycemic control inpatient; continue/initiate only for heart failure after the acute illness resolves (Rec 16.11); stop 3 days pre-op (4 for ertugliflozin)'],
          ['GLP-1 RA / dual agonist', 'Hold in acutely ill inpatients; also a perioperative aspiration consideration'],
          ['TZD (pioglitazone)', 'Avoid — fluid retention, slow onset, HF risk'],
        ],
        note: 'Insulin remains the default for anything beyond mild-moderate hyperglycemia, any ICU patient, and all type 1 diabetes.',
      },
    ],
    references: [
      {
        label: '16. Diabetes Care in the Hospital: Standards of Care in Diabetes—2026',
        source: 'American Diabetes Association — Diabetes Care',
        year: '2026',
        url: 'https://diabetesjournals.org/care/article/49/Supplement_1/S339/163925/16-Diabetes-Care-in-the-Hospital-Standards-of-Care',
      },
      {
        label: 'Management of Hyperglycaemia and Steroid (Glucocorticoid) Therapy (JBDS 08, rev. Jan 2023)',
        source: 'Joint British Diabetes Societies for Inpatient Care',
        year: '2023',
        url: 'https://abcd.care/sites/default/files/site_uploads/JBDS_Guidelines_Current/JBDS_08_Management_of_Hyperglycaemia_and_Steroid_%28Glucocorticoid%29_Therapy_with_QR_code_January_2023.pdf',
      },
      {
        label: '16. Diabetes Care in the Hospital: Standards of Care in Diabetes—2025',
        source: 'American Diabetes Association — Diabetes Care',
        year: '2025',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11635037/',
      },
    ],
    lastReviewed: '2026-08',
  },
  {
    id: 'perioperative-discharge',
    name: 'Perioperative Diabetes & Discharge Planning — New in ADA 2026',
    category: 'inpatient',
    summary: 'What changed in ADA Standards of Care 2026 for the hospital: two brand-new perioperative recommendations (pre-op A1C <8% within 3 months of elective surgery; glucose 100–180 mg/dL before, during, and after surgery), an updated discharge-to-facility recommendation, and the discharge checklist that prevents readmissions.',
    firstActions: [
      'Elective surgery on the books? Check the A1C — 2026 Rec 16.14 (NEW) targets <8% within the 3 months before elective surgery; for CGM users a 14-day GMI <8% or TIR >50% is an accepted alternative.',
      'Medication holds: SGLT2 inhibitor 3 days pre-op (4 days for ertugliflozin); metformin, sulfonylureas, and prandial insulin held while NPO; GLP-1 RA held per anesthesia guidance (delayed gastric emptying → aspiration risk).',
      'Continue basal insulin at ~75–80% of the usual dose the evening before / morning of surgery — never stop basal in type 1 diabetes.',
      'Perioperative glucose target (NEW 2026, Rec 16.15): 100–180 mg/dL before, during, and after surgery — monitor q2–4h while NPO, hourly on an infusion.',
      'Start discharge planning on day one: A1C in hand, med reconciliation, insulin teaching, supplies prescribed, sick-day education, and follow-up booked.',
    ],
    features: [
      'Why the new pre-op A1C target exists: A1C ≥8% is associated with worse postoperative outcomes — infections, wound complications, longer stays.',
      'Who needs an IV insulin infusion periop: long or complex procedures, type 1 diabetes, poor baseline control, or persistent glucose >180 mg/dL.',
      'Pumps periop: short procedures can continue basal-only if the anesthesia team agrees; long or complex cases → convert to an IV infusion or SC basal-bolus.',
      'Practical lever: schedule early-morning cases and minimize NPO time whenever possible.',
    ],
    diagnosis: [
      'Periop monitoring: POC glucose q2–4h while NPO; hourly during IV insulin; treat >180 mg/dL with correction or an infusion per protocol.',
      'Day-of-surgery basics: morning glucose and electrolytes; potassium before any insulin.',
      'The full "new in 2026" list is in the first table below — two new periop recommendations (16.14, 16.15), an updated discharge-to-facility recommendation (16.18), new DKA/HHS diagnostic tables inside §16, and expanded text on hospital technology use and periop non-insulin therapy.',
    ],
    management: [
      'Periop infusion criteria as above; transition back to SC insulin once eating, with the 2-h basal overlap (see the Targets & Insulin card).',
      'Discharge planning starts at ADMISSION: tailor the plan to the A1C — a high A1C means the home regimen was failing, so adjust it rather than sending the patient home unchanged.',
      'Med reconciliation: restart metformin 48 h post-contrast if renal function is stable; restart SGLT2i/GLP-1 RA only when recovered and eating; NEVER discharge on correction-only insulin.',
      'Insulin literacy before the door: demonstrate pen use, dosing, and glucose monitoring (teach-back if possible); prescribe insulin, pen needles, strips, and glucagon where indicated.',
      'Sick-day rules for everyone at risk (Rec 16.17): never stop basal insulin, check glucose q4–6h and ketones when ill, maintain fluids and carbohydrate, and know when to call.',
      'Rec 16.18 (updated 2026): discharging to a facility? Match the regimen to what the facility can actually deliver — a q6h regular-insulin plan fails in a nursing home that cannot check glucose q6h.',
      'Follow-up: outpatient diabetes visit within ~1 month for anyone with inpatient hyperglycemia; 1–2 weeks for new insulin starts or steroid tapers.',
    ],
    followUp: [
      'Run the discharge checklist (table) before sign-out — incomplete transitions drive readmissions, which inpatient diabetes teams are proven to reduce.',
      'Hand the outpatient team the A1C, the admission glycemic story, and what changed — the discharge summary is a diabetes document too.',
      'For recurrent admissions or brittle control, refer to diabetes self-management education (DSMES) and endocrinology follow-up.',
    ],
    pearls: [
      '2026 numbers to memorize: pre-op A1C <8% (or GMI <8% / TIR >50%), periop glucose 100–180 mg/dL, ward 100–180, ICU 140–180, treatment threshold ≥180.',
      'The classic discharge error: unchanged home regimen + A1C 10.5% = readmission. The admission is the intervention window.',
      'Never discharge anyone on sliding-scale correction alone.',
      'A regimen the receiving facility cannot execute is a regimen that will not be executed — complexity is a discharge-planning variable (Rec 16.18, 2026).',
      'SGLT2i timing runs both directions: stop 3–4 days pre-op; restart only when recovered and eating.',
    ],
    tables: [
      {
        title: 'New & updated in ADA Standards of Care 2026 — Section 16',
        columns: ['Rec', 'Change', 'Bottom line'],
        rows: [
          ['16.14 (NEW)', 'Pre-op glycemic goal', 'A1C <8% within 3 months before elective surgery — or 14-day GMI <8% / TIR >50% on CGM'],
          ['16.15 (NEW)', 'Periop glucose range', '100–180 mg/dL before, during, and after surgery'],
          ['16.18 (updated)', 'Discharge to facilities', 'Consider the facility\'s diabetes-management capabilities when choosing the regimen'],
          ['Tables 16.1–16.2 (NEW)', 'DKA/HHS diagnosis & presentation', 'Now printed in §16 — the 2024 consensus criteria (see the DKA and HHS cards)'],
          ['Narrative (expanded)', 'Technology + non-insulin periop', 'More on CGM/pump use in hospital and holding non-insulin agents around surgery'],
        ],
        note: 'Released December 2025 in Diabetes Care 2026;49(Suppl. 1). §6 also expanded the "intercurrent illness" medication-hold criteria and outpatient DKA prevention content.',
      },
      {
        title: 'Day-of-surgery medication instructions',
        columns: ['Agent', 'Instruction'],
        rows: [
          ['SGLT2 inhibitor', 'Stop 3 days before (4 days for ertugliflozin) — euglycemic DKA risk'],
          ['Metformin', 'Hold day of surgery; restart 48 h later with stable renal function and no contrast concern'],
          ['Sulfonylurea / meglitinide', 'Hold while NPO'],
          ['GLP-1 RA / dual agonist', 'Hold per anesthesia guidance (day of for daily agents; ~1 week for weekly agents) — delayed gastric emptying'],
          ['DPP-4 inhibitor', 'May continue; hold if NPO per local protocol'],
          ['Basal insulin', 'Continue ~75–80% of the usual dose (full dose if well controlled); never stop in type 1'],
          ['Prandial insulin', 'Hold scheduled doses while NPO; correction per protocol'],
          ['Insulin pump', 'Basal-only for short cases if anesthesia agrees; convert to infusion for long/complex cases'],
        ],
        note: 'Individualize with the surgical and anesthesia teams; goals may differ by procedure and hypoglycemia risk (Rec 16.15).',
      },
      {
        title: 'Discharge checklist — before the patient leaves',
        columns: ['Item', 'Standard'],
        rows: [
          ['A1C', 'Result on chart (≤3 months old); regimen adjusted if elevated'],
          ['Medications', 'Reconciled; metformin/SGLT2i/GLP-1 RA restart plan explicit; NO correction-only insulin'],
          ['Supplies', 'Insulin, pen needles/syringes, meter + strips prescribed; glucagon if at risk'],
          ['Skills', 'Insulin injection + glucose monitoring demonstrated (teach-back)'],
          ['Sick-day rules', 'Never stop basal; ketone checks when ill; when to call (Rec 16.17)'],
          ['Destination', 'Regimen matched to home vs facility capabilities (Rec 16.18)'],
          ['Follow-up', 'Diabetes visit within ~1 month (1–2 weeks for new insulin or steroid taper)'],
        ],
        note: 'Structured discharge planning reduces readmissions and ED revisits — it is a recommendation, not a courtesy.',
      },
    ],
    references: [
      {
        label: '16. Diabetes Care in the Hospital: Standards of Care in Diabetes—2026',
        source: 'American Diabetes Association — Diabetes Care',
        year: '2026',
        url: 'https://diabetesjournals.org/care/article/49/Supplement_1/S339/163925/16-Diabetes-Care-in-the-Hospital-Standards-of-Care',
      },
      {
        label: 'American Diabetes Association Releases "Standards of Care in Diabetes—2026"',
        source: 'American Diabetes Association — newsroom (what\'s new summary)',
        year: '2025',
        url: 'https://diabetes.org/newsroom/press-releases/american-diabetes-association-releases-standards-care-diabetes-2026',
      },
      {
        label: 'Hyperglycemic Crises in Adults With Diabetes: A Consensus Report',
        source: 'ADA/EASD/JBDS/AACE/DTS — Diabetologia',
        year: '2024',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11343900/',
      },
    ],
    lastReviewed: '2026-08',
  },
]
