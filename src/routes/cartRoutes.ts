import express from "express";
import { addToCart } from "../controllers/cartController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();


router.route("/cart").post(protect,addToCart);
export default router;
