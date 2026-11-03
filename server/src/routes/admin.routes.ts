import { Router } from 'express';
import {
  getMetrics,
  getUsers,
  createUser,
  getStores,
  createStore,
  getAvailableOwners
} from '../controllers/admin.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { AdminUserCreationSchema, StoreCreationSchema } from '../schemas';
import { Role } from '../config/constants';

const router = Router();

// Protect all admin routes with authentication and ADMIN role check
router.use(authenticateToken, requireRole([Role.ADMIN]));

router.get('/metrics', getMetrics);
router.get('/users', getUsers);
router.post('/users', validateBody(AdminUserCreationSchema), createUser);
router.get('/stores', getStores);
router.post('/stores', validateBody(StoreCreationSchema), createStore);
router.get('/available-owners', getAvailableOwners);

export default router;

