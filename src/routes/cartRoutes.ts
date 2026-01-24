import express from "express";
import {
  addToCart,
  deleteCartItem,
  getCartInfo,
  updateCartItemQuantity,
} from "../controllers/cartController";
import { protect, restrictTo } from "../middleware/authMiddleware";
import { loadUserCart } from "../middleware/setCartIdBeforeGetInfo";

const router = express.Router();

router.use(protect);
router
  .route("/")
  .post(restrictTo("customer"), addToCart)
  .get(restrictTo("customer", "admin"), loadUserCart, getCartInfo)
  .delete(restrictTo("customer"), deleteCartItem);

  router.route("/:id").patch(restrictTo("customer"), updateCartItemQuantity);
export default router;
