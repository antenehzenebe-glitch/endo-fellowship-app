'use client'

// people/RosterManager.tsx
// Shared people editor used by BOTH the admin roster page and the staff People
// directory editor. Pure UI + wiring — the create/update/reset/delete/photo
// handlers are injected as props so each route binds its own server actions.
// De-identified staff/fellow records — NO PHI.
import { useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ROLES,
  PGY_LEVELS,
  roleBadge,
  type Person,
  type PersonRole,
} from '@/lib/people'
import type { CreatePersonInput, UpdatePersonInput, ActionResult } from '@/people/actions'

const ROLE_LABEL: Record<PersonRole, string> = {
  fellow: 'Fellow',
  faculty: 'Faculty',
  staff: 'Staff',
}

export default function RosterManager({
  onCreate,
  onUpdate,
  onResetPassword,
  onDelete,
  onUploadPhoto,
}: {
  onCreate: (input: CreatePersonInput) => Promise<ActionResult>
  onUpdate: (id: string, patch: UpdatePersonInput) => Promise<ActionResult>
  onResetPassword: (id: string) => Promise<ActionResult>
  onDelete: (id: string) => Promise<ActionResult>
  onUploadPhoto: (id: string, formData: FormData) => Promise<ActionResult>
}) {
  const router = useRouter()
  const [people, setPeople] = useState<Person[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  // …
  return null
}
