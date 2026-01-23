import { Response, NextFunction } from "express";
import CartService from "../services/cartService";
import { AuthRequestCurrentUser } from "../types/auth.types";
import AppError from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";
import { getOne } from "../utils/handlerFactory";
import { CartModel } from "../models/Cart.Model";

const options = [
  { path: "userId", select: "name email" },
  { path: "items.productId", select: "name price stock status" },
];

export const addToCart = catchAsync(
  async (req: AuthRequestCurrentUser, res: Response, next: NextFunction) => {
    if (!req.body.productId || !req.body.quantity) {
      return next(new AppError("ProductId and quantity are required", 400));
    }

    if (!req.currentUser) {
      return next(new AppError("Authentication required", 401));
    }

    const cartService = new CartService();
    const updatedCart = await cartService.addProduct(
      req.currentUser._id,
      req.body.productId,
      req.body.quantity,
    );

    res.status(200).json({
      status: "success",
      data: updatedCart,
    });
  },
);

export const getCartInfo = getOne(CartModel, options);
