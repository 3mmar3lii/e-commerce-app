import mongoose from "mongoose";
import { models, Schema } from "mongoose";
import { ICartItem } from "../types/cart.types";
import { CartItemSchema } from "./Cart.Model";
import AppError from "../utils/AppError";
import { IOrder } from "../types/order.types";

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    orderItems: {
      type: [CartItemSchema],
      required: true,
      validate: {
        validator: function (items: ICartItem[]) {
          const ids = items.map((i) => i.productId.toString());
          return new Set(ids).size === ids.length;
        },
        message: "Duplicate products in order are not allowed",
      },
    },
    total: { type: Number, required: true, min: 0 },
    orderNumber: { type: String, required: true, min: 0 },
    status: {
      type: String,
      enum: ["DELIVERED", "CANCELLED", "PENDING", "PROCESSING"],
      default: "PENDING",
    },
    discountAmount: { type: Number, default: 0 },
    discountCode: { type: String },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    //priceChanges: [
    //  {
    //    oldPrice: { type: Number, required: true },
    //    newPrice: { type: Number, required: true },
    //    changedAt: { type: Date, default: Date.now },
    //    product: {
    //      productId: {
    //        type: Schema.Types.ObjectId,
    //        ref: "Product",
    //        required: true,
    //      },
    //    },
    //  },
    //],
  },
  { timestamps: true },
);

//  Once paid, block changes to items/total
OrderSchema.pre("save", async function () {
  if (
    (this.isModified("orderItems") || this.isModified("total")) &&
    this.paymentStatus === "paid"
  ) {
    throw new AppError("Cannot modify order items or total after payment", 400);
  }
});

export const OrderModel =
  models.Order || mongoose.model<IOrder>("Order", OrderSchema);
