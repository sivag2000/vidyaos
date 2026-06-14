# Class 11 Question Bank + Practice Engine — Design Spec

**Date:** 2026-06-14
**Status:** Approved design (pre-implementation)
**Approach:** A — Syllabus-as-config + DB question bank

## Problem

VidyaOS has no real question bank. All test content is hardcoded in
`frontend/src/data/mockTests.ts` (2 tests, 3–4 questions each). "Chapters" are
string IDs in the seed, and the `ChapterProgress`, `TestResult`, and `WeakTopic`
models ride on hardcoded data. Without a structured, persistent question bank,
none of the downstream features (practice modes, analytics, weak-topic loop,
flashcards) can become real.

## Goal

Build a structured, AI-generated, cached question bank for **CBSE Class 11**
across **Physics, Chemistry, Mathematics, Biology** (PCM + PCB), plus a student
**chapter-practice** experience and a **simple timed-test** mode that reuse the
existing pages and models.

## Non-goals (MVP)

- No curriculum CRUD / admin CMS (syllabus is config, not DB-managed).
- No mistakes/bucket/topic-wise modes or full analytics yet (planned fast-follow).
- No mandatory human review of AI questions (self-verification gate instead).
- No content migration of the old Class 10 hardcoded tests (they are retired).

## Scope

- **Class:** 11
- **Subjects:** Physics, Chemistry, Mathematics, Biology
- **Content source:** AI pre-generated (Gemini) and cached in the DB.
- **Student experience:** chapter practice (instant solutions, advances
  `ChapterProgress`) + simple timed test (scores into `TestResult`).

## Data model (Prisma — new)

### `Question` (the bank)

| Field | Type | Purpose |
|---|---|---|
| `id` | String cuid | PK |
| `classLevel` | Int | `11` |
| `subject` | String | `physics` / `chemistry` / `mathematics` / `biology` |
| `chapterId` | String | canonical id from syllabus config (e.g. `units-and-measurements`) |
| `topic` | String | topic within the chapter |
| `type` | enum `QuestionType` | `MCQ` / `NUMERICAL` / `ASSERTION_REASON` |
| `difficulty` | enum `Difficulty` | `EASY` / `MEDIUM` / `HARD` |
| `question` | String | stem (markdown/LaTeX) |
| `options` | Json? | array of strings (MCQ/AR); null for numerical |
| `correctAnswer` | Json | index (MCQ/AR) or numeric value/range (numerical) |
| `explanation` | String | worked solution |
| `source` | String | default `ai-gemini` |
| `status` | enum `QuestionStatus` | `DRAFT` / `PUBLISHED` / `REJECTED` — students see only `PUBLISHED` |
| `modelMeta` | Json? | generation audit (model, prompt version, generatedAt, self-check result) |
| `createdAt` | DateTime | default now |

Indexes: `[classLevel, subject, chapterId]`, `[chapterId, difficulty]`.

Enums: `QuestionType { MCQ NUMERICAL ASSERTION_REASON }`,
`Difficulty { EASY MEDIUM HARD }`, `QuestionStatus { DRAFT PUBLISHED REJECTED }`.

### `QuestionAttempt`

`{ id, studentId, questionId, isCorrect, selectedAnswer (Json), attemptedAt }`,
unique on `[studentId, questionId]` (upsert on re-answer → dedupes). Substrate for
`ChapterProgress` advancement and future analytics.

### Reused unchanged

`ChapterProgress` (status), `TestResult` (test scores), `WeakTopic`.

## Syllabus as config

`backend/src/curriculum/class11.ts` is the single source of truth:

```
Class 11 → subjects [{ id, name, chapters: [{ id, name, topics: string[] }] }]
```

Defines the canonical `chapterId`s used by generation, navigation, and
`ChapterProgress`. Exposed to the frontend via `GET /api/curriculum/class/11`
(no duplication). Stable + version-controlled; no DB CRUD.

## AI generation + quality safeguards

CLI script `npm run generate:questions` (extends existing `ai.service`):

1. Walk syllabus → for each subject/chapter/topic, request N questions per
   difficulty from Gemini using a **strict JSON output contract**.
2. **Validate with zod** before saving: correct shape, valid option count,
   answer index in range.
3. **Sanity checks:** exactly one correct answer (MCQ/AR); numerical answer
   parseable; explanation non-empty; **duplicate-stem dedupe via hashing**.
4. **Self-verification pass:** a second Gemini call re-solves each question; any
   answer mismatch → saved as `DRAFT` (hidden) instead of `PUBLISHED`. Core trust
   gate for AI content.
5. **Idempotent + resumable:** skip topics already at target count; safe to re-run
   to fill gaps / add difficulties. Rate-limited / batched for API limits.
6. **Report-question** path flips status out of the pool (fast-follow).

## API endpoints (backend)

| Method | Path | Behaviour |
|---|---|---|
| GET | `/api/curriculum/class/11` | syllabus tree for navigation |
| GET | `/api/practice/chapter/:chapterId/questions` | paginated `PUBLISHED` questions, optional `?difficulty=` |
| POST | `/api/practice/attempt` | `{ questionId, selectedAnswer }` → correctness + explanation; upsert `QuestionAttempt`; advance `ChapterProgress` |
| POST | `/api/tests/generate` | `{ chapterId, count, timeLimit }` → assemble timed test from bank |
| POST | `/api/tests/submit` | *(exists)* writes `TestResult` — reused unchanged |

## Frontend

- **New "Practice" page** (added to `StudentLayout` nav): subject cards →
  chapter list (shows `ChapterProgress` status) → question view (answer →
  instant solution/explanation).
- **Existing `MockTests.tsx`:** keep the test-taking UI; swap data source from
  `mockTests.ts` to `POST /api/tests/generate`. Frontend question shape
  (`mcq` / `assertion-reason` / `numerical`) unchanged.

## ChapterProgress auto-advance rule

Driven by `QuestionAttempt` data (thresholds are tunable config constants):

- `NOT_STARTED → LEARNING` on first attempt in the chapter
- `→ REVISING` after ≥ N distinct questions attempted
- `→ MASTERED` at ≥ X% accuracy over ≥ M questions

Defaults to be set in implementation (proposed: N=10, M=15, X=80).

## Replacing `mockTests.ts`

`frontend/src/data/mockTests.ts` is removed once `/api/tests/generate` is live.
The two existing Class 10 tests are superseded by the Class 11 generated bank — no
content migration needed.

## Testing (TDD)

- **Validation layer (highest risk):** reject malformed Gemini output, enforce
  single-correct-answer, parse numerical answers, catch duplicates.
- **Generation script:** tested against a mocked Gemini response (no live API).
- **Endpoints:** practice-attempt correctness + `ChapterProgress` advancement;
  test generation returns correct count/shape.

## Build order (each step shippable)

1. Schema + migration (`Question`, `QuestionAttempt`)
2. Syllabus config + `GET /api/curriculum/class/11`
3. Generation script + validation (seed a few chapters)
4. Practice endpoints + Practice page
5. Wire `MockTests` to generate endpoint; retire `mockTests.ts`
