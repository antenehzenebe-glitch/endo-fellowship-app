import { describe, expect, it } from 'vitest'
import { roleHome } from '../../lib/auth'

describe('roleHome', () => {
  it('returns /dashboard for staff roles', () => {
    expect(roleHome('pd')).toBe('/dashboard')
    expect(roleHome('apd')).toBe('/dashboard')
    expect(roleHome('coordinator')).toBe('/dashboard')
    expect(roleHome('admin')).toBe('/dashboard')
  })

  it('returns /attending for attending role', () => {
    expect(roleHome('attending')).toBe('/attending')
  })

  it('returns /log for fellow role', () => {
    expect(roleHome('fellow')).toBe('/log')
  })
})
