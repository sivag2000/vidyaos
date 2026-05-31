import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(9),
  role: z.enum(['STUDENT', 'PARENT', 'TEACHER']),
  name: z.string().min(1),
  classLevel: z.string().optional(),
  section: z.string().optional(),
  board: z.enum(['CBSE', 'ICSE', 'STATE']).optional(),
  school: z.string().optional(),
  academicYear: z.string().optional(),
});

const LoginSchema = z.object({
  identity: z.string().min(1), // email or username
  password: z.string().min(1),
});

function signToken(payload: { id: string; role: string; email: string }) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
}

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const { email, username, password, role, name, classLevel, section, board, school, academicYear } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    res.status(409).json({ error: 'Email or username already taken' });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashed,
      role: role as Role,
    },
  });

  // Create role-specific profile
  if (role === 'STUDENT') {
    await prisma.student.create({
      data: {
        userId: user.id,
        name,
        classLevel: classLevel || 'Class 10',
        section: section || 'A',
        board: (board || 'CBSE') as any,
        school,
        academicYear: academicYear || '2026-27',
      },
    });
  } else if (role === 'TEACHER') {
    await prisma.teacher.create({ data: { userId: user.id, name, school } });
  } else if (role === 'PARENT') {
    await prisma.parent.create({ data: { userId: user.id, name } });
  }

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  res.status(201).json({ token, role: user.role, username: user.username });
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed' });
    return;
  }

  const { identity, password } = parsed.data;
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identity }, { username: identity }] },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  res.json({ token, role: user.role, username: user.username });
}

export async function getMe(req: Request & { user?: any }, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, email: true, username: true, role: true,
      student: { select: { id: true, name: true, classLevel: true, section: true, board: true, xp: true, level: true, streak: true, academicYear: true, school: true } },
      teacher: { select: { id: true, name: true, subject: true, school: true } },
      parent: { select: { id: true, name: true } },
    },
  });

  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json(user);
}
