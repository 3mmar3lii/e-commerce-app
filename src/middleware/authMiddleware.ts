import { Request, Response, NextFunction } from "express";
import  { JwtPayload } from "jsonwebtoken";
import AppError from "../utils/AppError";
import { User } from "../models/User.Model";
import { verifyJwtToken } from "../utils/jwtUtils";
import { AuthRequestCurrentUser } from "../types";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(
        new AppError(
          `You are not logged in ! please log in to get access`,
          401,
        ),
      );
    }
    const decoded =  verifyJwtToken<JwtPayload>(token);

    const currentUser = await User.findById(decoded.id).select("+password");
    if (!currentUser) {
      throw new AppError(
        "The user belonging to this token no longer exists.",
        401,
      );
    }

    (req as any).currentUser = currentUser;
    next();
  } catch (err: any) {
    if (err.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token. Please log in again.", 401));
    }
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Token expired. Please log in again.", 401));
    }
    next(err);
  }
};

export const restrictTo = (
  ...allowedRoles: ("user" | "admin" | "seller")[]
) => {
  return (
    req: AuthRequestCurrentUser,
    res: Response,
    next: NextFunction,
  ): void => {
    const currentUser = req.currentUser;
    if (!currentUser) {
      return next(new AppError("Access denied. No user found.", 403));
    }

    if (!allowedRoles.includes(currentUser.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403),
      );
    }

    next();
  };
};
