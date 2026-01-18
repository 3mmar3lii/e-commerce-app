import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

export default function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = err instanceof AppError ? err.statusCode : 500;
  let message = err.message;

  // 2. Handle non-operational (unexpected) errors
  if (!(err instanceof AppError)) {
    console.error("💥 UNEXPECTED ERROR:", err);

    // Use generic message in production
    message =
      process.env.NODE_ENV === "production"
        ? "Something went wrong!"
        : "Internal server error";
    statusCode = 500;
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
  });
}
