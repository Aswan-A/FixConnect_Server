import { Router } from 'express';
import { getIssues, createIssue } from '../controllers/issueController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router: Router = Router();

router.get('/', getIssues);
router.post('/', authenticate, createIssue);

export default router;
