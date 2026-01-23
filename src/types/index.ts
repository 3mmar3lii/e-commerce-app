import { Request, Response, NextFunction } from "express";

export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;




export interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

