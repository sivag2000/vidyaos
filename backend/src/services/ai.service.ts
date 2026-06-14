// AI Service — uses Google Gemini API when GEMINI_API_KEY is set, falls back to mock responses

import { GoogleGenerativeAI } from '@google/generative-ai';

const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const MODEL = 'gemini-1.5-flash'; // fast + free tier available

export interface TutorResponse {
  text: string;
  suggestions: string[];
  mode: string;
}

export interface DoubtResponse {
  question: string;
  explanation: string;
  eli5: string;
  tips: string;
}

export interface QuestionGeneratorResponse {
  questions: GeneratedQuestion[];
  title: string;
}

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  type: 'mcq' | 'assertion-reason' | 'short';
}

const COMPLEXITY_GUIDANCE: Record<string, string> = {
  foundation: 'Explain using simple everyday analogies. Define all key terms.',
  standard: 'Follow NCERT explanation sequence. Work through one solved example.',
  advanced: 'Include derivations, edge cases, and common CBSE exam traps.',
  'deep-dive': 'Map prerequisites, derivation path, experiment context, and JEE/NEET extensions.',
};

async function geminiCall(prompt: string): Promise<string> {
  if (!gemini) throw new Error('No API key');
  const model = gemini.getGenerativeModel({ model: MODEL });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ─── TUTOR ────────────────────────────────────────────────────────────────────
export async function getTutorResponse(
  topic: string,
  userMessage: string,
  complexity: string,
  subject: string,
  chapter: string
): Promise<TutorResponse> {
  if (gemini) {
    try {
      const prompt = `You are Vidya AI, an expert CBSE Class 10 study tutor.
Subject: ${subject}, Chapter: ${chapter}, Topic: ${topic || 'General'}.
Complexity mode: ${complexity}. Guidance: ${COMPLEXITY_GUIDANCE[complexity] || COMPLEXITY_GUIDANCE.standard}

Student asks: "${userMessage}"

Respond with a JSON object (no markdown, raw JSON only):
{
  "text": "<HTML explanation with <h3>, <p>, <ul>, <strong> tags. Include a math-box div for formulas.>",
  "suggestions": ["chip 1", "chip 2", "chip 3"]
}

Keep the explanation concise and exam-focused. End suggestions with relevant emoji.`;

      const raw = await geminiCall(prompt);
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return { text: parsed.text, suggestions: parsed.suggestions || [], mode: complexity };
    } catch (err) {
      console.error('[Gemini tutor error]', err);
    }
  }

  return getMockTutorResponse(topic, userMessage, complexity);
}

// ─── DOUBT SOLVER ─────────────────────────────────────────────────────────────
export async function solveDoubt(question: string, subject: string): Promise<DoubtResponse> {
  if (gemini) {
    try {
      const prompt = `You are Vidya AI, a CBSE Class 10 doubt solver.
Subject: ${subject}
Question: "${question}"

Respond with a JSON object (no markdown, raw JSON only):
{
  "explanation": "<detailed HTML step-by-step explanation with <h3>, <p>, <ul>, chemical equations if needed, and an info-alert div for exam tips>",
  "eli5": "<simple analogy HTML using <h3> and <p> tags, max 100 words>",
  "tips": "<CBSE board exam tips HTML as <ul> with <li> items>"
}`;

      const raw = await geminiCall(prompt);
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return { question, explanation: parsed.explanation, eli5: parsed.eli5, tips: parsed.tips };
    } catch (err) {
      console.error('[Gemini doubt error]', err);
    }
  }

  return getMockDoubtResponse(question, subject);
}

// ─── QUESTION GENERATOR ───────────────────────────────────────────────────────
export async function generateQuestions(
  subject: string,
  chapter: string,
  topic: string,
  type: string,
  count: number = 3
): Promise<QuestionGeneratorResponse> {
  if (gemini) {
    try {
      const prompt = `You are a CBSE Class 10 exam question generator.
Generate ${count} ${type} questions for:
Subject: ${subject}, Chapter: ${chapter}, Topic: ${topic || 'General overview'}

Respond with a JSON object (no markdown, raw JSON only):
{
  "title": "short worksheet title",
  "questions": [
    {
      "type": "${type}",
      "question": "question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": 0,
      "explanation": "why this answer is correct"
    }
  ]
}

For assertion-reason type, format question as:
"Assertion (A): ...\\nReason (R): ..."
with standard options: Both A and R true (R explains A) / Both true (R doesn't explain) / A true R false / A false R true`;

      const raw = await geminiCall(prompt);
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return { questions: parsed.questions, title: parsed.title };
    } catch (err) {
      console.error('[Gemini question gen error]', err);
    }
  }

  return getMockGeneratedQuestions(subject, chapter, topic, type, count);
}

// ─── MOCK FALLBACKS ───────────────────────────────────────────────────────────
function getMockTutorResponse(topic: string, message: string, complexity: string): TutorResponse {
  const lower = message.toLowerCase();

  if (lower.includes('ohm') || topic?.toLowerCase().includes('ohm')) {
    return {
      text: `<h3>Ohm's Law & Resistance</h3>
      <p>Ohm's law states that the current (I) through a conductor is <strong>directly proportional</strong> to the potential difference (V), at constant temperature.</p>
      <div class="math-box"><strong>V = I × R</strong></div>
      <p>Where <strong>R</strong> is resistance in Ohms (Ω).</p>`,
      suggestions: ["Simplify this (ELI5) 🎈", "Show CBSE Board Tips 💡", "Solve a numerical 📐", "Give me a mock question 📝"],
      mode: complexity,
    };
  }

  if (lower.includes('quadratic') || lower.includes('discriminant')) {
    return {
      text: `<h3>Nature of Roots & Discriminant</h3>
      <p>For <strong>ax² + bx + c = 0</strong>, the discriminant D determines root nature:</p>
      <div class="math-box"><strong>D = b² − 4ac</strong></div>
      <ul><li>D &gt; 0 → Two distinct real roots</li><li>D = 0 → Two equal real roots</li><li>D &lt; 0 → No real roots</li></ul>`,
      suggestions: ["Simplify this (ELI5) 🎈", "Show CBSE Board Tips 💡", "Solve a numerical 📐", "Give me a mock question 📝"],
      mode: complexity,
    };
  }

  return {
    text: `<h3>Study Guide: ${topic || 'Selected Topic'}</h3>
    <p>Based on the CBSE Class 10 syllabus, here is the step-by-step breakdown. <em>(Add your GEMINI_API_KEY to .env for real AI responses.)</em></p>
    <p><strong>Mode:</strong> ${COMPLEXITY_GUIDANCE[complexity] || COMPLEXITY_GUIDANCE.standard}</p>`,
    suggestions: ["Simplify this (ELI5) 🎈", "Show CBSE Board Tips 💡", "Give me a mock question 📝"],
    mode: complexity,
  };
}

function getMockDoubtResponse(question: string, subject: string): DoubtResponse {
  return {
    question,
    explanation: `<h3>AI Explanation</h3>
    <p>This is a standard ${subject} concept from CBSE Class 10. <em>(Add your GEMINI_API_KEY to .env for real AI responses.)</em></p>
    <div class="info-alert"><strong>Exam Tip:</strong> Always write units and show all steps for full marks.</div>`,
    eli5: `<h3>Simple Explanation 🎈</h3><p>Think of <strong>${question}</strong> like a simple real-life situation where everything follows a basic rule.</p>`,
    tips: `<h3>CBSE Board Tips 💡</h3><ul><li>Define formula before using it</li><li>Show all calculation steps</li><li>Write SI units for all quantities</li></ul>`,
  };
}

function getMockGeneratedQuestions(subject: string, chapter: string, topic: string, type: string, count: number): QuestionGeneratorResponse {
  const questions: GeneratedQuestion[] = Array.from({ length: count }, (_, i) => ({
    type: type as any,
    question: type === 'assertion-reason'
      ? `Assertion (A): ${topic || chapter} is a fundamental concept.\nReason (R): It follows the law of conservation and is experimentally verified.`
      : `Which statement correctly describes ${topic || chapter}? (Q${i + 1})`,
    options: [`Primary characteristic of ${topic || chapter}`, `Secondary variable`, `Inverse relationship`, `None of the above`],
    correctAnswer: 0,
    explanation: `${topic || chapter} follows standard CBSE principles. Add GEMINI_API_KEY to .env for real generated questions.`,
  }));

  return { questions, title: `${chapter} — ${topic || 'General'} (${type.toUpperCase()})` };
}

// ─── CLASS 11 BANK GENERATION ──────────────────────────────────────────────────
export interface BankQuestionRaw {
  type: 'MCQ' | 'NUMERICAL' | 'ASSERTION_REASON';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  question: string;
  options?: string[];
  correctAnswer: number;
  explanation: string;
}

function extractJson(raw: string): any {
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function generateClass11Questions(params: {
  subjectName: string;
  chapterName: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  count: number;
}): Promise<BankQuestionRaw[]> {
  if (!gemini) throw new Error('GEMINI_API_KEY is required to generate questions');

  const { subjectName, chapterName, topic, difficulty, count } = params;
  const prompt = `You are a CBSE Class 11 ${subjectName} exam question setter.
Generate ${count} ${difficulty} difficulty questions on:
Chapter: ${chapterName}
Topic: ${topic}

Return raw JSON only (no markdown). Shape:
{
  "questions": [
    {
      "type": "MCQ" | "NUMERICAL" | "ASSERTION_REASON",
      "difficulty": "${difficulty}",
      "question": "question text (use plain text; LaTeX allowed inside $...$)",
      "options": ["A", "B", "C", "D"],   // omit for NUMERICAL
      "correctAnswer": 0,                  // option index for MCQ/ASSERTION_REASON; numeric value for NUMERICAL
      "explanation": "step-by-step worked solution"
    }
  ]
}
For ASSERTION_REASON, format question as "Assertion (A): ...\\nReason (R): ..." with the four standard options.`;

  const parsed = extractJson(await geminiCall(prompt));
  return parsed.questions as BankQuestionRaw[];
}

// Re-solves a question; returns the answer the model arrives at independently.
export async function verifyAnswer(q: BankQuestionRaw): Promise<number> {
  if (!gemini) throw new Error('GEMINI_API_KEY is required to verify questions');

  const optionsBlock = q.options
    ? `Options:\n${q.options.map((o, i) => `${i}. ${o}`).join('\n')}\nReturn the index of the correct option.`
    : 'Return the correct numeric value.';

  const prompt = `Solve this CBSE Class 11 question. ${optionsBlock}
Question: ${q.question}

Return raw JSON only: { "answer": <number> }`;

  const parsed = extractJson(await geminiCall(prompt));
  return Number(parsed.answer);
}
