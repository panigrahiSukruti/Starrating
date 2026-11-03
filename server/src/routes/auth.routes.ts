import { Router } from 'express';
import { register, login, changePassword, getMe } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  UserRegistrationSchema,
  LoginSchema,
  ChangePasswordSchema
} from '../schemas';

const router = Router();

router.post('/register', validateBody(UserRegistrationSchema), register);
router.post('/login', validateBody(LoginSchema), login);
router.patch(
  '/change-password',
  authenticateToken,
  validateBody(ChangePasswordSchema),
  changePassword
);
router.get('/me', authenticateToken, getMe);

export default router;

