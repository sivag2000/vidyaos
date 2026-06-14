import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { getChapterQuestions, submitAttempt } from '../controllers/practice.controller';

const router = Router();
router.use(authenticate, requireRole('STUDENT'));

router.get('/chapter/:chapterId/questions', getChapterQuestions);
router.post('/attempt', submitAttempt);

export default router;
