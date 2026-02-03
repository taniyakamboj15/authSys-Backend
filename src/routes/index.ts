import { Router } from 'express';
import userRoutes from '../modules/user/user.routes';
import emailRoutes from '../modules/email/email.routes';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// Module routes
router.use('/auth', userRoutes); 
router.use('/email', emailRoutes); 

export default router;
