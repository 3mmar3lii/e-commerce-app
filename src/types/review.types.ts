import mongoose, { Model, Document } from "mongoose";

// IReview extends Document so it's compatible with handlerFactory's Model<T extends Document>
export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  rate: number;
  review: string;
}

// Extend Model<IReview> so TypeScript knows this model has static methods
export interface IReviewModel extends Model<IReview> {
  updateProductRatingOnAdd(
    productId: mongoose.Types.ObjectId | string,
    newRating: number,
  ): Promise<void>;
  updateProductRatingOnDelete(
    productId: mongoose.Types.ObjectId | string,
    newRating: number,
  ): Promise<void>;
}
