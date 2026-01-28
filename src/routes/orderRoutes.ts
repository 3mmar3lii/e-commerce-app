import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware";
import { loadUserCart } from "../middleware/setCartIdBeforeGetInfo";
import { cancelOrder, createOrder } from "../controllers/orderController";

const router = express.Router();
router.use(protect, restrictTo("customer"));
router
  .route("")
  .post(loadUserCart, createOrder);

router.route("/:id").patch(cancelOrder);
export default router;
