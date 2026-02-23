import express from "express"
import { forgetPassword, resetPassword, signin, signup, updatePassword } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/sign-up", signup);
router.post("/login", signin);
router.post("/reset-password/:resetToken", resetPassword);
router.post("/forgot-password",forgetPassword)
router.patch("/update-password",protect, updatePassword);


export default router;