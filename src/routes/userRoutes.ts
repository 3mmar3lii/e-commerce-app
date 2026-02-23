import express from "express"
import { signin, signup, updatePassword } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/sign-up", signup);
router.post("/login", signin);

router.patch("/update-password",protect, updatePassword);


export default router;