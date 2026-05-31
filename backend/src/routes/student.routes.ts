import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
  getProfile, updateXP, updateChapterProgress,
  getDailyTasks, completeTask, getAnnouncements,
  updateStreak, upsertWeakTopic,
} from '../controllers/student.controller';

const router = Router();
router.use(authenticate, requireRole('STUDENT'));

router.get('/profile', getProfile);
router.patch('/xp', updateXP);
router.patch('/chapter-progress', updateChapterProgress);
router.get('/tasks', getDailyTasks);
router.patch('/tasks/:taskId', completeTask);
router.get('/announcements', getAnnouncements);
router.post('/streak', updateStreak);
router.post('/weak-topic', upsertWeakTopic);

export default router;
