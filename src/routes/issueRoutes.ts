import { Router } from 'express';
import { getIssues, createIssue } from '../controllers/issueController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/upload.js';

const router: Router = Router();

router.get('/', getIssues);
router.post("/", authenticate, upload.array("images", 5), createIssue);
export default router;
