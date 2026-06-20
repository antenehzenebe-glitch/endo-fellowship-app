// lib/endocrine-emergencies.ts
// Fellows' Survival Guide — endocrine & electrolyte emergencies.
// EDUCATIONAL QUICK-REFERENCE ONLY. No PHI. This is teaching content for the
// fellowship, not a clinical decision tool: it does not replace attending
// judgment or your institution's protocols, and every drug/dose must be
// verified against current local guidelines before use.
//
// Content is plain data so it renders identically on phone and desktop and is
// trivial for faculty to edit. `type` aliases (not interfaces) per CLAUDE.md.

export type EmergencyCategory =
  | 'glucose'
  | 'adrenal'
  | 'thyroid'
  | 'calcium'
  | 'sodium'
  | 'potassium'
  | 'catecholamine'
  | 'pituitary'

export type Emergency = {
  id: string
  name: string
  category: EmergencyCategory
  summary: string // one-line orientation
  features: string[] // clinical features
  diagnosis: string[] // how it's confirmed / key labs
  management: string[] // ordered steps
  followUp: string[] // disposition + after-care
  pearls: string[] // high-yield "don't miss / don't do" points
  tables?: EmergencyTable[] // optional structured tables (severity grids, scoring scales)
}

// Optional structured table for an emergency (e.g. DKA severity grading or the
// Burch–Wartofsky Point Scale). Rendered after the diagnosis section. `type` per CLAUDE.md.
export type EmergencyTable = {
  title: string
  columns: string[]
  rows: string[][]
  note?: string
}

// Category → label + accessible color tokens (color is paired with a text
// label everywhere, never used alone — DESIGN.md / WCAG).
export const EMERGENCY_CATEGORIES: Record<
  EmergencyCategory,
  { label: string; chip: string; bar: string }
