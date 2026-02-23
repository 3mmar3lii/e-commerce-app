import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { AuthService } from "../services/authService";
import createJwtToken from "../utils/jwtUtils";
import {
  AuthRequestCurrentUser,
  AuthUserCurrent,
  IUserSignupInput,
} from "../types/auth.types";
import AppError from "../utils/AppError";

function createSendToken(
  user: IUserSignupInput,
  statusCode: number,
  res: Response,
) {
  const token = createJwtToken(user._id!);
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000, // 24 hour
    ),
    httpOnly: process.env.NODE_ENV === "production",
  };
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    token,
    success: true,
    data: {
      user,
    },
  });
}

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name, role, confirmPassword } = req.body;
    if (!confirmPassword || password !== confirmPassword) {
      throw new AppError("Password confirmation failed", 400);
    }

    const user = await AuthService.signup(email, password, name, role);

    // Remove password from response
    user.password = undefined;

    createSendToken(user, 201, res);
  },
);

export const signin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userData = await AuthService.signin(req.body);
    createSendToken(userData, 200, res);
  },
);

export const updatePassword = catchAsync(
  async (req: AuthRequestCurrentUser, res, next) => {
    if (!req.currentUser) {
      return next(new AppError(`Authentecation failed please login`, 401));
    }
    const { newPassword, currentPassword } = req.body;
    const user = await AuthService.updatePassword({
      currentPassword,
      newPassword,
      userId: req.currentUser._id,
    });
    createSendToken(user, 200, res);
  },
);
