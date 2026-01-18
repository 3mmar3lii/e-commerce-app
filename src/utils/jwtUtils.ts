import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { Types } from "mongoose";

export default function createJwtToken(
  _id: Types.ObjectId | string,
  expiresIn: string = "90d",
) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
  }

  const token = jwt.sign(
    { id: _id.toString() },
    process.env.JWT_SECRET as Secret,
    { expiresIn } as SignOptions,
  );

  return token;
}

export function verifyJwtToken<T = any>(token: string): T {
  return jwt.verify(token, process.env.JWT_SECRET as Secret) as T;
}