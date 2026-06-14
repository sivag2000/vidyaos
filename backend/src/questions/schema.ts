import { z } from 'zod';

const base = {
  question: z.string().min(5),
  explanation: z.string().min(5),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
};

export const mcqSchema = z.object({
  ...base,
  type: z.enum(['MCQ', 'ASSERTION_REASON']),
  options: z.array(z.string().min(1)).min(2).max(6),
  correctAnswer: z.number().int().min(0),
}).refine(q => q.correctAnswer < q.options.length, {
  message: 'correctAnswer index out of range',
  path: ['correctAnswer'],
});

export const numericalSchema = z.object({
  ...base,
  type: z.literal('NUMERICAL'),
  correctAnswer: z.number(),
});

export const generatedQuestionSchema = z.union([mcqSchema, numericalSchema]);
export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;
