import { ReviewModel } from "../models/Review.Model";
import {
  deleteReview as handleDelelteReview,
  updateReview,
} from "../services/reviewService";
import { AuthRequestCurrentUser } from "../types/auth.types";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";
import { createOne, getAll} from "../utils/handlerFactory";

export const createReview = createOne(ReviewModel);
export const editReview = catchAsync(
  async (req: AuthRequestCurrentUser, res, next) => {
    if (!req.currentUser?._id) {
      return next(new AppError("You must be logged in to edit a review", 401));
    }

    const { id } = req.params;
    if (!id) {
      return next(new AppError("Review ID is required", 400));
    }

    const { rate, review } = req.body;
    if (!rate || !review) {
      return next(
        new AppError("At least 'rate' or 'review' must be provided", 400),
      );
    }
    // Need to fix return updated reivew
    const updatedReview = await updateReview(
      id as string,
      req.currentUser._id,
      req.body,
    );

    res.status(200).json({
      status: "success",
      data: {
        review: updatedReview,
      },
    });
  },
);
export const deleteReview = catchAsync(
  async (req: AuthRequestCurrentUser, res, next) => {
    if (!req.currentUser?._id) {
      return next(new AppError("You must be logged in to edit a review", 401));
    }

    const { id } = req.params;
    if (!id) {
      return next(new AppError("Review ID is required", 400));
    }

    await handleDelelteReview(id as string, req.currentUser._id);

    res.status(204).json({
      status: "success",
      data: {},
    });
  },
);
//export const getSingleReview = getOne(ReviewModel, []);
export const getAllReviews = getAll(ReviewModel, []); // Need Merge params