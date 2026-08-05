// lib/endocrine-emergencies/index.ts
// Fellows' Survival Guide — endocrine & electrolyte emergencies + inpatient
// diabetes management quick-reference.
// EDUCATIONAL QUICK-REFERENCE ONLY. No PHI. See types.ts for the full notice.
//
// Topics are maintained per cluster so each file stays faculty-editable:
//   glucose.ts           — DKA, euglycemic DKA, HHS, hypoglycemia
//   inpatient-diabetes.ts— ward/ICU targets & insulin, steroids/nutrition/non-insulin
//                          agents, perioperative & discharge (ADA 2026 §16 updates)
//   thyroid-adrenal.ts   — thyroid storm, myxedema coma, adrenal crisis, TPP, pheo crisis
//   mineral-pituitary.ts — calcium, sodium, potassium, pituitary apoplexy, AVP-D (DI)
// Content was reconciled with current societal guidance in 2026-08
// (see `references` + `lastReviewed` on each topic).

import { GLUCOSE_EMERGENCIES } from './glucose'
import { INPATIENT_DIABETES_TOPICS } from './inpatient-diabetes'
import { THYROID_ADRENAL_EMERGENCIES } from './thyroid-adrenal'
import { MINERAL_PITUITARY_EMERGENCIES } from './mineral-pituitary'
import type { Emergency } from './types'

export * from './types'

export const EMERGENCIES: Emergency[] = [
  ...GLUCOSE_EMERGENCIES,
  ...INPATIENT_DIABETES_TOPICS,
  ...THYROID_ADRENAL_EMERGENCIES,
  ...MINERAL_PITUITARY_EMERGENCIES,
]
