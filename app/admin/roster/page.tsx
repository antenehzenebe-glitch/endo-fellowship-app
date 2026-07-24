'use client'

// app/admin/roster/page.tsx
// Client wrapper: renders the shared RosterManager with the people/actions
// implementations bound in. Kept thin so app/people/page.tsx (the People
// directory editor) can reuse the same UI with different handlers.
import RosterManager from '@/people/RosterManager'
import {
  createProfile,
  deleteProfile,
  resetPassword,
  updateProfile,
  uploadPhoto,
} from '@/people/actions'

export default function RosterPage() {
  return (
    <RosterManager
      onCreate={createProfile}
      onUpdate={updateProfile}
      onResetPassword={resetPassword}
      onDelete={deleteProfile}
      onUploadPhoto={uploadPhoto}
    />
  )
}
