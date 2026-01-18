import { Request, Response, NextFunction } from "express";

export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export interface IUserSignupInput {
  _id: string;
  email: string;
  password?: string | undefined;
  name: string;
  role?:string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserSigninInput {
  email: string;
  password: string;
}

export interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequestCurrentUser {
  currentUser?: AuthUserCurrent;
}

export interface AuthUserCurrent {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin" | "seller";
}