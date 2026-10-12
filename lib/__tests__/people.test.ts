import { describe, it, expect } from 'vitest';
import { groupDirectory, DirectoryPerson } from '../people';

describe('groupDirectory', () => {
  const createPerson = (
    id: string,
    category: DirectoryPerson['category'],
    isLeadership: boolean,
    fullName: string = `Person ${id}`
  ): DirectoryPerson => ({
    id,
    category,
    fullName,
    credentials: null,
    roleTitle: null,
    isLeadership,
    photoUrl: null,
  });

  it('correctly sorts leadership, faculty, and fellows', () => {
    const people: DirectoryPerson[] = [
      createPerson('1', 'faculty', true, 'Dr. PD'),
      createPerson('2', 'faculty', false, 'Dr. Attending'),
      createPerson('3', 'fellow', false, 'Dr. Fellow'),
      createPerson('4', 'fellow', true, 'Dr. Chief Fellow'),
      createPerson('5', 'staff', true, 'Dr. APD'),
    ];

    const result = groupDirectory(people);

    // Leadership: Any category with isLeadership = true
    expect(result.leadership).toHaveLength(3);
    expect(result.leadership.map(p => p.id)).toEqual(['1', '4', '5']);

    // Faculty: Category 'faculty' AND isLeadership = false
    expect(result.faculty).toHaveLength(1);
    expect(result.faculty.map(p => p.id)).toEqual(['2']);

    // Fellows: Category 'fellow' (regardless of leadership status according to current implementation)
    // Wait, the current implementation filters 'fellows' purely by category.
    // If a fellow is also leadership, they'll appear in BOTH leadership and fellows.
    // Let's verify the current behavior of the code.
    expect(result.fellows).toHaveLength(2);
    expect(result.fellows.map(p => p.id)).toEqual(['3', '4']);
  });

  it('returns empty arrays when input is empty', () => {
    const result = groupDirectory([]);
    expect(result.leadership).toEqual([]);
    expect(result.faculty).toEqual([]);
    expect(result.fellows).toEqual([]);
  });

  it('handles empty categories appropriately', () => {
    const people: DirectoryPerson[] = [
      createPerson('1', 'faculty', true), // Only leadership
    ];

    const result = groupDirectory(people);
    expect(result.leadership).toHaveLength(1);
    expect(result.faculty).toHaveLength(0);
    expect(result.fellows).toHaveLength(0);
  });
});
