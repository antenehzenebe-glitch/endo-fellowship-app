import { test, describe } from 'node:test'
import * as assert from 'node:assert'
import { asConfig } from './schedule'

describe('asConfig', () => {
  test('returns default ScheduleConfig when given null or undefined', () => {
    const expected = {
      version: 2,
      weekly: [],
      rotations: [],
      fellows: [],
      blocks: [],
      months: []
    }
    assert.deepStrictEqual(asConfig(null), expected)
    assert.deepStrictEqual(asConfig(undefined), expected)
  })

  test('returns default ScheduleConfig when given empty object', () => {
    const expected = {
      version: 2,
      weekly: [],
      rotations: [],
      fellows: [],
      blocks: [],
      months: []
    }
    assert.deepStrictEqual(asConfig({}), expected)
  })

  test('preserves version if given a number', () => {
    assert.strictEqual(asConfig({ version: 5 }).version, 5)
  })

  test('defaults version to 2 if given non-number', () => {
    assert.strictEqual(asConfig({ version: '3' }).version, 2)
  })

  test('preserves weekly, rotations, and fellows if given arrays', () => {
    const input = {
      weekly: ['A', 'B'],
      rotations: [1, 2],
      fellows: [{ id: 'f1' }]
    }
    const res = asConfig(input)
    assert.deepStrictEqual(res.weekly, input.weekly)
    assert.deepStrictEqual(res.rotations, input.rotations)
    assert.deepStrictEqual(res.fellows, input.fellows)
  })

  test('defaults weekly, rotations, and fellows to empty arrays if not arrays', () => {
    const input = {
      weekly: 'not-array',
      rotations: null,
      fellows: {}
    }
    const res = asConfig(input)
    assert.deepStrictEqual(res.weekly, [])
    assert.deepStrictEqual(res.rotations, [])
    assert.deepStrictEqual(res.fellows, [])
  })

  test('parses blocks with string fallback', () => {
    const input = {
      blocks: [
        { id: 123, label: 'Block 1' },
        null,
        { id: 'b2', attending: 'Attending A', assignments: { 'A': 'B' } }
      ]
    }
    const res = asConfig(input)
    assert.strictEqual(res.blocks.length, 3)

    assert.strictEqual(res.blocks[0].id, '123')
    assert.strictEqual(res.blocks[0].label, 'Block 1')
    assert.strictEqual(res.blocks[0].start, '')
    assert.strictEqual(res.blocks[0].end, '')
    assert.strictEqual(res.blocks[0].attending, '')
    assert.deepStrictEqual(res.blocks[0].assignments, {})

    assert.strictEqual(res.blocks[1].id, '')
    assert.strictEqual(res.blocks[1].label, '')

    assert.strictEqual(res.blocks[2].id, 'b2')
    assert.strictEqual(res.blocks[2].attending, 'Attending A')
    assert.deepStrictEqual(res.blocks[2].assignments, { 'A': 'B' })
  })

  test('parses blocks handling invalid assignments', () => {
    const input = {
      blocks: [
        { id: 'b1', assignments: null },
        { id: 'b2', assignments: 'string-is-not-object' },
        { id: 'b3', assignments: ['array', 'is', 'object', 'but', 'handled'] }
      ]
    }
    const res = asConfig(input)
    assert.deepStrictEqual(res.blocks[0].assignments, {})
    assert.deepStrictEqual(res.blocks[1].assignments, {})
    // An array is technically an object, so it passes typeof === 'object'.
    // The cast to Record<string, string> just means we take it as-is.
    assert.deepStrictEqual(res.blocks[2].assignments, ['array', 'is', 'object', 'but', 'handled'])
  })

  test('parses months with string fallback and nested structures', () => {
    const input = {
      months: [
        {
          id: 'm1',
          ym: '2024-01',
          label: 'Jan 2024',
          subtitle: 'Happy New Year',
          sessions: [
            { id: 's1', date: '2024-01-01', title: 'Session 1', badge: 'NEW' },
            null
          ],
          coverage: {
            consultAttending: 'Dr. Smith',
            consultFellows: 'Fellow 1',
            procedureFellow: 'Fellow 2',
            weekend: [
              { id: 'w1', who: 'Fellow A', dates: '1/6-1/7' },
              null
            ]
          }
        },
        null,
        {
           id: 'm2',
           sessions: 'not-array',
           coverage: null
        }
      ]
    }

    const res = asConfig(input)
    assert.strictEqual(res.months.length, 3)

    // Month 1
    const m1 = res.months[0]
    assert.strictEqual(m1.id, 'm1')
    assert.strictEqual(m1.ym, '2024-01')
    assert.strictEqual(m1.label, 'Jan 2024')
    assert.strictEqual(m1.subtitle, 'Happy New Year')

    // Month 1 sessions
    assert.strictEqual(m1.sessions.length, 2)
    assert.strictEqual(m1.sessions[0].id, 's1')
    assert.strictEqual(m1.sessions[0].title, 'Session 1')
    assert.strictEqual(m1.sessions[0].badge, 'NEW')

    assert.strictEqual(m1.sessions[1].id, '')
    assert.strictEqual(m1.sessions[1].title, '')

    // Month 1 coverage
    assert.strictEqual(m1.coverage.consultAttending, 'Dr. Smith')
    assert.strictEqual(m1.coverage.consultFellows, 'Fellow 1')
    assert.strictEqual(m1.coverage.procedureFellow, 'Fellow 2')
    assert.strictEqual(m1.coverage.weekend.length, 2)
    assert.strictEqual(m1.coverage.weekend[0].id, 'w1')
    assert.strictEqual(m1.coverage.weekend[0].who, 'Fellow A')
    assert.strictEqual(m1.coverage.weekend[0].dates, '1/6-1/7')
    assert.strictEqual(m1.coverage.weekend[1].id, '')

    // Month 2 (null)
    assert.strictEqual(res.months[1].id, '')

    // Month 3
    const m3 = res.months[2]
    assert.strictEqual(m3.id, 'm2')
    assert.strictEqual(m3.subtitle, undefined)
    assert.deepStrictEqual(m3.sessions, [])
    assert.strictEqual(m3.coverage.consultAttending, '')
    assert.strictEqual(m3.coverage.consultFellows, '')
    assert.strictEqual(m3.coverage.procedureFellow, '')
    assert.deepStrictEqual(m3.coverage.weekend, [])
  })
})
