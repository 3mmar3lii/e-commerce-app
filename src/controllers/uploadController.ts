import AppError from '../utils/AppError';
import uploadImage from '../utils/imageUpload';
import { catchAsync } from './../utils/catchAsync';


export const uploadImageController = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No file uploaded",404))
  }


  const url = await uploadImage(req.file.buffer,req.file.filename);
})