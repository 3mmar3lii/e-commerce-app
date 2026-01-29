import ProductModel from "../models/Product.Model";
import AppError from "../utils/AppError";
import mongoose from "mongoose";

class StockReservationService {

  static async reserve(
    productId: string,
    quantity: number,
    session?: mongoose.ClientSession,
  ) {
    const product = await ProductModel.findOneAndUpdate(
      {
        _id: productId,
        $expr: {
          $gte: [{ $subtract: ["$stock", "$reservedStock"] }, quantity],
        },
      },
      { $inc: { reservedStock: quantity } },
      { new: true, runValidators: true, session },
    );

    if (!product) {
      throw new AppError("Not enough stock available", 400);
    }
    return product;
  }


  static async release(
    productId: string,
    quantity: number,
    session?: mongoose.ClientSession,
  ) {
    const product = await ProductModel.findOneAndUpdate(
      {
        _id: productId,
        reservedStock: { $gte: quantity },
      },
      { $inc: { reservedStock: -quantity } },
      { new: true, session },
    );

    if (!product) {
      throw new AppError("Reserved stock mismatch. Please refresh.", 409);
    }
    return product;
  }


  static async adjust(
    productId: string,
    delta: number,
    session?: mongoose.ClientSession,
  ) {
    if (delta > 0) {
      return this.reserve(productId, delta, session);
    } else if (delta < 0) {
      return this.release(productId, Math.abs(delta), session);
    }
    return null;
  }


  static async assertAvailable(productId: string, quantity: number) {
    const product = await ProductModel.findById(productId).select(
      "stock reservedStock",
    );
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    const available = product.stock - product.reservedStock;
    if (available < quantity) {
      throw new AppError(`Only ${available} units available`, 400);
    }
    return { available, product };
  }


  static async bulkRelease(
    items: Array<{ productId: string; quantity: number }>,
    session?: mongoose.ClientSession,
  ) {
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: {
          _id: item.productId,
          reservedStock: { $gte: item.quantity },
        },
        update: { $inc: { reservedStock: -item.quantity } },
      },
    }));
    return ProductModel.bulkWrite(bulkOps, { session });
  }
}

export default StockReservationService;
