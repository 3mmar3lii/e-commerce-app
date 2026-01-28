import OrderService from "../services/orderService";
import { AuthRequestCurrentUser } from "../types/auth.types";
import AppError from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";

export const createOrder = catchAsync(
  async (req: AuthRequestCurrentUser, res, next) => {
    const orderService = new OrderService();
    if (!req.currentUser || !req.params.id) {
      return next(new AppError("Authentication required", 401));
    }
    const order = await orderService.createOrder(
      req.currentUser?._id,
      req.params?.id as string,
    );

    res.status(201).json({
      status: "sucess",
      data: order,
    });
  },
);
