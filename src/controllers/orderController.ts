import OrderService from "../services/orderService";
import { AuthRequestCurrentUser } from "../types/auth.types";
import AppError from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";

export const createOrder = catchAsync(
  async (req: AuthRequestCurrentUser, res, next) => {
    if (!req.currentUser || !req.params.id) {
      return next(new AppError("Authentication required", 401));
    }
    const orderService = new OrderService(
      req.currentUser?._id,
      req.params.id as string,
    );
    const order = await orderService.createOrder();

    res.status(201).json({
      status: "sucess",
      data: order,
    });
  },
);
export const cancelOrder = catchAsync(
  async (req: AuthRequestCurrentUser, res, next) => {
    if (!req.currentUser || !req.params.id) {
      return next(new AppError("Authentication required", 401));
    }
    const orderService = new OrderService(
      req.currentUser?._id,
      req.params.id as string,
    );
    await orderService.cancelOrder(req.params?.id as string);

    res.status(204).json({
      status: "sucess",
      data: {},
    });
  },
);

export const editOrder = catchAsync(
  async (req: AuthRequestCurrentUser, res, next) => {
    if (!req.currentUser || !req.params.id) {
      return next(new AppError("Authentication required", 401));
    }
    const orderService = new OrderService(
      req.currentUser?._id,
      req.params.id as string,
    );
    await orderService.editOrder(req.params?.id as string);
    res.status(204).json({
      status: "sucess",
      data: {},
    });
  },
);
