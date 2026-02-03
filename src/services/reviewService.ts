import { ReviewModel } from "../models/Review.Model";
import { IReview } from "../types/review.types";
import AppError from "../utils/AppError";


// O(1) + Atomic 
async function deleteReview(reviewId: string, userId: string) {
  const review = await ReviewModel.findOne({ _id: reviewId, userId }); // O(1)
  if (!review) throw new AppError("Review not found", 404);

  const { productId, rate } = review;
  
  await review.deleteOne();

  await ReviewModel.updateProductRatingOnDelete(productId, rate);
}

// O(1) + Atomic 
async function updateReview(
  reviewId: string,
  userId: string,
  updateData: Partial<IReview>,
) {
  const review = await ReviewModel.findOne({ _id: reviewId, userId });
  if (!review) throw new AppError("Review not found", 404);

  const oldRate = review.rate;
  const newRate = updateData.rate;

  // Only recalculate if rate actually changed
  if (newRate !== undefined && newRate !== oldRate) {
    //  Remove old rating from average
    await ReviewModel.updateProductRatingOnDelete(review.productId, oldRate);
    
    // Update the review (but skip the post-save hook to avoid double-counting)
    await ReviewModel.findByIdAndUpdate(reviewId, updateData, { runValidators: true });
    
    // Add new rating to average
    await ReviewModel.updateProductRatingOnAdd(review.productId, newRate);
  } else {
    await ReviewModel.findByIdAndUpdate(reviewId, updateData, { runValidators: true });
  }
}

export { deleteReview, updateReview };
