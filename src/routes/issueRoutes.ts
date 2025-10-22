import { Router } from 'express';
import { getIssues, createIssue, getIssueById, requestIssue, getUserIssues, getRequestsForUserIssues, updateIssueStatus } from '../controllers/issueController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/upload.js';

const router: Router = Router();

router.get('/', getIssues);
router.post("/", authenticate, upload.array("images", 5), createIssue);
router.get("/:issueId", getIssueById);
router.post("/:issueId/request", authenticate, requestIssue);
router.get("/my/issues", authenticate, getUserIssues);
router.get("/my/requests/:issueId", authenticate, getRequestsForUserIssues);
router.patch("/:issueId/status", authenticate, updateIssueStatus);
export default router;
