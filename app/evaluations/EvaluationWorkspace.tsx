'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { saveEvaluation, setEvaluationStatus, deleteEvaluation } from './actions'
import {
  PERIODS,
  RATINGS,
  periodLabel,
  ratingLabel,
  ratingTone,
  formatPgy,
  type EvalRow,
  type EvalPeriod,
  type EvalRating,
} from '@/lib/evaluations'

const NAVY = '#003a63'
const CRIMSON = '#c8102e'

type FellowOpt = { id: string; name: string; pgy: string | null }

export default function EvaluationWorkspace({
  fellows,
  rows,
  currentUserId,
  seesAll,
  defaultAcademicYear,
}: {
  fellows: FellowOpt[]
  rows: EvalRow[]
  currentUserId: string
  seesAll: boolean
  defaultAcademicYear: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [fellowId, setFellowId] = useState('')
  const [period, setPeriod] = useState<EvalPeriod>('mid_year')
  const [academicYear, setAcademicYear] = useState(defaultAcademicYear)
  const [rating, setRating] = useState<EvalRating | ''>('')
  const [narrative, setNarrative] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  function resetForm() {
    setEditingId(null)
    setFellowId('')
    setPeriod('mid_year')
    setAcademicYear(defaultAcademicYear)
    setRating('')
    setNarrative('')
    setError(null)
  }

  function loadIntoForm(r: EvalRow) {
    setEditingId(r.id)
    setFellowId(r.fellow_id)
    setPeriod(r.period as EvalPeriod)
    setAcademicYear(r.academic_year)
    setRating(r.overall_rating as EvalRating)
    setNarrative(r.narrative)
    setError(null)
    setSavedMsg(null)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function submit(status: 'draft' | 'final') {
    setError(null)
    setSavedMsg(null)
    if (!fellowId) return setError('Choose a fellow to evaluate.')
    if (!rating) return setError('Choose an overall rating.')
    if (!narrative.trim()) return setError('Write the evaluation narrative before saving.')
    startTransition(async () => {
      const res = await saveEvaluation({
        fellowId,
        period,
        academicYear,
        overallRating: rating,
        narrative,
        status,
      })
      if (!res.ok) {
        setError(res.error)
        return
      }
      setSavedMsg(
        status === 'final'
          ? 'Evaluation finalized and shared with the fellow.'
          : 'Draft saved (private to you).'
      )
      resetForm()
      router.refresh()
    })
  }

  function changeStatus(id: string, status: 'draft' | 'final') {
    setError(null)
    setSavedMsg(null)
    startTransition(async () => {
      const res = await setEvaluationStatus(id, status)
      if (!res.ok) {
        setError(res.error)
        return
      }
      router.refresh()
    })
  }

  function remove(id: string) {
    if (
      typeof window !== 'undefined' &&
      !window.confirm('Delete this evaluation? This cannot be undone.')
    )
      return
    setError(null)
    setSavedMsg(null)
    startTransition(async () => {
      const res = await deleteEvaluation(id)
      if (!res.ok) {
        setError(res.error)
        return
      }
      if (editingId === id) resetForm()
      router.refresh()
    })
  }

  const mine = rows.filter((r) => r.evaluator_id === currentUserId)
  const others = rows.filter((r) => r.evaluator_id !== currentUserId)

  return (
    <div className="space-y-6">
      {/* ===== Form ===== */}
      <section
        className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
        style={{ borderTop: `3px solid ${CRIMSON}` }}
      >
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <h2 className="font-bold text-slate-900">
            {editingId ? 'Edit evaluation' : 'Write an evaluation'}
          </h2>
          {editingId && (
            <button
              onClick={resetForm}
              className="ml-auto text-sm text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ev-fellow" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Fellow
              </label>
              <select
                id="ev-fellow"
                value={fellowId}
                onChange={(e) => setFellowId(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#003a63]"
              >
                <option value="">Select a fellow…</option>
                {fellows.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                    {f.pgy ? ` · ${formatPgy(f.pgy)}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ev-year" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Academic year
              </label>
              <input
                id="ev-year"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2025-2026"
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#003a63]"
              />
            </div>
          </div>

          <div>
            <span className="block text-sm font-semibold text-slate-700 mb-1.5">Period</span>
            <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden">
              {PERIODS.map((p) => {
                const active = period === p.value
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPeriod(p.value)}
                    className="px-4 py-2 text-sm font-medium"
                    style={
                      active
                        ? { background: NAVY, color: 'white' }
                        : { background: 'white', color: '#334155' }
                    }
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <span className="block text-sm font-semibold text-slate-700 mb-1.5">Overall rating</span>
            <div className="flex flex-wrap gap-2">
              {RATINGS.map((r) => {
                const active = rating === r.value
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRating(r.value)}
                    className="px-4 py-2 text-sm font-semibold rounded-lg border"
                    style={
                      active
                        ? { background: r.tone, color: 'white', borderColor: r.tone }
                        : { background: 'white', color: r.tone, borderColor: r.tone }
                    }
                  >
                    {r.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label htmlFor="ev-narr" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Narrative
            </label>
            <textarea
              id="ev-narr"
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              rows={8}
              placeholder="Summarize the fellow's performance for this period: clinical skills, medical knowledge, professionalism, scholarly progress, and goals for the next period."
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#003a63]"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {savedMsg && <p className="text-sm text-green-700">{savedMsg}</p>}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => submit('draft')}
              disabled={pending}
              className="text-sm font-semibold px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {pending ? 'Saving…' : 'Save draft'}
            </button>
            <button
              onClick={() => submit('final')}
              disabled={pending}
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50"
              style={{ background: CRIMSON }}
            >
              {pending ? 'Saving…' : editingId ? 'Save & finalize' : 'Finalize & share'}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            A draft is private to you. Finalizing makes the evaluation visible to the fellow and
            program leadership.
          </p>
        </div>
      </section>

      {/* ===== My evaluations ===== */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
          Evaluations you have written
        </h2>
        {mine.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500 text-sm">
            None yet. Use the form above to write your first evaluation.
          </div>
        ) : (
          <div className="space-y-3">
            {mine.map((r) => (
              <EvalCard
                key={r.id}
                r={r}
                owned
                onEdit={() => loadIntoForm(r)}
                onFinalize={() => changeStatus(r.id, 'final')}
                onReopen={() => changeStatus(r.id, 'draft')}
                onDelete={() => remove(r.id)}
                pending={pending}
              />
            ))}
          </div>
        )}
      </section>

      {/* ===== Other faculty (leadership only) ===== */}
      {seesAll && others.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Evaluations by other faculty
          </h2>
          <div className="space-y-3">
            {others.map((r) => (
              <EvalCard key={r.id} r={r} owned={false} pending={pending} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function EvalCard({
  r,
  owned,
  onEdit,
  onFinalize,
  onReopen,
  onDelete,
  pending,
}: {
  r: EvalRow
  owned: boolean
  onEdit?: () => void
  onFinalize?: () => void
  onReopen?: () => void
  onDelete?: () => void
  pending: boolean
}) {
  const isFinal = r.status === 'final'
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold text-slate-900">{r.fellowName}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {periodLabel(r.period)} · {r.academic_year}
            {!owned && ` · by ${r.evaluatorName}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded text-white"
            style={{ background: ratingTone(r.overall_rating) }}
          >
            {ratingLabel(r.overall_rating)}
          </span>
          <span
            className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded"
            style={
              isFinal
                ? { background: '#dcfce7', color: '#15803d' }
                : { background: '#fef3c7', color: '#b45309' }
            }
          >
            {isFinal ? 'Final' : 'Draft'}
          </span>
        </div>
      </div>

      <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap leading-relaxed line-clamp-4">
        {r.narrative}
      </p>

      <div className="flex items-center gap-3 flex-wrap mt-3 pt-3 border-t border-slate-100">
        <Link
          href={`/evaluations/${r.id}/print`}
          className="text-sm font-medium text-[#003a63] hover:underline"
        >
          Print / PDF
        </Link>
        {owned && (
          <>
            <button
              onClick={onEdit}
              disabled={pending}
              className="text-sm font-medium text-slate-700 hover:underline disabled:opacity-50"
            >
              Edit
            </button>
            {isFinal ? (
              <button
                onClick={onReopen}
                disabled={pending}
                className="text-sm font-medium text-amber-700 hover:underline disabled:opacity-50"
              >
                Reopen to draft
              </button>
            ) : (
              <button
                onClick={onFinalize}
                disabled={pending}
                className="text-sm font-medium text-green-700 hover:underline disabled:opacity-50"
              >
                Finalize &amp; share
              </button>
            )}
            <button
              onClick={onDelete}
              disabled={pending}
              className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50 ml-auto"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </article>
  )
}
