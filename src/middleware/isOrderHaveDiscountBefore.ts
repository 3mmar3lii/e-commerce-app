import { OrderModel } from "../models/Order.Model";
import { AuthRequestCurrentUser } from "../types/auth.types";
import AppError from "../utils/AppError";
import { catchAsync } from "./../utils/catchAsync";


export const ensureOrderHasNoDiscount = catchAsync(
  async (req: AuthRequestCurrentUser, res, next) => {
    if (!req.currentUser) {
      return next(new AppError("Authentication required", 401));
    }

    const { orderId } = req.body;
    if (orderId) {

      const order = await OrderModel.findById(orderId)
        .select("discountAmount")
        .lean();

      if (!order) {
        return next(new AppError("Order not found", 404));
      }

      if (order.discountAmount && order.discountAmount > 0) {
        return next(
          new AppError("Cannot apply more than one discount per order", 400),
        );
      }

    }
    next();
  },
);
