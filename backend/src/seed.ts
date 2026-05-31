import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding VidyaOS database...');

  const hashedPw = await bcrypt.hash('Test@1234', 12);

  // Student
  const studentUser = await prisma.user.upsert({
    where: { email: 'rohan@vidyaos.edu.in' },
    update: {},
    create: {
      email: 'rohan@vidyaos.edu.in',
      username: 'rohan_sharma',
      password: hashedPw,
      role: 'STUDENT',
      student: {
        create: {
          name: 'Rohan Sharma',
          classLevel: 'Class 10',
          section: 'A',
          board: 'CBSE',
          rollNumber: '28',
          school: 'Delhi Public School, R.K. Puram',
          academicYear: '2026-27',
          xp: 2450,
          level: 4,
          nextLevelXp: 3000,
          streak: 5,
        },
      },
    },
  });

  // Teacher
  const teacherUser = await prisma.user.upsert({
    where: { email: 'sharma.teacher@vidyaos.edu.in' },
    update: {},
    create: {
      email: 'sharma.teacher@vidyaos.edu.in',
      username: 'ms_sharma',
      password: hashedPw,
      role: 'TEACHER',
      teacher: {
        create: {
          name: 'Ms. Ananya Sharma',
          subject: 'Science Specialist',
          school: 'Delhi Public School, R.K. Puram',
        },
      },
    },
  });

  // Parent
  await prisma.user.upsert({
    where: { email: 'parent@vidyaos.edu.in' },
    update: {},
    create: {
      email: 'parent@vidyaos.edu.in',
      username: 'rohan_parent',
      password: hashedPw,
      role: 'PARENT',
      parent: { create: { name: 'Mr. Sharma (Parent)' } },
    },
  });

  // Seed chapter progress for student
  const student = await prisma.student.findUnique({ where: { userId: studentUser.id } });
  if (student) {
    const chapters = [
      { chapterId: 'chem-reactions', subject: 'science', status: 'MASTERED' },
      { chapterId: 'acids-bases', subject: 'science', status: 'REVISING' },
      { chapterId: 'light', subject: 'science', status: 'LEARNING' },
      { chapterId: 'electricity', subject: 'science', status: 'LEARNING' },
      { chapterId: 'magnetic-effects', subject: 'science', status: 'NOT_STARTED' },
      { chapterId: 'quadratic-eq', subject: 'mathematics', status: 'MASTERED' },
      { chapterId: 'ap', subject: 'mathematics', status: 'REVISING' },
      { chapterId: 'trigo', subject: 'mathematics', status: 'LEARNING' },
    ];

    for (const ch of chapters) {
      await prisma.chapterProgress.upsert({
        where: { studentId_chapterId: { studentId: student.id, chapterId: ch.chapterId } },
        update: {},
        create: { studentId: student.id, ...ch, status: ch.status as any },
      });
    }

    // Weak topics
    await prisma.weakTopic.upsert({
      where: { studentId_topic: { studentId: student.id, topic: 'Factors affecting Resistance' } },
      update: {},
      create: { studentId: student.id, topic: 'Factors affecting Resistance', subject: 'Science (Physics)', clarity: 40 },
    });

    // Daily tasks
    await prisma.dailyTask.createMany({
      skipDuplicates: true,
      data: [
        { studentId: student.id, title: 'Practice 5 Quadratic Equations', completed: true },
        { studentId: student.id, title: 'Solve Physics Electricity quiz', completed: false },
        { studentId: student.id, title: 'Revise Bleaching Powder chemical formula', completed: false },
      ],
    });

    // Test results
    await prisma.testResult.createMany({
      skipDuplicates: true,
      data: [
        { studentId: student.id, testKey: 'chem-reactions', testTitle: 'Chemical Reactions Test', subject: 'science', score: 3, totalMarks: 4, accuracy: 85, answers: {}, xpAwarded: 200 },
        { studentId: student.id, testKey: 'trigo', testTitle: 'Trigonometry Basics', subject: 'mathematics', score: 4, totalMarks: 4, accuracy: 92, answers: {}, xpAwarded: 250 },
      ],
    });
  }

  // Link student to teacher
  const teacher = await prisma.teacher.findUnique({ where: { userId: teacherUser.id } });
  if (student && teacher) {
    await prisma.student.update({ where: { id: student.id }, data: { teacherId: teacher.id } });

    // Create an announcement
    const ann = await prisma.teacherAnnouncement.create({
      data: {
        teacherId: teacher.id,
        title: 'Science Lab Practical File Submission',
        content: 'Please ensure your light refraction practical files are completed and signed by tomorrow afternoon.',
      },
    });
    await prisma.studentAnnouncement.upsert({
      where: { studentId_announcementId: { studentId: student.id, announcementId: ann.id } },
      update: {},
      create: { studentId: student.id, announcementId: ann.id },
    });
  }

  console.log('Seed complete!');
  console.log('Login credentials (all use password: Test@1234):');
  console.log('  Student:  rohan@vidyaos.edu.in');
  console.log('  Teacher:  sharma.teacher@vidyaos.edu.in');
  console.log('  Parent:   parent@vidyaos.edu.in');
}

main().catch(console.error).finally(() => prisma.$disconnect());
