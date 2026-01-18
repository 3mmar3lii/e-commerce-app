
// src/utils/catchAsync.ts
import { AsyncRequestHandler } from '../types';

const catchAsync = (fn: AsyncRequestHandler) => {
  return (req: any, res: any, next: any) => {
    // Execute the async function and catch any unhandled promise rejection
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync;