# Class 11 Question Bank + Practice Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace VidyaOS's hardcoded test data with a structured, AI-generated, DB-cached question bank for CBSE Class 11 (Physics, Chemistry, Mathematics, Biology), plus a chapter-practice experience and a simple timed-test mode.

**Architecture:** Approach A — the CBSE syllabus lives as a checked-in config file (single source of truth for `chapterId`s); AI-generated questions are validated, self-verified, and cached in a new `Question` table; `QuestionAttempt` records power `ChapterProgress` advancement. Reuses existing `ChapterProgress`/`TestResult`/`WeakTopic`, controllers, auth middleware, and `ai.service`.

**Tech Stack:** Node + Express + TypeScript + Prisma (PostgreSQL), Google Gemini (`@google/generative-ai`), zod (already installed), Vitest (added in Task 0); React 19 + Vite + Zustand + axios frontend.

**Spec:** `docs/superpowers/specs/2026-06-14-class11-question-bank-design.md`

**Working directory for all backend commands:** `backend/`. For frontend commands: `frontend/`.

---

## File Structure

**Backend (new):**
- `backend/vitest.config.ts` — test runner config
- `backend/src/curriculum/class11.ts` — syllabus config (source of truth)
- `backend/src/curriculum/types.ts` — syllabus TypeScript types
- `backend/src/questions/schema.ts` — zod schema for AI question output
- `backend/src/questions/validate.ts` — validation + dedupe helpers (pure functions)
- `backend/src/questions/validate.test.ts` — tests
- `backend/src/questions/progress.ts` — `ChapterProgress` advancement rule (pure function)
- `backend/src/questions/progress.test.ts` — tests
- `backend/src/controllers/curriculum.controller.ts`
- `backend/src/controllers/practice.controller.ts`
- `backend/src/routes/curriculum.routes.ts`
- `backend/src/routes/practice.routes.ts`
- `backend/scripts/generate-questions.ts` — generation CLI

**Backend (modified):**
- `backend/prisma/schema.prisma` — add `Question`, `QuestionAttempt`, enums
- `backend/src/services/ai.service.ts` — add `generateClass11Questions` + self-verify
- `backend/src/controllers/test.controller.ts` — add `generateTest`
- `backend/src/routes/test.routes.ts` — add `POST /generate`
- `backend/src/index.ts` — mount curriculum + practice routes
- `backend/package.json` — add scripts + devDeps

**Frontend (new):**
- `frontend/src/api/practice.ts` — typed API calls + shared types
- `frontend/src/pages/student/Practice.tsx` — practice page

**Frontend (modified):**
- `frontend/src/pages/student/StudentLayout.tsx` — add Practice nav + route
- `frontend/src/pages/student/MockTests.tsx` — fetch from `/tests/generate`
- delete `frontend/src/data/mockTests.ts`

---

## Task 0: Add Vitest test runner (backend)

**Files:**
- Create: `backend/vitest.config.ts`
- Modify: `backend/package.json`

- [ ] **Step 1: Install Vitest**

Run (in `backend/`):
```bash
npm install -D vitest
```

- [ ] **Step 2: Create vitest config**

Create `backend/vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: Add test script**

In `backend/package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Add a smoke test**

