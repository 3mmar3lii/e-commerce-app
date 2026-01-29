import express from "express";
import { protect } from "../middleware/authMiddleware";
import { addCategory, deleteCategory, getCategorys, getSingleCategory, updateCategory } from "../controllers/categoryController";
const router = express.Router();
router.use(protect);


router
  .route("/:id")
  .post(addCategory)
  .delete(deleteCategory)
  .patch(updateCategory).get(getSingleCategory);

  router.route("/").get(getCategorys);
export default router;
