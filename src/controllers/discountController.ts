import {
  generateDiscount,
  isDiscountValid,
  orderDiscount,
  saveDiscount,
} from "../services/discountService";
import { AuthRequestCurrentUser } from "../types/auth.types";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";

export const useDiscount = catchAsync(
  async (req: AuthRequestCurrentUser, res, next) => {
    if (!req.currentUser) {
      throw new AppError("Unauthorized", 401);
    }

    const { discountCode, discountScope, orderId } = req.body;

    if (!discountCode || !discountScope || !orderId) {
      throw new AppError("Missing required fields", 400);
    }

    const { valid, discountData, msg } = await isDiscountValid(discountCode);

    if (!valid) {
      throw new AppError(msg, 400);
    }
    if (!discountData) {
      throw new AppError(
        "Error while process system discount please try later",
        400,
      );
    }
    await orderDiscount(discountData!, discountScope, discountCode, orderId);

    res.status(200).json({ message: "Discount applied successfully" });
  },
);

export const addDiscount = catchAsync(
  async (req: AuthRequestCurrentUser, res, next) => {
    console.log(req.currentUser);
    if (!req.currentUser) {
      return next(new AppError("Not Authorized please login", 401));
    }
    const { length, count, prefix, postfix } = req.body;
    if (!length || !count || !prefix) {
      return next(
        new AppError(
          "Missing important required fileds to make discount code ",
          404,
        ),
      );
    }
    const generatedDiscounts = generateDiscount(length, count, prefix, postfix);
    if (!generateDiscount) {
      //
    }
    const { startDate, endDate, scope, value, maxUsed, type } = req.body;
    const discount = await saveDiscount({
      startDate,
      endDate,
      scope,
      value,
      maxUsed,
      type,
      generatedDiscounts,
    });
    if (!discount) {
      return next(new AppError("Error while saving discounts ", 400));
    }
    res.status(201).json({
      data: {},
      sucess: true,
    });
  },
);
