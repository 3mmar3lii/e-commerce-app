import { AuthRequestCurrentUser } from "../types/auth.types";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";

export const setUserIdInBodyBeforeSave = catchAsync(
  async (req: AuthRequestCurrentUser, res, next) => {
    if (!req.currentUser?._id) {
      return next(new AppError("No Permission to do this", 401));
    }
    req.body.userId = req.currentUser._id;
    next();
  },
);
