import { Types } from "mongoose";
import { CartModel } from "../models/Cart.Model";
import ProductModel from "../models/Product.Model";
import { ICartItem } from "../types/cart.types";
import AppError from "../utils/AppError";
import StockReservationService from "./StockReservationService";

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

    // Reserve stock using StockReservationService
    const product = await StockReservationService.reserve(productId, quantity);

    const existingItemIndex = cart.items.findIndex(
      (item: ICartItem) => item.productId.toString() === productId,
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].priceAtTimeOfAdd = product.price;
    } else {
      cart.items.push({
        productId: product._id,
        quantity,
        priceAtTimeOfAdd: product.price,
      });
    }

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

    // Release stock using StockReservationService
    await StockReservationService.release(productId, quantityToRelease);

    const newQuantity = item.quantity - quantityToRelease;
    if (newQuantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = newQuantity;
    }

    cart.totalPrice = cart.items.reduce(
      (sum: number, item: ICartItem) =>
        sum + item.quantity * item.priceAtTimeOfAdd,
      0,
    );

    await cart.save();
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
      // Release all reserved stock for this item
      await StockReservationService.release(productId, oldQuantity);
      cart.items.splice(existingItemIndex, 1);
    } else {
      await StockReservationService.adjust(productId, delta);
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
