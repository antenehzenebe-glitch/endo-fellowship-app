import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { todayET } from './dates'

describe('todayET', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the correct date for early morning ET', () => {
    // 12:00:00 UTC on Nov 15th is 07:00:00 ET (EST) on Nov 15th
    const mockDate = new Date('2023-11-15T12:00:00Z')
    vi.setSystemTime(mockDate)

    expect(todayET()).toBe('2023-11-15')
  })

  it('returns the correct date for late evening ET, when UTC is next day', () => {
    // 01:00:00 UTC on Nov 16th is 20:00:00 ET (EST) on Nov 15th
    const mockDate = new Date('2023-11-16T01:00:00Z')
    vi.setSystemTime(mockDate)

    expect(todayET()).toBe('2023-11-15')
  })

  it('returns the correct date during leap years', () => {
    // 04:00:00 UTC on Feb 29th is 23:00:00 ET (EST) on Feb 28th
    const mockDate = new Date('2024-02-29T04:00:00Z')
    vi.setSystemTime(mockDate)

    expect(todayET()).toBe('2024-02-28')

    // 05:00:00 UTC on Feb 29th is 00:00:00 ET (EST) on Feb 29th
    const mockDate2 = new Date('2024-02-29T05:00:00Z')
    vi.setSystemTime(mockDate2)

    expect(todayET()).toBe('2024-02-29')
  })

  it('returns the correct date for the provided date argument instead of current time', () => {
    const mockSystemDate = new Date('2023-11-15T12:00:00Z')
    vi.setSystemTime(mockSystemDate)

    const specificDate = new Date('2023-11-16T01:00:00Z')
    expect(todayET(specificDate)).toBe('2023-11-15')
  })
})
