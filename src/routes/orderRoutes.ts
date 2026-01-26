import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware";
import { loadUserCart } from "../middleware/setCartIdBeforeGetInfo";
import { createOrder } from "../controllers/orderController";

const router = express.Router();

router
  .route("")
  .post(protect, restrictTo("customer"), loadUserCart, createOrder);

export default router;
