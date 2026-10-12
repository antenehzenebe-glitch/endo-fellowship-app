import { describe, it, expect } from 'vitest'
import { monthGridWeeks } from './schedule'

describe('monthGridWeeks', () => {
  it('returns empty array for invalid inputs', () => {
    expect(monthGridWeeks('')).toEqual([])
    expect(monthGridWeeks('invalid')).toEqual([])
    expect(monthGridWeeks('2023')).toEqual([])
  })

  it('handles a standard month starting on Sunday (Oct 2023)', () => {
    // Oct 1 2023 is Sunday.
    // Sunday should be skipped. Oct 2 is Monday.
    const result = monthGridWeeks('2023-10')

    // Check first week
    expect(result[0]).toEqual([
      { day: 2, ymd: '2023-10-02' },
      { day: 3, ymd: '2023-10-03' },
      { day: 4, ymd: '2023-10-04' },
      { day: 5, ymd: '2023-10-05' },
      { day: 6, ymd: '2023-10-06' },
    ])

    // Check last week (Oct 31 is Tuesday)
    const lastWeek = result[result.length - 1]
    expect(lastWeek).toEqual([
      { day: 30, ymd: '2023-10-30' },
      { day: 31, ymd: '2023-10-31' },
      { day: 0, ymd: '' },
      { day: 0, ymd: '' },
      { day: 0, ymd: '' },
    ])
  })

  it('handles a month starting on Friday (Sep 2023)', () => {
    // Sep 1 2023 is Friday.
    const result = monthGridWeeks('2023-09')

    expect(result[0]).toEqual([
      { day: 0, ymd: '' },
      { day: 0, ymd: '' },
      { day: 0, ymd: '' },
      { day: 0, ymd: '' },
      { day: 1, ymd: '2023-09-01' },
    ])
  })

  it('handles leap year February (Feb 2024)', () => {
    // Feb 1 2024 is Thursday.
    // Feb 29 2024 is Thursday.
    const result = monthGridWeeks('2024-02')

    // First week
    expect(result[0]).toEqual([
      { day: 0, ymd: '' },
      { day: 0, ymd: '' },
      { day: 0, ymd: '' },
      { day: 1, ymd: '2024-02-01' },
      { day: 2, ymd: '2024-02-02' },
    ])

    // Last week
    const lastWeek = result[result.length - 1]
    expect(lastWeek).toEqual([
      { day: 26, ymd: '2024-02-26' },
      { day: 27, ymd: '2024-02-27' },
      { day: 28, ymd: '2024-02-28' },
      { day: 29, ymd: '2024-02-29' },
      { day: 0, ymd: '' },
    ])
  })

  it('handles non-leap year February (Feb 2023)', () => {
    // Feb 1 2023 is Wednesday.
    // Feb 28 2023 is Tuesday.
    const result = monthGridWeeks('2023-02')

    expect(result[0]).toEqual([
      { day: 0, ymd: '' },
      { day: 0, ymd: '' },
      { day: 1, ymd: '2023-02-01' },
      { day: 2, ymd: '2023-02-02' },
      { day: 3, ymd: '2023-02-03' },
    ])

    const lastWeek = result[result.length - 1]
    expect(lastWeek).toEqual([
      { day: 27, ymd: '2023-02-27' },
      { day: 28, ymd: '2023-02-28' },
      { day: 0, ymd: '' },
      { day: 0, ymd: '' },
      { day: 0, ymd: '' },
    ])
  })
})
