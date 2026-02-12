import multer from "multer";
import AppError from "../utils/AppError";

const storage = multer.memoryStorage(); //  direct upload  no  need to   store  in disk or ram

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new AppError("Only images are allowed",500));
  },
});

