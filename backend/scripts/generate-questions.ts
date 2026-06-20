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
        correctAnswer: q.correctAnswer as any,
        explanation: q.explanation,
        stemHash: hash,
        status,
        modelMeta: { model: 'gemini-2.0-flash', generatedAt: new Date().toISOString(), selfCheck: status },
      },
    });
    console.log(`SAVE ${chapterId}/${topic}/${difficulty} [${status}]`);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
