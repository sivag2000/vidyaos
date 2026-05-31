import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getTutorResponse, solveDoubt, generateQuestions } from '../services/ai.service';

const router = Router();
router.use(authenticate);

router.post('/tutor', async (req: Request, res: Response) => {
  const { topic, message, complexity, subject, chapter } = req.body;
  const response = await getTutorResponse(topic, message, complexity || 'standard', subject, chapter);
  res.json(response);
});

router.post('/doubt', async (req: Request, res: Response) => {
  const { question, subject } = req.body;
  if (!question) { res.status(400).json({ error: 'Question is required' }); return; }
  const response = await solveDoubt(question, subject || 'General');
  res.json(response);
});

router.post('/generate-questions', async (req: Request, res: Response) => {
  const { subject, chapter, topic, type, count } = req.body;
  const response = await generateQuestions(subject, chapter, topic, type || 'mcq', count || 3);
  res.json(response);
});

export default router;
