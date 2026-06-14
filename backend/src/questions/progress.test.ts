import { describe, it, expect } from 'vitest';
import { nextStatus } from './progress';

describe('nextStatus', () => {
  it('moves NOT_STARTED to LEARNING on first attempt', () => {
    expect(nextStatus('NOT_STARTED', { attempted: 1, correct: 1 })).toBe('LEARNING');
  });

  it('stays LEARNING below the revising threshold', () => {
    expect(nextStatus('LEARNING', { attempted: 9, correct: 9 })).toBe('LEARNING');
  });

  it('moves to REVISING at >= 10 distinct attempts', () => {
    expect(nextStatus('LEARNING', { attempted: 10, correct: 5 })).toBe('REVISING');
  });

  it('moves to MASTERED at >= 15 attempts and >= 80% accuracy', () => {
    expect(nextStatus('REVISING', { attempted: 15, correct: 12 })).toBe('MASTERED');
  });

  it('does not master with high count but low accuracy', () => {
    expect(nextStatus('REVISING', { attempted: 20, correct: 10 })).toBe('REVISING');
  });

  it('never regresses below current status', () => {
    expect(nextStatus('MASTERED', { attempted: 1, correct: 0 })).toBe('MASTERED');
  });
});
