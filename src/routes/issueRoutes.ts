import { Router } from 'express';
import { getIssues, createIssue } from '../controllers/issueController';

const router: Router = Router();

router.get('/', getIssues);
router.post('/', createIssue);

export default router;
