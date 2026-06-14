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