> = {
  glucose: { label: 'Glucose', chip: 'bg-amber-100 text-amber-900 border-amber-200', bar: 'bg-amber-500' },
  adrenal: { label: 'Adrenal', chip: 'bg-rose-100 text-rose-900 border-rose-200', bar: 'bg-rose-500' },
  thyroid: { label: 'Thyroid', chip: 'bg-violet-100 text-violet-900 border-violet-200', bar: 'bg-violet-500' },
  calcium: { label: 'Calcium', chip: 'bg-teal-100 text-teal-900 border-teal-200', bar: 'bg-teal-500' },
  sodium: { label: 'Sodium', chip: 'bg-sky-100 text-sky-900 border-sky-200', bar: 'bg-sky-500' },
  potassium: { label: 'Potassium', chip: 'bg-indigo-100 text-indigo-900 border-indigo-200', bar: 'bg-indigo-500' },
  catecholamine: { label: 'Catecholamine', chip: 'bg-orange-100 text-orange-900 border-orange-200', bar: 'bg-orange-500' },
  pituitary: { label: 'Pituitary', chip: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200', bar: 'bg-fuchsia-500' },
}

export const EMERGENCIES: Emergency[] = [
  // ───────────────────────────── GLUCOSE ─────────────────────────────
  {
    id: 'dka',
    name: 'Diabetic Ketoacidosis (DKA)',
    category: 'glucose',
    summary: 'Insulin deficiency driving hyperglycemia, ketone overproduction, and an anion-gap metabolic acidosis — the classic type-1 emergency, but increasingly seen in ketosis-prone type-2 and on SGLT2 inhibitors. Death is from the precipitant, cerebral edema (mainly children), hypokalemia, or aspiration — not the glucose itself.',
    features: [
      'Onset over hours: polyuria, polydipsia, weight loss, then nausea, vomiting, and diffuse abdominal pain (it can mimic a surgical abdomen and usually clears as the acidosis does).',
      'Kussmaul respirations (deep, sighing hyperventilation) and a fruity/acetone odor.',
      'Volume depletion: tachycardia, dry mucosa, hypotension; mental status ranges from alert to coma and tracks osmolality more than acidosis.',
      'Precipitant clues — the I-words: Infection, Infarction (MI/stroke), Infant (pregnancy), Indiscretion (diet/alcohol), Insulin omission, Iatrogenic drugs (steroids, SGLT2i, antipsychotics).',
    ],
    diagnosis: [
      '2024 ADA/EASD — all three: (1) glucose ≥200 mg/dL OR known diabetes; (2) ketonemia β-hydroxybutyrate ≥3.0 mmol/L (or ketonuria ≥2+); (3) acidosis pH <7.3 and/or HCO3 <18 mmol/L. Anion gap was REMOVED from the criteria but still tracks resolution.',
      'β-hydroxybutyrate is the preferred ketone measure — nitroprusside urine ketones see acetoacetate only, so they read falsely low early (β-OHB predominates) and falsely persistent in recovery (as β-OHB converts back to acetoacetate).',
      'Anion gap = Na - (Cl + HCO3); >12 mmol/L is elevated. A venous gas suffices (venous pH runs ~0.03 below arterial) — an arterial stick is rarely needed.',
      'Corrected Na = measured Na + 1.6 × ([glucose - 100] / 100): hyperglycemia pulls water in and dilutes sodium, so a normal measured Na in DKA actually signals a free-water deficit.',
      'Potassium is the trap: total-body K is depleted, yet serum K is often normal or HIGH on arrival (acidosis and insulin lack shift it out). It falls fast once insulin starts — anticipate it.',
      'Expect a stress leukocytosis that does not by itself mean infection, and a mildly raised lipase/amylase without pancreatitis. Grade severity by β-OHB, pH, HCO3, and mental status (table).',
    ],
    management: [
      'Fluids first — isotonic saline ~1-1.5 L (or 15-20 mL/kg) in hour 1, then 250-500 mL/h; switch to 0.45% saline once corrected Na is normal or high, and replace the deficit over ~24-48 h.',
      'Potassium-gated insulin: if K <3.3 mmol/L, HOLD insulin and give 10-20 mmol/h K first (insulin would cause dangerous hypokalemia/arrhythmia); if K 3.3-5.0, add 20-30 mmol K per litre to hold K 4-5; if K >5.0, give no K and recheck in 2 h.',
      'Regular insulin infusion 0.1 U/kg/h (an initial 0.1 U/kg bolus is optional and may be skipped); aim for a glucose fall of 50-75 mg/dL/h. If it is not falling, recheck hydration and the line, then increase the rate.',
      'When glucose reaches ≈200 mg/dL, ADD dextrose (D5, or D10 if needed) and continue the SAME insulin rate — insulin is now there to clear KETONES, not glucose; never stop it just because the sugar normalized.',
      'Monitor: glucose hourly; electrolytes, venous pH, and anion gap q2-4h; keep K 4-5 mmol/L throughout.',
      'Resolution = glucose <200 mg/dL PLUS two of: HCO3 ≥15 mmol/L, venous pH >7.30, anion gap ≤12 — and the patient is eating. Overlap subcutaneous insulin 1-2 h BEFORE stopping the drip.',
      'Adjuncts, not routine: bicarbonate only if pH <6.9; phosphate only if <1.0 mg/dL with cardiac dysfunction, respiratory depression, or anemia; treat the precipitant.',
    ],
    followUp: [
      'Pin and treat the trigger; deliver diabetes and sick-day education (never stop basal insulin; check ketones when ill).',
      'Confirm the SC insulin overlap happened before the drip came off, then arrange outpatient diabetes follow-up.',
      'On an SGLT2 inhibitor, counsel to hold it during acute illness and ~3-4 days before surgery, and to check ketones even when glucose looks normal.',
    ],
    pearls: [
      'Never stop the insulin drip without SC overlap — the gap reopens within hours.',
      'Serum K on arrival hides a whole-body deficit; the danger window is 1-4 h after insulin starts.',
      'Watch for cerebral edema in children and adolescents (headache, falling GCS, bradycardia with hypertension) — correct osmolality gradually; treat with hypertonic saline or mannitol.',
      'On an SGLT2 inhibitor the glucose may be near-normal — diagnose on ketones and pH, not the sugar (see euglycemic DKA).',
    ],
    tables: [
      {
        title: 'DKA severity grading (2024 ADA/EASD)',
        columns: ['Severity', 'β-OHB (mmol/L)', 'pH', 'HCO3 (mmol/L)', 'Mental status', 'Typical setting'],
        rows: [
          ['Mild', '≤ 6', '> 7.25', '≥ 15', 'Alert', 'Ward / floor'],
          ['Moderate', '≤ 6', '7.0–7.25', '10 to <15', 'Alert or drowsy', 'Step-down'],
          ['Severe', '> 6', '< 7.0', '< 10', 'Stupor or coma', 'ICU'],
        ],
        note: 'Grade by the most severe parameter present — mental status or pH <7.0 alone can drive ICU placement.',
      },
      {
        title: 'Potassium-guided insulin and repletion',
        columns: ['Serum K (mmol/L)', 'Insulin', 'Potassium'],
        rows: [
          ['< 3.3', 'HOLD until K ≥ 3.3', 'Give 10–20 mmol/h; recheck before starting insulin'],
          ['3.3 – 5.0', 'Run at 0.1 U/kg/h', 'Add 20–30 mmol per litre; target K 4–5'],
          ['> 5.0', 'Run at 0.1 U/kg/h', 'Give none; recheck in 2 h'],
        ],
        note: 'Insulin and bicarbonate both drive K into cells — recheck K every 2 h early on, and keep continuous cardiac monitoring while K is low.',
      },
    ],
  },
  {
    id: 'euglycemic-dka',
    name: 'Euglycemic DKA (euDKA)',
    category: 'glucose',
    summary: 'Full ketoacidosis with glucose <200-250 mg/dL — the dangerous mimic that gets missed because the sugar looks reassuring. Think SGLT2 inhibitors above all, plus pregnancy, starvation/low-carb intake, alcohol, and acute illness or surgery superimposed on diabetes.',
    features: [
      'The DKA syndrome — nausea/vomiting, abdominal pain, malaise, Kussmaul breathing, dehydration — but the glucose is normal or only mildly raised.',
      'High-risk context is the tip-off: an SGLT2 inhibitor (canagliflozin / dapagliflozin / empagliflozin), pregnancy or lactation, reduced caloric or carbohydrate intake, heavy alcohol, recent surgery, or any acute illness in a person with diabetes.',
    ],
    diagnosis: [
      'Ketonemia (β-OHB ≥3.0 mmol/L) + acidosis (pH <7.3 and/or HCO3 <18 mmol/L) with glucose <200-250 mg/dL — it qualifies under the 2024 criteria through the known-diabetes clause, so a normal glucose does NOT exclude DKA.',
      'Mechanism worth knowing: SGLT2 inhibitors lower glucose by urinary excretion (masking hyperglycemia) while raising glucagon and promoting lipolysis and ketogenesis — so the acidosis runs ahead of the sugar.',
      'Check β-hydroxybutyrate and a venous gas in ANY at-risk patient who is acidotic, vomiting, or unwell, whatever the glucometer shows.',
    ],
    management: [
      'Treat exactly as DKA but give dextrose EARLY: start D5-D10 (often D10) alongside the insulin infusion so insulin can clear ketones without dropping the glucose too low.',
      'Insulin infusion to close the gap / clear ketonemia; isotonic fluids for the deficit; potassium repletion and the same K-gated insulin rule (hold insulin if K <3.3 mmol/L) as in DKA.',
      'Stop the SGLT2 inhibitor immediately; do not restart during the acute illness, and hold it ~3-4 days before elective surgery.',
      'Continue insulin + dextrose until ketonemia and acidosis resolve (gap closed, β-OHB <0.6 mmol/L, patient eating); overlap SC insulin before stopping the drip.',
    ],
    followUp: [
      'Counsel on SGLT2-inhibitor sick-day rules and perioperative holding; arrange home ketone testing for high-risk patients.',
      'Identify and treat the trigger (illness, fasting, surgery, pregnancy) and reconsider whether the SGLT2 inhibitor should be resumed.',
    ],
    pearls: [
      'A normal glucose does not exclude DKA — check ketones in any acidotic at-risk patient, especially on an SGLT2 inhibitor.',
      'Run insulin AND dextrose together from the start; the dextrose is what lets you keep clearing ketones.',
      'SGLT2-inhibitor ketoacidosis can surface days into a fast or after surgery and can persist after the drug is stopped (long tissue effect) — keep treating until ketones clear.',
    ],
  },
  {
    id: 'hhs',
    name: 'Hyperosmolar Hyperglycemic State (HHS)',
    category: 'glucose',
    summary: 'Extreme hyperglycemia and hyperosmolality with little or no ketosis — typically an older type-2 patient over days, often with an infection and poor access to water. It builds slower than DKA, dehydrates far more (deficit ~8-10 L), and carries much higher mortality (~5-20%).',
    features: [
      'Days to weeks of polyuria and polydipsia ending in profound dehydration; the trigger is frequently infection (pneumonia, UTI), an MI or stroke, missed medication, or a hyperglycemic drug.',
      'Neurologic dominance: lethargy, confusion, focal deficits, seizures, or coma — the depression of consciousness tracks OSMOLALITY (obtunded patients usually have effective osm >320-340).',
      'Minimal ketotic symptoms and little Kussmaul breathing — the acidosis is mild or absent, which is what separates it clinically from DKA.',
    ],
    diagnosis: [
      'Glucose usually >600 mg/dL (often far higher) with effective serum osmolality >320 mOsm/kg.',
      'Effective osm = 2 × Na + glucose/18 (BUN is excluded — urea crosses cell membranes and does not drive water shifts).',
      'pH >7.30, HCO3 >18 mmol/L, and only small ketones — these distinguish HHS from DKA; a mixed DKA-HHS picture is common and is managed as DKA.',
      'Corrected Na = measured Na + 1.6 × ([glucose - 100] / 100) (use ~2.4 at glucose >400) — the corrected value guides fluid choice and reveals the true free-water deficit.',
      'Estimate the deficit: total water loss averages ~100-220 mL/kg (~8-10 L in an adult). Work up the precipitant (cultures, ECG/troponin, medication review).',
    ],
    management: [
      'Fluids do most of the early work — they alone drop glucose substantially. Start isotonic saline 1-1.5 L/h (or ~15-20 mL/kg/h) for 1-2 h, then 250-500 mL/h titrated to corrected Na and hemodynamics.',
      'Switch to 0.45% saline once corrected Na is normal or high; add dextrose when glucose reaches ≈250-300 mg/dL (a higher threshold than DKA) and continue fluids.',
      'Potassium repletion and the same K-gated rule as DKA (hold insulin if K <3.3 mmol/L; keep K 4-5).',
      'Insulin comes SECOND and LOWER: only after fluids are running and K is known, start ≈0.05 U/kg/h (fluids alone may suffice initially) — premature or aggressive insulin shifts water intracellularly and risks cardiovascular collapse.',
      'Correct osmolality SLOWLY (aim ≤3 mOsm/kg/h) and glucose more gradually than in DKA to avoid cerebral edema; give VTE prophylaxis (high thrombosis risk); monitor neuro status closely.',
    ],
    followUp: [
      'Treat the precipitant and provide diabetes education; many patients transition to oral agents or modest insulin once recovered.',
      'Mind the heightened thrombosis and mortality risk; mental-status recovery lags the labs — a persistent deficit suggests an unresolved cause or a CNS event.',
    ],
    pearls: [
      'Volume first — fluids, not insulin, are the main early glucose-lowering tool; going in insulin-heavy invites vascular collapse.',
      'Correct osmolality slowly to avoid cerebral edema; if mental status does not improve as osm normalizes, look for another cause (stroke, infection).',
      'Mixed DKA-HHS exists — if there is significant ketoacidosis, treat by the DKA protocol.',
    ],
    tables: [
      {
        title: 'DKA vs HHS at a glance',
        columns: ['Feature', 'DKA', 'HHS'],
        rows: [
          ['Typical patient', 'Younger, type 1 (or ketosis-prone T2)', 'Older, type 2'],
          ['Onset', 'Hours', 'Days to weeks'],
          ['Glucose', '>200 mg/dL (often 300–600)', 'Usually >600 mg/dL'],
          ['Ketones / β-OHB', 'Marked (≥3.0 mmol/L)', 'Minimal'],
          ['pH', '< 7.30', '> 7.30'],
          ['HCO3', '< 18 mmol/L', '> 18 mmol/L'],
          ['Effective osm', 'Variable', '> 320 mOsm/kg'],
          ['Fluid deficit', '~3–6 L (~100 mL/kg)', '~8–10 L (~100–220 mL/kg)'],
          ['Mortality', '< 1–5%', '~5–20%'],
        ],
        note: 'A mixed DKA-HHS picture is common; when significant ketoacidosis is present, manage as DKA.',
      },
    ],
  },
  {
    id: 'hypoglycemia',
    name: 'Hypoglycemia',
    category: 'glucose',
    summary: 'Low plasma glucose with adrenergic + neuroglycopenic symptoms. The approach splits sharply by context: in diabetes it is a clinical/iatrogenic diagnosis; in a non-diabetic it must be PROVEN (Whipple\'s triad) and then worked up with a critical sample.',
    features: [
      'Adrenergic / autonomic (earlier, glucose ~55–70 mg/dL): tremor, palpitations, sweating, anxiety, hunger, pallor.',
      'Neuroglycopenic (lower, glucose <50 mg/dL): confusion, behavior/personality change, blurred or double vision, slurred speech, seizures, coma.',
      'Whipple\'s triad = (1) symptoms/signs of hypoglycemia + (2) a low plasma glucose by a reliable lab method + (3) resolution when glucose is raised. Required before working up a non-diabetic.',
      'Hypoglycemia unawareness: recurrent lows / autonomic failure blunt the adrenergic warning, so neuroglycopenia becomes the first sign — common in long-standing T1DM and tight control.',
    ],
    diagnosis: [
      'Define severity (ADA, used mainly in diabetes): Level 1 / alert = glucose <70 mg/dL (3.9 mmol/L); Level 2 / clinically significant = <54 mg/dL (3.0 mmol/L); Level 3 / severe = any low causing cognitive impairment that needs another person to treat it (no fixed cutoff). See table.',
      'DIABETIC patients: a CLINICAL, contextual diagnosis — almost always iatrogenic from insulin or an insulin secretagogue (sulfonylurea, meglitinide). No endocrine work-up is needed; instead pin the precipitant: missed/late meal, exercise, dose error, renal or hepatic impairment, alcohol, or hypoglycemia unawareness.',
      'NON-DIABETIC patients: first PROVE true hypoglycemia with Whipple\'s triad — a glucometer reading alone is not enough; confirm with a venous plasma glucose. The Endocrine Society work-up threshold is a plasma glucose <55 mg/dL with concurrent symptoms.',
      'NON-DIABETIC — draw the CRITICAL SAMPLE at the moment glucose is <55 mg/dL (spontaneous, or provoked by a supervised 72-hour fast; use a mixed-meal test instead if symptoms are postprandial). Measure: plasma glucose, insulin, C-peptide, proinsulin, β-hydroxybutyrate, oral-hypoglycemic-agent (sulfonylurea/meglitinide) screen, insulin antibodies, ± cortisol. Then give 1 mg IV glucagon and measure the glucose response.',
      'NON-DIABETIC — frame the differential by appearance: ill/medicated → drugs, organ failure (hepatic/renal/cardiac), sepsis, cortisol or GH deficiency, or a non-islet-cell tumor (IGF-2). Healthy-appearing → endogenous hyperinsulinism: insulinoma, surreptitious sulfonylurea, insulin autoimmune syndrome, or post-bariatric (post-gastric-bypass) hyperinsulinemic hypoglycemia.',
      'Interpret the critical sample at glucose <55 mg/dL using the grid below — the pattern of insulin, C-peptide, proinsulin, β-OHB and the post-glucagon glucose rise separates the causes.',
    ],
    management: [
      'Conscious and able to swallow: 15–20 g fast-acting oral carbohydrate (glucose tabs/gel, juice); recheck in 15 min and repeat until glucose >70 mg/dL (the rule of 15); then a complex-carb snack or meal to prevent relapse.',
      'Impaired consciousness or NPO / no oral route: IV dextrose — 25 g D50 (1 amp) push, or a D10 infusion; if no IV access, IM/SC or intranasal glucagon 1 mg.',
      'Sulfonylurea-induced or refractory/recurrent: admit; continuous D10 infusion; add octreotide (e.g., 50 µg SC q6–8h) to suppress insulin secretion and prevent the rebound lows that dextrose alone does not hold.',
      'Glucagon caveat: it fails when hepatic glycogen is depleted (alcohol, malnutrition, prolonged fasting, advanced liver disease) and can worsen sulfonylurea hypoglycemia by further stimulating insulin — IV dextrose is the definitive therapy.',
      'Cause-directed (non-diabetic): per the critical-sample result — insulinoma → localize and resect; sulfonylurea → stop the drug + observe; NICTH → treat the tumor ± glucocorticoid/GH; adrenal insufficiency → hydrocortisone; post-bariatric → dietary change, acarbose, or diazoxide.',
    ],
    followUp: [
      'Diabetic: review the insulin/secretagogue regimen; screen for and reverse hypoglycemia unawareness (raise targets and relax control for 2–3 weeks); consider CGM; prescribe a glucagon kit and educate patient and family; check renal/hepatic function.',
      'Non-diabetic with proven Whipple\'s triad: complete the critical-sample work-up, then localize confirmed endogenous hyperinsulinism (CT/MRI, endoscopic ultrasound, and — if needed — selective arterial calcium stimulation for insulinoma).',
      'Postprandial / reactive pattern (e.g., post-gastric-bypass): evaluate with a mixed-meal test rather than a prolonged fast.',
    ],
    pearls: [
      'In any non-diabetic, establish Whipple\'s triad first — do not chase a glucometer number; confirm with a lab plasma glucose.',
      'The critical sample is only interpretable if drawn WHILE glucose is <55 mg/dL — a panel sent at normal glucose is uninterpretable.',
      'High insulin + LOW C-peptide = exogenous (factitious or iatrogenic) insulin. High insulin + HIGH C-peptide + positive drug screen = sulfonylurea — the great insulinoma mimic.',
      'LOW β-hydroxybutyrate plus a glucose rise ≥25 mg/dL after IV glucagon = insulin-mediated hypoglycemia (insulin is antiketogenic and preserves hepatic glycogen).',
      'Glucagon can fail (glycogen-depleted or sulfonylurea patients) — dextrose is definitive; sulfonylurea lows recur for many hours, so observe/admit long enough.',
    ],
    tables: [
      {
        title: 'Severity levels (ADA — diabetes context)',
        columns: ['Level', 'Plasma glucose', 'Clinical meaning'],
        rows: [
          ['Level 1 (alert)', '<70 mg/dL (3.9 mmol/L)', 'Treat with fast carbohydrate; reassess regimen.'],
          ['Level 2 (clinically significant)', '<54 mg/dL (3.0 mmol/L)', 'Neuroglycopenia threshold; serious, needs prompt correction.'],
          ['Level 3 (severe)', 'No fixed cutoff', 'Cognitive/physical impairment requiring another person to treat.'],
        ],
        note: 'Levels guide diabetes management. In a non-diabetic, use Whipple\'s triad and the <55 mg/dL work-up threshold instead.',
      },
      {
        title: 'Critical-sample interpretation (non-diabetic, drawn at glucose <55 mg/dL)',
        columns: ['Cause', 'Insulin', 'C-peptide', 'Proinsulin', 'β-OHB', 'Δ glucose post-glucagon', 'Key clue'],
        rows: [
          ['Insulinoma', '↑ (≥3 µU/mL)', '↑ (≥0.6 ng/mL)', '↑ (≥5 pmol/L)', '↓ (≤2.7 mmol/L)', '↑ ≥25 mg/dL', 'Drug screen neg, Ab neg'],
          ['Exogenous insulin (factitious)', '↑↑ (often very high)', '↓ suppressed', '↓', '↓', 'Variable', 'High insulin with LOW C-peptide'],
          ['Sulfonylurea / meglitinide', '↑', '↑', '↑', '↓', '↑', 'Drug screen POSITIVE (mimics insulinoma)'],
          ['Insulin autoimmune', '↑↑ (very high total)', '↑', 'Variable', '↓', '—', 'Anti-insulin antibodies POSITIVE'],
          ['NICTH / IGF-2-mediated', '↓', '↓', '↓', '↑', 'No rise', '↑ IGF-2 : IGF-1 ratio; large tumor'],
          ['Non-insulin (alcohol, organ failure, cortisol/GH deficiency, sepsis)', '↓', '↓', '↓', '↑', 'No rise', 'Clinical context; check AM cortisol'],
        ],
        note: 'Thresholds (Endocrine Society) apply when plasma glucose is <55 mg/dL. Insulin µU/mL, C-peptide ng/mL, proinsulin pmol/L, β-OHB mmol/L. ↑ raised, ↓ low/suppressed, — not characteristic.',
      },
    ],
  },

  // ───────────────────────────── ADRENAL ─────────────────────────────
  {
    id: 'adrenal-crisis',
    name: 'Adrenal Crisis (Acute Adrenal Insufficiency)',
    category: 'adrenal',
    summary: 'Acute glucocorticoid (and in primary disease, mineralocorticoid) deficiency causing shock that does not respond to fluids and pressors — a true "give hydrocortisone now, confirm later" emergency. Usually a known adrenal-insufficient patient under stress, an undiagnosed Addison patient, or abrupt steroid withdrawal.',
    features: [
      'Hypotension or shock poorly responsive to fluids and vasopressors — the cardinal feature; tachycardia, sometimes relative bradycardia.',
      'Nausea, vomiting, diffuse abdominal pain (can mimic an acute abdomen), fever, profound weakness, and confusion progressing to coma.',
      'A precipitating stress is usual: infection or sepsis, surgery, trauma, myocardial infarction, missed steroid doses, or abrupt glucocorticoid withdrawal.',
      'Chronic primary disease clues: hyperpigmentation (palmar creases, buccal mucosa, scars), vitiligo, weight loss, salt craving, postural dizziness.',
      'Suggestive labs: hyponatremia, hyperkalemia (primary only), hypoglycemia (more in central disease and children), mild hypercalcemia, prerenal azotemia, eosinophilia.',
    ],
    diagnosis: [
      'Clinical — TREAT FIRST, confirm later. Draw a paired cortisol (and ACTH, aldosterone, renin, DHEAS) BEFORE the first steroid ONLY if it will not delay treatment.',
      'Random (basal) cortisol: <3–5 µg/dL (<83–138 nmol/L) in a stressed or ill patient strongly supports adrenal insufficiency; >18 µg/dL (>500 nmol/L) makes acute insufficiency very unlikely; a morning value of 3–15 is indeterminate and needs stimulation testing.',
      '250 µg cosyntropin (ACTH) stimulation test once stable: cortisol at 0, 30 and 60 min; a peak <18 µg/dL (<500 nmol/L) confirms adrenal insufficiency.',
      'Localize the lesion: PRIMARY → high ACTH with low aldosterone and high renin, giving hyperkalemia, hyponatremia and hyperpigmentation; CENTRAL (secondary or tertiary) → low or inappropriately normal ACTH with an intact mineralocorticoid axis (normal potassium), no hyperpigmentation, and often other pituitary deficits.',
      'If you must treat before testing, bridge with DEXAMETHASONE — it does not cross-react in the cortisol assay, so the stimulation test can still be done.',
      'A NORMAL cosyntropin test does not exclude recent-onset central insufficiency (e.g., after pituitary surgery or apoplexy) — the adrenals take roughly 2 weeks to atrophy and may still respond.',
    ],
    management: [
      'Hydrocortisone 100 mg IV immediately, then 50 mg IV q6h or 200 mg/24h by continuous infusion — do NOT wait for labs. If hydrocortisone is unavailable and a stimulation test is pending, give dexamethasone 4 mg IV.',
      'Aggressive IV fluids: 1 L isotonic saline in the first hour, then titrate to hemodynamics and the deficit; use dextrose-containing saline (D5NS) to cover hypoglycemia.',
      'Treat hyperkalemia and hypoglycemia; at ≥50 mg/day hydrocortisone supplies enough mineralocorticoid effect, so no fludrocortisone is needed acutely.',
      'Find and treat the precipitant — sepsis is the most common; have a low threshold for cultures and empiric antibiotics.',
      'Correct hyponatremia cautiously: it often improves with cortisol and saline alone, and cortisol replacement triggers a water diuresis that can raise sodium quickly — keep within ≤8 mmol/L per 24 h to avoid osmotic demyelination.',
      'As the patient stabilizes, taper hydrocortisone over 1–3 days toward maintenance and ADD fludrocortisone 0.05–0.2 mg daily for primary disease once the hydrocortisone dose falls below ~50 mg/day.',
    ],
    followUp: [
      'Establish maintenance replacement (hydrocortisone ~15–25 mg/day in 2–3 divided doses; fludrocortisone for primary disease) and confirm the cause — autoimmune, adrenal hemorrhage, infiltration, tuberculosis, drugs (checkpoint inhibitors, ketoconazole, etomidate), or pituitary disease.',
      'Teach sick-day rules and stress dosing; provide an emergency hydrocortisone injection kit with training and a medical-alert identifier.',
      'Arrange outpatient endocrine follow-up.',
    ],
    pearls: [
      'Never delay steroids for confirmatory testing — death is from untreated shock, not from one dose of hydrocortisone.',
      'Hypotension with hyponatremia and hyperkalemia (with or without hypoglycemia) is adrenal crisis until proven otherwise.',
      'Dexamethasone is the bridge: it treats the patient without blocking the cortisol assay.',
      'A single induction dose of etomidate and checkpoint-inhibitor immunotherapy are increasingly common precipitants and causes.',
    ],
    tables: [
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
          ['Associated clues', 'Vitiligo, other autoimmune disease', 'Other pituitary deficits, headache, visual change'],
        ],
        note: 'Hyperkalemia and hyperpigmentation point to a primary adrenal process; their absence with other pituitary deficits points central.',
      },
    ],
  },

  // ───────────────────────────── THYROID ─────────────────────────────
  {
    id: 'thyroid-storm',
    name: 'Thyroid Storm',
    category: 'thyroid',
    summary: 'Decompensated, life-threatening thyrotoxicosis with multi-organ failure — hyperthermia, tachyarrhythmia and heart failure, CNS dysfunction, and GI/hepatic involvement. A CLINICAL diagnosis (do not wait for labs); mortality is 10–30%.',
    features: [
      'Hyperpyrexia, often >38.5–40 °C — a temperature out of proportion to any infection is a hallmark.',
      'Cardiovascular: marked sinus tachycardia, atrial fibrillation with rapid ventricular response, high-output then congestive heart failure, and hypotension or shock.',
      'CNS: agitation, anxiety, delirium, psychosis, seizures, progressing to stupor or coma; an apathetic presentation can occur in the elderly.',
      'GI and hepatic: nausea, vomiting, diarrhea, abdominal pain, and jaundice from hepatic congestion or dysfunction (a poor prognostic sign).',
      'Precipitants: infection, surgery (thyroid or non-thyroid), trauma, DKA, childbirth, iodinated contrast or amiodarone, radioactive iodine, abrupt antithyroid-drug withdrawal, or thyroid hormone overdose.',
    ],
    diagnosis: [
      'A clinical diagnosis: labs (suppressed TSH with elevated free T4 and/or T3) confirm thyrotoxicosis, but the DEGREE of hormone elevation does not separate storm from uncomplicated thyrotoxicosis — severity is clinical.',
      'Burch–Wartofsky Point Scale: ≥45 highly suggestive, 25–44 impending storm, <25 unlikely (table). The Japanese Thyroid Association criteria are an alternative (more specific, less sensitive).',
      'Send free T4, total or free T3, TSH, and TRAb if the cause is unknown, plus CBC, LFTs, glucose, and calcium; then hunt the precipitant (cultures, ECG, imaging as indicated).',
    ],
    management: [
      'Order matters — give a thionamide BEFORE iodine. Start all arms promptly in an ICU and treat the precipitant.',
      'β-blockade: propranolol 60–80 mg PO q4–6h (or 0.5–1 mg IV slowly, then 1–3 mg IV under monitoring) — high doses also blunt peripheral T4→T3 conversion; for heart failure or to stay titratable, use an esmolol infusion (load ~250–500 µg/kg, then 50–100 µg/kg/min).',
      'Block synthesis: propylthiouracil (PTU) is preferred in storm — 500–1000 mg PO load, then 250 mg q4h (it also blocks peripheral T4→T3 conversion); methimazole 20–25 mg q4–6h (60–80 mg/day) is the alternative.',
      'Block release with iodine, given ≥1 hour AFTER the thionamide: SSKI 5 drops PO q6h, or Lugol solution 8–10 drops q6–8h — iodine given first would fuel new hormone synthesis.',
      'Glucocorticoid: hydrocortisone 300 mg IV load then 100 mg q8h (or dexamethasone 2 mg IV q6h) — reduces T4→T3 conversion and treats relative adrenal insufficiency.',
      'Supportive: active cooling plus acetaminophen for fever — NOT aspirin, which displaces T4 from binding proteins and raises free hormone; IV fluids with dextrose; treat heart failure and arrhythmia.',
      'Refractory: cholestyramine 4 g PO q6h to interrupt enterohepatic recycling of hormone, therapeutic plasma exchange, and definitive therapy (thyroidectomy or radioactive iodine) once stabilized.',
    ],
    followUp: [
      'ICU-level monitoring until the crisis resolves (usually 1–3 days), then continue the thionamide and transition to DEFINITIVE therapy (thyroidectomy or radioactive iodine) once stable — note radioactive iodine must be deferred after an iodine load, so surgery may be favored.',
      'Close endocrine follow-up; identify and prevent recurrence of the precipitant.',
    ],
    pearls: [
      'Thionamide BEFORE iodine — iodine given first feeds hormone synthesis.',
      'Avoid aspirin (it raises free T4); use acetaminophen and active cooling.',
      'Do not withhold β-blockade for the tachyarrhythmia unless there is true cardiogenic shock — if worried, use titratable esmolol.',
      'Five blocks to remember: block synthesis (thionamide), block release (iodine), block T4→T3 conversion (PTU, propranolol, steroid), block β-effects (β-blocker), and block enterohepatic recycling (cholestyramine).',
      'Jaundice and a falling level of consciousness are poor prognostic signs.',
    ],
    tables: [
      {
        title: 'Burch–Wartofsky Point Scale (thyroid storm)',
        columns: ['Parameter', 'Findings → points'],
        rows: [
          ['Temperature (°F)', '99–99.9 = 5 · 100–100.9 = 10 · 101–101.9 = 15 · 102–102.9 = 20 · 103–103.9 = 25 · ≥104 = 30'],
          ['CNS effects', 'Absent = 0 · Mild/agitation = 10 · Moderate (delirium, psychosis, lethargy) = 20 · Severe (seizure, coma) = 30'],
          ['GI–hepatic', 'Absent = 0 · Moderate (diarrhea, nausea/vomiting, abdominal pain) = 10 · Severe (unexplained jaundice) = 20'],
          ['Heart rate (bpm)', '90–109 = 5 · 110–119 = 10 · 120–129 = 15 · 130–139 = 20 · ≥140 = 25'],
          ['Heart failure', 'Absent = 0 · Mild (pedal edema) = 5 · Moderate (bibasilar rales) = 10 · Severe (pulmonary edema) = 15'],
          ['Atrial fibrillation', 'Absent = 0 · Present = 10'],
          ['Precipitant history', 'Absent = 0 · Present = 10'],
        ],
        note: 'Sum every category: ≥45 highly suggestive of thyroid storm · 25–44 impending · <25 unlikely.',
      },
      {
        title: 'Thyroid storm — agents and doses',
        columns: ['Target', 'Agent', 'Dose'],
        rows: [
          ['β-adrenergic', 'Propranolol (or esmolol if CHF)', '60–80 mg PO q4–6h; or 0.5–1 mg IV then 1–3 mg'],
          ['Block synthesis', 'PTU (preferred)', '500–1000 mg load, then 250 mg q4h'],
          ['Block synthesis (alt)', 'Methimazole', '20–25 mg q4–6h (60–80 mg/day)'],
          ['Block release', 'SSKI or Lugol — ≥1 h AFTER thionamide', 'SSKI 5 drops q6h; Lugol 8–10 drops q6–8h'],
          ['Reduce conversion + cover adrenals', 'Hydrocortisone', '300 mg IV load, then 100 mg q8h'],
          ['Fever', 'Acetaminophen + cooling', 'Avoid aspirin (raises free T4)'],
          ['Refractory', 'Cholestyramine ± plasma exchange', 'Cholestyramine 4 g PO q6h'],
        ],
        note: 'Give the thionamide before iodine. PTU, propranolol, and glucocorticoid all additionally reduce peripheral T4→T3 conversion.',
      },
    ],
  },
  {
    id: 'myxedema-coma',
    name: 'Myxedema Coma',
    category: 'thyroid',
    summary: 'Decompensated severe hypothyroidism — the mirror image of thyroid storm: hypothermia, depressed mentation, and multi-organ slowdown, usually tipped over by infection, cold, or sedatives in an older patient in winter. "Coma" is a misnomer (it need not be present); mortality is 30–50%. Treat empirically.',
    features: [
      'Hypothermia, often <35 °C and sometimes missed by standard thermometers; fever may be ABSENT even with sepsis.',
      'CNS: lethargy, confusion, obtundation progressing to coma, sometimes seizures — altered mentation is the hallmark.',
      'Cardiovascular: bradycardia, hypotension, low-voltage ECG, pericardial effusion, and reduced cardiac output.',
      'Respiratory: hypoventilation with hypercapnia and hypoxia (depressed central drive plus respiratory-muscle weakness) — a leading cause of death.',
      'Other: non-pitting (myxedematous) edema, macroglossia, hoarse voice, hyporeflexia with delayed relaxation, ileus, hyponatremia, and hypoglycemia.',
      'Precipitants: infection (especially pneumonia or urosepsis), cold exposure, myocardial infarction, stroke, sedatives or opioids, surgery or anesthesia, missed levothyroxine, and GI bleeding.',
    ],
    diagnosis: [
      'Clinical, in a hypothyroid context — do not wait for labs to begin treatment.',
      'Labs: a markedly elevated TSH with low free T4 (primary); a low or inappropriately normal TSH with low free T4 points to a CENTRAL cause (look for panhypopituitarism). Free T4 is usually very low.',
      'ALWAYS check cortisol and cover for coexisting adrenal insufficiency, particularly with central hypothyroidism or autoimmune polyglandular disease.',
      'Supporting findings: hyponatremia, hypoglycemia, elevated creatine kinase, anemia, and hypercapnia on blood gas; ECG bradycardia, low voltage, or prolonged QT.',
      'A diagnostic score (thermoregulatory, CNS, cardiovascular, GI, metabolic, and precipitant components) can support the diagnosis when the picture is uncertain.',
    ],
    management: [
      'Cover the adrenals FIRST: hydrocortisone 100 mg IV (then 50–100 mg q8h) BEFORE thyroid hormone — giving thyroid hormone in unrecognized adrenal insufficiency can precipitate adrenal crisis (draw cortisol first if it will not delay).',
      'Thyroid hormone: levothyroxine (T4) IV load 200–400 µg (lower in elderly, cardiac, or small patients), then 1.6 µg/kg/day, reduced to ~75% of the oral dose while given IV.',
      'Consider adding liothyronine (T3) in severe cases — a small IV load of 5–20 µg, then 2.5–10 µg q8h (faster onset, since peripheral conversion is impaired in critical illness) — but T3 raises arrhythmia and ischemia risk, so use lower doses and caution in the elderly or those with heart disease.',
      'Supportive: PASSIVE rewarming with blankets (active external rewarming causes vasodilation and shock); ventilatory support for hypercapnia with a low threshold to intubate; cautious IV fluids with or without vasopressors; treat hypoglycemia.',
      'Correct hyponatremia cautiously — water restriction, with hypertonic saline only for severe symptoms and within the ≤8 mmol/L per 24 h limit.',
      'Find and treat the precipitant — infection is common and fever may be absent, so have a low threshold for cultures and empiric antibiotics; minimize sedatives.',
    ],
    followUp: [
      'ICU care; titrate thyroid replacement to clinical and biochemical response, then transition to oral levothyroxine once stable and the gut is working.',
      'Determine why decompensation occurred (missed levothyroxine, intercurrent illness) and address it; confirm a primary versus central cause.',
    ],
    pearls: [
      'Hydrocortisone BEFORE levothyroxine — always cover the adrenals first.',
      'PASSIVE rewarming only — aggressive active rewarming triggers vasodilatory collapse.',
      'Hypothermia with altered mentation and hyponatremia in an older patient in winter should prompt the diagnosis; fever can be absent despite serious infection.',
      'Hypoventilation with CO2 retention is a leading cause of death — watch the respiratory status and intubate early if needed.',
    ],
    tables: [
      {
        title: 'Thyroid storm vs myxedema coma',
        columns: ['Feature', 'Thyroid storm', 'Myxedema coma'],
        rows: [
          ['Temperature', 'Hyperthermia (often >40 °C)', 'Hypothermia (often <35 °C)'],
          ['Heart rate', 'Tachycardia / atrial fibrillation', 'Bradycardia'],
          ['Mental status', 'Agitation, delirium, psychosis', 'Lethargy, obtundation, coma'],
          ['Common precipitant', 'Infection, surgery, contrast/amiodarone', 'Infection, cold, sedatives, missed T4'],
          ['Give steroids?', 'Yes — reduces T4→T3 conversion', 'Yes — cover adrenals BEFORE T4'],
          ['Mortality', '10–30%', '30–50%'],
        ],
        note: 'Both are clinical diagnoses treated empirically, and both receive glucocorticoid — for different reasons.',
      },
    ],
  },

  {
    id: 'thyrotoxic-periodic-paralysis',
    name: 'Thyrotoxic Periodic Paralysis (TPP)',
    category: 'thyroid',
    summary: 'Acute hypokalemic paralysis triggered by thyrotoxicosis — a sudden intracellular potassium SHIFT, not a true deficit. Classically young Asian or Hispanic men; attacks resolve and recur with the thyroid state and stop once the patient is euthyroid.',
    features: [
      'Sudden symmetric proximal weakness or flaccid paralysis (legs > arms), often waking the patient from sleep or striking in the early morning; may ascend.',
      'Triggers that drive potassium into cells: a high-carbohydrate meal, strenuous exercise followed by rest, stress, or alcohol.',
      'Signs of thyrotoxicosis (tachycardia, tremor, goiter) may be present but are often subtle or absent at the moment of paralysis.',
      'Reflexes reduced or absent; sensation and consciousness preserved; respiratory and bulbar muscles usually spared but are the life threat when involved.',
    ],
    diagnosis: [
      'Hypokalemia, often profound (K commonly <3.0, sometimes <2.0 mEq/L), but WITHOUT total-body potassium depletion — the potassium is shifted intracellularly, not lost.',
      'Biochemical thyrotoxicosis: suppressed TSH with elevated free T4 and/or T3 (most often Graves disease).',
      'Hypophosphatemia and hypomagnesemia commonly accompany it (also shift-driven); low urine potassium / low fractional excretion supports a shift rather than renal loss.',
      'ECG for hypokalemic changes and arrhythmia.',
      'Separate it from familial (non-thyrotoxic) hypokalemic periodic paralysis — TPP requires thyrotoxicosis and typically presents in the 20s to 40s (table).',
    ],
    management: [
      'Continuous cardiac monitoring — arrhythmia and (rarely) respiratory muscle involvement are the dangers.',
      'Non-selective β-blockade is the key acute therapy: propranolol (e.g., 3 mg/kg orally has been used, or standard dosing) blocks the β-adrenergic drive of the shift and can reverse the paralysis WITHOUT the rebound-hyperkalemia risk of potassium loading.',
      'Replete potassium only CAUTIOUSLY, and only for dangerous arrhythmia or severe weakness: low-dose KCl (e.g., ~10 mEq/h, total ≤50–90 mEq) — because total-body potassium is normal, aggressive repletion causes REBOUND HYPERKALEMIA once the shift reverses.',
      'Avoid glucose- or insulin-containing fluids and high-carbohydrate loads — they deepen the shift.',
      'Treat the underlying thyrotoxicosis (thionamide, then definitive therapy) — this is what prevents recurrence.',
    ],
    followUp: [
      'Render the patient euthyroid with antithyroid drugs and then radioactive iodine or surgery — TPP does not recur once thyrotoxicosis is controlled.',
      'Counsel on triggers (high-carbohydrate meals, alcohol, strenuous exercise) until euthyroid.',
      'Watch potassium during recovery for rebound hyperkalemia.',
    ],
    pearls: [
      'The potassium is SHIFTED, not lost — replete sparingly and anticipate rebound hyperkalemia.',
      'Propranolol is the safest way to break the paralysis; treating the thyrotoxicosis is the cure.',
      'Suspect TPP in any young man with sudden hypokalemic paralysis — check thyroid function even when thyrotoxic signs are subtle.',
    ],
    tables: [
      {
        title: 'Thyrotoxic vs familial hypokalemic periodic paralysis',
        columns: ['Feature', 'Thyrotoxic PP', 'Familial hypokalemic PP'],
        rows: [
          ['Thyroid state', 'Thyrotoxic (suppressed TSH)', 'Euthyroid'],
          ['Inheritance', 'Sporadic / acquired', 'Autosomal dominant channelopathy'],
          ['Typical onset', '20s–40s', 'Childhood / teens'],
          ['Demographics', 'Asian / Hispanic men', 'Family history, variable'],
          ['Cure', 'Treat the thyrotoxicosis', 'No cure; avoid triggers'],
          ['Acute therapy', 'Propranolol; cautious K', 'Cautious K; acetazolamide in some'],
        ],
        note: 'Both present with episodic hypokalemic paralysis from a potassium shift; only TPP is curable — by restoring euthyroidism.',
      },
    ],
  },

  // ───────────────────────────── CALCIUM ─────────────────────────────
  {
    id: 'hypercalcemic-crisis',
    name: 'Hypercalcemic Crisis',
    category: 'calcium',
    summary: 'Severe symptomatic hypercalcemia, usually corrected Ca >14 mg/dL — most often malignancy or primary hyperparathyroidism. The treatment triad is rehydrate, inhibit bone resorption, and treat the cause; hypercalcemia itself drives a nephrogenic diuresis that worsens the calcium in a vicious cycle.',
    features: [
      'The classic "stones, bones, abdominal groans, and psychiatric overtones" — nephrolithiasis, bone pain, nausea/vomiting/constipation/anorexia, and fatigue, confusion, or depression.',
      'Polyuria and dehydration: hypercalcemia causes a nephrogenic diabetes insipidus and natriuresis, so volume depletion concentrates calcium further.',
      'Neuromuscular: weakness, lethargy, stupor, coma.',
      'Cardiac: a SHORT QT interval, bradyarrhythmia, heart block at very high levels, and increased sensitivity to digoxin.',
    ],
    diagnosis: [
      'Confirm with corrected calcium or ionized calcium. Corrected Ca = measured Ca + 0.8 × (4.0 - albumin g/dL); severe is generally >14 mg/dL, though symptoms also depend on the rate of rise.',
      'PTH first: HIGH or inappropriately normal PTH → PTH-dependent (primary hyperparathyroidism, lithium, familial hypocalciuric hypercalcemia); SUPPRESSED PTH → PTH-independent, then send PTHrP, 25- and 1,25-vitamin D, and SPEP/UPEP with imaging.',
      'Malignancy mechanisms: PTHrP (humoral hypercalcemia of malignancy), osteolytic metastases, and 1,25-vitamin D production by lymphoma.',
      'ECG for a short QT; check renal function, phosphate, and magnesium.',
    ],
    management: [
      'Rehydrate aggressively: isotonic saline 200-300 mL/h, titrated to a urine output of 100-150 mL/h — restores volume and drives calciuresis (the mainstay).',
      'Calcitonin (salmon) 4 IU/kg SC or IM q12h (can increase to 6-8 IU/kg q6h): fast, lowering calcium within hours, but transient with tachyphylaxis by ~48 h — a bridge while the bisphosphonate takes hold.',
      'Bisphosphonate for durable control: zoledronic acid 4 mg IV over 15 min (preferred in malignancy; onset 2-4 days, nadir ~4-7 days, lasts weeks) or pamidronate 60-90 mg IV over 2-4 h. Adjust for renal impairment.',
      'Denosumab 60-120 mg SC for bisphosphonate-refractory hypercalcemia or significant renal failure (not renally cleared); monitor for delayed hypocalcemia.',
      'Glucocorticoid (prednisone 20-60 mg/day or equivalent) for vitamin-D-mediated, granulomatous, or lymphoma-related hypercalcemia — it lowers 1,25-vitamin D and gut calcium absorption.',
      'Avoid loop diuretics unless volume-overloaded (forced saline diuresis is outdated and causes volume depletion); use hemodialysis with a low-calcium bath for renal failure or refractory life-threatening hypercalcemia.',
    ],
    followUp: [
      'Definitive treatment of the cause: parathyroidectomy for primary hyperparathyroidism; oncologic therapy for malignancy.',
      'Monitor calcium and renal function; prevent post-bisphosphonate/denosumab hypocalcemia by repleting vitamin D and magnesium first.',
    ],
    pearls: [
      'Fluids first — not furosemide; loop diuretics are reserved for volume overload.',
      'Calcitonin buys hours while the bisphosphonate (days) takes effect — start both together.',
      'Suppressed PTH points to malignancy or vitamin D excess; elevated PTH points to primary hyperparathyroidism.',
      'Denosumab is the go-to when bisphosphonates fail or renal function is poor.',
    ],
    tables: [
      {
        title: 'Lowering agents — onset, duration, dose',
        columns: ['Agent', 'Onset', 'Duration', 'Dose'],
        rows: [
          ['IV isotonic saline', 'Hours', 'While running', '200–300 mL/h to UOP 100–150 mL/h'],
          ['Calcitonin', '4–6 h', '~48 h (tachyphylaxis)', '4 IU/kg SC/IM q12h'],
          ['Zoledronic acid', '2–4 days', 'Weeks', '4 mg IV over 15 min'],
          ['Pamidronate', '2–4 days', 'Weeks', '60–90 mg IV over 2–4 h'],
          ['Denosumab', 'Days', 'Weeks', '60–120 mg SC'],
          ['Glucocorticoid (vit-D mediated)', '2–5 days', 'Variable', 'Prednisone 20–60 mg/day'],
          ['Hemodialysis', 'Immediate', '—', 'Low-calcium bath; refractory / renal failure'],
        ],
        note: 'Combine immediate therapy (saline + calcitonin) with durable therapy (bisphosphonate or denosumab); calcitonin covers the gap until the antiresorptive works.',
      },
    ],
  },
  {
    id: 'hypocalcemia',
    name: 'Severe / Symptomatic Hypocalcemia',
    category: 'calcium',
    summary: 'Acute hypocalcemia causing neuromuscular irritability that can escalate to tetany, laryngospasm, seizures, and QT prolongation — most often after thyroid or parathyroid surgery. Magnesium must be normal or repletion fails.',
    features: [
      'Perioral and acral (fingertip and toe) paresthesias — the earliest symptom.',
      'Chvostek sign (facial twitch on tapping the facial nerve) and Trousseau sign (carpal spasm on BP-cuff inflation, the more specific of the two).',
      'Muscle cramps and tetany; laryngospasm and bronchospasm (life-threatening); seizures.',
      'Cardiac: prolonged QT, arrhythmia, hypotension, and reduced contractility or heart failure.',
    ],
    diagnosis: [
      'Confirm with corrected calcium or ionized calcium (the active fraction; total Ca reads falsely normal with alkalosis and falsely low with low albumin).',
      'Check MAGNESIUM — hypomagnesemia impairs PTH secretion and action and causes refractory hypocalcemia. Also check phosphate, PTH, 25-vitamin D, and renal function: a LOW PTH with low calcium = hypoparathyroidism; a HIGH PTH = secondary response (vitamin D deficiency, CKD, pseudohypoparathyroidism).',
      'ECG for QT prolongation.',
      'Common causes: post-surgical hypoparathyroidism (after thyroid/parathyroid/neck surgery), hungry bone syndrome after parathyroidectomy, severe vitamin D deficiency, CKD, acute pancreatitis, hyperphosphatemia or tumor lysis, and drugs (bisphosphonates, denosumab, cinacalcet).',
    ],
    management: [
      'Symptomatic or severe (tetany, laryngospasm, seizure, QT prolongation, or Ca <7.5 mg/dL): IV calcium gluconate 1-2 g (10-20 mL of 10% = 90-180 mg elemental Ca) in 50-100 mL D5W over 10-20 min with cardiac monitoring.',
      'If it persists, follow with an infusion: ~11 g calcium gluconate (≈990 mg elemental) in 1 L D5W or saline at ~50 mL/h (≈0.5-1.5 mg/kg/h elemental), titrated to calcium and symptoms.',
      'Replete MAGNESIUM first or concurrently when low — hypocalcemia will not correct until magnesium is restored.',
      'Start oral calcium plus active vitamin D (calcitriol 0.25-0.5 µg twice daily) for ongoing repletion, especially in post-surgical hypoparathyroidism; hungry bone syndrome may need large sustained doses.',
      'Treat the underlying cause.',
    ],
    followUp: [
      'Titrate calcium and calcitriol; monitor for hypercalcemia and hypercalciuria (aim for low-normal calcium in hypoparathyroidism to limit nephrocalcinosis).',
      'Endocrine follow-up for long-term hypoparathyroidism (thiazide for hypercalciuria; recombinant PTH in selected patients).',
    ],
    pearls: [
      'Replete magnesium or repletion fails — always check and correct it.',
      'Calcium GLUCONATE peripherally; calcium CHLORIDE delivers far more elemental calcium but is sclerosing and causes severe necrosis on extravasation — give it only through a central line.',
      'Trousseau sign is more specific than Chvostek (which can be positive in healthy people).',
      'After total thyroidectomy, watch for symptomatic hypocalcemia at 24-72 h; a falling or low PTH predicts it.',
    ],
    tables: [
      {
        title: 'Calcium gluconate vs calcium chloride',
        columns: ['Feature', 'Calcium gluconate 10%', 'Calcium chloride 10%'],
        rows: [
          ['Elemental Ca per 10 mL', '~93 mg (4.65 mEq)', '~273 mg (13.6 mEq)'],
          ['Access', 'Peripheral acceptable', 'CENTRAL line only'],
          ['Extravasation risk', 'Lower', 'High — tissue necrosis'],
          ['Typical use', 'First line for repletion', 'Arrest / when central access present'],
        ],
        note: 'Most non-arrest hypocalcemia is treated with calcium gluconate; chloride is reserved for arrest or central-access situations because of its sclerosing risk.',
      },
    ],
  },

  // ───────────────────────────── SODIUM ─────────────────────────────
  {
    id: 'hyponatremia',
    name: 'Severe Hyponatremia',
    category: 'sodium',
    summary: 'Low serum sodium — management turns on two axes: the SYMPTOMS and acuity (cerebral-edema risk when acute and severe) and the CORRECTION RATE (osmotic demyelination risk when a chronic low sodium is raised too fast). Diagnose by tonicity, then volume status and urine studies.',
    features: [
      'Symptoms track severity and rate: nausea, headache, lethargy, confusion → seizures, coma, respiratory arrest (acute cerebral edema, typically Na <120 or a rapid drop).',
      'Chronic hyponatremia is often paucisymptomatic but still causes gait instability, falls, and attention deficits even when called "asymptomatic."',
    ],
    diagnosis: [
      'Step 1 — measure serum OSMOLALITY. Most hyponatremia is hypotonic (true). Exclude isotonic pseudohyponatremia (severe hyperlipidemia or paraproteinemia) and hypertonic hyponatremia (hyperglycemia, mannitol — correct Na up by 1.6-2.4 mEq/L per 100 mg/dL glucose above 100).',
      'Step 2 — for hypotonic hyponatremia, assess VOLUME STATUS and send urine osmolality and urine sodium.',
      'Urine osm <100 mOsm/kg → appropriately dilute urine (primary polydipsia, beer potomania, low solute intake).',
      'Urine osm >100 with EUVOLEMIA and urine Na >30 → SIADH — a diagnosis of exclusion, so also check TSH and cortisol (hypothyroidism and adrenal insufficiency mimic it).',
      'HYPOvolemic (urine Na <20-30, or >30 with renal/diuretic loss) versus HYPERvolemic (heart failure, cirrhosis, nephrotic — urine Na usually <20).',
      'Decide ACUTE (<48 h) versus CHRONIC (≥48 h or unknown) — chronic and unknown-duration cases carry the higher demyelination risk and are corrected slowly.',
    ],
    management: [
      'Severe symptoms (seizure, coma): 3% hypertonic saline 100-150 mL IV bolus, repeated up to 2-3 times or until symptoms improve, targeting a rise of only 4-6 mEq/L — that increment relieves cerebral edema; do not chase the number.',
      'CORRECTION LIMIT: ≤8 mEq/L per 24 h (≤6 mEq/L if high-risk — alcohol use, malnutrition, hypokalemia, advanced liver disease, Na <105) and ≤18 mEq/L over 48 h.',
      'Recheck sodium every 2-4 h during active correction; remember that correcting potassium also raises sodium.',
      'Cause-directed: SIADH → fluid restriction first, then salt tabs ± loop diuretic, urea, or a vaptan if refractory; HYPOvolemic → isotonic saline (which switches off ADH and can trigger a brisk water diuresis and overcorrection); HYPERvolemic → treat heart failure or cirrhosis with fluid and sodium restriction.',
      'If OVERCORRECTING (rise exceeding the limit), re-lower with D5W ~6 mL/kg over 1-2 h and/or desmopressin 2-4 µg — the proactive "DDAVP clamp" prevents overcorrection in high-risk patients.',
    ],
    followUp: [
      'Establish and treat the etiology; review medications (thiazides, SSRIs, carbamazepine, desmopressin, MDMA).',
      'For SIADH, identify the source (CNS, pulmonary, malignancy, drugs); counsel on fluid intake and recheck sodium.',
    ],
    pearls: [
      'The danger is the RATE, in both directions — too fast down (or a rapid drop) risks cerebral edema; too fast up risks osmotic demyelination.',
      'Hypertonic saline for severe symptoms aims for only a 4-6 mEq/L rise — enough to stop seizures.',
      'In high-risk patients a proactive DDAVP clamp plus controlled hypotonic fluid lets you set the correction rate precisely.',
      'Always check TSH and cortisol before settling on SIADH — hypothyroidism and adrenal insufficiency are mimics.',
    ],
    tables: [
      {
        title: 'Classifying hypotonic hyponatremia',
        columns: ['Volume status', 'Urine Na', 'Typical causes', 'First-line treatment'],
        rows: [
          ['Hypovolemic', '<20–30 (extrarenal); >30 (renal/diuretic)', 'GI/skin loss, diuretics, cerebral salt wasting, adrenal insufficiency', 'Isotonic saline'],
          ['Euvolemic', '>30, urine osm >100', 'SIADH, hypothyroidism, glucocorticoid deficiency', 'Fluid restriction; treat cause'],
          ['Hypervolemic', '<20 (>30 in renal failure)', 'Heart failure, cirrhosis, nephrotic, renal failure', 'Fluid + Na restriction; treat cause'],
        ],
        note: 'Exclude hyperglycemia and pseudohyponatremia first, and check TSH and cortisol before diagnosing SIADH.',
      },
    ],
  },
  {
    id: 'hypernatremia',
    name: 'Severe Hypernatremia',
    category: 'sodium',
    summary: 'High serum sodium always means a water deficit relative to sodium — usually impaired thirst or no access to water (the very young, elderly, or obtunded), sometimes diabetes insipidus or osmotic losses. Correct slowly to avoid cerebral edema.',
    features: [
      'Thirst is the main defense — its absence (impaired access, altered mentation, hypodipsia) is what lets hypernatremia develop.',
      'Neurologic: lethargy, irritability, weakness, hyperreflexia, twitching, seizures, coma; severity tracks the rate of rise (rapid in acute, the brain adapts in chronic).',
      'Clues to the cause: volume depletion (GI losses, osmotic diuresis), a large dilute urine output (diabetes insipidus), or fever and tachypnea (insensible losses).',
    ],
    diagnosis: [
      'Serum sodium with the FREE-WATER DEFICIT: deficit (L) = TBW × ([measured Na / 140] - 1), where TBW = 0.6 × weight (men) or 0.5 × weight (women), and ~0.45-0.5 in the elderly.',
      'Assess volume status and URINE OSMOLALITY: a high urine osm (>700-800) with low volume = appropriate renal water conservation (extrarenal/insensible loss, low intake); an INAPPROPRIATELY dilute urine (osm below serum, large volume) = diabetes insipidus or osmotic diuresis.',
      'History: water access, GI losses, osmotic diuresis (hyperglycemia, mannitol, high-protein tube feeds), and diuretics.',
      'For dilute urine, give desmopressin to separate CENTRAL DI (urine osm rises ≥50%) from NEPHROGENIC DI (no response) — see the diabetes insipidus entry.',
    ],
    management: [
      'If hypovolemic or unstable, restore perfusion with isotonic saline FIRST, then turn to the water deficit — a profoundly volume-depleted patient needs volume before free water.',
      'Replace the free-water deficit with oral or enteral water when possible, or IV D5W or 0.45% saline; ADD the ongoing losses (urine, GI, insensible) to the calculated deficit.',
      'Correct SLOWLY: ≤10-12 mEq/L per 24 h (≈≤0.5 mEq/L/h) to avoid cerebral edema — acute (<48 h) hypernatremia can be corrected somewhat faster, but err toward caution; recheck sodium every 4-6 h.',
      'Treat the cause: central DI → desmopressin; nephrogenic DI → stop the offending drug (lithium), correct hypercalcemia/hypokalemia, and use a thiazide with a low-solute diet; osmotic diuresis → control the osmole (e.g., glucose).',
    ],
    followUp: [
      'Diagnose and manage diabetes insipidus or the source of losses; ensure ongoing access to water (a recurring problem in dependent or hospitalized patients).',
      'Monitor sodium and neurologic status; provide a free-water plan for tube-fed patients.',
    ],
    pearls: [
      'Always account for ONGOING free-water losses in the deficit calculation — under-replacing them is the usual reason sodium does not fall.',
      'Resuscitate volume before chasing the sodium in a shocked patient.',
      'Hospital-acquired hypernatremia is usually iatrogenic — inadequate free water for a patient who cannot ask for it — so anticipate it.',
    ],
    tables: [
      {
        title: 'Urine osmolality in hypernatremia',
        columns: ['Urine osm (mOsm/kg)', 'Interpretation', 'Examples'],
        rows: [
          ['>700–800 (concentrated)', 'Appropriate renal water conservation', 'Insensible/GI loss, low water intake'],
          ['300–700 (intermediate)', 'Partial concentrating defect / osmotic', 'Osmotic diuresis, partial DI'],
          ['<300 (dilute, vs high serum)', 'Inappropriate — diabetes insipidus', 'Central or nephrogenic DI'],
        ],
        note: 'An osmotic diuresis (glucose, mannitol, urea from high-protein feeds) also raises urine output — check a urine glucose and the clinical context before labeling it DI.',
      },
    ],
  },

  // ─────────────────────────── POTASSIUM ───────────────────────────
  {
    id: 'hyperkalemia',
    name: 'Hyperkalemia',
    category: 'potassium',
    summary: 'Elevated serum potassium with a real risk of fatal arrhythmia — the priority is to STABILIZE the myocardium, SHIFT potassium into cells, then REMOVE it from the body. Endocrine causes (hypoaldosteronism, adrenal insufficiency, type 4 RTA) are easy to miss.',
    features: [
      'Often asymptomatic until dangerous; nonspecific weakness, paresthesias, palpitations, or flaccid paralysis at high levels.',
      'ECG is the vital sign: peaked T waves (often K >6) → PR prolongation and flattened/absent P waves (>7) → widened QRS (>8) → sine-wave pattern → ventricular fibrillation or asystole.',
      'ECG changes can be ABSENT even with severe hyperkalemia, so a normal tracing is not reassuring — treat by the number and the trajectory.',
    ],
    diagnosis: [
      'Confirm the value and EXCLUDE pseudohyperkalemia (hemolyzed sample, fist clenching, marked thrombocytosis or leukocytosis) — recheck a free-flowing or plasma sample if the result surprises you with no ECG changes.',
      'Get an ECG immediately for any significant elevation.',
      'Sort the cause: reduced excretion (renal failure — the big one); drugs (ACEi/ARB, aldosterone antagonists, K-sparing diuretics, NSAIDs, trimethoprim, heparin, calcineurin inhibitors); transcellular shift (acidosis, insulin deficiency, β-blockade, tissue breakdown — rhabdomyolysis, tumor lysis, hemolysis); and ENDOCRINE causes — hypoaldosteronism, adrenal insufficiency, and type 4 (hyporeninemic hypoaldosteronic) RTA in diabetes.',
    ],
    management: [
      'STABILIZE the membrane if there are ECG changes or K >6.5: IV calcium gluconate 1-2 g (10-20 mL of 10%) over 2-3 min, repeat in 5 min if the ECG is unchanged — onset is minutes and it does NOT lower potassium. Use calcium chloride only via central access; give slowly if on digoxin.',
      'SHIFT potassium into cells: regular insulin 10 units IV with 25 g dextrose (D50) — recheck glucose and use a D10 infusion if borderline; nebulized albuterol 10-20 mg (additive); sodium bicarbonate only if metabolically acidotic.',
      'REMOVE potassium from the body: a loop diuretic if the patient makes urine; GI binders — sodium zirconium cyclosilicate or patiromer (better tolerated than sodium polystyrene sulfonate, which carries a colonic-necrosis risk); and HEMODIALYSIS for renal failure or refractory, life-threatening hyperkalemia (the only definitive removal in anuria).',
      'Stop the offending drugs and treat the cause — fludrocortisone for documented hypoaldosteronism, hydrocortisone if adrenal crisis is the driver.',
    ],
    followUp: [
      'Address the etiology and review the medication list; RECHECK potassium after the shifting therapy wears off — insulin and albuterol are temporary and rebound is common.',
      'For renal or adrenal causes, arrange definitive management (dialysis access, mineralocorticoid replacement, dietary potassium restriction).',
    ],
    pearls: [
      'Calcium protects the heart but does NOT lower potassium — you still must shift it and remove it.',
      'Insulin-dextrose and albuterol only SHIFT potassium for a few hours; without removal (dialysis, binders, diuresis) it rebounds.',
      'Recurrent unexplained hyperkalemia, especially in a diabetic, should prompt a look for type 4 RTA / hyporeninemic hypoaldosteronism and adrenal insufficiency.',
    ],
    tables: [
      {
        title: 'Hyperkalemia — stabilize, shift, remove',
        columns: ['Step', 'Agent', 'Dose', 'Onset / duration'],
        rows: [
          ['Stabilize', 'Calcium gluconate 10%', '1–2 g (10–20 mL) over 2–3 min', '1–3 min / 30–60 min'],
          ['Shift', 'Insulin + dextrose', '10 U regular IV + 25 g D50', '15–30 min / 4–6 h'],
          ['Shift', 'Albuterol nebulized', '10–20 mg', '15–30 min / ~2 h'],
          ['Shift', 'Sodium bicarbonate', 'Only if acidotic', 'Variable'],
          ['Remove', 'Loop diuretic', 'If urine output present', '~30 min'],
          ['Remove', 'Binder (SZC / patiromer)', 'Oral', 'Hours'],
          ['Remove', 'Hemodialysis', 'Refractory / renal failure', 'Immediate'],
        ],
        note: 'Calcium does not lower potassium, and shifting agents are temporary — always pair them with a removal strategy.',
      },
    ],
  },
  {
    id: 'hypokalemia',
    name: 'Hypokalemia',
    category: 'potassium',
    summary: 'Low serum potassium risking arrhythmia (especially with digoxin or a long QT) and weakness — usually GI or renal loss, a transcellular shift, or mineralocorticoid excess. Magnesium must be repleted or potassium will not correct.',
    features: [
      'Weakness, fatigue, cramps, myalgia; ileus and constipation; palpitations and arrhythmia.',
      'ECG: flattened or inverted T waves, prominent U waves, ST depression, and a prolonged QT/QU predisposing to torsades.',
      'Severe (K <2.5): rhabdomyolysis and ascending paralysis.',
    ],
    diagnosis: [
      'Serum potassium with magnesium and acid-base status — and recall that each ~0.3 mEq/L fall below 3.5 reflects a large total-body deficit (~100 mEq), so low values mean big deficits.',
      'Distinguish a SHIFT (insulin, β-agonists, alkalosis, thyrotoxic periodic paralysis, refeeding) from true LOSS.',
      'For true loss, check a urine potassium: LOW = GI loss or prior diuretic; HIGH = ongoing renal loss — then use blood pressure and the aldosterone-to-renin ratio to screen for primary hyperaldosteronism, and consider RTA, Bartter/Gitelman, and hypomagnesemia.',
    ],
    management: [
      'Replete potassium: ORAL (40-60 mEq KCl per dose, repeated) for mild-moderate; IV for severe, symptomatic, or NPO patients.',
      'IV rate caps: peripheral ≤10 mEq/h at a concentration ≤40 mEq/L (to avoid phlebitis); a central line with continuous cardiac monitoring for faster rates (up to ~20 mEq/h) in severe or arrhythmic hypokalemia — NEVER give potassium by IV push.',
      'Replete MAGNESIUM (magnesium sulfate 1-2 g IV) — hypomagnesemia drives renal potassium wasting, so refractory hypokalemia will not correct until magnesium is restored.',
      'Cardiac monitoring for severe, symptomatic, or digoxin-treated patients; recheck potassium during repletion (overshoot is easy in renal impairment).',
      'Treat the cause: hold or change diuretics, treat vomiting/diarrhea, address hyperaldosteronism, and correct an alkalosis or shift state.',
    ],
    followUp: [
      'Treat the underlying cause; adjust diuretics or add a potassium-sparing agent; ensure magnesium is repleted.',
      'Evaluate for PRIMARY HYPERALDOSTERONISM in any hypertensive or spontaneously hypokalemic patient (aldosterone-renin ratio).',
    ],
    pearls: [
      'Always check and replace magnesium — it is the most common reason hypokalemia is refractory.',
      'Do not push IV potassium and respect the rate caps — too-rapid infusion can be fatal.',
      'Hypokalemia plus hypertension → screen for primary hyperaldosteronism; hypokalemia plus paralysis in a young man → think thyrotoxic periodic paralysis.',
    ],
    tables: [
      {
        title: 'Potassium repletion guide',
        columns: ['Setting', 'Route / rate', 'Notes'],
        rows: [
          ['Mild–moderate (K 3.0–3.5), takes PO', 'Oral KCl 40–60 mEq per dose', 'Repeat and recheck; preferred when possible'],
          ['Severe / symptomatic / NPO', 'IV KCl', 'Peripheral ≤10 mEq/h (≤40 mEq/L); central ≤20 mEq/h with monitoring'],
          ['Refractory to repletion', 'Give magnesium with it', 'MgSO4 1–2 g IV; low Mg drives renal K wasting'],
          ['Digoxin / arrhythmia', 'IV with cardiac monitoring', 'Hypokalemia potentiates digoxin toxicity'],
        ],
        note: 'Each 0.3 mEq/L below 3.5 reflects roughly a 100 mEq total-body deficit; never give potassium by IV push.',
      },
    ],
  },

  // ───────────────────────── CATECHOLAMINE ─────────────────────────
  {
    id: 'pheo-crisis',
    name: 'Pheochromocytoma Crisis',
    category: 'catecholamine',
    summary: 'A catecholamine surge from a pheochromocytoma or paraganglioma causing severe, labile hypertension and end-organ damage (and sometimes paradoxical shock). The cardinal rule: α-blockade must precede β-blockade, or unopposed α-stimulation precipitates a hypertensive crisis.',
    features: [
      'The classic triad — episodic pounding headache, palpitations, and diaphoresis — with paroxysmal severe hypertension (sometimes alternating with hypotension, or frank collapse in crisis).',
      'Pallor, anxiety or a sense of doom, tremor, hyperglycemia, and weight loss.',
      'End-organ injury: catecholamine (takotsubo-like) cardiomyopathy, arrhythmia, myocardial ischemia, pulmonary edema, stroke, and multi-organ failure — pheochromocytoma multisystem crisis.',
      'Triggers of a crisis: anesthesia or surgery, tumor manipulation or biopsy, certain drugs (see pearls), and iodinated contrast.',
    ],
    diagnosis: [
      'Biochemical confirmation with plasma free metanephrines or 24-h urine fractionated metanephrines (high sensitivity); draw under proper conditions (supine, avoiding interfering drugs).',
      'Imaging (CT or MRI of abdomen/pelvis; functional MIBG or DOTATATE PET) localizes AFTER biochemical confirmation — never image first.',
      'In an acute crisis the diagnosis may already be known or made clinically; treat the hemodynamics while confirming.',
    ],
    management: [
      'α-blockade FIRST for acute control: IV phentolamine (a pure α-blocker, 5 mg boluses) or a titratable infusion of nicardipine or sodium nitroprusside; magnesium sulfate is a useful adjunct (it inhibits catecholamine release).',
      'Add a β-blocker ONLY after adequate α-blockade, to control reflex tachycardia or arrhythmia — a β-blocker given first removes β-mediated vasodilation and leaves unopposed α-vasoconstriction, causing a hypertensive crisis and pulmonary edema.',
      'Volume expansion: chronic catecholamine excess contracts the intravascular space, so these patients are volume-DEPLETED and need fluids; manage cardiomyopathy and arrhythmia supportively.',
      'Definitive therapy is SURGICAL resection — but only after full preoperative preparation: 10-14 days of α-blockade (phenoxybenzamine or doxazosin), then a β-blocker once tachycardic, plus a high-sodium diet and fluids to re-expand volume.',
    ],
    followUp: [
      'Complete biochemical confirmation and localization; refer for surgery with proper preoperative blockade.',
      'Genetic counseling and testing (a large fraction are hereditary — SDHx, VHL, RET/MEN2, NF1); lifelong biochemical surveillance for recurrence or metastasis.',
    ],
    pearls: [
      'NEVER give a β-blocker before α-blockade — unopposed α-stimulation triggers a hypertensive crisis.',
      'A pheochromocytoma crisis masquerades as ACS, sepsis, or thyroid storm — consider it when severe hypertension is paroxysmal or labile.',
      'Drugs that can provoke a crisis: unopposed β-blockers, glucagon, metoclopramide, high-dose corticosteroids, and some anesthetics — avoid them until blocked.',
      'The patient is volume-CONTRACTED despite hypertension; expect hypotension after the tumor is removed and volume-load beforehand.',
    ],
    tables: [
      {
        title: 'Acute blood-pressure control in pheochromocytoma',
        columns: ['Agent', 'Class', 'Note'],
        rows: [
          ['Phentolamine', 'α-blocker (IV bolus)', 'First line for acute control; 5 mg boluses'],
          ['Nicardipine', 'Calcium-channel blocker (infusion)', 'Titratable; good for labile pressure'],
          ['Sodium nitroprusside', 'Direct vasodilator (infusion)', 'Rapid, titratable'],
          ['Magnesium sulfate', 'Inhibits catecholamine release', 'Useful adjunct'],
          ['β-blocker', 'Only AFTER α-blockade', 'For reflex tachycardia/arrhythmia — never first'],
        ],
        note: 'For preoperative prep, use phenoxybenzamine or doxazosin for 10–14 days, add a β-blocker once tachycardic, and salt/volume load.',
      },
    ],
  },

  // ───────────────────────────── PITUITARY ─────────────────────────────
  {
    id: 'pituitary-apoplexy',
    name: 'Pituitary Apoplexy',
    category: 'pituitary',
    summary: 'Acute hemorrhage or infarction of the pituitary, usually into a pre-existing (often unknown) adenoma — a neuro-ophthalmic emergency whose immediate life threat is acute secondary adrenal insufficiency. Give stress-dose steroids before any imaging delay.',
    features: [
      'Sudden severe ("thunderclap") retro-orbital or frontal headache — the most common symptom — with nausea and vomiting.',
      'Visual loss or a field defect (bitemporal hemianopia from chiasm compression) and ophthalmoplegia with diplopia or ptosis (CN III, IV, VI in the cavernous sinus); reduced acuity.',
      'Meningismus and photophobia, mimicking subarachnoid hemorrhage or meningitis; altered consciousness if severe.',
      'Acute hypopituitarism — especially secondary ADRENAL INSUFFICIENCY causing hypotension and hyponatremia; this is the immediate killer.',
      'Often a precipitant: anticoagulation, a dynamic pituitary test, surgery, pregnancy or the postpartum state (Sheehan syndrome), or a dopamine agonist — but frequently spontaneous.',
    ],
    diagnosis: [
      'Urgent pituitary MRI (the study of choice; CT may miss it but can exclude subarachnoid hemorrhage or be used when MRI is unavailable).',
      'Draw the pituitary axes BEFORE steroids if it will not delay treatment: cortisol and ACTH (the urgent one), free T4 and TSH, prolactin, IGF-1, LH/FSH with testosterone or estradiol — plus electrolytes and glucose.',
      'Watch sodium: secondary adrenal insufficiency and SIADH cause hyponatremia, while a less common concurrent diabetes insipidus causes hypernatremia.',
    ],
    management: [
      'Stress-dose GLUCOCORTICOIDS immediately — hydrocortisone 100 mg IV then 50 mg q6h (or 200 mg/24h infusion) — do NOT wait for the cortisol result; secondary adrenal insufficiency is the life threat and steroids also help mass-effect edema.',
      'Hemodynamic resuscitation with fluids; correct electrolytes (manage hyponatremia or SIADH cautiously; treat diabetes insipidus if it appears).',
      'Urgent NEUROSURGERY and OPHTHALMOLOGY evaluation: transsphenoidal decompression for severe or progressive visual loss or declining consciousness; selected stable patients with mild, non-progressive deficits can be managed conservatively with close monitoring and serial visual fields.',
      'Replace deficient hormones — thyroid hormone only AFTER glucocorticoid is on board (to avoid precipitating adrenal crisis); sex steroids and growth hormone are addressed later.',
    ],
    followUp: [
      'Full pituitary hormone assessment and long-term replacement (a majority have lasting deficits); serial visual fields and acuity.',
      'Neurosurgery and endocrine follow-up with interval imaging of any residual tumor; counsel that apoplexy may be the first presentation of a previously unknown pituitary adenoma.',
    ],
    pearls: [
      'Steroids before thyroid hormone — and before any imaging delay.',
      'Thunderclap headache with an ophthalmoplegia or a visual-field cut points to apoplexy; it mimics subarachnoid hemorrhage and bacterial meningitis.',
      'The danger is not the headache but the unrecognized cortisol deficiency — hypotension and hyponatremia are the tells.',
    ],
    tables: [
      {
        title: 'Pituitary axes in apoplexy — assess all, act on adrenal',
        columns: ['Axis', 'Test', 'Acute action'],
        rows: [
          ['Adrenal (ACTH–cortisol)', 'Cortisol, ACTH', 'Stress-dose hydrocortisone NOW — do not wait'],
          ['Thyroid', 'Free T4, TSH', 'Replace levothyroxine only AFTER steroids'],
          ['Lactotroph', 'Prolactin', 'Low or high; a high level suggests a prolactinoma'],
          ['Gonadal', 'LH/FSH, testosterone or estradiol', 'Replace later'],
          ['Somatotroph', 'IGF-1', 'Assess later'],
          ['Posterior pituitary', 'Sodium, urine output', 'Watch for SIADH (low Na) or DI (high Na)'],
        ],
        note: 'The adrenal axis is the emergency; every other axis is assessed but managed after the patient is stabilized and glucocorticoid-replaced.',
      },
    ],
  },

  {
    id: 'central-diabetes-insipidus',
    name: 'Acute Central Diabetes Insipidus (AVP Deficiency)',
    category: 'pituitary',
    summary: 'Sudden failure of vasopressin (AVP/ADH) secretion — large volumes of dilute urine with a rising sodium. The classic acute setting is post–pituitary or hypothalamic surgery (or traumatic brain injury), where the danger is rapid hypernatremia and, in the triphasic response, swings between DI and SIADH.',
    features: [
      'Abrupt polyuria (often >3 L/day, sometimes far higher) with dilute, near-colorless urine; intense thirst if the patient is awake with water access.',
      'Hypernatremia and hyperosmolality develop fast once intake cannot keep pace — sedated, post-op, or unconscious patients are at highest risk because thirst cannot protect them.',
      'Post-neurosurgical triphasic response: (1) early DI on days 0–3 (axonal shock) → (2) transient SIADH/antidiuresis around days 4–10 (release of stored AVP) → (3) permanent DI — sodium can swing in either direction.',
    ],
    diagnosis: [
      'The defining combination: a high or rising serum sodium/osmolality together with INAPPROPRIATELY dilute urine — urine osmolality below serum osmolality (typically urine osm <300 mOsm/kg, often <100) and low specific gravity, while urine output stays high.',
      'Central vs nephrogenic: give desmopressin — in CENTRAL DI urine osmolality rises (classically by ≥50%) and output falls; in nephrogenic DI it does not (table).',
      'Copeptin (a stable AVP surrogate) supports formal water-deprivation or hypertonic-saline testing, but acute post-op DI is usually a bedside diagnosis from urine output, sodium, and paired serum/urine osmolalities.',
      'Exclude an osmotic diuresis (glucose, mannitol, post-obstructive) and simple post-op fluid mobilization before labeling it DI.',
    ],
    management: [
      'Protect sodium FIRST by matching losses: replace urine output plus insensible losses with oral water if the patient can drink, or IV hypotonic fluid (D5W or 0.45% saline) if not — do not let the patient out-urinate intake.',
      'Desmopressin (DDAVP) for confirmed central DI: a small initial dose titrated to effect (e.g., ~1–2 µg IV/SC, 10 µg intranasal, or 60–120 µg oral), then redosed by clinical response — urine output, thirst, sodium — not on a rigid schedule.',
      'In the acute post-op setting, dose desmopressin conservatively and let it wear off between doses to reveal whether AVP function is returning — over-treatment during the SIADH phase of the triphasic response causes dangerous HYPONATREMIA.',
      'Correct established hypernatremia at the safe rate (≤10–12 mEq/L per 24 h) to avoid cerebral edema; recheck sodium every 2–6 h while output is high or desmopressin is being titrated.',
    ],
    followUp: [
      'Establish permanence and cause (post-surgical, tumor or infiltrative disease, trauma, hypophysitis) and arrange maintenance desmopressin with an explicit "let it wear off" rule to prevent water intoxication.',
      'Screen the anterior pituitary axes — cortisol especially: unrecognized ACTH deficiency can mask DI until glucocorticoid is replaced, which then unmasks the polyuria.',
      'Educate the patient: take desmopressin on a steady schedule, allow a daily breakthrough to pass dilute urine, and avoid excess free-water intake.',
    ],
    pearls: [
      'Dilute urine in the face of a HIGH sodium is the tell — large volumes of pale urine while the sodium climbs is DI until proven otherwise.',
      'After pituitary surgery, expect the triphasic pattern and dose desmopressin so it wears off between doses — fixed scheduled dosing through the SIADH phase causes hyponatremia.',
      'Unrecognized cortisol deficiency can hide DI; replacing glucocorticoid can unmask it.',
    ],
    tables: [
      {
        title: 'Central vs nephrogenic diabetes insipidus',
        columns: ['Feature', 'Central DI', 'Nephrogenic DI'],
        rows: [
          ['Defect', 'Deficient AVP secretion', 'Renal resistance to AVP'],
          ['Response to desmopressin', 'Urine osm rises ≥50%', 'Little or no rise'],
          ['Copeptin', 'Low', 'High'],
          ['Common causes', 'Surgery, tumor, trauma, hypophysitis', 'Lithium, hypercalcemia, hypokalemia, hereditary'],
          ['Treatment', 'Desmopressin', 'Stop offending agent; thiazide, low-solute diet'],
        ],
        note: 'A desmopressin trial is the bedside discriminator — central DI concentrates the urine; nephrogenic DI does not.',
      },
    ],
  },
]