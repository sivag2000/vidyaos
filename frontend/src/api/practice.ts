import api from './client';

export interface ChapterDef { id: string; name: string; topics: string[]; }
export interface SubjectDef { id: string; name: string; chapters: ChapterDef[]; }
export interface ClassDef { classLevel: number; subjects: SubjectDef[]; }

export interface PracticeQuestion {
  id: string;
  type: 'MCQ' | 'NUMERICAL' | 'ASSERTION_REASON';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  question: string;
  options: string[] | null;
  topic: string;
}

export interface AttemptResult {
  isCorrect: boolean;
  correctAnswer: number;
  explanation: string;
  chapterStatus: string;
}

export async function fetchCurriculum(): Promise<ClassDef> {
  const { data } = await api.get('/curriculum/class/11');
  return data;
}

export async function fetchChapterQuestions(chapterId: string, difficulty?: string): Promise<PracticeQuestion[]> {
  const { data } = await api.get(`/practice/chapter/${chapterId}/questions`, { params: { difficulty } });
  return data;
}

export async function submitAttempt(questionId: string, selectedAnswer: number): Promise<AttemptResult> {
  const { data } = await api.post('/practice/attempt', { questionId, selectedAnswer });
  return data;
}

export interface GeneratedTest {
  key: string;
  title: string;
  subject: string;
  timeLimit: number;
  questions: Array<{ id: string; type: string; question: string; options: string[] | null; correctAnswer: number; explanation: string }>;
}

export async function generateTest(chapterId: string, count = 10, timeLimit = 600): Promise<GeneratedTest> {
  const { data } = await api.post('/tests/generate', { chapterId, count, timeLimit });
  return data;
}
