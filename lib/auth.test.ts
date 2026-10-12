import { isStaff, isEvaluator, roleHome } from './auth';

describe('Auth role helpers', () => {
  describe('isStaff', () => {
    it('returns true for staff roles', () => {
      expect(isStaff('pd')).toBe(true);
      expect(isStaff('apd')).toBe(true);
      expect(isStaff('coordinator')).toBe(true);
      expect(isStaff('admin')).toBe(true);
    });

    it('returns false for non-staff roles', () => {
      expect(isStaff('fellow')).toBe(false);
      expect(isStaff('attending')).toBe(false);
    });
  });

  describe('isEvaluator', () => {
    it('returns true for evaluator roles', () => {
      expect(isEvaluator('attending')).toBe(true);
      expect(isEvaluator('pd')).toBe(true);
      expect(isEvaluator('apd')).toBe(true);
      expect(isEvaluator('coordinator')).toBe(true);
      expect(isEvaluator('admin')).toBe(true);
    });

    it('returns false for non-evaluator roles', () => {
      expect(isEvaluator('fellow')).toBe(false);
    });
  });

  describe('roleHome', () => {
    it('returns /dashboard for staff roles', () => {
      expect(roleHome('pd')).toBe('/dashboard');
      expect(roleHome('apd')).toBe('/dashboard');
      expect(roleHome('coordinator')).toBe('/dashboard');
      expect(roleHome('admin')).toBe('/dashboard');
    });

    it('returns /attending for attending role', () => {
      expect(roleHome('attending')).toBe('/attending');
    });

    it('returns /log for fellow role', () => {
      expect(roleHome('fellow')).toBe('/log');
    });
  });
});
