import { AuthRequestCurrentUser } from "./../types/auth.types";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import uploadImage from "../utils/imageUpload";

export const uploadProductImage = catchAsync(
  async (req: AuthRequestCurrentUser, res, next) => {
    if (!req.currentUser) {
      return next(
        new AppError(
          "No Authrized please login to can  upload  product  image",
          401,
        ),
      );
    }
    if (!req.file) {
      return next(new AppError("No file uploaded", 400));
    }
    const ext = req.file.originalname.split(".").pop(); // get file extension
    // set a new filename for ImageKit

    req.file.filename = `${req.body.name}-${Date.now()}.${ext}`;
    const result = await uploadImage(req.file.buffer, req.file.filename);
    if (!result || !result.url) {
      return next(
        new AppError(
          "Error while uploading the product image. Please try again later.",
          500,
        ),
      );
    }
    req.body.images = [result.url];
    next();
  },
);
