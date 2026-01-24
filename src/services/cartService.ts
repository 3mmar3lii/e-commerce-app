import { HydratedDocument, Types } from "mongoose";
import { CartModel } from "../models/Cart.Model";
import ProductModel from "../models/Product.Model";
import {  ICartItem } from "../types/cart.types";
import AppError from "../utils/AppError";

class CartService {
  private userId: string;
  private productId: string;
  private quantity: number;

  constructor(userId: string, productId: string, quantity: number = 1) {
    this.userId = userId;
    this.productId = productId;
    this.quantity = quantity;
  }

  async addProduct(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) throw new AppError("Quantity must be at least 1", 400);
    if (!Types.ObjectId.isValid(productId)) {
      throw new AppError("Invalid product ID", 400);
    }

    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      cart = await CartModel.create({ userId });
    }

    // 2. Try to atomically reserve stock in Product
    const product = await ProductModel.findOneAndUpdate(
      {
        _id: productId,
        // Critical: ensure enough available stock
        $expr: {
          $gte: [{ $subtract: ["$stock", "$reservedStock"] }, quantity],
        },
      },
      {
        $inc: { reservedStock: quantity },
      },
      { new: true, runValidators: true },
    );

    if (!product) {
      throw new AppError("Not enough stock available", 400);
    }

    const existingItemIndex = cart.items.findIndex(
      (item: ICartItem) => item.productId.toString() === productId,
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].priceAtTimeOfAdd = product.price; // refresh price?
    } else {
      cart.items.push({
        productId: product._id,
        quantity,
        priceAtTimeOfAdd: product.price,
      });
    }

    // 4. Recalculate totals (optional but good for performance)
    cart.totalPrice = cart.items.reduce(
      (sum: number, item: ICartItem) =>
        sum + item.quantity * item.priceAtTimeOfAdd,
      0,
    );

    await cart.save();

    return cart;
  }

  async deleteProduct(userId: string, productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new AppError("Invalid product ID", 400);
    }

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return null;
    }

    const itemIndex = cart.items.findIndex(
      (item: ICartItem) => item.productId.toString() === productId,
    );
    if (itemIndex === -1) {
      return cart;
    }

    const item = cart.items[itemIndex];
    const quantityToRelease = 1;

    // 3. Atomically release reserved stock
    const product = await ProductModel.findOneAndUpdate(
      {
        _id: productId,
        reservedStock: { $gte: quantityToRelease },
      },
      { $inc: { reservedStock: -quantityToRelease } },
      { new: true },
    );

    if (!product) {
      throw new AppError("Reserved stock mismatch. Please refresh cart.", 409);
    }

    const newQuantity = item.quantity - quantityToRelease;
    if (newQuantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = newQuantity;
    }

    cart.totalPrice = cart.items.reduce(
      (sum: string, item: ICartItem) =>
        sum + item.quantity * item.priceAtTimeOfAdd,
      0,
    );

    await cart.save();
    //return cart;
  }
  async updateProduct() {
    const { userId, productId, quantity: newQuantity } = this;

    if (!Types.ObjectId.isValid(productId)) {
      throw new AppError("Invalid product ID", 400);
    }

    if (newQuantity < 0) {
      throw new AppError("Quantity cannot be negative", 400);
    }

    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      if (newQuantity === 0) return null; 
      cart = await CartModel.create({ userId });
    }

    const existingItemIndex = cart.items.findIndex(
      (item: ICartItem) => item.productId.toString() === productId,
    );

    if (existingItemIndex === -1) {
      if (newQuantity === 0) {
        return cart;
      }
      return this.addProduct(userId, productId, newQuantity);
    }

    const currentItem = cart.items[existingItemIndex];
    const oldQuantity = currentItem.quantity;
    const delta = newQuantity - oldQuantity;

    if (delta === 0) {
      return cart;
    }

    const product = await ProductModel.findById(productId).select(
      "price stock reservedStock",
    );
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (newQuantity === 0) {
      const releaseQty = oldQuantity;
      const updatedProduct = await ProductModel.findOneAndUpdate(
        {
          _id: productId,
          reservedStock: { $gte: releaseQty },
        },
        { $inc: { reservedStock: -releaseQty } },
        { new: true },
      );

      if (!updatedProduct) {
        throw new AppError(
          "Reserved stock mismatch. Please refresh cart.",
          409,
        );
      }
      cart.items.splice(existingItemIndex, 1);
    }
    // Handle quantity update 
    else {
      if (delta > 0) {
        const availableStock = product.stock - product.reservedStock;
        if (delta > availableStock) {
          throw new AppError("Not enough stock available", 400);
        }

        const updatedProduct = await ProductModel.findOneAndUpdate(
          {
            _id: productId,
            $expr: {
              $gte: [{ $subtract: ["$stock", "$reservedStock"] }, delta],
            },
          },
          { $inc: { reservedStock: delta } },
          { new: true },
        );

        if (!updatedProduct) {
          throw new AppError(
            "Stock reservation failed. Please try again.",
            409,
          );
        }
      }
      // Decreasing quantity → release excess
      else if (delta < 0) {
        const releaseQty = Math.abs(delta);
        const updatedProduct = await ProductModel.findOneAndUpdate(
          {
            _id: productId,
            reservedStock: { $gte: releaseQty },
          },
          { $inc: { reservedStock: -releaseQty } },
          { new: true },
        );

        if (!updatedProduct) {
          throw new AppError(
            "Reserved stock underflow. Please refresh cart.",
            409,
          );
        }
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    }

    cart.totalPrice = cart.items.reduce(
      (sum: number, item: ICartItem) =>
        sum + item.quantity * item.priceAtTimeOfAdd,
      0,
    );

    await cart.save();
    return cart;
  }
}

export default CartService;
