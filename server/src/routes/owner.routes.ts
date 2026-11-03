import { Router } from 'express';
import { getOwnerDashboard } from '../controllers/owner.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { Role } from '../config/constants';

const router = Router();

router.use(authenticateToken, requireRole([Role.STORE_OWNER]));

router.get('/dashboard', getOwnerDashboard);

export default router;

