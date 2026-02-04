import { Router } from "express";
import {
  addProduct,
  deleteProduct,
  editProduct,
  getAllProducts,
  getSingleProduct,
} from "../controllers/productController";
import reviewRouter from "./reviewRoutes";
const router = Router();

router.route("/").get(getAllProducts).post(addProduct);
router.use("/:id/reviews",reviewRouter)
router
  .route("/:id")
  .get(getSingleProduct)
  .patch(editProduct)
  .delete(deleteProduct);

export default router;
