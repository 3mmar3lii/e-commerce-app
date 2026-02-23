import express from "express"
import { signin, signup, updatePassword } from "../controllers/authController";

const router = express.Router();

router.post("/sign-up", signup);
router.post("/login", signin);
router.patch("/update-password", updatePassword);


export default router;