Create `backend/src/smoke.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run tests, verify pass**

Run: `npm test`
Expected: PASS (1 test). Then delete `backend/src/smoke.test.ts`.

- [ ] **Step 6: Commit**

```bash
git add backend/package.json backend/package-lock.json backend/vitest.config.ts
git commit -m "chore: add vitest test runner to backend"
```

---

## Task 1: Add Question + QuestionAttempt models

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] **Step 1: Add enums**

In `backend/prisma/schema.prisma`, after the existing `enum ChapterStatus { ... }` block, add:
```prisma
enum QuestionType {
  MCQ
  NUMERICAL
  ASSERTION_REASON
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

enum QuestionStatus {
  DRAFT
  PUBLISHED
  REJECTED
}
```

- [ ] **Step 2: Add Question + QuestionAttempt models**

At the end of `backend/prisma/schema.prisma`, add:
```prisma
model Question {
  id            String         @id @default(cuid())
  classLevel    Int
  subject       String
  chapterId     String
  topic         String
  type          QuestionType
  difficulty    Difficulty
  question      String
  options       Json?
  correctAnswer Json
  explanation   String
  stemHash      String
  source        String         @default("ai-gemini")
  status        QuestionStatus @default(PUBLISHED)
  modelMeta     Json?
  createdAt     DateTime       @default(now())

  attempts QuestionAttempt[]

  @@unique([chapterId, stemHash])
  @@index([classLevel, subject, chapterId])
  @@index([chapterId, difficulty, status])
  @@map("questions")
}

model QuestionAttempt {
  id            String   @id @default(cuid())
  studentId     String
  student       Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  questionId    String
  question      Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  isCorrect     Boolean
  selectedAnswer Json
  attemptedAt   DateTime @default(now())

  @@unique([studentId, questionId])
  @@index([studentId])
  @@map("question_attempts")
}
```

- [ ] **Step 3: Add the back-relation on Student**

In `model Student`, in the relations block (after `battleResults   BattleResult[]`), add:
```prisma
  questionAttempts QuestionAttempt[]
```

- [ ] **Step 4: Create the migration**

Run (in `backend/`):
```bash
npm run db:migrate -- --name add_question_bank
```
Expected: a new migration under `backend/prisma/migrations/`, Prisma client regenerated, no errors. (Requires a running PostgreSQL per `DATABASE_URL`.)

- [ ] **Step 5: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations
git commit -m "feat: add Question and QuestionAttempt models"
```

---

## Task 2: Syllabus config + types

**Files:**
- Create: `backend/src/curriculum/types.ts`
- Create: `backend/src/curriculum/class11.ts`
- Test: `backend/src/curriculum/class11.test.ts`

- [ ] **Step 1: Write the failing test**

Create `backend/src/curriculum/class11.test.ts`:
```typescript
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
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test -- class11`
Expected: FAIL (cannot find module `./class11`).

- [ ] **Step 3: Create the types**

Create `backend/src/curriculum/types.ts`:
```typescript
export interface ChapterDef {
  id: string;
  name: string;
  topics: string[];
}

export interface SubjectDef {
  id: string;
  name: string;
  chapters: ChapterDef[];
}

export interface ClassDef {
  classLevel: number;
  subjects: SubjectDef[];
}
```

- [ ] **Step 4: Create the syllabus config**

Create `backend/src/curriculum/class11.ts`. Include all four subjects with their full chapter lists. Provide `topics` for the starter chapters (those without topics are skipped by the generator until topics are added — see Task 6). Use this exact shape (chapter lists shown; fill `topics: []` for chapters not yet seeded):
```typescript
import { ClassDef } from './types';

export const CLASS_11: ClassDef = {
  classLevel: 11,
  subjects: [
    {
      id: 'physics',
      name: 'Physics',
      chapters: [
        { id: 'units-and-measurements', name: 'Units and Measurements', topics: ['SI units', 'Dimensional analysis', 'Significant figures', 'Errors in measurement'] },
        { id: 'motion-in-a-straight-line', name: 'Motion in a Straight Line', topics: ['Displacement and velocity', 'Acceleration', 'Equations of motion', 'Relative velocity'] },
        { id: 'motion-in-a-plane', name: 'Motion in a Plane', topics: [] },
        { id: 'laws-of-motion', name: 'Laws of Motion', topics: [] },
        { id: 'work-energy-and-power', name: 'Work, Energy and Power', topics: [] },
        { id: 'rotational-motion', name: 'System of Particles and Rotational Motion', topics: [] },
        { id: 'gravitation', name: 'Gravitation', topics: [] },
        { id: 'mechanical-properties-of-solids', name: 'Mechanical Properties of Solids', topics: [] },
        { id: 'mechanical-properties-of-fluids', name: 'Mechanical Properties of Fluids', topics: [] },
        { id: 'thermal-properties-of-matter', name: 'Thermal Properties of Matter', topics: [] },
        { id: 'thermodynamics-phy', name: 'Thermodynamics', topics: [] },
        { id: 'kinetic-theory', name: 'Kinetic Theory', topics: [] },
        { id: 'oscillations', name: 'Oscillations', topics: [] },
        { id: 'waves', name: 'Waves', topics: [] },
      ],
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      chapters: [
        { id: 'basic-concepts-of-chemistry', name: 'Some Basic Concepts of Chemistry', topics: ['Mole concept', 'Stoichiometry', 'Empirical and molecular formula', 'Concentration terms'] },
        { id: 'structure-of-atom', name: 'Structure of Atom', topics: ['Bohr model', 'Quantum numbers', 'Electronic configuration', 'Dual nature of matter'] },
        { id: 'classification-and-periodicity', name: 'Classification of Elements and Periodicity in Properties', topics: [] },
        { id: 'chemical-bonding', name: 'Chemical Bonding and Molecular Structure', topics: [] },
        { id: 'thermodynamics-chem', name: 'Thermodynamics', topics: [] },
        { id: 'equilibrium', name: 'Equilibrium', topics: [] },
        { id: 'redox-reactions', name: 'Redox Reactions', topics: [] },
        { id: 'organic-basic-principles', name: 'Organic Chemistry: Some Basic Principles and Techniques', topics: [] },
        { id: 'hydrocarbons', name: 'Hydrocarbons', topics: [] },
      ],
    },
    {
      id: 'mathematics',
      name: 'Mathematics',
      chapters: [
        { id: 'sets', name: 'Sets', topics: ['Types of sets', 'Venn diagrams', 'Operations on sets', 'De Morgan laws'] },
        { id: 'relations-and-functions', name: 'Relations and Functions', topics: ['Cartesian product', 'Domain and range', 'Types of functions'] },
        { id: 'trigonometric-functions', name: 'Trigonometric Functions', topics: [] },
        { id: 'complex-numbers', name: 'Complex Numbers and Quadratic Equations', topics: [] },
        { id: 'linear-inequalities', name: 'Linear Inequalities', topics: [] },
        { id: 'permutations-and-combinations', name: 'Permutations and Combinations', topics: [] },
        { id: 'binomial-theorem', name: 'Binomial Theorem', topics: [] },
        { id: 'sequences-and-series', name: 'Sequences and Series', topics: [] },
        { id: 'straight-lines', name: 'Straight Lines', topics: [] },
        { id: 'conic-sections', name: 'Conic Sections', topics: [] },
        { id: 'three-dimensional-geometry', name: 'Introduction to Three-Dimensional Geometry', topics: [] },
        { id: 'limits-and-derivatives', name: 'Limits and Derivatives', topics: [] },
        { id: 'statistics', name: 'Statistics', topics: [] },
        { id: 'probability', name: 'Probability', topics: [] },
      ],
    },
    {
      id: 'biology',
      name: 'Biology',
      chapters: [
        { id: 'the-living-world', name: 'The Living World', topics: ['Taxonomic categories', 'Nomenclature', 'Diversity of living organisms'] },
        { id: 'biological-classification', name: 'Biological Classification', topics: ['Five kingdom classification', 'Monera', 'Protista', 'Fungi'] },
        { id: 'plant-kingdom', name: 'Plant Kingdom', topics: [] },
        { id: 'animal-kingdom', name: 'Animal Kingdom', topics: [] },
        { id: 'cell-unit-of-life', name: 'Cell: The Unit of Life', topics: [] },
        { id: 'biomolecules', name: 'Biomolecules', topics: [] },
        { id: 'cell-cycle-and-division', name: 'Cell Cycle and Cell Division', topics: [] },
        { id: 'breathing-and-exchange-of-gases', name: 'Breathing and Exchange of Gases', topics: [] },
        { id: 'body-fluids-and-circulation', name: 'Body Fluids and Circulation', topics: [] },
        { id: 'neural-control-and-coordination', name: 'Neural Control and Coordination', topics: [] },
      ],
    },
  ],
};

export interface ChapterLookup {
  subjectId: string;
  subjectName: string;
  chapter: { id: string; name: string; topics: string[] };
}

export function getChapter(chapterId: string): ChapterLookup | null {
  for (const s of CLASS_11.subjects) {
    const chapter = s.chapters.find(c => c.id === chapterId);
    if (chapter) return { subjectId: s.id, subjectName: s.name, chapter };
  }
  return null;
}
```

- [ ] **Step 5: Run test, verify pass**

Run: `npm test -- class11`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add backend/src/curriculum
git commit -m "feat: add Class 11 CBSE syllabus config"
```

---

## Task 3: Curriculum endpoint

**Files:**
- Create: `backend/src/controllers/curriculum.controller.ts`
- Create: `backend/src/routes/curriculum.routes.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Create the controller**

Create `backend/src/controllers/curriculum.controller.ts`:
```typescript
import { Request, Response } from 'express';
import { CLASS_11 } from '../curriculum/class11';

export function getClass11Curriculum(_req: Request, res: Response): void {
  res.json(CLASS_11);
}
```

- [ ] **Step 2: Create the route**

Create `backend/src/routes/curriculum.routes.ts`:
```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getClass11Curriculum } from '../controllers/curriculum.controller';

const router = Router();
router.use(authenticate);

router.get('/class/11', getClass11Curriculum);

export default router;
```

- [ ] **Step 3: Mount the route**

In `backend/src/index.ts`, add the import after the other route imports:
```typescript
import curriculumRoutes from './routes/curriculum.routes';
```
And mount it after `app.use('/api/ai', aiRoutes);`:
```typescript
app.use('/api/curriculum', curriculumRoutes);
```

- [ ] **Step 4: Manual verification**

Run `npm run dev`, then with a valid student token:
```bash
curl -s http://localhost:4000/api/curriculum/class/11 -H "Authorization: Bearer <TOKEN>" | head -c 200
```
Expected: JSON starting with `{"classLevel":11,"subjects":[...`.

- [ ] **Step 5: Commit**

```bash
git add backend/src/controllers/curriculum.controller.ts backend/src/routes/curriculum.routes.ts backend/src/index.ts
git commit -m "feat: add GET /api/curriculum/class/11 endpoint"
```

---

## Task 4: Question validation + dedupe (pure functions, TDD)

**Files:**
- Create: `backend/src/questions/schema.ts`
- Create: `backend/src/questions/validate.ts`
- Test: `backend/src/questions/validate.test.ts`

- [ ] **Step 1: Write the failing test**

Create `backend/src/questions/validate.test.ts`:
```typescript
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
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test -- validate`
Expected: FAIL (cannot find module `./validate`).

- [ ] **Step 3: Create the zod schema**

Create `backend/src/questions/schema.ts`:
```typescript
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
```

- [ ] **Step 4: Create the validator**

Create `backend/src/questions/validate.ts`:
```typescript
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
```

- [ ] **Step 5: Run test, verify pass**

Run: `npm test -- validate`
Expected: PASS (8 tests).

- [ ] **Step 6: Commit**

```bash
git add backend/src/questions/schema.ts backend/src/questions/validate.ts backend/src/questions/validate.test.ts
git commit -m "feat: add AI question validation and dedupe hashing"
```

---

## Task 5: ChapterProgress advancement rule (pure function, TDD)

**Files:**
- Create: `backend/src/questions/progress.ts`
- Test: `backend/src/questions/progress.test.ts`

- [ ] **Step 1: Write the failing test**

Create `backend/src/questions/progress.test.ts`:
```typescript
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
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test -- progress`
Expected: FAIL (cannot find module `./progress`).

- [ ] **Step 3: Implement the rule**

Create `backend/src/questions/progress.ts`:
```typescript
export type ChapterStatus = 'NOT_STARTED' | 'LEARNING' | 'REVISING' | 'MASTERED';

export const PROGRESS_THRESHOLDS = {
  revisingAttempts: 10,
  masteryAttempts: 15,
  masteryAccuracy: 0.8,
};

const RANK: Record<ChapterStatus, number> = {
  NOT_STARTED: 0,
  LEARNING: 1,
  REVISING: 2,
  MASTERED: 3,
};

export function nextStatus(
  current: ChapterStatus,
  stats: { attempted: number; correct: number }
): ChapterStatus {
  const { attempted, correct } = stats;
  const accuracy = attempted > 0 ? correct / attempted : 0;

  let computed: ChapterStatus = 'NOT_STARTED';
  if (attempted >= 1) computed = 'LEARNING';
  if (attempted >= PROGRESS_THRESHOLDS.revisingAttempts) computed = 'REVISING';
  if (attempted >= PROGRESS_THRESHOLDS.masteryAttempts && accuracy >= PROGRESS_THRESHOLDS.masteryAccuracy) {
    computed = 'MASTERED';
  }

  // Never regress.
  return RANK[computed] >= RANK[current] ? computed : current;
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `npm test -- progress`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add backend/src/questions/progress.ts backend/src/questions/progress.test.ts
git commit -m "feat: add chapter progress advancement rule"
```

---

## Task 6: AI generation service (extend ai.service)

**Files:**
- Modify: `backend/src/services/ai.service.ts`

- [ ] **Step 1: Add generation + self-verify functions**

In `backend/src/services/ai.service.ts`, add at the end of the file:
```typescript
// ─── CLASS 11 BANK GENERATION ──────────────────────────────────────────────────
export interface BankQuestionRaw {
  type: 'MCQ' | 'NUMERICAL' | 'ASSERTION_REASON';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  question: string;
  options?: string[];
  correctAnswer: number;
  explanation: string;
}

function extractJson(raw: string): any {
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function generateClass11Questions(params: {
  subjectName: string;
  chapterName: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  count: number;
}): Promise<BankQuestionRaw[]> {
  if (!gemini) throw new Error('GEMINI_API_KEY is required to generate questions');

  const { subjectName, chapterName, topic, difficulty, count } = params;
  const prompt = `You are a CBSE Class 11 ${subjectName} exam question setter.
Generate ${count} ${difficulty} difficulty questions on:
Chapter: ${chapterName}
Topic: ${topic}

Return raw JSON only (no markdown). Shape:
{
  "questions": [
    {
      "type": "MCQ" | "NUMERICAL" | "ASSERTION_REASON",
      "difficulty": "${difficulty}",
      "question": "question text (use plain text; LaTeX allowed inside $...$)",
      "options": ["A", "B", "C", "D"],   // omit for NUMERICAL
      "correctAnswer": 0,                  // option index for MCQ/ASSERTION_REASON; numeric value for NUMERICAL
      "explanation": "step-by-step worked solution"
    }
  ]
}
For ASSERTION_REASON, format question as "Assertion (A): ...\\nReason (R): ..." with the four standard options.`;

  const parsed = extractJson(await geminiCall(prompt));
  return parsed.questions as BankQuestionRaw[];
}

// Re-solves a question; returns the answer the model arrives at independently.
export async function verifyAnswer(q: BankQuestionRaw): Promise<number> {
  if (!gemini) throw new Error('GEMINI_API_KEY is required to verify questions');

  const optionsBlock = q.options
    ? `Options:\n${q.options.map((o, i) => `${i}. ${o}`).join('\n')}\nReturn the index of the correct option.`
    : 'Return the correct numeric value.';

  const prompt = `Solve this CBSE Class 11 question. ${optionsBlock}
Question: ${q.question}

Return raw JSON only: { "answer": <number> }`;

  const parsed = extractJson(await geminiCall(prompt));
  return Number(parsed.answer);
}
```

- [ ] **Step 2: Type-check**

Run (in `backend/`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add backend/src/services/ai.service.ts
git commit -m "feat: add Class 11 question generation + self-verify to ai.service"
```

---

## Task 7: Generation CLI script

**Files:**
- Create: `backend/scripts/generate-questions.ts`
- Modify: `backend/package.json`

- [ ] **Step 1: Write the script**

Create `backend/scripts/generate-questions.ts`:
```typescript
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { CLASS_11 } from '../src/curriculum/class11';
import { generateClass11Questions, verifyAnswer } from '../src/services/ai.service';
import { validateGenerated, stemHash } from '../src/questions/validate';

const prisma = new PrismaClient();

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const;
const PER_DIFFICULTY = Number(process.env.GEN_PER_DIFFICULTY || 5);

async function run() {
  for (const subject of CLASS_11.subjects) {
    for (const chapter of subject.chapters) {
      if (chapter.topics.length === 0) {
        console.log(`SKIP ${chapter.id} (no topics defined yet)`);
        continue;
      }

      const existing = await prisma.question.count({ where: { chapterId: chapter.id } });
      const target = chapter.topics.length * DIFFICULTIES.length * PER_DIFFICULTY;
      if (existing >= target) {
        console.log(`SKIP ${chapter.id} (${existing}/${target} already generated)`);
        continue;
      }

      for (const topic of chapter.topics) {
        for (const difficulty of DIFFICULTIES) {
          await generateForTopic(subject.id, chapter.id, subject.name, chapter.name, topic, difficulty);
        }
      }
    }
  }
  console.log('Done.');
  await prisma.$disconnect();
}

async function generateForTopic(
  subjectId: string, chapterId: string, subjectName: string, chapterName: string,
  topic: string, difficulty: 'EASY' | 'MEDIUM' | 'HARD'
) {
  let raws;
  try {
    raws = await generateClass11Questions({ subjectName, chapterName, topic, difficulty, count: PER_DIFFICULTY });
  } catch (err) {
    console.error(`GEN FAIL ${chapterId}/${topic}/${difficulty}:`, (err as Error).message);
    return;
  }

  for (const raw of raws) {
    const validation = validateGenerated(raw);
    if (!validation.ok) {
      console.warn(`REJECT (invalid) ${chapterId}/${topic}: ${validation.error}`);
      continue;
    }
    const q = validation.value;
    const hash = stemHash(q.question);

    const dup = await prisma.question.findUnique({
      where: { chapterId_stemHash: { chapterId, stemHash: hash } },
    });
    if (dup) { console.log(`DUP ${chapterId}/${topic}`); continue; }

    // Self-verification pass.
    let status: 'PUBLISHED' | 'DRAFT' = 'PUBLISHED';
    try {
      const verified = await verifyAnswer(raw);
      if (verified !== q.correctAnswer) status = 'DRAFT';
    } catch {
      status = 'DRAFT';
    }

    await prisma.question.create({
      data: {
        classLevel: 11,
        subject: subjectId,
        chapterId,
        topic,
        type: q.type,
        difficulty: q.difficulty,
        question: q.question,
        options: 'options' in q ? q.options : undefined,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        stemHash: hash,
        status,
        modelMeta: { model: 'gemini-1.5-flash', generatedAt: new Date().toISOString(), selfCheck: status },
      },
    });
    console.log(`SAVE ${chapterId}/${topic}/${difficulty} [${status}]`);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Add the npm script**

In `backend/package.json` `"scripts"`, add:
```json
"generate:questions": "ts-node scripts/generate-questions.ts"
```

- [ ] **Step 3: Verify it runs (requires GEMINI_API_KEY + DB)**

Run (in `backend/`): `npm run generate:questions`
Expected: log lines like `SAVE units-and-measurements/SI units/EASY [PUBLISHED]`, `SKIP` for chapters without topics. Re-running prints `SKIP (already generated)` for filled chapters (idempotent).

- [ ] **Step 4: Commit**

```bash
git add backend/scripts/generate-questions.ts backend/package.json
git commit -m "feat: add idempotent question generation CLI"
```

---

## Task 8: Practice endpoints

**Files:**
- Create: `backend/src/controllers/practice.controller.ts`
- Create: `backend/src/routes/practice.routes.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Create the controller**

Create `backend/src/controllers/practice.controller.ts`:
```typescript
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { nextStatus, ChapterStatus } from '../questions/progress';

const prisma = new PrismaClient();

// GET /api/practice/chapter/:chapterId/questions?difficulty=EASY&limit=20
export async function getChapterQuestions(req: AuthRequest, res: Response): Promise<void> {
  const { chapterId } = req.params;
  const difficulty = req.query.difficulty as string | undefined;
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  const where: any = { chapterId, status: 'PUBLISHED' };
  if (difficulty) where.difficulty = difficulty;

  const questions = await prisma.question.findMany({
    where,
    take: limit,
    select: {
      id: true, type: true, difficulty: true, question: true,
      options: true, topic: true,
    },
  });
  res.json(questions);
}

// POST /api/practice/attempt  { questionId, selectedAnswer }
export async function submitAttempt(req: AuthRequest, res: Response): Promise<void> {
  const { questionId, selectedAnswer } = req.body;

  const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
  if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) { res.status(404).json({ error: 'Question not found' }); return; }

  const isCorrect = JSON.stringify(question.correctAnswer) === JSON.stringify(selectedAnswer);

  await prisma.questionAttempt.upsert({
    where: { studentId_questionId: { studentId: student.id, questionId } },
    update: { isCorrect, selectedAnswer },
    create: { studentId: student.id, questionId, isCorrect, selectedAnswer },
  });

  // Recompute chapter progress from attempt stats.
  const attempts = await prisma.questionAttempt.findMany({
    where: { studentId: student.id, question: { chapterId: question.chapterId } },
    select: { isCorrect: true },
  });
  const stats = { attempted: attempts.length, correct: attempts.filter(a => a.isCorrect).length };

  const existing = await prisma.chapterProgress.findUnique({
    where: { studentId_chapterId: { studentId: student.id, chapterId: question.chapterId } },
  });
  const current = (existing?.status as ChapterStatus) || 'NOT_STARTED';
  const status = nextStatus(current, stats);

  await prisma.chapterProgress.upsert({
    where: { studentId_chapterId: { studentId: student.id, chapterId: question.chapterId } },
    update: { status },
    create: { studentId: student.id, chapterId: question.chapterId, subject: question.subject, status },
  });

  res.json({
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    chapterStatus: status,
  });
}
```

- [ ] **Step 2: Create the route**

Create `backend/src/routes/practice.routes.ts`:
```typescript
import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { getChapterQuestions, submitAttempt } from '../controllers/practice.controller';

const router = Router();
router.use(authenticate, requireRole('STUDENT'));

router.get('/chapter/:chapterId/questions', getChapterQuestions);
router.post('/attempt', submitAttempt);

export default router;
```

- [ ] **Step 3: Mount the route**

In `backend/src/index.ts`, add the import:
```typescript
import practiceRoutes from './routes/practice.routes';
```
And mount after the curriculum route:
```typescript
app.use('/api/practice', practiceRoutes);
```

- [ ] **Step 4: Type-check + manual verification**

Run `npx tsc --noEmit` (expect no errors). Then with `npm run dev` and a seeded bank:
```bash
curl -s "http://localhost:4000/api/practice/chapter/units-and-measurements/questions?limit=2" -H "Authorization: Bearer <STUDENT_TOKEN>" | head -c 200
```
Expected: a JSON array of questions without `correctAnswer`/`explanation` fields.

- [ ] **Step 5: Commit**

```bash
git add backend/src/controllers/practice.controller.ts backend/src/routes/practice.routes.ts backend/src/index.ts
git commit -m "feat: add practice endpoints (chapter questions + attempt)"
```

---

## Task 9: Test-generation endpoint

**Files:**
- Modify: `backend/src/controllers/test.controller.ts`
- Modify: `backend/src/routes/test.routes.ts`

- [ ] **Step 1: Add generateTest controller**

In `backend/src/controllers/test.controller.ts`, first add the syllabus import at the top (the file already imports `AuthRequest` and constructs `prisma`):
```typescript
import { getChapter } from '../curriculum/class11';
```
Then add the controller:
```typescript
// POST /api/tests/generate  { chapterId, count?, timeLimit? }
export async function generateTest(req: AuthRequest, res: Response): Promise<void> {
  const { chapterId, count = 10, timeLimit = 600 } = req.body;

  const lookup = getChapter(chapterId);
  if (!lookup) { res.status(404).json({ error: 'Unknown chapter' }); return; }

  const all = await prisma.question.findMany({
    where: { chapterId, status: 'PUBLISHED' },
    select: { id: true, type: true, question: true, options: true, correctAnswer: true, explanation: true },
  });

  if (all.length === 0) { res.status(404).json({ error: 'No questions for this chapter yet' }); return; }

  // Shuffle and take `count`.
  const picked = [...all].sort(() => Math.random() - 0.5).slice(0, count);

  const questions = picked.map(q => ({
    id: q.id,
    type: q.type === 'NUMERICAL' ? 'numerical' : q.type === 'ASSERTION_REASON' ? 'assertion-reason' : 'mcq',
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
  }));

  res.json({
    key: chapterId,
    title: `${lookup.chapter.name} Test`,
    subject: lookup.subjectId,
    timeLimit,
    questions,
  });
}
```

- [ ] **Step 2: Wire the route**

In `backend/src/routes/test.routes.ts`, update the import to add `generateTest`:
```typescript
import { submitTestResult, getTestHistory, saveBattleResult, saveFlashcardProgress, generateTest } from '../controllers/test.controller';
```
And add the route:
```typescript
router.post('/generate', generateTest);
```

- [ ] **Step 3: Type-check + manual verification**

Run `npx tsc --noEmit` (no errors). With a seeded bank:
```bash
curl -s -X POST http://localhost:4000/api/tests/generate -H "Authorization: Bearer <STUDENT_TOKEN>" -H "Content-Type: application/json" -d '{"chapterId":"units-and-measurements","count":3}' | head -c 200
```
Expected: `{"key":"units-and-measurements","title":...,"questions":[...]}` with 3 questions.

- [ ] **Step 4: Commit**

```bash
git add backend/src/controllers/test.controller.ts backend/src/routes/test.routes.ts
git commit -m "feat: add POST /api/tests/generate from question bank"
```

---

## Task 10: Frontend API module + types

**Files:**
- Create: `frontend/src/api/practice.ts`

- [ ] **Step 1: Create the API module**

Create `frontend/src/api/practice.ts`:
```typescript
import api from './client';

export interface ChapterDef { id: string; name: string; topics: string[]; }
export interface SubjectDef { id: string; name: string; chapters: ChapterDef[]; }
export interface ClassDef { classLevel: number; subjects: SubjectDef[]; }

export interface PracticeQuestion {
  id: string;
  type: 'MCQ' | 'NUMERICAL' | 'ASSERTION_REASON';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  question: string;
  options: string[] | null;
  topic: string;
}

export interface AttemptResult {
  isCorrect: boolean;
  correctAnswer: number;
  explanation: string;
  chapterStatus: string;
}

export async function fetchCurriculum(): Promise<ClassDef> {
  const { data } = await api.get('/curriculum/class/11');
  return data;
}

export async function fetchChapterQuestions(chapterId: string, difficulty?: string): Promise<PracticeQuestion[]> {
  const { data } = await api.get(`/practice/chapter/${chapterId}/questions`, { params: { difficulty } });
  return data;
}

export async function submitAttempt(questionId: string, selectedAnswer: number): Promise<AttemptResult> {
  const { data } = await api.post('/practice/attempt', { questionId, selectedAnswer });
  return data;
}

export interface GeneratedTest {
  key: string;
  title: string;
  subject: string;
  timeLimit: number;
  questions: Array<{ id: string; type: string; question: string; options: string[] | null; correctAnswer: number; explanation: string }>;
}

export async function generateTest(chapterId: string, count = 10, timeLimit = 600): Promise<GeneratedTest> {
  const { data } = await api.post('/tests/generate', { chapterId, count, timeLimit });
  return data;
}
```

- [ ] **Step 2: Type-check**

Run (in `frontend/`): `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/api/practice.ts
git commit -m "feat: add frontend practice/curriculum API module"
```

---

## Task 11: Practice page + navigation

**Files:**
- Create: `frontend/src/pages/student/Practice.tsx`
- Modify: `frontend/src/pages/student/StudentLayout.tsx`

- [ ] **Step 1: Create the Practice page**

Create `frontend/src/pages/student/Practice.tsx`:
```tsx
import { useState, useEffect } from 'react';
import { fetchCurriculum, fetchChapterQuestions, submitAttempt, type SubjectDef, type PracticeQuestion, type AttemptResult } from '../../api/practice';

type View = 'subjects' | 'chapters' | 'practice';

export default function Practice() {
  const [view, setView] = useState<View>('subjects');
  const [subjects, setSubjects] = useState<SubjectDef[]>([]);
  const [activeSubject, setActiveSubject] = useState<SubjectDef | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);

  useEffect(() => { fetchCurriculum().then(c => setSubjects(c.subjects)).catch(() => {}); }, []);

  async function openChapter(chapterId: string) {
    const qs = await fetchChapterQuestions(chapterId);
    setQuestions(qs); setIdx(0); setSelected(null); setResult(null); setView('practice');
  }

  async function answer(optIdx: number) {
    if (result) return;
    setSelected(optIdx);
    const r = await submitAttempt(questions[idx].id, optIdx);
    setResult(r);
  }

  function nextQ() {
    setSelected(null); setResult(null);
    setIdx(i => Math.min(i + 1, questions.length - 1));
  }

  const q = questions[idx];

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>📚 Practice</h2>

      {view === 'subjects' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {subjects.map(s => (
            <div key={s.id} className="glass-panel" style={{ padding: 20, cursor: 'pointer' }}
                 onClick={() => { setActiveSubject(s); setView('chapters'); }}>
              <h3 style={{ fontWeight: 700 }}>{s.name}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.chapters.length} chapters</p>
            </div>
          ))}
        </div>
      )}

