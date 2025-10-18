import { Router } from 'express';
import { updateProUser,getUserProfile, getUser } from '../controllers/profileController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router : Router = Router();

router.use(authenticate); 

router.put('/pro-user', updateProUser);
router.get('/me', getUserProfile);
router.get('/', getUser);
export default router;
