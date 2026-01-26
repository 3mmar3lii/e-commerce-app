import { Types } from "mongoose";
import { ICartItem } from "./cart.types";

export type IOrder = {
  status: "DELIVERED" | "CANCELLED" | "PENDING" | "PROCESSING";
  userId: Types.ObjectId;
  orderItems: ICartItem[];
  paymentStatus: "paid" | "failed" | "refunded" | "pending";
  discountAmount?: number;
  discountCode?: string;
  orderNumber: string;
  total: number;
  createdAt?: Date;
  updatedAt?: Date;
};