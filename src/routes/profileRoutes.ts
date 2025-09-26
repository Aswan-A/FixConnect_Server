import { Router } from 'express';
import { updateProUser,getUserProfile } from '../controllers/profileController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router : Router = Router();

router.use(authenticate); 

router.put('/pro-user', updateProUser);
router.get('/me', getUserProfile);

export default router;
