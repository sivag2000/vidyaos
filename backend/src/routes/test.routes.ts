import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { submitTestResult, getTestHistory, saveBattleResult, saveFlashcardProgress } from '../controllers/test.controller';

const router = Router();
router.use(authenticate, requireRole('STUDENT'));

router.post('/submit', submitTestResult);
router.get('/history', getTestHistory);
router.post('/battle', saveBattleResult);
router.post('/flashcard', saveFlashcardProgress);

export default router;
