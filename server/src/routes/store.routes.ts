import { Router } from 'express';
import { getStores, submitOrUpdateRating } from '../controllers/store.controller';
import { optionalAuthenticateToken, authenticateToken, requireRole } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { RatingSubmissionSchema } from '../schemas';
import { Role } from '../config/constants';

const router = Router();

router.get('/stores', optionalAuthenticateToken, getStores);
router.post(
  '/ratings',
  authenticateToken,
  requireRole([Role.USER, Role.ADMIN]),
  validateBody(RatingSubmissionSchema),
  submitOrUpdateRating
);

export default router;

