import { describe, it, expect } from 'vitest';
import { formatPgy } from './evaluations';

describe('formatPgy', () => {
  it('formats standard pgy string correctly', () => {
    expect(formatPgy('pgy_4')).toBe('PGY-4');
  });

  it('formats standard pgy string with different numbers correctly', () => {
    expect(formatPgy('pgy_5')).toBe('PGY-5');
    expect(formatPgy('pgy_6')).toBe('PGY-6');
  });

  it('handles multiple underscores', () => {
    expect(formatPgy('pgy_4_5')).toBe('PGY-4-5');
  });

  it('returns empty string for null', () => {
    expect(formatPgy(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatPgy(undefined)).toBe('');
  });

  it('returns empty string for an empty string input', () => {
    expect(formatPgy('')).toBe('');
  });

  it('handles already formatted strings gracefully', () => {
    expect(formatPgy('PGY-4')).toBe('PGY-4');
  });
});
