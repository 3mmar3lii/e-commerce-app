import ProductModel from "../models/Product.Model";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../utils/handlerFactory";
import { PRODUCT_POPULATION } from "../utils/populationPaths";

const addProduct = createOne(ProductModel);
const deleteProduct = deleteOne(ProductModel);
const editProduct = updateOne(ProductModel);
const getSingleProduct = getOne(ProductModel, PRODUCT_POPULATION);
const getAllProducts = getAll(ProductModel,[]); 

export {
  addProduct,
  deleteProduct,
  editProduct,
  getAllProducts,
  getSingleProduct,
};
