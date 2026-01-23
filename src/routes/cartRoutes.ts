import express from "express";
import { addToCart, getCartInfo } from "../controllers/cartController";
import { protect, restrictTo } from "../middleware/authMiddleware";
import { loadUserCart } from "../middleware/setCartIdBeforeGetInfo";

const router = express.Router();

router.use(protect);
router
  .route("/")
  .post(restrictTo("customer"), addToCart)
  .get(loadUserCart, getCartInfo);
export default router;
