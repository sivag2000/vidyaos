import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { getChildProgress } from '../controllers/parent.controller';

const router = Router();
router.use(authenticate, requireRole('PARENT'));

router.get('/children', getChildProgress);

export default router;
