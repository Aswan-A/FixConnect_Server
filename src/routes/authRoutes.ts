import { Router } from "express";
import {
  register,
  login,
  refresh,
  proRegister,
} from "../controllers/authController.js";
import { upload } from "../middlewares/upload.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router: Router = Router();

router.post("/register", upload.single("profilePic"), register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post(
  "/pro-register",
  authenticate,
  upload.array("certificates", 3),
  proRegister
);
export default router;
