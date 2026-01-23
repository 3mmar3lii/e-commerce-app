import { Schema, model, models } from "mongoose";
import { ICart, ICartItem } from "../types/cart.types";

export const CartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, min: 1, max: 100 },
  priceAtTimeOfAdd: { type: Number, min: 0 },
});

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true, // Cannot change owner
    },
    items: {
      type: [CartItemSchema],
      default: [],
      validate: {
        validator: function (items: ICartItem[]) {
          // Prevent duplicate productId in same cart
          const ids = items.map((i) => i.productId.toString());
          return new Set(ids).size === ids.length;
        },
        message: "Duplicate products in cart are not allowed",
      },
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "converted", "expired"],
      default: "active",
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
    },
  },
  {
    timestamps: true,
  },
);

// Ensure indexes
CartSchema.index({ userId: 1 });
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 * 5 }); 

CartSchema.virtual("calculatedTotalPrice").get(function (this: ICart) {
  return this.items.reduce((sum: number, item: ICartItem) => {
    return sum + item.priceAtTimeOfAdd * item.quantity;
  }, 0);
});

// Prevent saving if cart is empty and expired? → Handle in service layer

export const CartModel = models.Cart || model<ICart>("Cart", CartSchema);
