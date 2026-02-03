import mongoose from "mongoose";
import ProductModel from "./Product.Model";
import AppError from "../utils/AppError";
import { OrderModel } from "./Order.Model";
import { IReview, IReviewModel } from "../types/review.types";

const ReviewScehma = new mongoose.Schema<IReview>(
  {
    review: {
      type: String,
      required: [true, "Review must have review!"],
      trim: true,
    },
    // Parent Ref
    userId: {
      ref: "User",
      type: mongoose.Types.ObjectId,
      required: [true, "Review must have User !"],
    },
    productId: {
      ref: "Product",
      type: mongoose.Types.ObjectId,
      required: [true, "Reivew must have Product"],
    },
    rate: {
      type: Number,
      required: [true, "Rating is required!"],
      min: [0, "Rating must be at least 0"],
      max: [5, "Rating cannot exceed 5"],
    },
  },
  { timestamps: true },
);

// Indexes for performance
ReviewScehma.index({ productId: 1 }); // For rating calculations
ReviewScehma.index({ productId: 1, userId: 1 }, { unique: true }); // One review per user per product

ReviewScehma.statics.updateProductRatingOnAdd = async function (
  productId: mongoose.Types.ObjectId,
  newRating: number,
) {
  // Increment count and update average in ONE atomic operation
  // Use $ifNull to handle products with null/undefined rating fields
  await ProductModel.findByIdAndUpdate(
    productId,
    [
      {
        $set: {
          ratingsQuantity: { $add: [{ $ifNull: ["$ratingsQuantity", 0] }, 1] },
          ratingsAverage: {
            $cond: {
              if: { $lte: [{ $ifNull: ["$ratingsQuantity", 0] }, 0] },
              then: newRating,
              else: {
                $divide: [
                  {
                    $add: [
                      {
                        $multiply: [
                          { $ifNull: ["$ratingsAverage", 0] },
                          { $ifNull: ["$ratingsQuantity", 0] },
                        ],
                      },
                      newRating,
                    ],
                  },
                  { $add: [{ $ifNull: ["$ratingsQuantity", 0] }, 1] },
                ],
              },
            },
          },
        },
      },
    ],
    { updatePipeline: true, new: false, runValidators: false },
  );
};
ReviewScehma.statics.updateProductRatingOnDelete = async function (
  productId: mongoose.Types.ObjectId,
  deletedRating: number,
) {
  // Use $ifNull to handle products with null/undefined rating fields
  await ProductModel.findByIdAndUpdate(
    productId,
    [
      {
        $set: {
          ratingsQuantity: {
            $max: [{ $subtract: [{ $ifNull: ["$ratingsQuantity", 0] }, 1] }, 0],
          },
          ratingsAverage: {
            $cond: {
              if: { $lte: [{ $ifNull: ["$ratingsQuantity", 0] }, 1] },
              then: 0,
              else: {
                $divide: [
                  {
                    $subtract: [
                      {
                        $multiply: [
                          { $ifNull: ["$ratingsAverage", 0] },
                          { $ifNull: ["$ratingsQuantity", 0] },
                        ],
                      },
                      deletedRating,
                    ],
                  },
                  { $subtract: [{ $ifNull: ["$ratingsQuantity", 0] }, 1] },
                ],
              },
            },
          },
        },
      },
    ],
    { updatePipeline: true, new: false, runValidators: false },
  );
};

ReviewScehma.post("save", async function () {
  await (this.constructor as any).updateProductRatingOnAdd(
    this.productId,
    this.rate,
  );
});

// user must only make reivew on product he buy
ReviewScehma.pre("save", async function (this) {
  // Check if user already reviewed this product
  const existingReview = await mongoose.models.Review.findOne({
    userId: this.userId,
    productId: this.productId,
  });

  if (existingReview) {
    throw new AppError(
      "You have already reviewed this product. You can update or delete your existing review instead.",
      400,
    );
  }

  const hasPurchased = await OrderModel.exists({
    userId: this.userId,
    "orderItems.productId": this.productId,
    status: "DELIVERED",
  });

  if (!hasPurchased) {
    throw new AppError(
      "You can only review products you have purchased and received.",
      403,
    );
  }
});

export const ReviewModel: IReviewModel =
  (mongoose.models.Review as IReviewModel) ||
  mongoose.model<IReview, IReviewModel>("Review", ReviewScehma);
