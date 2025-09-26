import { Router } from "express";
import authRoutes from "./authRoutes.js";
import issueRoutes from "./issueRoutes.js";
import profileRoutes from "./profileRoutes.js";
const router = Router();

router.use("/auth", authRoutes);
router.use("/issues", issueRoutes);
router.use("/profile", profileRoutes);
export default router;
