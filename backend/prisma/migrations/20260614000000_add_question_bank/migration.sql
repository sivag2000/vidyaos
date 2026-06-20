-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'NUMERICAL', 'ASSERTION_REASON');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'REJECTED');

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "classLevel" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" JSONB NOT NULL,
    "explanation" TEXT NOT NULL,
    "stemHash" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'ai-gemini',
    "status" "QuestionStatus" NOT NULL DEFAULT 'PUBLISHED',
    "modelMeta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_attempts" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "selectedAnswer" JSONB NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "questions_classLevel_subject_chapterId_idx" ON "questions"("classLevel", "subject", "chapterId");

-- CreateIndex
CREATE INDEX "questions_chapterId_difficulty_status_idx" ON "questions"("chapterId", "difficulty", "status");

-- CreateIndex
CREATE UNIQUE INDEX "questions_chapterId_stemHash_key" ON "questions"("chapterId", "stemHash");

-- CreateIndex
CREATE INDEX "question_attempts_studentId_idx" ON "question_attempts"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "question_attempts_studentId_questionId_key" ON "question_attempts"("studentId", "questionId");

-- AddForeignKey
ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

