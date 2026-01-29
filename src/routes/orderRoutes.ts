import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware";
import { loadUserCart } from "../middleware/setCartIdBeforeGetInfo";
import { cancelOrder, createOrder, editOrder } from "../controllers/orderController";

const router = express.Router();
router.use(protect, restrictTo("customer"));
router
  .route("")
  .post(loadUserCart, createOrder);

router.route("/:id/cancel").patch(cancelOrder);
router.route("/:id").patch(editOrder)
export default router;
