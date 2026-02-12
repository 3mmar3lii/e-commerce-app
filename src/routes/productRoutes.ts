import { Router } from "express";
import {
  addProduct,
  deleteProduct,
  editProduct,
  getAllProducts,
  getSingleProduct,
} from "../controllers/productController";
import reviewRouter from "./reviewRoutes";
import { protect } from "../middleware/authMiddleware";
import  { upload} from   "../middleware/multer"
import { uploadProductImage } from "../middleware/uploadProductImage";

const router = Router();

router.use(protect);
router.route("/").get(getAllProducts).post(upload.single("productImage"),uploadProductImage, addProduct);
router.use("/:id/reviews",reviewRouter)
router
  .route("/:id")
  .get(getSingleProduct)
  .patch(editProduct)
  .delete(deleteProduct);

export default router;
