import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export async function getChildProgress(req: AuthRequest, res: Response): Promise<void> {
  const parent = await prisma.parent.findUnique({
    where: { userId: req.user!.id },
    include: {
      children: {
        include: {
          testResults: { orderBy: { completedAt: 'desc' }, take: 10 },
          weakTopics: true,
          chapterProgress: true,
        },
      },
    },
  });
  if (!parent) { res.status(404).json({ error: 'Parent not found' }); return; }
  res.json(parent);
}
