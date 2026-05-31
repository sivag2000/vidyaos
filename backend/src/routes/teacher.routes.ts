import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { getTeacherDashboard, createHomework, publishAnnouncement, getClassPerformance } from '../controllers/teacher.controller';

const router = Router();
router.use(authenticate, requireRole('TEACHER'));

router.get('/dashboard', getTeacherDashboard);
router.post('/homework', createHomework);
router.post('/announcement', publishAnnouncement);
router.get('/performance', getClassPerformance);

export default router;
