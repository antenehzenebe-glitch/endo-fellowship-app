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
    summary: 'Acute glucocorticoid deficiency causing shock — a true "give steroids now" emergency.',
    features: [
      'Hypotension/shock poorly responsive to fluids and pressors.',
      'Nausea, vomiting, abdominal pain, fever, profound weakness, confusion.',
      'Labs may show hyponatremia, hyperkalemia, hypoglycemia (especially in primary AI).',
    ],
    diagnosis: [
      'Clinical — treat first, confirm later.',
      'Random (basal) cortisol: <3–5 µg/dL (<83–138 nmol/L) strongly supports adrenal insufficiency; >18 µg/dL (>500 nmol/L) makes it unlikely. Draw it (± ACTH, aldosterone/renin) BEFORE steroids only if that will not delay treatment.',
      '250 µg cosyntropin (ACTH) stimulation test once stable: peak cortisol <18 µg/dL (<500 nmol/L) at 30–60 min confirms adrenal insufficiency.',
      'Localize the lesion: primary AI → HIGH ACTH with hyperkalemia + hyponatremia; central (secondary) AI → low or inappropriately normal ACTH with normal potassium.',
      'If a stim test is planned but you must treat now, bridge with dexamethasone (does not cross-react with the cortisol assay).',
    ],
    management: [
      'Hydrocortisone 100 mg IV immediately, then 50 mg IV q6h (or 200 mg/24h continuous) — do NOT wait for labs.',
      'Aggressive IV fluids — isotonic saline with dextrose (D5NS) for volume and hypoglycemia.',
      'Treat hyperkalemia and hypoglycemia; identify and treat the precipitant (infection, surgery, missed steroids, MI).',
      'Stress-dose hydrocortisone covers mineralocorticoid needs acutely; add fludrocortisone later for primary AI once HC <50 mg/day.',
    ],
    followUp: [
      'Education on stress dosing and sick-day rules; emergency hydrocortisone injection kit; medical-alert identification.',
      'Outpatient endocrine follow-up; clarify the cause (autoimmune, adrenal hemorrhage, pituitary disease).',
    ],
    pearls: [
      'Never delay steroids for confirmatory testing.',
      'Hypotension + hyponatremia + hyperkalemia → think adrenal crisis.',
    ],
  },

  // ───────────────────────────── THYROID ─────────────────────────────
  {
    id: 'thyroid-storm',
    name: 'Thyroid Storm',
    category: 'thyroid',
    summary: 'Decompensated, life-threatening thyrotoxicosis with multi-organ dysfunction.',
    features: [
      'Hyperpyrexia; marked tachycardia/atrial fibrillation; high-output heart failure.',
      'Agitation, delirium, psychosis, or coma.',
      'GI: vomiting, diarrhea, jaundice/hepatic dysfunction.',
      'Burch–Wartofsky score helps stratify likelihood.',
    ],
    diagnosis: [
      'Clinical diagnosis — Burch–Wartofsky ≥45 is highly suggestive.',
      'Biochemistry confirms thyrotoxicosis (suppressed TSH, elevated free T4/T3) but the SEVERITY is clinical, not a lab value.',
    ],
    management: [
      'β-blocker — propranolol (also blunts peripheral T4→T3 conversion); use cautiously with rate control if there is decompensated heart failure.',
      'Thionamide — PTU is preferred in storm (additionally blocks T4→T3 conversion); methimazole is an alternative.',
      'Iodine (SSKI / Lugol) — give ≥1 hour AFTER the thionamide (premature iodine can fuel hormone synthesis).',
      'Glucocorticoid — hydrocortisone or dexamethasone (reduces T4→T3 conversion, treats relative adrenal insufficiency).',
      'Supportive — cooling with acetaminophen (NOT aspirin, which displaces T4 and raises free hormone), IV fluids, treat the precipitant; consider plasmapheresis/bile-acid sequestrant if refractory.',
    ],
    followUp: [
      'ICU-level monitoring.',
      'Transition to definitive therapy (radioactive iodine or thyroidectomy) once stabilized; close endocrine follow-up.',
    ],
    pearls: [
      'Order matters: thionamide BEFORE iodine.',
      'Avoid aspirin (raises free T4). Do not withhold β-blockade for tachyarrhythmia unless true cardiogenic shock.',
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
        note: 'Sum every category: ≥45 highly suggestive of thyroid storm · 25–44 impending storm · <25 unlikely.',
      },
    ],
  },
  {
    id: 'myxedema-coma',
    name: 'Myxedema Coma',
    category: 'thyroid',
    summary: 'Decompensated severe hypothyroidism — hypothermia plus altered mentation; high mortality.',
    features: [
      'Hypothermia, bradycardia, hypoventilation/hypercapnia, hypotension.',
      'Hyponatremia and hypoglycemia.',
      'Altered mental status/coma; often precipitated by infection, cold exposure, sedatives, or MI.',
    ],
    diagnosis: [
      'Clinical, in a hypothyroid context.',
      'Labs: high TSH + low free T4 (primary); low/normal TSH + low free T4 (central).',
      'Check cortisol — coexisting adrenal insufficiency must be covered.',
    ],
    management: [
      'Give IV hydrocortisone FIRST (e.g., 100 mg IV) before thyroid hormone — replacing thyroid hormone in unrecognized adrenal insufficiency can precipitate adrenal crisis.',
      'IV levothyroxine loading dose (± small dose of T3) per protocol.',
      'Supportive — passive rewarming, ventilatory support, careful fluids/pressors; correct hyponatremia and hypoglycemia.',
      'Identify and treat the precipitant — infection is common; have a low threshold for empiric antibiotics.',
    ],
    followUp: [
      'ICU; titrate thyroid replacement; outpatient endocrine follow-up.',
      'Review what precipitated decompensation (often missed levothyroxine or an intercurrent illness).',
    ],
    pearls: [
      'Hydrocortisone before levothyroxine.',
      'Passive (not aggressive) rewarming; correct hyponatremia cautiously to avoid osmotic demyelination.',
    ],
  },

  // ───────────────────────────── CALCIUM ─────────────────────────────
  {
    id: 'hypercalcemic-crisis',
    name: 'Hypercalcemic Crisis',
    category: 'calcium',
    summary: 'Severe symptomatic hypercalcemia (often Ca >14 mg/dL) — usually malignancy or primary hyperparathyroidism.',
    features: [
      '"Stones, bones, abdominal groans, psychiatric overtones."',
      'Polyuria and dehydration, nausea/vomiting, constipation, weakness.',
      'Confusion progressing to coma; short QT and arrhythmia.',
    ],
    diagnosis: [
      'Corrected calcium (or ionized calcium).',
      'PTH (elevated → hyperparathyroidism; suppressed → malignancy/other), then PTHrP, 25- and 1,25-vitamin D, SPEP/imaging as indicated.',
    ],
    management: [
      'Aggressive IV isotonic saline — restore volume and promote calciuresis (the mainstay).',
      'Calcitonin — rapid but transient (tachyphylaxis within ~48 h); use for early lowering.',
      'IV bisphosphonate (zoledronic acid) — slower onset but durable; or denosumab (useful in renal failure/refractory cases).',
      'Treat the underlying cause; glucocorticoids for vitamin-D-mediated, granulomatous, or lymphoma-related hypercalcemia.',
      'Avoid loop diuretics unless volume-overloaded; consider dialysis for renal failure or refractory severe hypercalcemia.',
    ],
    followUp: [
      'Definitive treatment of the cause (parathyroidectomy; oncologic therapy).',
      'Monitor calcium/renal function; watch for post-bisphosphonate hypocalcemia (correct vitamin D and Mg first).',
    ],
    pearls: [
      'Fluids first — not furosemide.',
      'Calcitonin buys time while the bisphosphonate takes effect.',
    ],
  },
  {
    id: 'hypocalcemia',
    name: 'Severe / Symptomatic Hypocalcemia',
    category: 'calcium',
    summary: 'Acute hypocalcemia causing neuromuscular irritability — frequently after thyroid/parathyroid surgery.',
    features: [
      'Perioral and acral paresthesias; Chvostek and Trousseau signs.',
      'Muscle cramps, tetany, laryngospasm/bronchospasm, seizures.',
      'Prolonged QT, arrhythmia, heart failure.',
    ],
    diagnosis: [
      'Corrected or ionized calcium.',
      'Check magnesium (hypomagnesemia causes refractory hypocalcemia), phosphate, PTH, vitamin D, renal function.',
      'ECG for QT prolongation.',
    ],
    management: [
      'Symptomatic/severe: IV calcium gluconate (e.g., 1–2 g in D5W over ~10–20 min) with cardiac monitoring; follow with a calcium infusion if it persists.',
      'Correct magnesium — hypocalcemia will not resolve until Mg is repleted.',
      'Start/continue oral calcium + active vitamin D (calcitriol) for ongoing repletion (e.g., post-surgical hypoparathyroidism).',
      'Identify the cause: post-surgical hypoparathyroidism, vitamin D deficiency, CKD, hungry-bone syndrome, drugs.',
    ],
    followUp: [
      'Titrate calcium/calcitriol; monitor for hypercalcemia and hypercalciuria.',
      'Endocrine follow-up for long-term hypoparathyroidism management.',
    ],
    pearls: [
      'Replete magnesium or repletion fails.',
      'Calcium gluconate peripherally; calcium chloride is sclerosing (central line only).',
    ],
  },

  // ───────────────────────────── SODIUM ─────────────────────────────
  {
    id: 'hyponatremia',
    name: 'Severe Hyponatremia',
    category: 'sodium',
    summary: 'Low serum sodium — cerebral-edema risk if acute, osmotic-demyelination risk if overcorrected.',
    features: [
      'Severity tracks the rate: nausea, headache, lethargy, confusion → seizures, coma, respiratory arrest (acute cerebral edema).',
      'Chronic hyponatremia may be paucisymptomatic.',
    ],
    diagnosis: [
      'Serum Na with serum osmolality.',
      'Then urine osmolality, urine Na, and volume status to classify (SIADH, hypovolemic, hypervolemic).',
      'Decide acute vs chronic and the severity of symptoms — this drives how fast you correct.',
    ],
    management: [
      'Severe symptoms (seizure/coma): 3% hypertonic saline — e.g., 100–150 mL bolus, repeat to a total rise of ~4–6 mEq/L to control symptoms.',
      'Correction LIMIT: ≤8 mEq/L per 24 h (≤6 in high-risk patients — alcohol use, malnutrition, hypokalemia, liver disease) to avoid osmotic demyelination syndrome.',
      'Cause-directed therapy: SIADH → fluid restriction ± urea/vaptans; hypovolemic → isotonic saline; hypervolemic → treat HF/cirrhosis + restriction.',
      'Recheck Na q2–4h during active correction; if overcorrecting, re-lower with D5W ± desmopressin ("DDAVP clamp").',
    ],
    followUp: [
      'Establish and treat the etiology; medication review (thiazides, SSRIs, carbamazepine).',
      'Recheck sodium and counsel on free-water intake.',
    ],
    pearls: [
      'The danger is the RATE — in both directions.',
      'A pre-emptive DDAVP clamp in high-risk patients prevents overcorrection.',
    ],
  },
  {
    id: 'hypernatremia',
    name: 'Severe Hypernatremia',
    category: 'sodium',
    summary: 'High serum sodium = a water deficit; cerebral-edema risk if corrected too fast.',
    features: [
      'Thirst (may be absent if access to water is impaired), lethargy, irritability, weakness, hyperreflexia → seizures, coma.',
      'Usually the very young, elderly, or those without water access; consider diabetes insipidus.',
    ],
    diagnosis: [
      'Serum Na; calculate the free-water deficit.',
      'Assess volume status and urine osmolality (low/dilute urine → diabetes insipidus).',
      'History: water access, GI losses, osmotic diuresis.',
    ],
    management: [
      'If hypovolemic/unstable: restore perfusion with isotonic fluids first.',
      'Then replace free water (oral water, or IV D5W/hypotonic saline) to correct the deficit.',
      'Correct SLOWLY: ≤10–12 mEq/L per 24 h (≈≤0.5 mEq/L/h) to avoid cerebral edema; account for ongoing losses.',
      'Treat the cause: central DI → desmopressin; nephrogenic DI → remove the offending drug, correct electrolytes, thiazide/low-solute diet.',
    ],
    followUp: [
      'Diagnose and treat DI or the source of losses; ensure adequate water access.',
      'Monitor sodium and neuro status.',
    ],
    pearls: [
      'Account for ongoing free-water losses in the deficit calculation.',
      'Resuscitate volume before chasing the sodium.',
    ],
  },

  // ─────────────────────────── POTASSIUM ───────────────────────────
  {
    id: 'hyperkalemia',
    name: 'Hyperkalemia',
    category: 'potassium',
    summary: 'Elevated potassium with arrhythmia risk — an endocrine cause (hypoaldosteronism / adrenal insufficiency) is easy to miss.',
    features: [
      'Often asymptomatic; weakness, paresthesias, palpitations.',
      'ECG progression: peaked T waves → PR prolongation/flattened P → wide QRS → sine wave → arrest.',
    ],
    diagnosis: [
      'Serum K (exclude pseudohyperkalemia/hemolysis).',
      'ECG immediately if elevated.',
      'Assess the cause: renal failure, drugs (ACEi/ARB, K-sparing diuretics, NSAIDs), acidosis, adrenal insufficiency/hypoaldosteronism, tissue breakdown.',
    ],
    management: [
      'Stabilize the membrane: IV calcium gluconate (or chloride) if there are ECG changes — works in minutes but does NOT lower K.',
      'Shift K intracellularly: insulin + dextrose; nebulized albuterol; ± sodium bicarbonate if acidotic.',
      'Remove K from the body: loop diuretic (if making urine), GI binders (patiromer / sodium zirconium cyclosilicate), and hemodialysis for refractory cases or renal failure.',
      'Stop offending drugs; treat the cause (e.g., mineralocorticoid replacement for hypoaldosteronism).',
    ],
    followUp: [
      'Address the etiology and medications; recheck K.',
      'For adrenal/renal causes, arrange definitive management.',
    ],
    pearls: [
      'Calcium protects the heart but does NOT lower K — you still must shift and remove it.',
      'Recurrent unexplained hyperkalemia → check for hypoaldosteronism / adrenal insufficiency.',
    ],
  },
  {
    id: 'hypokalemia',
    name: 'Hypokalemia',
    category: 'potassium',
    summary: 'Low potassium with arrhythmia and weakness risk — often GI/renal losses or mineralocorticoid excess.',
    features: [
      'Weakness, cramps, fatigue, ileus/constipation, palpitations/arrhythmia.',
      'ECG: flattened/inverted T waves, U waves, ST depression.',
      'Severe: rhabdomyolysis, ascending paralysis.',
    ],
    diagnosis: [
      'Serum K; check magnesium and acid-base status.',
      'If unexplained: urine K plus BP and aldosterone–renin (screen for hyperaldosteronism).',
      'Distinguish GI vs renal loss.',
    ],
    management: [
      'Replete potassium — oral if mild/moderate; IV (controlled rate, with monitoring; central line for concentrated infusions) if severe or symptomatic.',
      'Correct magnesium — refractory hypokalemia will not resolve until Mg is repleted.',
      'Cardiac monitoring if severe, arrhythmic, or on digoxin; recheck K during repletion.',
      'Identify and treat the cause (diuretics, vomiting/diarrhea, hyperaldosteronism, RTA, hypomagnesemia).',
    ],
    followUp: [
      'Treat the cause; adjust diuretics; ensure magnesium is repleted.',
      'Evaluate for primary hyperaldosteronism if hypertensive or spontaneously hypokalemic.',
    ],
    pearls: [
      'Always check and replace magnesium.',
      'Do not infuse IV potassium too rapidly.',
    ],
  },

  // ───────────────────────── CATECHOLAMINE ─────────────────────────
  {
    id: 'pheo-crisis',
    name: 'Pheochromocytoma Crisis',
    category: 'catecholamine',
    summary: 'A catecholamine surge causing severe hypertension and end-organ damage — α-blockade must precede β-blockade.',
    features: [
      'Paroxysmal severe hypertension (or lability, occasionally shock).',
      'Pounding headache, palpitations, diaphoresis, pallor, anxiety.',
      'Can cause cardiomyopathy, arrhythmia, hyperglycemia, multi-organ failure ("pheo crisis").',
    ],
    diagnosis: [
      'Plasma free (or 24-h urine) metanephrines for biochemical confirmation.',
      'Imaging (CT/MRI; MIBG/PET) localizes AFTER biochemical confirmation.',
      'In crisis the diagnosis may be clinical or already known.',
    ],
    management: [
      'α-blockade FIRST — IV phentolamine (or a short-acting agent such as nicardipine/nitroprusside) for acute control; phenoxybenzamine/doxazosin for preoperative blockade.',
      'β-blockade only AFTER adequate α-blockade — a β-blocker first leaves unopposed α-stimulation and a hypertensive crisis.',
      'Volume expansion (catecholamine excess contracts intravascular volume); manage arrhythmia/cardiomyopathy supportively.',
      'Definitive: surgical resection after full preoperative α-blockade and volume repletion.',
    ],
    followUp: [
      'Biochemical confirmation + localization; preoperative preparation; surgical referral.',
      'Genetic counseling for hereditary syndromes; post-operative biochemical surveillance.',
    ],
    pearls: [
      'NEVER β-block before α-block.',
      'A catecholamine crisis can masquerade as ACS or sepsis.',
    ],
  },

  // ───────────────────────────── PITUITARY ─────────────────────────────
  {
    id: 'pituitary-apoplexy',
    name: 'Pituitary Apoplexy',
    category: 'pituitary',
    summary: 'Acute hemorrhage/infarction of the pituitary (often into an adenoma) — a neuro-ophthalmic emergency with acute secondary adrenal insufficiency.',
    features: [
      'Sudden severe ("thunderclap") headache.',
      'Visual loss/field defect (chiasm compression); ophthalmoplegia (CN III/IV/VI via the cavernous sinus).',
      'Nausea/vomiting, altered consciousness, meningismus.',
      'Acute hypopituitarism — especially secondary adrenal insufficiency (hypotension, hyponatremia).',
    ],
    diagnosis: [
      'Urgent pituitary MRI (CT if MRI is unavailable).',
      'Check the pituitary axes — cortisol/ACTH, TSH/free T4, prolactin, IGF-1, gonadotropins — plus electrolytes and glucose.',
    ],
    management: [
      'Stress-dose glucocorticoids immediately (e.g., hydrocortisone) — secondary adrenal insufficiency is the life threat; do not wait for the cortisol result.',
      'Hemodynamic support; correct electrolytes (watch for hyponatremia/SIADH or DI).',
      'Urgent neurosurgery + ophthalmology evaluation — surgical decompression for significant or worsening visual/neurologic deficits; conservative management if stable.',
      'Replace deficient hormones (thyroid only after cortisol is covered; sex steroids/GH later).',
    ],
    followUp: [
      'Full pituitary hormone assessment and long-term replacement.',
      'Serial visual fields; neurosurgery/endocrine follow-up; imaging surveillance of residual tumor.',
    ],
    pearls: [
      'Steroids before thyroid hormone — and before any imaging delay.',
      'Apoplexy can be the first presentation of a previously unknown pituitary tumor.',
    ],
  },
]