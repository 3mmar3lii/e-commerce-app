import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware";
import { addDiscount, useDiscount } from "../controllers/discountController";
import { ensureOrderHasNoDiscount } from "../middleware/isOrderHaveDiscountBefore";

const router = express.Router();

router.use(protect);
router
  .route("/")
  .post(restrictTo("customer"), ensureOrderHasNoDiscount, useDiscount);
router.route("/add-discount").post(restrictTo("seller"), addDiscount);

export default router;
