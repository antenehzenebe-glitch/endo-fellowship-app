#!/usr/bin/env python3
# patch_schedule_multiyear.py
# Two files, three surgical edits, for the multi-year schedule:
#
# app/schedule/ScheduleEditor.tsx
#   1. Year is now chosen via the YearSwitcher above the editor, so the editor's
#      free-text year input becomes a read-only label (editing + saving it would
#      no longer match a row, since saveSchedule keys off academic_year).
#   2. Footer caption "(id=current)" -> "({academicYear})".
#
# lib/supabase/database.types.ts
#   3. Add the new `is_current` column to program_schedule (Row/Insert/Update)
#      and mark Insert.id required (the singleton default was dropped). Matches
#      the freshly regenerated Supabase types.
#
# Run from inside the repo:  python3 patch_schedule_multiyear.py
# Idempotent: re-running after a successful patch is a clean no-op. Uses
# match-exactly-once and aborts without writing if an anchor is missing.

import subprocess
import sys
import pathlib

# ---- app/schedule/ScheduleEditor.tsx -------------------------------------
EDITOR = 'app/schedule/ScheduleEditor.tsx'

E_OLD1 = '''          <label className="text-sm font-medium text-slate-600">Academic year</label>
          <input
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="w-28 text-sm border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2"
            style={{ caretColor: NAVY }}
          />'''

E_NEW1 = '''          <label className="text-sm font-medium text-slate-600">Academic year</label>
          <span className="text-sm font-semibold text-slate-900 bg-slate-100 rounded px-2 py-1">
            {academicYear}
          </span>
          <span className="text-xs text-slate-400">(switch years above)</span>'''

E_OLD2 = '<code className="bg-slate-100 px-1 rounded">program_schedule</code> (id=current)'
E_NEW2 = '<code className="bg-slate-100 px-1 rounded">program_schedule</code> ({academicYear})'

# ---- lib/supabase/database.types.ts --------------------------------------
TYPES = 'lib/supabase/database.types.ts'

T_OLD = '''      program_schedule: {
        Row: {
          academic_year: string
          config: Json
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          academic_year?: string
          config?: Json
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          academic_year?: string
          config?: Json
          id?: string
          updated_at?: string
          updated_by?: string | null
        }'''

T_NEW = '''      program_schedule: {
        Row: {
          academic_year: string
          config: Json
          id: string
          is_current: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          academic_year?: string
          config?: Json
          id: string
          is_current?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          academic_year?: string
          config?: Json
          id?: string
          is_current?: boolean
          updated_at?: string
          updated_by?: string | null
        }'''


def git_root() -> pathlib.Path:
    out = subprocess.run(
        ['git', 'rev-parse', '--show-toplevel'],
        capture_output=True, text=True,
    )
    if out.returncode != 0:
        sys.exit('Not inside a git repo. Run this from the project folder.')
    return pathlib.Path(out.stdout.strip())


def apply(text: str, old: str, new: str, label: str) -> str:
    if new in text and old not in text:
        print(f'  - {label}: already patched, skipping.')
        return text
    n = text.count(old)
    if n != 1:
        sys.exit(f'  ! {label}: expected exactly 1 match, found {n}. Aborted; no changes written.')
    print(f'  - {label}: patched.')
    return text.replace(old, new)


def patch_file(root: pathlib.Path, rel: str, edits) -> None:
    path = root / rel
    if not path.exists():
        sys.exit(f'Not found: {path}')
    print(rel)
    original = path.read_text()
    text = original
    for old, new, label in edits:
        text = apply(text, old, new, label)
    if text != original:
        path.write_text(text)
        print(f'  wrote {rel}.')
    else:
        print('  no changes needed.')


def main() -> None:
    root = git_root()
    patch_file(root, EDITOR, [
        (E_OLD1, E_NEW1, 'year input -> read-only label'),
        (E_OLD2, E_NEW2, 'footer caption'),
    ])
    patch_file(root, TYPES, [
        (T_OLD, T_NEW, 'program_schedule is_current column'),
    ])
    print('Done.')


if __name__ == '__main__':
    main()
