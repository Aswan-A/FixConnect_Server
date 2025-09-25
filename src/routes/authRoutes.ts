import { Router } from 'express';
import { register, login, refresh } from '../controllers/authController.js';
import { upload } from '../middlewares/upload.js';

const router: Router = Router();

router.post('/register', upload.single('profilePic'), register);
router.post('/login', login);
router.post('/refresh', refresh);

export default router;
