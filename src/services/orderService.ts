import { Types } from "mongoose";
import { CartModel } from "../models/Cart.Model";
import { OrderModel } from "../models/Order.Model";
import ProductModel from "../models/Product.Model";
import { ICartItem } from "../types/cart.types";
import AppError from "../utils/AppError";
import mongoose from "mongoose";
import StockReservationService from "./StockReservationService";

class OrderService {
  private cartId: string;
  private userId: string;
  constructor(userId: string, cartId: string) {
    this.userId = userId;
    this.cartId = cartId;
  }

  async createOrder() {
    // get cart
    let cart = await CartModel.findOne({
      _id: this.cartId,
      status: "active",
      userId: this.userId,
    }).lean();
    if (!cart) throw new AppError("Active cart not found", 404);
    if (cart.items.length === 0) throw new AppError("Cart is empty", 400);
    const productIds = cart.items.map(
      (product: ICartItem) => product.productId,
    );
    const products = await ProductModel.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    const orderItems = [];

    for (const item of cart.items) {
      const product = productMap.get(item?.productId.toString());

      if (!product) {
        throw new AppError(`Product ${item?.productId} no longer exists`, 400);
      }

      if (product?.stock - product?.reservedStock < item.quantity) {
        throw new AppError(`Insufficient stock for "${product.name}"`, 400);
      }

      // snapshot
      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        priceAtTimeOfAdd: item.priceAtTimeOfAdd ?? product.price,
      });
    }

    // Calculate total
    const total = orderItems.reduce(
      (sum, i) => sum + i.priceAtTimeOfAdd * i.quantity,
      0,
    );

    // create order
    const order = await OrderModel.create({
      orderItems,
      status: "PENDING",
      paymentStatus: "pending",
      total,
      userId: this.userId,
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    });

    await CartModel.updateOne({ _id: this.cartId }, { status: "completed" });

    return order;
  }

  async cancelOrder(orderId: string) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new AppError("Invalid Order ID", 400);
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const order = await OrderModel.findOne({
        _id: orderId,
        userId: this.userId,
        paymentStatus: "pending",
      })
        .select("orderItems status cancelReason")
        .session(session);

      if (!order) {
        throw new AppError("Order not found or not cancellable", 404);
      }
      if (order.status === "CANCELLED") {
        throw new AppError("Order already cancelled", 400);
      }

      // Empty order items
      if (!order.orderItems || order.orderItems.length === 0) {
        throw new AppError("Order items is empty", 400);
      }

      // Use StockReservationService for bulk release
      const items = order.orderItems.map((item: any) => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
      }));
      const result = await StockReservationService.bulkRelease(items, session);

      if (result.matchedCount !== order.orderItems.length) {
        throw new AppError("One or more products not found", 500);
      }

      order.status = "CANCELLED";
      order.cancelReason = "USER_CANCELLED";
      await order.save({ session });

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  async editOrder(orderId: string) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new AppError("Invalid Order ID", 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await OrderModel.findOne({
        _id: orderId,
        userId: this.userId,
        status: "PENDING",
        paymentStatus: "pending",
      }).session(session);

      if (!order) {
        throw new AppError("Order not found or cannot be edited", 404);
      }

      await CartModel.updateOne(
        { userId: this.userId, status: "active" },
        { status: "abandoned" },
        { session },
      );

      
      const newCart = await CartModel.create(
        [
          {
            userId: this.userId,
            status: "active",
            items: order.orderItems.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtTimeOfAdd: item.priceAtTimeOfAdd,
            })),
          },
        ],
        { session },
      );

      order.status = "CANCELLED";
      order.cancelReason = "USER_EDITED";
      await order.save({ session });

      await session.commitTransaction();
      return newCart[0];
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }
}

export default OrderService;
