import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export async function getTeacherDashboard(req: AuthRequest, res: Response): Promise<void> {
  const teacher = await prisma.teacher.findUnique({
    where: { userId: req.user!.id },
    include: {
      homeworks: { orderBy: { createdAt: 'desc' }, take: 10 },
      students: {
        select: {
          id: true, name: true, classLevel: true, section: true, xp: true, level: true,
          testResults: { orderBy: { completedAt: 'desc' }, take: 3 },
          weakTopics: true,
        },
      },
    },
  });
  if (!teacher) { res.status(404).json({ error: 'Teacher not found' }); return; }
  res.json(teacher);
}

export async function createHomework(req: AuthRequest, res: Response): Promise<void> {
  const { title, subject, chapterId, targetClass, questions, dueDate, totalCount } = req.body;
  const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.id } });
  if (!teacher) { res.status(404).json({ error: 'Teacher not found' }); return; }

  const homework = await prisma.homework.create({
    data: {
      teacherId: teacher.id,
      title,
      subject,
      chapterId,
      targetClass,
      questions,
      dueDate: new Date(dueDate),
      totalCount: totalCount || 30,
    },
  });

  // Create daily tasks for all students in that class
  const students = await prisma.student.findMany({
    where: { classLevel: targetClass.split('-')[0]?.trim(), section: targetClass.split('-')[1]?.trim() },
  });

  if (students.length > 0) {
    await prisma.dailyTask.createMany({
      data: students.map(s => ({
        studentId: s.id,
        title: `Solve homework: ${title}`,
        sourceType: 'homework',
        sourceId: homework.id,
      })),
    });

    // Create announcement for all students
    const announcement = await prisma.teacherAnnouncement.create({
      data: {
        teacherId: teacher.id,
        title: `New Homework: ${title}`,
        content: `${teacher.name} has assigned a new homework sheet on ${title}. Due: ${new Date(dueDate).toLocaleDateString('en-IN')}.`,
        targetClass,
      },
    });

    await prisma.studentAnnouncement.createMany({
      data: students.map(s => ({ studentId: s.id, announcementId: announcement.id })),
    });
  }

  res.status(201).json(homework);
}

export async function publishAnnouncement(req: AuthRequest, res: Response): Promise<void> {
  const { title, content, targetClass } = req.body;
  const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.id } });
  if (!teacher) { res.status(404).json({ error: 'Teacher not found' }); return; }

  const announcement = await prisma.teacherAnnouncement.create({
    data: { teacherId: teacher.id, title, content, targetClass },
  });

  // Distribute to matching students
  const where = targetClass
    ? { classLevel: targetClass.split('-')[0]?.trim(), section: targetClass.split('-')[1]?.trim() }
    : {};

  const students = await prisma.student.findMany({ where });
  if (students.length > 0) {
    await prisma.studentAnnouncement.createMany({
      data: students.map(s => ({ studentId: s.id, announcementId: announcement.id })),
    });
  }

  res.status(201).json({ ...announcement, sentTo: students.length });
}

export async function getClassPerformance(req: AuthRequest, res: Response): Promise<void> {
  const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.id } });
  if (!teacher) { res.status(404).json({ error: 'Teacher not found' }); return; }

  const students = await prisma.student.findMany({
    where: { teacherId: teacher.id },
    include: { testResults: { orderBy: { completedAt: 'desc' }, take: 5 } },
  });

  const performance = students.map(s => {
    const avgAccuracy = s.testResults.length
      ? Math.round(s.testResults.reduce((sum, t) => sum + t.accuracy, 0) / s.testResults.length)
      : 0;
    return { id: s.id, name: s.name, classLevel: s.classLevel, section: s.section, avgAccuracy, xp: s.xp, level: s.level };
  });

  res.json(performance);
}
