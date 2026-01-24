import { Response, NextFunction } from "express";
import CartService from "../services/cartService";
import { AuthRequestCurrentUser } from "../types/auth.types";
import AppError from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";
import { getOne } from "../utils/handlerFactory";
import { CartModel } from "../models/Cart.Model";
import { CART_POPULATION } from "../utils/cartPopulation";

export const addToCart = catchAsync(
  async (req: AuthRequestCurrentUser, res: Response, next: NextFunction) => {
    if (!req.body.productId || !req.body.quantity) {
      return next(new AppError("ProductId and quantity are required", 400));
    }

    if (!req.currentUser) {
      return next(new AppError("Authentication required", 401));
    }

    const cartService = new CartService(
      req.currentUser?._id,
      req.body?.productId,
      req.body?.quantity,
    );
    const updatedCart = await cartService.addProduct(
      req.currentUser._id,
      req.body.productId,
      req.body.quantity,
    );

    res.status(201).json({
      status: "success",
      data: updatedCart,
    });
  },
);
export const getCartInfo = getOne(CartModel, CART_POPULATION);
export const deleteCartItem = catchAsync(
  async (req: AuthRequestCurrentUser, res, next) => {
    if (!req.body.productId) {
      return next(new AppError("ProductId are required", 400));
    }

    if (!req.currentUser) {
      return next(new AppError("Authentication required", 401));
    }
    const cartService = new CartService(
      req.currentUser?._id,
      req.body?.productId,
    );
    await cartService.deleteProduct(req.currentUser._id, req.body.productId);

    res.status(204).json({
      status: "success",
    });
  },
);
export const updateCartItemQuantity = catchAsync(
  async (req: AuthRequestCurrentUser, res, next) => {
    if (!req.body.quantity || !req.params.id) {
      return next(new AppError(" Quantity is required", 400));
    }
    if (!req.currentUser) {
      return next(new AppError("Authentication required", 401));
    }
    const cartService = new CartService(
      req.currentUser?._id,
      req.params?.id as string,
      req.body?.quantity,
    );

    const cart = await cartService.updateProduct();

    res.status(200).json({
      status: "success",
      data: cart,
    });
  },
);
