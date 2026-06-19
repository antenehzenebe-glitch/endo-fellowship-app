'use client'

// people/RosterManager.tsx
// Staff-only curation of the public people directory. All writes go through the
// staff member's own session (RLS-enforced) — no service-role key. Headshots
// upload to the public 'people-photos' bucket; we store the object path and
// render via getPublicUrl.
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_OPTIONS, CATEGORY_LABELS, PEOPLE_BUCKET } from '@/people/types'
import type { Person, PersonCategory } from '@/people/types'

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').toLowerCase()
}

type Draft = {
  category: PersonCategory
  full_name: string
  credentials: string
  role_title: string
  email: string
  bio: string
  sort_order: number
  is_published: boolean
}

function draftFrom(p?: Person): Draft {
  return {
    category: p?.category ?? 'faculty',
    full_name: p?.full_name ?? '',
    credentials: p?.credentials ?? '',
    role_title: p?.role_title ?? '',
    email: p?.email ?? '',
    bio: p?.bio ?? '',
    sort_order: p?.sort_order ?? 0,
    is_published: p?.is_published ?? false,
  }
}

const fieldCls =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#003a63]'
const labelCls = 'block text-sm font-semibold text-gray-800 mb-1.5'

function PersonForm({
  idPrefix, draft, setDraft, setFile, busy, error, submitLabel, onSubmit, onCancel,
}: {
  idPrefix: string
  draft: Draft
  setDraft: (d: Draft) => void
  setFile: (f: File | null) => void
  busy: boolean
  error: string
  submitLabel: string
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 bg-white border border-gray-200 rounded-xl p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor={`${idPrefix}-name`}>Full name</label>
          <input id={`${idPrefix}-name`} className={fieldCls} value={draft.full_name}
            onChange={(e) => setDraft({ ...draft, full_name: e.target.value })} required />
        </div>
        <div>
          <label className={labelCls} htmlFor={`${idPrefix}-cat`}>Category</label>
          <select id={`${idPrefix}-cat`} className={fieldCls} value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value as PersonCategory })}>
            {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor={`${idPrefix}-cred`}>Credentials</label>
          <input id={`${idPrefix}-cred`} className={fieldCls} placeholder="MD, FACE" value={draft.credentials}
            onChange={(e) => setDraft({ ...draft, credentials: e.target.value })} />
        </div>
        <div>
          <label className={labelCls} htmlFor={`${idPrefix}-role`}>Role / title</label>
          <input id={`${idPrefix}-role`} className={fieldCls} placeholder="Program Director" value={draft.role_title}
            onChange={(e) => setDraft({ ...draft, role_title: e.target.value })} />
        </div>
        <div>
          <label className={labelCls} htmlFor={`${idPrefix}-email`}>Email</label>
          <input id={`${idPrefix}-email`} type="email" className={fieldCls} value={draft.email}
            onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
        </div>
        <div>
          <label className={labelCls} htmlFor={`${idPrefix}-sort`}>Sort order</label>
          <input id={`${idPrefix}-sort`} type="number" className={fieldCls} value={draft.sort_order}
            onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })} />
        </div>
      </div>
      <div>
        <label className={labelCls} htmlFor={`${idPrefix}-bio`}>Bio</label>
        <textarea id={`${idPrefix}-bio`} rows={3} className={fieldCls} value={draft.bio}
          onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
      </div>
      <div>
        <label className={labelCls} htmlFor={`${idPrefix}-photo`}>Headshot (optional)</label>
        <input id={`${idPrefix}-photo`} type="file" accept="image/*" className={fieldCls}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={draft.is_published}
          onChange={(e) => setDraft({ ...draft, is_published: e.target.checked })} />
        Published (visible on the public site)
      </label>
      {error ? (
        <div role="alert" className="p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">{error}</div>
      ) : null}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} aria-busy={busy}
          className="flex-1 py-3 bg-[#c8102e] text-white font-semibold rounded-lg hover:bg-[#a50e26] disabled:opacity-60 min-h-[44px]">
          {busy ? 'Saving…' : submitLabel}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 min-h-[44px]">
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function RosterManager({ initialPeople }: { initialPeople: Person[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [people, setPeople] = useState<Person[]>(initialPeople)

  const [adding, setAdding] = useState(false)
  const [addDraft, setAddDraft] = useState<Draft>(draftFrom())
  const [addFile, setAddFile] = useState<File | null>(null)
  const [addBusy, setAddBusy] = useState(false)
  const [addErr, setAddErr] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Draft>(draftFrom())
  const [editFile, setEditFile] = useState<File | null>(null)
  const [editBusy, setEditBusy] = useState(false)
  const [editErr, setEditErr] = useState('')

  function publicUrl(path: string | null): string | null {
    if (!path) return null
    return supabase.storage.from(PEOPLE_BUCKET).getPublicUrl(path).data.publicUrl
  }

  async function uploadPhoto(category: PersonCategory, file: File): Promise<string> {
    const path = `${category}/${Date.now()}-${safeName(file.name)}`
    const up = await supabase.storage.from(PEOPLE_BUCKET).upload(path, file, { upsert: false })
    if (up.error) throw new Error(up.error.message)
    return path
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setAddErr(''); setAddBusy(true)
    try {
      let photo_path: string | null = null
      if (addFile) photo_path = await uploadPhoto(addDraft.category, addFile)
      const { data, error } = await supabase.from('people').insert({
        category: addDraft.category,
        full_name: addDraft.full_name.trim(),
        credentials: addDraft.credentials.trim() || null,
        role_title: addDraft.role_title.trim() || null,
        email: addDraft.email.trim() || null,
        bio: addDraft.bio.trim() || null,
        sort_order: addDraft.sort_order,
        is_published: addDraft.is_published,
        photo_path,
      }).select('*').single()
      if (error) { setAddErr(`Couldn't add: ${error.message}`); setAddBusy(false); return }
      setPeople((prev) => [...prev, data as Person])
      setAddDraft(draftFrom()); setAddFile(null); setAdding(false); setAddBusy(false)
      router.refresh()
    } catch (err) {
      setAddErr(err instanceof Error ? err.message : 'Upload failed. Try again.'); setAddBusy(false)
    }
  }

  function startEdit(p: Person) {
    setEditingId(p.id); setEditDraft(draftFrom(p)); setEditFile(null); setEditErr('')
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault(); if (!editingId) return
    setEditErr(''); setEditBusy(true)
    try {
      const current = people.find((p) => p.id === editingId)
      let photo_path = current?.photo_path ?? null
      if (editFile) photo_path = await uploadPhoto(editDraft.category, editFile)
      const { data, error } = await supabase.from('people').update({
        category: editDraft.category,
        full_name: editDraft.full_name.trim(),
        credentials: editDraft.credentials.trim() || null,
        role_title: editDraft.role_title.trim() || null,
        email: editDraft.email.trim() || null,
        bio: editDraft.bio.trim() || null,
        sort_order: editDraft.sort_order,
        is_published: editDraft.is_published,
        photo_path,
      }).eq('id', editingId).select('*').single()
      if (error) { setEditErr(`Couldn't save: ${error.message}`); setEditBusy(false); return }
      setPeople((prev) => prev.map((p) => (p.id === editingId ? (data as Person) : p)))
      setEditingId(null); setEditBusy(false)
      router.refresh()
    } catch (err) {
      setEditErr(err instanceof Error ? err.message : 'Save failed. Try again.'); setEditBusy(false)
    }
  }

  async function togglePublish(p: Person) {
    const { data, error } = await supabase.from('people')
      .update({ is_published: !p.is_published }).eq('id', p.id).select('*').single()
    if (!error && data) {
      setPeople((prev) => prev.map((x) => (x.id === p.id ? (data as Person) : x)))
      router.refresh()
    }
  }

  async function remove(p: Person) {
    if (!confirm(`Remove ${p.full_name} from the directory? This cannot be undone.`)) return
    const { error } = await supabase.from('people').delete().eq('id', p.id)
    if (!error) {
      setPeople((prev) => prev.filter((x) => x.id !== p.id))
      router.refresh()
    }
  }

  const groups: PersonCategory[] = ['faculty', 'fellow', 'staff']

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          {people.length} {people.length === 1 ? 'person' : 'people'} · draft rows are staff-only
        </p>
        {!adding ? (
          <button onClick={() => setAdding(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#c8102e] text-white hover:bg-[#a50e26] min-h-[44px]">
            + Add person
          </button>
        ) : null}
      </div>

      {adding ? (
        <PersonForm idPrefix="add" draft={addDraft} setDraft={setAddDraft} setFile={setAddFile}
          busy={addBusy} error={addErr} submitLabel="Add person" onSubmit={handleAdd}
          onCancel={() => { setAdding(false); setAddDraft(draftFrom()); setAddFile(null); setAddErr('') }} />
      ) : null}

      {groups.map((g) => {
        const rows = people.filter((p) => p.category === g)
        if (!rows.length) return null
        return (
          <section key={g}>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[#c8102e] mb-3">{CATEGORY_LABELS[g]}</h2>
            <ul className="space-y-3">
              {rows.map((p) => (
                <li key={p.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  {editingId === p.id ? (
                    <PersonForm idPrefix={`edit-${p.id}`} draft={editDraft} setDraft={setEditDraft} setFile={setEditFile}
                      busy={editBusy} error={editErr} submitLabel="Save changes" onSubmit={handleEdit}
                      onCancel={() => setEditingId(null)} />
                  ) : (
                    <div className="flex items-start gap-4">
                      {publicUrl(p.photo_path) ? (
                        <img src={publicUrl(p.photo_path) as string} alt=""
                          className="w-16 h-16 rounded-full object-cover border border-gray-200 shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[#eef2f6] text-[#003a63] grid place-items-center font-bold shrink-0">
                          {p.full_name.split(' ').map((s) => s[0]).slice(0, 2).join('')}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-[#003a63] leading-tight">
                            {p.full_name}{p.credentials ? `, ${p.credentials}` : ''}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {p.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        {p.role_title ? <p className="text-sm text-gray-600">{p.role_title}</p> : null}
                        {p.bio ? <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.bio}</p> : null}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button onClick={() => startEdit(p)}
                            className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 min-h-[44px]">Edit</button>
                          <button onClick={() => togglePublish(p)}
                            className="px-3 py-2 text-sm font-medium rounded-lg border border-[#003a63] text-[#003a63] hover:bg-[#eef2f6] min-h-[44px]">
                            {p.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button onClick={() => remove(p)}
                            className="px-3 py-2 text-sm font-medium rounded-lg border border-red-300 text-red-700 hover:bg-red-50 min-h-[44px]">Remove</button>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      {people.length === 0 && !adding ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-gray-300 bg-white">
          <p className="font-semibold text-gray-800">No one in the directory yet</p>
          <p className="text-sm text-gray-500 mt-1">Add faculty, fellows, and staff above — then publish to show them on the public site.</p>
        </div>
      ) : null}
    </div>
  )
}
