'use client'

// modules/ThyroidQuiz.tsx
// The 10-question formative self-check for the Thyroid Ultrasound module.
// One question at a time, immediate feedback, board pearl, and a results screen.
// On a passing score the signed-in fellow's completion is recorded via the
// completeModule server action. Static teaching content - NO PHI.
//
// Content verified against 2017 ACR TI-RADS, 2015/2025 ATA, and the Bethesda
// System for Reporting Thyroid Cytopathology (3rd ed., 2023).

import { useState } from 'react'
import type { QuizQuestion } from './types'
import { completeModule } from './actions'

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'tirads-score',
    tag: 'TI-RADS scoring',
    stem: 'Score this nodule with ACR TI-RADS.',
    vignette:
      'A nodule is solid, very hypoechoic, wider-than-tall, with smooth margins and punctate echogenic foci. What is the point total and TR level?',
    options: ['3 points \u2192 TR3', '5 points \u2192 TR4', '8 points \u2192 TR5', '9 points \u2192 TR5'],
    correct: 2,
    rationale:
      'Sum the five axes: solid (2) + very hypoechoic (3) + wider-than-tall (0) + smooth margin (0) + punctate echogenic foci (3) = 8 points. A total of 7 or more is TR5 (highly suspicious, >20% malignancy).',
    pearl: 'Always add all five features. \u22657 points = TR5 regardless of which features contribute.',
  },
  {
    id: 'specific-feature',
    tag: 'Highest-yield feature',
    stem: 'Which sonographic feature is the MOST SPECIFIC sign of papillary thyroid carcinoma and carries the highest single-feature score?',
    options: [
      'Marked hypoechogenicity',
      'Punctate echogenic foci (microcalcifications)',
      'Lobulated margin',
      'Macrocalcifications',
    ],
    correct: 1,
    rationale:
      'Punctate echogenic foci (microcalcifications) represent psammoma bodies. They are the most specific sonographic sign of PTC and score the maximum 3 points. Do not confuse them with the benign large comet-tail artifact of colloid (0 points).',
    pearl: 'Taller-than-wide shape also scores 3, but microcalcifications are the most specific finding for malignancy.',
  },
  {
    id: 'fna-threshold',
    tag: 'FNA threshold',
    stem: 'A TR4 (moderately suspicious) nodule should be sampled by FNA at what minimum size?',
    options: ['\u2265 0.5 cm', '\u2265 1.0 cm', '\u2265 1.5 cm', '\u2265 2.5 cm'],
    correct: 2,
    rationale:
      'ACR TI-RADS FNA thresholds scale with risk: TR3 \u2265 2.5 cm, TR4 \u2265 1.5 cm, TR5 \u2265 1.0 cm. Higher risk lowers the size at which biopsy is warranted.',
    pearl: 'Memorize the trio 2.5 / 1.5 / 1.0 cm for TR3 / TR4 / TR5.',
  },
  {
    id: 'size-floor',
    tag: 'The size floor',
    stem: 'A 4 mm nodule has every suspicious feature and scores TR5. What is the appropriate next step?',
    options: [
      'FNA now',
      'FNA only if it grows on follow-up',
      'No FNA and no follow-up',
      'Repeat ultrasound in 6 months',
    ],
    correct: 2,
    rationale:
      'Nodules under 5 mm receive no FNA and no follow-up \u2014 even when TR5 \u2014 because clinically significant malignancy at that size is vanishingly unlikely and the harms of pursuing it outweigh any benefit.',
    pearl: 'The < 5 mm rule overrides the TR level. Size is a hard floor.',
  },
  {
    id: 'before-biopsy',
    tag: 'Before you biopsy',
    stem: 'Workup of a thyroid nodule shows TSH 0.1 mU/L (low). What is the most appropriate next step before any FNA?',
    options: [
      'Proceed directly to size-based FNA',
      'Radionuclide (I-123 or Tc-99m) thyroid scan',
      'Start levothyroxine and re-image',
      'Refer for surgery',
    ],
    correct: 1,
    rationale:
      'A low TSH suggests the nodule may be autonomously functioning. Obtain a radionuclide scan: a \'hot\' (functioning) nodule is almost never malignant, so FNA is usually unnecessary.',
    pearl: 'Order the scan only when TSH is low. A normal or high TSH means go straight to size-based FNA.',
  },
  {
    id: 'node-survey',
    tag: 'Lymph node survey',
    stem: 'Which cervical lymph-node finding is REASSURING (favors a benign node)?',
    options: [
      'Loss of the fatty hilum',
      'Rounded shape (short/long axis ratio > 0.5)',
      'Preserved echogenic fatty hilum',
      'Punctate microcalcifications within the node',
    ],
    correct: 2,
    rationale:
      'A preserved, thin, echogenic fatty hilum with orderly hilar vascularity is the hallmark of a benign node. Suspicious features are loss of the hilum, rounded shape, microcalcifications, cystic/necrotic change, and peripheral or chaotic vascularity.',
    pearl: 'A suspicious lateral node can upstage disease and convert a lobectomy into a neck dissection.',
  },
  {
    id: 'node-washout',
    tag: 'Nodal sampling',
    stem: 'You aspirate a suspicious lateral neck node in a patient with thyroid cancer. In addition to cytology, the needle washout should be sent for:',
    options: ['Calcitonin', 'Thyroglobulin', 'Parathyroid hormone (PTH)', 'TSH'],
    correct: 1,
    rationale:
      'A thyroglobulin (Tg) washout from the node aspirate is highly sensitive for metastatic differentiated thyroid carcinoma and can confirm nodal involvement even when cytology is equivocal.',
    pearl: 'Sample the node AND its thyroid source, and send the washout for thyroglobulin.',
  },
  {
    id: 'fna-technique',
    tag: 'FNA technique',
    stem: 'During US-guided FNA, the in-plane (long-axis) approach is favored for tip confidence because:',
    options: [
      'Only the needle tip is seen as a single bright dot',
      'The entire needle shaft and tip appear as one continuous bright line',
      'It guarantees avoidance of all vessels',
      'It requires no movement of the probe',
    ],
    correct: 1,
    rationale:
      'In-plane, the needle runs parallel to the probe so the whole shaft and the tip are visualized as one bright line \u2014 ideal for teaching and for confirming exactly where the tip is. Out-of-plane shows only a dot, requiring you to \'walk\' the beam to keep the tip in view.',
    pearl: 'See the whole needle (in-plane) when tip confidence matters most.',
  },
  {
    id: 'bethesda-iv',
    tag: 'Bethesda \u2192 management',
    stem: 'An FNA returns Bethesda IV (follicular neoplasm). What is the most appropriate next step?',
    options: [
      'Routine clinical / ultrasound follow-up',
      'Molecular testing or diagnostic lobectomy',
      'Total thyroidectomy plus radioactive iodine',
      'Repeat FNA in 6 weeks',
    ],
    correct: 1,
    rationale:
      'Bethesda IV carries a malignancy risk of roughly 23\u201334%. Cytology cannot distinguish a follicular adenoma from carcinoma, so the next step is molecular testing (e.g., Afirma, ThyroSeq) to refine risk, or a diagnostic lobectomy.',
    pearl: 'Indeterminate cytology (Bethesda III and IV) is where molecular testing earns its place \u2014 it can spare a purely diagnostic operation.',
  },
  {
    id: 'ata-2025',
    tag: '2025 ATA management',
    stem: 'A unifocal 1.5 cm intrathyroidal PTC (cN0, no prior radiation) is treated with lobectomy; final pathology shows negative margins, no extra-thyroidal extension, and no vascular invasion. Per the 2025 ATA guidance, the next step is:',
    options: [
      'Completion thyroidectomy plus radioactive iodine',
      'Completion thyroidectomy alone',
      'No further surgery \u2014 surveillance with TSH and neck ultrasound',
      'Lateral neck dissection',
    ],
    correct: 2,
    rationale:
      'Lobectomy is definitive for unifocal PTC < 4 cm that is intrathyroidal, cN0, and without prior radiation or a familial syndrome. Completion thyroidectomy is reserved for tumor > 4 cm, ETE, clinical nodal metastases, aggressive variants, or extensive vascular invasion \u2014 none present here.',
    pearl: 'Lobectomy alone: ~50% keep normal thyroid function, with lower hypoparathyroidism and nerve-injury risk.',
  },
]

