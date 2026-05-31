import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  const student = await prisma.student.findUnique({
    where: { userId: req.user!.id },
    include: {
      chapterProgress: true,
      testResults: { orderBy: { completedAt: 'desc' }, take: 10 },
      dailyTasks: {
        where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      },
      weakTopics: true,
    },
  });
  if (!student) { res.status(404).json({ error: 'Student not found' }); return; }
  res.json(student);
}

export async function updateXP(req: AuthRequest, res: Response): Promise<void> {
  const { xpDelta } = req.body as { xpDelta: number };
  const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
  if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

  let newXp = student.xp + xpDelta;
  let newLevel = student.level;
  let newNextLevelXp = student.nextLevelXp;

  while (newXp >= newNextLevelXp) {
    newXp -= newNextLevelXp;
    newLevel += 1;
    newNextLevelXp = Math.floor(newNextLevelXp * 1.2);
  }

  const updated = await prisma.student.update({
    where: { id: student.id },
    data: { xp: newXp, level: newLevel, nextLevelXp: newNextLevelXp },
  });
  res.json({ xp: updated.xp, level: updated.level, nextLevelXp: updated.nextLevelXp, leveledUp: newLevel > student.level });
}

export async function updateChapterProgress(req: AuthRequest, res: Response): Promise<void> {
  const { chapterId, subject, status } = req.body as { chapterId: string; subject: string; status: string };
  const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
  if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

  const progress = await prisma.chapterProgress.upsert({
    where: { studentId_chapterId: { studentId: student.id, chapterId } },
    update: { status: status as any },
    create: { studentId: student.id, chapterId, subject, status: status as any },
  });
  res.json(progress);
}

export async function getDailyTasks(req: AuthRequest, res: Response): Promise<void> {
  const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
  if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tasks = await prisma.dailyTask.findMany({
    where: { studentId: student.id, date: { gte: today } },
    orderBy: { date: 'asc' },
  });
  res.json(tasks);
}

export async function completeTask(req: AuthRequest, res: Response): Promise<void> {
  const { taskId } = req.params;
  const { completed } = req.body as { completed: boolean };
  const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
  if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

  const task = await prisma.dailyTask.findFirst({ where: { id: taskId, studentId: student.id } });
  if (!task) { res.status(404).json({ error: 'Task not found' }); return; }

  const updated = await prisma.dailyTask.update({ where: { id: taskId }, data: { completed } });

  // Award or deduct XP for task completion
  const xpDelta = completed ? 50 : -50;
  const s = await prisma.student.update({ where: { id: student.id }, data: { xp: { increment: xpDelta } } });
  res.json({ task: updated, xp: s.xp });
}

export async function getAnnouncements(req: AuthRequest, res: Response): Promise<void> {
  const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
  if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

  const announcements = await prisma.studentAnnouncement.findMany({
    where: { studentId: student.id },
    include: { announcement: { include: { teacher: { select: { name: true, subject: true } } } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  res.json(announcements);
}

export async function updateStreak(req: AuthRequest, res: Response): Promise<void> {
  const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
  if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

  const now = new Date();
  const lastStudy = student.lastStudyDate;
  let newStreak = student.streak;

  if (lastStudy) {
    const dayDiff = Math.floor((now.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
    if (dayDiff === 1) newStreak += 1;       // consecutive day
    else if (dayDiff > 1) newStreak = 1;     // streak broken
    // dayDiff === 0 means same day, no change
  } else {
    newStreak = 1;
  }

  const updated = await prisma.student.update({
    where: { id: student.id },
    data: { streak: newStreak, lastStudyDate: now },
  });
  res.json({ streak: updated.streak });
}

export async function upsertWeakTopic(req: AuthRequest, res: Response): Promise<void> {
  const { topic, subject, clarity } = req.body as { topic: string; subject: string; clarity: number };
  const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
  if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

  const result = await prisma.weakTopic.upsert({
    where: { studentId_topic: { studentId: student.id, topic } },
    update: { clarity },
    create: { studentId: student.id, topic, subject, clarity },
  });
  res.json(result);
}
