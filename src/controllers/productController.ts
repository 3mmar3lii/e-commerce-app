import ProductModel from "../models/Product.Model";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../utils/handlerFactory";

const addProduct = createOne(ProductModel);
const deleteProduct = deleteOne(ProductModel);
const editProduct = updateOne(ProductModel);
const getSingleProduct = getOne(ProductModel,[]);
const getAllProducts = getAll(ProductModel,[]); 

export {
  addProduct,
  deleteProduct,
  editProduct,
  getAllProducts,
  getSingleProduct,
};
