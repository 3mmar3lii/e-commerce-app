import { Router } from "express";
import {
  createReview,
  editReview,
  deleteReview,
  getAllReviews,
} from "../controllers/reviewController";
import { protect, restrictTo } from "../middleware/authMiddleware";
import { setUserIdInBodyBeforeSave } from "../middleware/setUserIdInBodyBeforeSaveReview";

const router = Router({mergeParams:true});
router.use(protect);
router
  .route("/")
  .post(restrictTo("customer"), setUserIdInBodyBeforeSave, createReview)
  .get(restrictTo("admin", "seller"), getAllReviews);

router
  .route("/:id")
  .patch(restrictTo("customer"), editReview)
  .delete(restrictTo("customer", "admin"), deleteReview);

export default router;
