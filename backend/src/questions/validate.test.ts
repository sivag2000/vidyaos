import { describe, it, expect } from 'vitest';
import { validateGenerated, stemHash } from './validate';

const validMcq = {
  type: 'MCQ',
  difficulty: 'EASY',
  question: 'What is the SI unit of force?',
  options: ['Newton', 'Joule', 'Watt', 'Pascal'],
  correctAnswer: 0,
  explanation: 'Force is measured in newtons (kg·m/s²).',
};

describe('validateGenerated', () => {
  it('accepts a well-formed MCQ', () => {
    const r = validateGenerated(validMcq);
    expect(r.ok).toBe(true);
  });

  it('rejects MCQ with out-of-range correctAnswer', () => {
    const r = validateGenerated({ ...validMcq, correctAnswer: 9 });
    expect(r.ok).toBe(false);
  });

  it('rejects MCQ with fewer than 2 options', () => {
    const r = validateGenerated({ ...validMcq, options: ['only one'] });
    expect(r.ok).toBe(false);
  });

  it('rejects empty explanation', () => {
    const r = validateGenerated({ ...validMcq, explanation: '' });
    expect(r.ok).toBe(false);
  });

  it('accepts NUMERICAL with a numeric answer and no options', () => {
    const r = validateGenerated({
      type: 'NUMERICAL',
      difficulty: 'MEDIUM',
      question: 'How many significant figures are in 0.00204?',
      correctAnswer: 3,
      explanation: 'Leading zeros are not significant; 2, 0, 4 count.',
    });
    expect(r.ok).toBe(true);
  });

  it('rejects NUMERICAL with a non-numeric answer', () => {
    const r = validateGenerated({
      type: 'NUMERICAL',
      difficulty: 'MEDIUM',
      question: 'x?',
      correctAnswer: 'three',
      explanation: 'x is three',
    });
    expect(r.ok).toBe(false);
  });
});

describe('stemHash', () => {
  it('is stable and case/whitespace-insensitive', () => {
    expect(stemHash('  What is FORCE? ')).toBe(stemHash('what is force?'));
  });

  it('differs for different stems', () => {
    expect(stemHash('a')).not.toBe(stemHash('b'));
  });
});
