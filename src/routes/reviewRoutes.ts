import { Router } from "express";
import { createReview } from "../controllers/reviewController";
import { protect } from "../middleware/authMiddleware";
import { setUserIdInBodyBeforeSave } from "../middleware/setUserIdInBodyBeforeSaveReview";

const router = Router();
router.use(protect);
router.route("/").post(setUserIdInBodyBeforeSave,createReview);

export default router;
