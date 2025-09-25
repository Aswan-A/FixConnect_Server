import { Router } from "express";
import authRoutes from "./authRoutes.js";
import issueRoutes from "./issueRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/issues", issueRoutes);

export default router;
