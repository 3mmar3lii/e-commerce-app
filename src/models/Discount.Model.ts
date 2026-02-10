import mongoose, { Schema } from "mongoose";
import { IDiscount } from "../types/discount.types";

const DiscountSchema = new Schema<IDiscount>(
  {
    code: {
      type: [String],
      required: [true, "Discount code is required"],
      unique: true,
    },

    type: {
      type: String,
      enum: ["PERCENT", "FIXED"],
      required: [true, "Discount type is required"],
    },
    value: {
      type: Number,
      required: [true, "Discount value is required"],
      validate: {
        validator: function (this: any, value: number) {
          if (this.type === "PERCENT") {
            return value > 0 && value <= 100;
          }
          if (this.type === "FIXED") {
            return value > 0;
          }
          return false;
        },
        message: function () {
          return `Invalid discount value for type `;
        },
      },
    },
    scope: {
      type: String,
      enum: ["PRODUCT", "ORDER"],
      required: [true, "Discount scope is required"],
    },
    productId: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
    },
    //orderId: {
    //  type: mongoose.Types.ObjectId,
    //  ref: "Order",
    //},

    isActive: {
      type: Boolean,
      default: true,
    },

    startsAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    maxUsed: {
      type: Number,
      default: 0,
    },
    endsAt: {
      type: Date,
      required: [true, "Discount must have end date"],
      validate: {
        validator: function (this: any, value: Date) {
          return value > this.startsAt;
        },
        message: "Discount end date must be after start date",
      },
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  },
);

// i need to make corn job run this after certin of time => task to do
DiscountSchema.statics.mangeDiscountActivaction = async function (this: any) {
  const now = new Date();
  return this.updateMany(
    {
      isActive: true,
      endsAt: { $lte: now },
    },
    {
      isActive: false,
    },
  );
};

DiscountSchema.index({ isActive: 1 });
export default mongoose.model<IDiscount>("Discount", DiscountSchema);
