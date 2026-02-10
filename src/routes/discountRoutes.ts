import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware";
import { addDiscount, useDiscount } from "../controllers/discountController";
import { ensureOrderHasNoDiscount } from "../middleware/isOrderHaveDiscountBefore";

const router = express.Router();

router.use(protect);
router.route("/").post(ensureOrderHasNoDiscount, useDiscount);
//router.route("/add-discount").post(restrictTo("seller"), addDiscount);
router.route("/add-discount").post(addDiscount);

export default router;
