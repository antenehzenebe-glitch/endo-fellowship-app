import { describe, it, expect } from 'vitest'
import { currentAcademicYear } from './evaluations'

describe('currentAcademicYear', () => {
  it('should treat early year dates (Jan-Jun) as part of previous year', () => {
    const janDate = new Date('2026-01-15T12:00:00Z')
    expect(currentAcademicYear(janDate)).toBe('2025-2026')

    const marchDate = new Date('2026-03-01T12:00:00Z')
    expect(currentAcademicYear(marchDate)).toBe('2025-2026')

    // June 30, 2026 23:59:00 UTC (which is June 30, 19:59 ET)
    const juneDate = new Date('2026-06-30T23:59:00Z')
    expect(currentAcademicYear(juneDate)).toBe('2025-2026')
  })

  it('should roll over at exactly midnight July 1st ET', () => {
    // July 1, 2026 00:00:00 ET is July 1, 2026 04:00:00 UTC
    const rolloverDate = new Date('2026-07-01T04:00:00Z')
    expect(currentAcademicYear(rolloverDate)).toBe('2026-2027')

    // 1 ms before midnight ET is June 30 ET (so previous academic year)
    const justBeforeRollover = new Date('2026-07-01T03:59:59.999Z')
    expect(currentAcademicYear(justBeforeRollover)).toBe('2025-2026')
  })

  it('should treat late year dates (Jul-Dec) as part of current year', () => {
    const julyDate = new Date('2026-07-15T12:00:00Z')
    expect(currentAcademicYear(julyDate)).toBe('2026-2027')

    const sepDate = new Date('2026-09-01T12:00:00Z')
    expect(currentAcademicYear(sepDate)).toBe('2026-2027')

    const novDate = new Date('2026-11-30T12:00:00Z')
    expect(currentAcademicYear(novDate)).toBe('2026-2027')
  })
})
