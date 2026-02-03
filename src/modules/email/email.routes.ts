import { Router } from 'express';
import { emailController } from './email.controller';
import { asyncHandler } from '../../common/utils/asyncHandler.util';
import { validate } from '../../common/middlewares/validate.middleware';
import { sendOTPValidators, verifyOTPValidators, resendOTPValidators } from './email.validation';

const router = Router();

router.post('/send-verification', sendOTPValidators, validate, asyncHandler(emailController.sendVerificationOTP));
router.post('/verify-otp', verifyOTPValidators, validate, asyncHandler(emailController.verifyOTP));
router.post('/resend-otp', resendOTPValidators, validate, asyncHandler(emailController.resendOTP));

export default router;
