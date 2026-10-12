import { describe, it, expect } from 'vitest';
import {
  monthGridWeeks,
  emptyCoverage,
  blockForDate,
  ymToLabel,
  pickMonth,
  asConfig,
  ScheduleBlock,
  ScheduleMonth,
  EMPTY_CONFIG
} from './schedule';

describe('schedule module', () => {
  describe('monthGridWeeks', () => {
    it('returns empty array for invalid input', () => {
      expect(monthGridWeeks('invalid')).toEqual([]);
      expect(monthGridWeeks('2024')).toEqual([]);
      expect(monthGridWeeks('')).toEqual([]);
    });

    it('generates correct grid for a month starting on Thursday (leap year)', () => {
      // Feb 2024 starts on Thursday (col 3), 29 days
      const weeks = monthGridWeeks('2024-02');
      expect(weeks).toHaveLength(5);

      // Week 1: Mon-Wed empty, Thu 1st, Fri 2nd
      expect(weeks[0].map(d => d.day)).toEqual([0, 0, 0, 1, 2]);
      expect(weeks[0][3].ymd).toBe('2024-02-01');
      expect(weeks[0][4].ymd).toBe('2024-02-02');

      // Week 2: Mon 5th - Fri 9th
      expect(weeks[1].map(d => d.day)).toEqual([5, 6, 7, 8, 9]);

      // Week 5: Mon 26th - Thu 29th, Fri empty
      expect(weeks[4].map(d => d.day)).toEqual([26, 27, 28, 29, 0]);
      expect(weeks[4][3].ymd).toBe('2024-02-29');
    });

    it('generates correct grid for a month starting on Monday', () => {
      // July 2024 starts on Monday (col 0), 31 days
      const weeks = monthGridWeeks('2024-07');
      expect(weeks).toHaveLength(5);

      // Week 1: Mon 1st - Fri 5th
      expect(weeks[0].map(d => d.day)).toEqual([1, 2, 3, 4, 5]);

      // Week 5: Mon 29th - Wed 31st, Thu-Fri empty
      expect(weeks[4].map(d => d.day)).toEqual([29, 30, 31, 0, 0]);
      expect(weeks[4][2].ymd).toBe('2024-07-31');
    });

    it('generates correct grid for a month starting on Saturday', () => {
      // June 2024 starts on Saturday (skipped)
      // June 1 (Sat), June 2 (Sun) -> first grid day is June 3 (Mon)
      const weeks = monthGridWeeks('2024-06');

      // June 30 is Sunday. June 29 is Sat. June 28 is Fri.
      // So June only has 4 weeks in the grid!
      expect(weeks).toHaveLength(4);

      // Week 1: Mon 3rd - Fri 7th
      expect(weeks[0].map(d => d.day)).toEqual([3, 4, 5, 6, 7]);

      // Week 4: Mon 24th - Fri 28th
      expect(weeks[3].map(d => d.day)).toEqual([24, 25, 26, 27, 28]);
    });

    it('generates correct grid for a month starting on Sunday', () => {
      // September 2024 starts on Sunday (skipped)
      // Sept 1 is Sunday. Sept 2 is Monday. 30 days.
      const weeks = monthGridWeeks('2024-09');
      expect(weeks).toHaveLength(5);

      // Week 1: Mon 2nd - Fri 6th
      expect(weeks[0].map(d => d.day)).toEqual([2, 3, 4, 5, 6]);

      // Week 5: Mon 30th - Fri empty
      expect(weeks[4].map(d => d.day)).toEqual([30, 0, 0, 0, 0]);
    });
  });

  describe('emptyCoverage', () => {
    it('returns the correct default object', () => {
      expect(emptyCoverage()).toEqual({
        consultAttending: '',
        consultFellows: '',
        weekend: [],
        procedureFellow: ''
      });
    });
  });

  describe('blockForDate', () => {
    const blocks: ScheduleBlock[] = [
      { id: '1', label: 'Jan', start: '2024-01-01', end: '2024-01-31', attending: '', assignments: {} },
      { id: '2', label: 'Feb', start: '2024-02-01', end: '2024-02-29', attending: '', assignments: {} },
    ];

    it('finds the block matching the date range', () => {
      expect(blockForDate(blocks, '2024-01-15')).toBe(blocks[0]);
      expect(blockForDate(blocks, '2024-02-29')).toBe(blocks[1]);
    });

    it('returns null if date is out of bounds', () => {
      expect(blockForDate(blocks, '2023-12-31')).toBeNull();
      expect(blockForDate(blocks, '2024-03-01')).toBeNull();
    });

    it('handles edge cases correctly (inclusive bounds)', () => {
      expect(blockForDate(blocks, '2024-01-01')).toBe(blocks[0]);
      expect(blockForDate(blocks, '2024-01-31')).toBe(blocks[0]);
    });

    it('returns null for empty blocks list', () => {
      expect(blockForDate([], '2024-01-15')).toBeNull();
    });
  });

  describe('ymToLabel', () => {
    it('formats valid year-month string correctly', () => {
      expect(ymToLabel('2026-06')).toBe('June 2026');
      expect(ymToLabel('2024-02')).toBe('February 2024');
      expect(ymToLabel('2024-12')).toBe('December 2024');
    });

    it('returns original input if invalid', () => {
      expect(ymToLabel('invalid')).toBe('invalid');
      expect(ymToLabel('2024')).toBe('2024');
    });
  });

  describe('pickMonth', () => {
    const months: ScheduleMonth[] = [
      { id: '1', ym: '2024-01', label: 'Jan', sessions: [], coverage: emptyCoverage() },
      { id: '2', ym: '2024-03', label: 'Mar', sessions: [], coverage: emptyCoverage() },
      { id: '3', ym: '2024-05', label: 'May', sessions: [], coverage: emptyCoverage() },
    ];

    it('returns null for empty months list', () => {
      expect(pickMonth([], '2024-02-15')).toBeNull();
    });

    it('returns exact match', () => {
      expect(pickMonth(months, '2024-03-15')).toBe(months[1]);
    });

    it('returns nearest upcoming month if no exact match', () => {
      expect(pickMonth(months, '2024-02-15')).toBe(months[1]); // Nearest upcoming is March
      expect(pickMonth(months, '2024-04-15')).toBe(months[2]); // Nearest upcoming is May
    });

    it('returns most recent past month if no upcoming month', () => {
      expect(pickMonth(months, '2024-06-15')).toBe(months[2]); // May
    });
  });

  describe('asConfig', () => {
    it('returns EMPTY_CONFIG structure for null/undefined input', () => {
      const result = asConfig(null);
      expect(result.version).toBe(2);
      expect(result.weekly).toEqual([]);
      expect(result.blocks).toEqual([]);
      expect(result.months).toEqual([]);
    });

    it('safely coerces partial data with fallbacks', () => {
      const partialRaw = {
        version: 3,
        blocks: [
          { id: 123, label: 'Block 1', assignments: null } // id as number, assignments null
        ],
        months: [
          { ym: '2024-01' } // Missing other fields
        ]
      };

      const result = asConfig(partialRaw);
      expect(result.version).toBe(3);
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0].id).toBe('123');
      expect(result.blocks[0].label).toBe('Block 1');
      expect(result.blocks[0].start).toBe('');
      expect(result.blocks[0].assignments).toEqual({});

      expect(result.months).toHaveLength(1);
      expect(result.months[0].ym).toBe('2024-01');
      expect(result.months[0].sessions).toEqual([]);
      expect(result.months[0].coverage).toEqual(emptyCoverage());
    });

    it('preserves valid data exactly', () => {
      const validConfig = {
        version: 2,
        weekly: [{ id: 'w1', activity: 'Clinic', days: ['Mon'], start: '08:00', end: '12:00', kind: 'clinic' as const }],
        rotations: ['Endo'],
        fellows: [{ id: 'f1', name: 'Dr. John', pgy: '4' }],
        blocks: [{ id: 'b1', label: 'July', start: '2024-07-01', end: '2024-07-31', attending: 'Dr. Smith', assignments: { f1: 'Endo' } }],
        months: [{ id: 'm1', ym: '2024-07', label: 'July 2024', sessions: [], coverage: emptyCoverage() }],
      };

      const result = asConfig(validConfig);
      expect(result).toEqual(validConfig);
    });
  });
});