const LETTERS = ['A', 'B', 'C', 'D', 'E']

type Props = {
  moduleId: string
  moduleKey: string
  passPct?: number
  canRecord?: boolean
}

type RecordState = 'idle' | 'saving' | 'saved' | 'error'

export default function ThyroidQuiz({
  moduleId,
  moduleKey,
  passPct = 80,
  canRecord = false,
}: Props) {
  const total = QUESTIONS.length
  const [idx, setIdx] = useState(0)
  const [answered, setAnswered] = useState<(number | null)[]>(() => QUESTIONS.map(() => null))
  const [locked, setLocked] = useState<boolean[]>(() => QUESTIONS.map(() => false))
  const [done, setDone] = useState(false)
  const [recordState, setRecordState] = useState<RecordState>('idle')

  const score = QUESTIONS.reduce((n, q, i) => (answered[i] === q.correct ? n + 1 : n), 0)
  const pct = Math.round((score / total) * 100)
  const passed = pct >= passPct

  function choose(i: number) {
    if (locked[idx]) return
    setAnswered((a) => {
      const n = [...a]
      n[idx] = i
      return n
    })
    setLocked((l) => {
      const n = [...l]
      n[idx] = true
      return n
    })
  }

  function scrollUp() {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function finish() {
    setDone(true)
    scrollUp()
    const s = QUESTIONS.reduce((n, q, i) => (answered[i] === q.correct ? n + 1 : n), 0)
    if (canRecord && s / total >= passPct / 100) {
      setRecordState('saving')
      const res = await completeModule(moduleId, moduleKey, s, total)
      setRecordState(res.ok ? 'saved' : 'error')
    }
  }

  function next() {
    if (idx < total - 1) {
      setIdx((i) => i + 1)
      scrollUp()
    } else {
      finish()
    }
  }

  function retake() {
    setIdx(0)
    setAnswered(QUESTIONS.map(() => null))
    setLocked(QUESTIONS.map(() => false))
    setDone(false)
    setRecordState('idle')
    scrollUp()
  }

  // ---------- results ----------
  if (done) {
    const missed = QUESTIONS.map((q, i) => ({ q, i })).filter((o) => answered[o.i] !== o.q.correct)
    return (
      <div className="text-center">
        <span
          className={`inline-block text-xs font-bold px-4 py-1.5 rounded-full ${
            passed ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {passed ? 'PASSED' : 'KEEP REVIEWING'}
        </span>
        <div className={`text-5xl font-bold mt-3 ${passed ? 'text-green-700' : 'text-amber-700'}`}>
          {score}/{total}
        </div>
        <p className="text-sm text-[#5C6B7A] mt-1">
          {pct}% &middot; pass mark {passPct}%
        </p>

        {canRecord && passed && (
          <p className="text-xs mt-3">
            {recordState === 'saving' && <span className="text-gray-500">Recording your completion&hellip;</span>}
            {recordState === 'saved' && (
              <span className="text-green-700 font-semibold">&#10003; Recorded to your training log</span>
            )}
            {recordState === 'error' && (
              <span className="text-amber-700">Saved your score locally, but recording to the log failed. Refresh and retake to retry.</span>
            )}
          </p>
        )}
        {!canRecord && passed && (
          <p className="text-xs text-gray-400 mt-3">Self-check only &mdash; completions are recorded for fellows.</p>
        )}

        <h3 className="font-bold text-[#003a63] text-lg mt-5">
          {passed ? 'Nicely done.' : 'Almost there.'}
        </h3>
        <p className="text-sm text-[#1B2733] max-w-xl mx-auto mt-1 leading-relaxed">
          {passed
            ? 'You can score a nodule, choose the next step, and reason through cytology and management. Revisit the lecture and the two procedure videos any time for reinforcement.'
            : 'Review the items below, then rewatch the relevant parts of the lecture and procedure videos and retake the check.'}
        </p>

        {missed.length > 0 && (
          <div className="text-left max-w-xl mx-auto mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wide text-[#5C6B7A] mb-3">Review these</h4>
            {missed.map((o) => (
              <div key={o.q.id} className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
                <p className="text-sm font-semibold text-[#003a63]">
                  {o.i + 1}. {o.q.stem}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  <span className="font-semibold">Correct answer:</span> {o.q.options[o.q.correct]}
                </p>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={retake}
          className="mt-6 inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg border-2 border-[#003a63] text-[#003a63] hover:bg-[#003a63] hover:text-white min-h-[44px]"
        >
          Retake the self-check
        </button>
      </div>
    )
  }

  // ---------- question ----------
  const q = QUESTIONS[idx]
  const sel = answered[idx]
  const isLocked = locked[idx]
  const isCorrect = sel === q.correct
  const last = idx === total - 1

  return (
    <div>
      {/* progress */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#c8102e] rounded-full transition-all"
            style={{ width: `${(idx / total) * 100}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-[#5C6B7A] whitespace-nowrap">
          {idx + 1} of {total}
        </span>
      </div>

      <p className="text-[11px] font-bold uppercase tracking-wide text-[#c8102e]">
        {idx + 1} / {total} &middot; {q.tag}
      </p>
      <p className="font-semibold text-[#003a63] mt-1 leading-snug">{q.stem}</p>
      {q.vignette && <p className="text-sm text-[#1B2733] mt-2 leading-relaxed">{q.vignette}</p>}

      <div className="mt-4 space-y-2.5">
        {q.options.map((opt, i) => {
          let cls = 'border-gray-200 bg-white hover:border-[#003a63]'
          let chip = 'bg-gray-100 text-[#003a63]'
          if (isLocked) {
            if (i === q.correct) {
              cls = 'border-green-500 bg-green-50'
              chip = 'bg-green-600 text-white'
            } else if (i === sel) {
              cls = 'border-[#c8102e] bg-red-50'
              chip = 'bg-[#c8102e] text-white'
            } else {
              cls = 'border-gray-200 bg-white opacity-55'
            }
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={isLocked}
              className={`w-full text-left flex gap-3 items-start border-2 rounded-lg p-3 min-h-[44px] transition-colors ${cls} ${
                isLocked ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <span
                className={`flex-none w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 ${chip}`}
              >
                {LETTERS[i]}
              </span>
              <span className="text-[15px] text-[#1B2733] leading-snug">{opt}</span>
            </button>
          )
        })}
      </div>

      {isLocked && (
        <div
          className={`mt-4 rounded-lg p-4 border ${
            isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}
        >
          <p className={`font-bold text-sm flex items-center gap-2 ${isCorrect ? 'text-green-700' : 'text-[#c8102e]'}`}>
            {isCorrect ? '\u2713 Correct' : '\u2717 Not quite'}
          </p>
          <p className="text-sm text-[#1B2733] mt-1.5 leading-relaxed">{q.rationale}</p>
          <div className="mt-3 bg-white border border-red-200 rounded-lg p-3 text-[13px] text-[#1B2733] leading-relaxed">
            <span className="font-semibold text-[#c8102e]">Board Pearl &middot;</span> {q.pearl}
          </div>
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <button
          onClick={next}
          disabled={!isLocked}
          className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-lg bg-[#c8102e] text-white hover:bg-[#a50e26] disabled:opacity-40 disabled:cursor-default min-h-[44px]"
        >
          {last ? 'See results' : 'Next question'}
        </button>
      </div>
    </div>
  )
}