      {view === 'chapters' && activeSubject && (
        <div>
          <button className="sec-btn" onClick={() => setView('subjects')} style={{ marginBottom: 16 }}>← Subjects</button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {activeSubject.chapters.map(c => (
              <button key={c.id} className="glass-panel" style={{ padding: 16, textAlign: 'left', cursor: 'pointer' }}
                      onClick={() => openChapter(c.id)}>
                <strong>{c.name}</strong>
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'practice' && q && (
        <div>
          <button className="sec-btn" onClick={() => setView('chapters')} style={{ marginBottom: 16 }}>← Chapters</button>
          <div className="glass-panel" style={{ padding: 24 }}>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>Question {idx + 1} of {questions.length} · {q.difficulty}</p>
            <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.6, marginBottom: 20, whiteSpace: 'pre-line' }}>{q.question}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(q.options || []).map((opt, i) => {
                const isPicked = selected === i;
                const isAnswer = result && i === result.correctAnswer;
                const border = isAnswer ? 'var(--accent-green)' : isPicked ? 'var(--accent-indigo)' : 'var(--glass-border)';
                return (
                  <div key={i} onClick={() => answer(i)} style={{ display: 'flex', gap: 14, padding: '12px 16px', borderRadius: 10, border: `1px solid ${border}`, cursor: result ? 'default' : 'pointer' }}>
                    <span style={{ fontWeight: 700 }}>{['A','B','C','D','E','F'][i]}</span>
                    <span style={{ fontSize: 14 }}>{opt}</span>
                  </div>
                );
              })}
            </div>
            {result && (
              <div className="glass-panel" style={{ marginTop: 16, padding: 16 }}>
                <p style={{ fontWeight: 700, color: result.isCorrect ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  {result.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, whiteSpace: 'pre-line' }}>{result.explanation}</p>
                <button className="primary-btn" onClick={nextQ} style={{ marginTop: 12 }} disabled={idx >= questions.length - 1}>Next ▶</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add nav entry + route**

In `frontend/src/pages/student/StudentLayout.tsx`:

Add the import after the other page imports:
```tsx
import Practice from './Practice';
```
Add to the `NAV` array after the `doubt` entry:
```tsx
  { to: 'practice', icon: '📚', label: 'Practice' },
```
Add the route inside `<Routes>` (before the wildcard `*` route):
```tsx
            <Route path="practice" element={<Practice />} />
```

- [ ] **Step 3: Type-check + run**

Run (in `frontend/`): `npx tsc -b --noEmit` (no errors). Then `npm run dev`, log in as a student, click **Practice** → a subject → a chapter, answer a question, confirm the explanation + correctness appear.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/student/Practice.tsx frontend/src/pages/student/StudentLayout.tsx
git commit -m "feat: add student Practice page and nav"
```

---

## Task 12: Wire MockTests to generated tests, retire mockTests.ts

**Files:**
- Modify: `frontend/src/pages/student/MockTests.tsx`
- Delete: `frontend/src/data/mockTests.ts`

- [ ] **Step 1: Replace the data source + select screen**

In `frontend/src/pages/student/MockTests.tsx`:

Replace the import line
```tsx
import { MOCK_TESTS_DATA } from '../../data/mockTests';
```
with
```tsx
import { fetchCurriculum, generateTest, type SubjectDef } from '../../api/practice';
```

After the existing `useState`/`useRef` hooks (near the top of the component), add chapter-catalog state and loader:
```tsx
  const [subjects, setSubjects] = useState<SubjectDef[]>([]);
  useEffect(() => { fetchCurriculum().then(c => setSubjects(c.subjects)).catch(() => {}); }, []);
```

Replace the `startTest` function with one that fetches a generated test:
```tsx
  async function startTest(chapterId: string) {
    let test;
    try {
      test = await generateTest(chapterId, 10, 600);
    } catch {
      alert('No questions available for this chapter yet.');
      return;
    }
    setActiveTest(test);
    setAnswers({});
    setCurrentIdx(0);
    setTimeLeft(test.timeLimit);
    setScreen('session');

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); submitTest(test, {}); return 0; }
        return t - 1;
      });
    }, 1000);
  }
```

- [ ] **Step 2: Replace the select-screen render**

Replace the `{screen === 'select' && ( ... )}` block with a chapter-driven catalog:
```tsx
      {screen === 'select' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {subjects.map(s => (
            <div key={s.id}>
              <h3 style={{ fontWeight: 700, marginBottom: 10 }}>{s.name}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                {s.chapters.map(c => (
                  <div key={c.id} className="glass-panel" style={{ padding: 16 }}>
                    <h4 style={{ fontWeight: 700, marginBottom: 8 }}>{c.name}</h4>
                    <button className="primary-btn" onClick={() => startTest(c.id)} style={{ width: '100%' }}>Launch Exam</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
```

- [ ] **Step 3: Confirm session/report still work**

The session and report screens already read from `activeTest.questions` / `report`, and the generated test object provides `questions` with `{ id, type, question, options, correctAnswer, explanation }` — compatible. No change needed there. (`msq` branches stay dormant since the bank emits `mcq`/`numerical`/`assertion-reason`.)

- [ ] **Step 4: Delete the hardcoded data file**

```bash
git rm frontend/src/data/mockTests.ts
```

- [ ] **Step 5: Type-check + run**

Run (in `frontend/`): `npx tsc -b --noEmit` (no errors). Then `npm run dev`, log in as a student, open **Mock Exams**, pick a chapter, Launch Exam, answer, submit, confirm the report renders with explanations.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/student/MockTests.tsx frontend/src/data/mockTests.ts
git commit -m "feat: source mock tests from generated question bank; retire mockTests.ts"
```

---

## Final verification

- [ ] Run backend tests: `cd backend && npm test` → all pass.
- [ ] Backend type-check: `cd backend && npx tsc --noEmit` → no errors.
- [ ] Frontend type-check: `cd frontend && npx tsc -b --noEmit` → no errors.
- [ ] End-to-end: generate a small bank (`npm run generate:questions` with a couple seeded chapters), then as a student: Practice flow advances `ChapterProgress`, and Mock Exams generates a chapter test that scores into `TestResult`.
