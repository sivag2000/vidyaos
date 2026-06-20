import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getClass11Curriculum } from '../controllers/curriculum.controller';

const router = Router();
router.use(authenticate);

router.get('/class/11', getClass11Curriculum);

export default router;
