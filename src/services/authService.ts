import { User } from "../models/User.Model";
import bcrypt from "bcrypt";
import {
  IUserSigninInput,
  IUserSignupInput,
  IUserUpdatePassword,
} from "../types/auth.types";
import AppError from "../utils/AppError";
import { buildResetPasswordEmail, sendEmail } from "../utils/sendEmail";

export class AuthService {
  static async signup(
    email: string,
    password: string,
    name: string,
    role: string,
  ): Promise<IUserSignupInput> {
    try {
      const user = await User.create({ email, password, name, role });
      return user;
    } catch (err) {
      throw new AppError(` ${err}`, 400);
    }
  }

  static async signin({ email, password }: IUserSigninInput) {
    if (!email || !password) {
      throw new AppError("Please provide email and password", 400);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      // Generic error to prevent user enumeration
      throw new AppError("Invalid email or password", 401);
    }
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
    return userResponse;
  }

  static async updatePassword({
    currentPassword,
    newPassword,
    userId,
  }: IUserUpdatePassword) {
    if (!userId) {
      throw new AppError(`You are not loged in !`, 401);
    }
    if (!currentPassword || !newPassword) {
      throw new AppError(
        `Please enter current password and new password to update`,
        400,
      );
    }
    if (currentPassword === newPassword) {
      throw new AppError(`New password must be different`, 400);
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new AppError("Authentication failed", 401);
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      throw new AppError(
        `Mismatching between current password and user password`,
        400,
      );
    }
    // update password
    user.password = newPassword;
    await user.save();
    return user;
  }

  static async forgetPassword(email: string, protocol: string, host: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError(`User not found`, 400);
    }
    const token = user.createResetToken();
    await user.save({ runValidators: false });
    // Build url
    let mailOptions = buildResetPasswordEmail({
      protocol,
      host,
      user,
      token,
    });
    const res = await sendEmail(mailOptions);
    if (!res.ok) {
      console.error("Email Error:", res.error);
      throw new AppError(`${res.error}`, 500);
    } else {
      console.log("Email Sent:", res.response);
    }
  }

  static async resetPassword() {}
}
