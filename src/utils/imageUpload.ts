import imagekit from "../config/imagekit";
import { UploadResult } from "../types/uploadImage.types";
import AppError from "./AppError";

const uploadImage = async (
  fileBuffer: Buffer | string,
  fileName: string,
): Promise<UploadResult> => {
  if (!fileBuffer || !fileName) {
    throw new AppError("Missing file or file name", 400);
  }

  try {
    const result = await imagekit.upload({
      file: fileBuffer,
      fileName,
    });

    return result;
  } catch (err: any) {
    throw new AppError(err.message || "Failed to upload image", 500);
  }
};

export default uploadImage;
