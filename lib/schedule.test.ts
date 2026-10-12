import { describe, it, expect } from 'vitest'
import { blockForDate, ScheduleBlock } from './schedule'

describe('blockForDate', () => {
  const blocks: ScheduleBlock[] = [
    {
      id: 'block1',
      label: 'July',
      start: '2026-07-01',
      end: '2026-07-31',
      attending: '',
      assignments: {},
    },
    {
      id: 'block2',
      label: 'August',
      start: '2026-08-01',
      end: '2026-08-31',
      attending: '',
      assignments: {},
    },
    {
      id: 'block3',
      label: 'Invalid Block',
      start: '', // Missing start
      end: '2026-09-30',
      attending: '',
      assignments: {},
    },
    {
      id: 'block4',
      label: 'Invalid Block 2',
      start: '2026-10-01',
      end: '', // Missing end
      attending: '',
      assignments: {},
    }
  ]

  it('returns the correct block for an exact start date match', () => {
    expect(blockForDate(blocks, '2026-07-01')).toEqual(blocks[0])
  })

  it('returns the correct block for an exact end date match', () => {
    expect(blockForDate(blocks, '2026-07-31')).toEqual(blocks[0])
  })

  it('returns the correct block for a date inside the range', () => {
    expect(blockForDate(blocks, '2026-07-15')).toEqual(blocks[0])
  })

  it('returns null for a date before the first block', () => {
    expect(blockForDate(blocks, '2026-06-30')).toBeNull()
  })

  it('returns null for a date after the last valid block', () => {
    expect(blockForDate(blocks, '2026-09-01')).toBeNull()
  })

  it('handles multiple blocks and returns the correct one', () => {
    expect(blockForDate(blocks, '2026-08-15')).toEqual(blocks[1])
  })

  it('ignores blocks with missing start dates', () => {
    expect(blockForDate(blocks, '2026-09-15')).toBeNull()
  })

  it('ignores blocks with missing end dates', () => {
    expect(blockForDate(blocks, '2026-10-15')).toBeNull()
  })
})
