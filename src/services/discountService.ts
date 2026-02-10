import { CreateDiscountInput } from "./../types/discount.types";
import DiscountModel from "../models/Discount.Model";
import { OrderModel } from "../models/Order.Model";
import { IDiscount } from "../types/discount.types";
import AppError from "../utils/AppError";
import voucher_codes from "voucher-code-generator";
import mongoose from "mongoose";
import ProductModel from "../models/Product.Model";
import { CartModel } from "../models/Cart.Model";
import { ICartItem } from "../types/cart.types";

export const isDiscountValid = async (
  discountScope: string,
  discountCode: string,
) => {
  const discountMatched = await DiscountModel.findOne({
    scope: discountScope,
    code: discountCode,
    isActive: true,
  });

  if (!discountMatched) {
    return { msg: "Maybe scope or code  have issues !", valid: false };
  }

  const { usedCount, endsAt, isActive, maxUsed } = discountMatched;

  if (!isActive)
    return {
      msg: "This discount is currently inactive",
      valid: false,
    };

  if (usedCount >= maxUsed)
    return { msg: "This discount has reached its usage limit", valid: false };

  if (endsAt && new Date() > endsAt)
    return { msg: `This discount expired on ${endsAt}`, valid: false };

  return {
    valid: true,
    discountData: discountMatched as IDiscount,
  };
};

export const calculateDiscountAmount = (
  total: number,
  type: "PERCENT" | "FIXED",
  value: number,
): number => {
  if (total <= 0) return 0;

  let discount = 0;

  if (type === "PERCENT") {
    discount = total * (value / 100); // discount = 2000 *.1=200
  }

  if (type === "FIXED") {
    discount = value;
  }
  const newTotal = Math.max(0, total - discount);
  return Math.min(newTotal, total);
};

export const orderDiscount = async (
  discountData: IDiscount,
  discountScope: string,
  discountCode: string,
  orderId: string,
) => {
  if (discountScope !== "ORDER") {
    throw new AppError("Invalid discount scope", 400);
  }

  const { value, code: discountCodes, type } = discountData;

  if (!Array.isArray(discountCodes)) {
    throw new AppError("Invalid discount codes format", 400);
  }

  const matchedCode = discountCodes.find((c) => c.toString() === discountCode);
  if (!matchedCode) {
    throw new AppError("Invalid discount code", 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await OrderModel.findById(orderId)
      .select("paymentStatus total status")
      .session(session)
      .lean();

    if (!order) throw new AppError("Order not found", 404);

    const { paymentStatus, total, status } = order;
    if (
      paymentStatus !== "pending" ||
      !["PENDING", "PROCESSING"].includes(status)
    ) {
      throw new AppError("Order cannot receive discount", 400);
    }

    const newTotal = calculateDiscountAmount(total, type, value);

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        total: newTotal,
        discountAmount: value,
        discountCode: matchedCode,
      },
      { new: true, session },
    );

    if (!updatedOrder) {
      throw new AppError("Failed to apply discount to order", 500);
    }

    // Update discount atomically u
    const updatedDiscount = await DiscountModel.findOneAndUpdate(
      { code: matchedCode, isActive: true },
      [
        { $set: { usedCount: { $add: ["$usedCount", 1] } } },
        {
          $set: {
            isActive: {
              $cond: {
                if: { $gte: [{ $add: ["$usedCount", 1] }, "$maxUsed"] },
                then: false,
                else: true,
              },
            },
          },
        },
      ],
      {
        new: true,
        session,
        updatePipeline: true,
      },
    );

    if (!updatedDiscount) {
      throw new AppError("Discount code invalid or exhausted", 400);
    }

    await session.commitTransaction();
    return updatedOrder;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const productDiscount = async (
  productId: string,
  discountData: IDiscount,
  discountScope: string,
  userId: string,
) => {
  if (discountScope !== "PRODUCT") {
    throw new AppError("Invalid discount scope for product discount", 400);
  }

  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  if (!productId) {
    throw new AppError("Product ID is required", 400);
  }

  const { value, type } = discountData;

  const productExists = await ProductModel.exists({ _id: productId });
  if (!productExists) {
    throw new AppError("Product not found", 404);
  }

  const cart = await CartModel.findOne({ userId });
  if (!cart) {
    throw new AppError("User has no cart", 400);
  }

  const cartItem = cart.items.find(
    (item: ICartItem) => item.productId.toString() === productId,
  );

  if (!cartItem) {
    throw new AppError("Product not found in cart", 400);
  }

  //// 5. Prevent double discount on same product
  //if (cartItem.discountCode) {
  //  throw new AppError("Discount already applied to this product", 400);
  //}

  const discountedUnitPrice = calculateDiscountAmount(
    cartItem.priceAtTimeOfAdd,
    type,
    value,
  );

  // 7. Apply discount to cart item
  cartItem.priceAtTimeOfAdd = discountedUnitPrice;
  //cartItem.discountCode = discountCode;

  // 8. Recalculate cart total
  cart.totalPrice = cart.items.reduce((sum: number, item: ICartItem) => {
    const unitPrice =  item.priceAtTimeOfAdd;
    return sum + unitPrice * item.quantity;
  }, 0);

  await cart.save();

  return cart;
};


export const generateDiscount = (
  discountLength: number,
  discountNumbersToGenerate: number,
  discountPrefix: string,
  discountPostfix?: string,
) => {
  const discount = voucher_codes.generate({
    length: discountLength || 0,
    count: discountNumbersToGenerate || 0,
    charset: voucher_codes.charset("alphanumeric"),
    prefix: discountPrefix || "promo-",
    postfix: discountPostfix || "",
  });
  return discount;
};

export const saveDiscount = async (discountData: CreateDiscountInput) => {
  const {
    startDate,
    endDate,
    scope,
    value,
    type,
    maxUsed,
    generatedDiscounts,
  } = discountData;

  if (endDate <= startDate) {
    throw new AppError("End date must be after start date", 400);
  }

  const discount = await DiscountModel.create({
    startsAt: startDate,
    endsAt: endDate,
    scope,
    value,
    type,
    maxUsed,
    code: generatedDiscounts,
  });

  return discount;
};
