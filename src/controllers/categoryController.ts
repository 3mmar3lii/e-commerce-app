import { CategoryModel } from "../models/Category.Model";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../utils/handlerFactory";
import { CATEGORY_POPULATION } from "../utils/populationPaths";

export const addCategory = createOne(CategoryModel);
export const deleteCategory = deleteOne(CategoryModel);
export const updateCategory = updateOne(CategoryModel);
export const getSingleCategory = getOne(CategoryModel, CATEGORY_POPULATION);
export const getCategorys = getAll(CategoryModel, CATEGORY_POPULATION);
