import { Request, Response, NextFunction } from "express";
import { AuthRequestCurrentUser } from "../types/auth.types";
import { CartModel } from "../models/Cart.Model";
import AppError from "../utils/AppError";

export const loadUserCart = async (
  req: AuthRequestCurrentUser,
  res: Response,
  next: NextFunction,
) => {
  if (!req.currentUser) {
    return next(new AppError("Forbidden Action ", 401));
  }

  const cart = await CartModel.findOne({ userId: req.currentUser._id });
  //.populate("items.productId", "name price image")
  //.populate("userId", "name email");
  if (!req.params.id) {
    console.log("Cart id =", cart._id);
    (req as any).params.id = cart._id;
  }

  next();
};
