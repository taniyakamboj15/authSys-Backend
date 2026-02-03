import { Router } from 'express';
import { emailController } from './email.controller';
import { asyncHandler } from '../../common/utils/asyncHandler.util';
import { validate } from '../../common/middlewares/validate.middleware';
import { sendOTPValidators, verifyOTPValidators, resendOTPValidators } from './email.validation';

import { emailVerificationLimiter, resendOTPLimiter } from '../../common/middlewares/rateLimiter.middleware';

const router = Router();

router.post('/send-verification', resendOTPLimiter, sendOTPValidators, validate, asyncHandler(emailController.sendVerificationOTP));
router.post('/verify-otp', emailVerificationLimiter, verifyOTPValidators, validate, asyncHandler(emailController.verifyOTP));
router.post('/resend-otp', resendOTPLimiter, resendOTPValidators, validate, asyncHandler(emailController.resendOTP));

export default router;
