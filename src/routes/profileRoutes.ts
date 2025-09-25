import { Router } from 'express';
import { updateIsPro, updateProUser,getUserProfile } from '../controllers/profileController.js';

const router : Router = Router();

router.put('/update-isPro', updateIsPro);
router.put('/pro-user/:id', updateProUser);
router.get('/profile/:userId', getUserProfile);

export default router;
