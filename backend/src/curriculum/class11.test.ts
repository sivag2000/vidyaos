import { describe, it, expect } from 'vitest';
import { CLASS_11, getChapter } from './class11';

describe('CLASS_11 syllabus', () => {
  it('has the four subjects', () => {
    expect(CLASS_11.subjects.map(s => s.id).sort()).toEqual(
      ['biology', 'chemistry', 'mathematics', 'physics']
    );
  });

  it('has unique chapter ids across all subjects', () => {
    const ids = CLASS_11.subjects.flatMap(s => s.chapters.map(c => c.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every chapter belongs to a subject and has a name', () => {
    for (const s of CLASS_11.subjects) {
      for (const c of s.chapters) {
        expect(c.id).toBeTruthy();
        expect(c.name).toBeTruthy();
      }
    }
  });

  it('getChapter resolves a known chapter', () => {
    const found = getChapter('units-and-measurements');
    expect(found?.subjectId).toBe('physics');
    expect(found?.chapter.name).toBe('Units and Measurements');
  });

  it('getChapter returns null for unknown ids', () => {
    expect(getChapter('does-not-exist')).toBeNull();
  });
});
