import {
  canAuthorEval,
  currentAcademicYear,
  formatPgy,
  periodLabel,
  ratingLabel,
  ratingTone
} from './evaluations';
import { AMBER_DARK, NAVY, SLATE_600, SUCCESS_DARK } from './tokens';

describe('Evaluations module', () => {
  describe('canAuthorEval', () => {
    it('returns true for pd, apd, and admin', () => {
      expect(canAuthorEval('pd')).toBe(true);
      expect(canAuthorEval('apd')).toBe(true);
      expect(canAuthorEval('admin')).toBe(true);
    });

    it('returns false for other roles', () => {
      expect(canAuthorEval('attending')).toBe(false);
      expect(canAuthorEval('fellow')).toBe(false);
      expect(canAuthorEval('coordinator')).toBe(false);
      expect(canAuthorEval('')).toBe(false);
      expect(canAuthorEval('random')).toBe(false);
    });
  });

  describe('formatPgy', () => {
    it('formats pgy string correctly', () => {
      expect(formatPgy('pgy_4')).toBe('PGY-4');
      expect(formatPgy('pgy_5')).toBe('PGY-5');
      expect(formatPgy('pgy_1')).toBe('PGY-1');
    });

    it('returns empty string for null or undefined', () => {
      expect(formatPgy(null)).toBe('');
      expect(formatPgy(undefined)).toBe('');
      expect(formatPgy('')).toBe('');
    });
  });

  describe('currentAcademicYear', () => {
    it('returns correctly for dates before July (Jan - Jun)', () => {
      // For Jan-Jun 2026, academic year is 2025-2026
      const marchDate = new Date('2026-03-15T12:00:00Z');
      expect(currentAcademicYear(marchDate)).toBe('2025-2026');

      const juneDate = new Date('2026-06-30T12:00:00Z');
      expect(currentAcademicYear(juneDate)).toBe('2025-2026');
    });

    it('returns correctly for dates from July onwards (Jul - Dec)', () => {
      // For Jul-Dec 2026, academic year is 2026-2027
      const julyDate = new Date('2026-07-01T12:00:00Z');
      expect(currentAcademicYear(julyDate)).toBe('2026-2027');

      const decemberDate = new Date('2026-12-31T12:00:00Z');
      expect(currentAcademicYear(decemberDate)).toBe('2026-2027');
    });
  });

  describe('labels and tones', () => {
    it('returns correct period label', () => {
      expect(periodLabel('mid_year')).toBe('Mid-year');
      expect(periodLabel('end_of_year')).toBe('End-of-year');
      expect(periodLabel('unknown')).toBe('unknown');
    });

    it('returns correct rating label', () => {
      expect(ratingLabel('below')).toBe('Below level');
      expect(ratingLabel('at')).toBe('At level');
      expect(ratingLabel('above')).toBe('Above level');
      expect(ratingLabel('unknown')).toBe('unknown');
    });

    it('returns correct rating tone', () => {
      expect(ratingTone('below')).toBe(AMBER_DARK);
      expect(ratingTone('at')).toBe(SUCCESS_DARK);
      expect(ratingTone('above')).toBe(NAVY);
      expect(ratingTone('unknown')).toBe(SLATE_600);
    });
  });
});
