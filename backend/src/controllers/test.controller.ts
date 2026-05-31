import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

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
