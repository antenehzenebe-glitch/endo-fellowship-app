import { pickMonth, ScheduleMonth, MonthCoverage } from '../schedule';

describe('pickMonth', () => {
  const dummyCoverage: MonthCoverage = {
    consultAttending: '',
    consultFellows: '',
    weekend: [],
    procedureFellow: '',
  };

  const createMonth = (ym: string): ScheduleMonth => ({
    id: `id-${ym}`,
    ym,
    label: `Label ${ym}`,
    sessions: [],
    coverage: dummyCoverage,
  });

  it('returns null if months array is empty', () => {
    expect(pickMonth([], '2026-06-15')).toBeNull();
  });

  it('returns the exact match for the current year-month', () => {
    const months = [
      createMonth('2026-05'),
      createMonth('2026-06'),
      createMonth('2026-07'),
    ];
    const result = pickMonth(months, '2026-06-15');
    expect(result?.ym).toBe('2026-06');
  });

  it('returns the nearest upcoming month if there is no exact match', () => {
    const months = [
      createMonth('2026-05'),
      createMonth('2026-07'),
      createMonth('2026-08'),
    ];
    // Asking for June 2026, the nearest upcoming is July 2026
    const result = pickMonth(months, '2026-06-15');
    expect(result?.ym).toBe('2026-07');
  });

  it('returns the most recent past month if no exact match and no future months', () => {
    const months = [
      createMonth('2026-03'),
      createMonth('2026-04'),
      createMonth('2026-05'),
    ];
    // Asking for June 2026, there are no upcoming. It should pick the latest past (May).
    const result = pickMonth(months, '2026-06-15');
    expect(result?.ym).toBe('2026-05');
  });

  it('handles unsorted input array properly for upcoming month', () => {
    const months = [
      createMonth('2026-08'),
      createMonth('2026-05'),
      createMonth('2026-07'),
    ];
    // Asking for June 2026, nearest upcoming is July 2026
    const result = pickMonth(months, '2026-06-15');
    expect(result?.ym).toBe('2026-07');
  });

  it('handles unsorted input array properly for most recent past month', () => {
    const months = [
      createMonth('2026-03'),
      createMonth('2026-05'),
      createMonth('2026-04'),
    ];
    // Asking for June 2026, latest past is May
    const result = pickMonth(months, '2026-06-15');
    expect(result?.ym).toBe('2026-05');
  });
});
