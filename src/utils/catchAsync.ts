import { Request, Response, NextFunction, RequestHandler } from "express";
import { ParsedQs } from "qs";

type AsyncHandler<
  TReq extends Request = Request,
  TRes extends Response = Response,
  TParams = Record<string, string>,
  TResBody = any,
  TReqBody = any,
  TReqQuery = ParsedQs,
> = (
  req: TReq,
  res: TRes,
  next: NextFunction,
  ) => Promise<TResBody | void>;

export const catchAsync = <
  TReq extends Request = Request,
  TRes extends Response = Response,
  TParams = Record<string, string>,
  TResBody = any,
  TReqBody = any,
  TReqQuery = ParsedQs,
>(
  fn: AsyncHandler<TReq, TRes, TParams, TResBody, TReqBody, TReqQuery>,
): RequestHandler<TParams, TResBody, TReqBody, TReqQuery> => {
  return (req, res, next) => {
    Promise.resolve(fn(req as unknown as TReq, res as TRes, next)).catch(next);
  };
};

// Default export for backward compatibility
export default catchAsync;
