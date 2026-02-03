import { ReviewModel } from "../models/Review.Model";
import { createOne } from "../utils/handlerFactory";


export const createReview = createOne(ReviewModel);