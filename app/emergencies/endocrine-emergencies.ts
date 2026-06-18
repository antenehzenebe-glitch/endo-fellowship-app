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
    summary: 'Insulin-deficient hyperglycemia with anion-gap ketoacidosis — the classic type-1 (and sometimes type-2) emergency.',
    features: [
      'Polyuria, polydipsia, nausea/vomiting, abdominal pain.',
      'Kussmaul (deep, rapid) respirations; fruity/acetone breath.',
      'Volume depletion; tachycardia; altered mental status in severe cases.',
    ],
    diagnosis: [
      'Glucose usually >250 mg/dL — but can be near-normal ("euglycemic DKA" with SGLT2 inhibitors, pregnancy, starvation).',
      'Anion-gap metabolic acidosis: pH <7.30, HCO₃ <18 mEq/L, elevated anion gap.',
      'Ketonemia (β-hydroxybutyrate preferred) and/or ketonuria.',
      'Grade severity by pH/HCO₃ and mental status.',
    ],
    management: [
      'IV fluids first: isotonic saline for resuscitation (~1 L or 15–20 mL/kg in hour 1), then adjust tonicity to corrected Na and continue deficit replacement.',
      'Check potassium before insulin: if K <3.3 mEq/L, HOLD insulin and replete K first (insulin drives K intracellularly).',
      'Regular insulin infusion 0.1 U/kg/h (± 0.1 U/kg bolus); aim glucose fall ~50–75 mg/dL/h.',
      'Add dextrose (D5–D10) when glucose ≈200 mg/dL and continue insulin until the anion gap closes.',
      'Keep K 4–5 mEq/L while on insulin; recheck glucose/electrolytes/gap/venous pH q2–4h.',
      'Treat the precipitant: infection, missed insulin, new-onset diabetes, ACS, drugs.',
      'Resolution = anion gap closed; overlap subcutaneous insulin 1–2 h BEFORE stopping the drip.',
    ],
    followUp: [
      'Confirm and treat the trigger; diabetes education and sick-day rules.',
      'Ensure SC insulin overlap before the drip comes off, then arrange outpatient diabetes follow-up.',
      'Bicarbonate only if pH <6.9; phosphate/Mg replacement only if clinically indicated.',
    ],
    pearls: [
      'Never stop the insulin drip without SC overlap — the gap reopens.',
      'On an SGLT2 inhibitor? Check ketones even when glucose looks normal.',
    ],
  },
  {
    id: 'hhs',
    name: 'Hyperosmolar Hyperglycemic State (HHS)',
    category: 'glucose',
    summary: 'Profound hyperglycemia + hyperosmolality with minimal ketosis — typically older type-2 patients; higher mortality than DKA.',
    features: [
      'Days of polyuria leading to severe dehydration.',
      'Altered mental status or coma; focal deficits or seizures possible.',
      'Minimal ketotic symptoms (little acidosis).',
    ],
    diagnosis: [
      'Glucose often >600 mg/dL.',
      'Effective serum osmolality >320 mOsm/kg.',
      'pH >7.30, HCO₃ >18 mEq/L, minimal ketones (distinguishes from DKA).',
    ],
    management: [
      'Aggressive IV fluids — the deficit is larger than DKA (often 8–10 L). Isotonic saline first, then adjust to corrected Na.',
      'Potassium repletion as in DKA (hold insulin if K <3.3 mEq/L).',
      'Insulin infusion 0.05–0.1 U/kg/h once fluids are underway; correct glucose gradually to avoid rapid osmolar shifts.',
      'Add dextrose at glucose ≈250–300 mg/dL; aim for SLOWER correction than DKA.',
      'VTE prophylaxis; identify precipitant (infection, ACS, drugs, nonadherence).',
    ],
    followUp: [
      'Treat the precipitant; diabetes education.',
      'Monitor neuro status and address the higher thrombosis/mortality risk.',
    ],
    pearls: [
      'Fluids do most of the early glucose-lowering — go in volume-first.',
      'Correct osmolality slowly to avoid cerebral edema.',
    ],
  },
  {
    id: 'hypoglycemia',
    name: 'Hypoglycemia',
    category: 'glucose',
    summary: 'Low plasma glucose with adrenergic + neuroglycopenic symptoms — the commonest acute diabetes emergency.',
    features: [
      'Adrenergic: tremor, palpitations, sweating, anxiety, hunger.',
      'Neuroglycopenic: confusion, behavior change, seizures, coma.',
      'Whipple triad: low glucose + consistent symptoms + relief on correction.',
    ],
    diagnosis: [
      'Plasma glucose <70 mg/dL (level 1); <54 mg/dL clinically significant (level 2); severe = needing assistance (level 3).',
      'In a non-diabetic, work up the cause (insulin/C-peptide/proinsulin, sulfonylurea screen).',
    ],
    management: [
      'Awake and able to swallow: 15–20 g fast-acting oral carbohydrate; recheck in 15 min; repeat ("rule of 15"); follow with a complex carb/meal.',
      'Impaired or NPO: IV dextrose (e.g., 25 g D50, or a D10 infusion); if no IV access, IM/intranasal glucagon.',
      'Sulfonylurea-induced or refractory: admit + dextrose infusion; consider octreotide to suppress insulin secretion.',
      'Identify the cause: insulin/secretagogue dose, missed meal, renal/hepatic failure, alcohol, adrenal insufficiency.',
    ],
    followUp: [
      'Review the regimen (insulin, sulfonylureas) and assess hypoglycemia unawareness/counter-regulatory failure.',
      'If non-diabetic, evaluate for insulinoma/other causes.',
      'Education + glucagon kit for at-risk patients.',
    ],
    pearls: [
      'Glucagon can fail in glycogen-depleted or sulfonylurea patients — dextrose is definitive.',
      'Sulfonylurea hypoglycemia recurs — observe long enough.',
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
      'Draw cortisol (± ACTH, aldosterone/renin) BEFORE steroids only if it will not delay care; a low cortisol supports the diagnosis.',
      'Confirm later with cosyntropin stimulation once stable. If the diagnosis is uncertain and a stim test is planned, use dexamethasone in the interim (it does not cross-react with the cortisol assay).',
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