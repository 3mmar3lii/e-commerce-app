import { Request } from "express";

export interface IUserSignupInput {
  _id?: string;
  email?: string;
  password?: string | undefined;
  name: string;
  role:string;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface IUserSigninInput {
  email: string;
  password: string;
}


export interface AuthRequestCurrentUser extends Request{
  currentUser?: AuthUserCurrent;
}
export type UserRole = "customer" | "seller" | "admin";



export interface AuthUserCurrent {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface IUserUpdatePassword {
  currentPassword: string;
  newPassword: string;
  userId: string;
}