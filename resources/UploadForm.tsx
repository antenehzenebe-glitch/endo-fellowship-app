'use client'

// Staff-only upload. Add a material by uploading a file (stored in the private
// 'resources' bucket) or pasting an external link. Writes respect RLS — only
// staff can insert. No service-role key; the user's own session does the work.
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_OPTIONS } from '@/resources/types'
import type { ResourceCategory } from '@/resources/types'

type Mode = 'file' | 'link'

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').toLowerCase()
}

export default function UploadForm() {
  const supabase = createClient()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('file')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<ResourceCategory>('policy')
  const [requiresAck, setRequiresAck] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function reset() {
    setTitle(''); setDescription(''); setCategory('policy'); setRequiresAck(false)
    setFile(null); setUrl(''); setError(''); setMode('file')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      let storage_path: string | null = null
      let external_url: string | null = null
      let file_type: string | null = null

      if (mode === 'file') {
        if (!file) { setError('Choose a file to upload.'); setBusy(false); return }
        const path = `${category}/${Date.now()}-${safeName(file.name)}`
        const up = await supabase.storage.from('resources').upload(path, file, { upsert: false })
        if (up.error) { setError(`Upload failed: ${up.error.message}`); setBusy(false); return }
        storage_path = path
        file_type = file.type || null
      } else {
        if (!/^https?:\/\//i.test(url)) { setError('Enter a full URL (https://…).'); setBusy(false); return }
        external_url = url.trim()
      }

      const { data: userData } = await supabase.auth.getUser()
      const ins = await supabase.from('resources').insert({
        title: title.trim(),
        description: description.trim() || null,
        category,
        storage_path,
        external_url,
        file_type,
        requires_ack: requiresAck,
        uploaded_by: userData.user?.id ?? null,
      })
      if (ins.error) { setError(`Couldn't save: ${ins.error.message}`); setBusy(false); return }

      reset(); setOpen(false); setBusy(false)
      router.refresh()
    } catch {
      setError('Something interrupted the upload. Check your connection and try again.')
      setBusy(false)
    }
  }

  const fieldCls = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#003a63]'
  const labelCls = 'block text-sm font-semibold text-gray-800 mb-1.5'

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#c8102e] text-white hover:bg-[#a50e26] min-h-[44px]">
        + Add material
      </button>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#003a63]">Add a material</h2>
        <button onClick={() => { reset(); setOpen(false) }} className="text-sm text-gray-500 hover:text-gray-800">Cancel</button>
      </div>

      <div className="flex gap-2 mb-4">
        <button type="button" onClick={() => setMode('file')}
          className={`px-3 py-2 text-sm font-medium rounded-lg border ${mode === 'file' ? 'border-[#003a63] text-[#003a63] bg-[#eef2f6]' : 'border-gray-300 text-gray-600'}`}>
          Upload a file
        </button>
        <button type="button" onClick={() => setMode('link')}
          className={`px-3 py-2 text-sm font-medium rounded-lg border ${mode === 'link' ? 'border-[#003a63] text-[#003a63] bg-[#eef2f6]' : 'border-gray-300 text-gray-600'}`}>
          Link out
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="m-title" className={labelCls}>Title</label>
          <input id="m-title" className={fieldCls} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="m-cat" className={labelCls}>Category</label>
          <select id="m-cat" className={fieldCls} value={category} onChange={(e) => setCategory(e.target.value as ResourceCategory)}>
            {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {mode === 'file' ? (
          <div>
            <label htmlFor="m-file" className={labelCls}>File</label>
            <input id="m-file" type="file" className={fieldCls} onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
          </div>
        ) : (
          <div>
            <label htmlFor="m-url" className={labelCls}>Link (URL)</label>
            <input id="m-url" type="url" placeholder="https://…" className={fieldCls} value={url} onChange={(e) => setUrl(e.target.value)} required />
          </div>
        )}
        <div>
          <label htmlFor="m-desc" className={labelCls}>Description (optional)</label>
          <textarea id="m-desc" rows={2} className={fieldCls} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={requiresAck} onChange={(e) => setRequiresAck(e.target.checked)} />
          Require fellows to acknowledge this
        </label>
        {error ? <div role="alert" className="p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">{error}</div> : null}
        <button type="submit" disabled={busy} aria-busy={busy}
          className="w-full py-3 bg-[#c8102e] text-white font-semibold rounded-lg hover:bg-[#a50e26] disabled:opacity-60 min-h-[44px]">
          {busy ? 'Saving…' : 'Save material'}
        </button>
      </form>
    </div>
  )
}
