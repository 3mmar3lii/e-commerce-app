import { Router } from "express";
import {
  addProduct,
  deleteProduct,
  editProduct,
  getAllProducts,
  getSingleProduct,
} from "../controllers/productController";

const router = Router();

router.route("/").get(getAllProducts).post(addProduct);

router
  .route("/:id")
  .get(getSingleProduct)
  .patch(editProduct)
  .delete(deleteProduct);

export default router;
