import { createHash } from 'crypto';
import { generatedQuestionSchema, GeneratedQuestion } from './schema';

export type ValidationResult =
  | { ok: true; value: GeneratedQuestion }
  | { ok: false; error: string };

export function validateGenerated(raw: unknown): ValidationResult {
  const parsed = generatedQuestionSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map(i => i.message).join('; ') };
  }
  return { ok: true, value: parsed.data };
}

export function stemHash(question: string): string {
  const normalized = question.trim().toLowerCase().replace(/\s+/g, ' ');
  return createHash('sha256').update(normalized).digest('hex');
}
