import { Router } from 'express';
import { userController } from './user.controller';
import { asyncHandler } from '../../common/utils/asyncHandler.util';
import { validate } from '../../common/middlewares/validate.middleware'; 
import { protect } from '../../common/middlewares/auth.middleware';
import passport from 'passport';
import { googleAuthCallback } from '../../common/middlewares/googleAuth.middleware';
import { registerValidators, loginValidators } from './user.validation';
const router = Router();

router.post('/signup', registerValidators, validate, asyncHandler(userController.register));
router.post('/login', loginValidators, validate, asyncHandler(userController.login));
router.post('/refresh', asyncHandler(userController.refresh));
router.post('/logout', asyncHandler(userController.logout));

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  googleAuthCallback,
  asyncHandler(userController.googleCallback)
);

router.get('/profile', protect, asyncHandler(userController.getProfile));

export default router;
