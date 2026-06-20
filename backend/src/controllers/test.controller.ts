import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { getChapter } from '../curriculum/class11';

const prisma = new PrismaClient();

export async function submitTestResult(req: AuthRequest, res: Response): Promise<void> {
  const { testKey, testTitle, subject, score, totalMarks, accuracy, answers, xpAwarded } = req.body;

  const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
  if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

  const result = await prisma.testResult.create({
    data: {
      studentId: student.id,
      testKey,
      testTitle,
      subject,
      score,
      totalMarks,
      accuracy,
      answers,
      xpAwarded,
    },
  });

  // Add XP to student
  await prisma.student.update({
    where: { id: student.id },
    data: { xp: { increment: xpAwarded } },
  });

  res.status(201).json(result);
}

export async function getTestHistory(req: AuthRequest, res: Response): Promise<void> {
  const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
  if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

  const results = await prisma.testResult.findMany({
    where: { studentId: student.id },
    orderBy: { completedAt: 'desc' },
    take: 20,
  });
  res.json(results);
}

export async function saveBattleResult(req: AuthRequest, res: Response): Promise<void> {
  const { opponentName, won, xpAwarded } = req.body;
  const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
  if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

  const result = await prisma.battleResult.create({
    data: { studentId: student.id, opponentName, won, xpAwarded },
  });

  if (xpAwarded > 0) {
    await prisma.student.update({ where: { id: student.id }, data: { xp: { increment: xpAwarded } } });
  }

  res.status(201).json(result);
}

export async function saveFlashcardProgress(req: AuthRequest, res: Response): Promise<void> {
  const { deckId, cardIndex, mastered } = req.body;
  const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
  if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

  const progress = await prisma.flashcardProgress.upsert({
    where: { studentId_deckId_cardIndex: { studentId: student.id, deckId, cardIndex } },
    update: { mastered },
    create: { studentId: student.id, deckId, cardIndex, mastered },
  });
  res.json(progress);
}

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
