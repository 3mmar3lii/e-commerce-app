import { User } from "../models/User.Model";
import { IUserSigninInput, IUserSignupInput } from "../types/auth.types";
import AppError from "../utils/AppError";

export class AuthService {
  static async signup(
    email: string,
    password: string,
    name: string,
    role: string,
  ): Promise<IUserSignupInput> {
    const user = await User.create({ email, password, name, role });
    return user;
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
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
    return userResponse;
  }
}
