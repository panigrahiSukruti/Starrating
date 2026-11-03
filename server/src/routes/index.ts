import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import storeRoutes from './store.routes';
import ownerRoutes from './owner.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/owner', ownerRoutes);
router.use('/', storeRoutes);

export default router;

