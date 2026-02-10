import { ObjectId } from "mongoose";



export interface IDiscount {
  scope: "PRODUCT" | "ORDER";
  usedCount: number;
  maxUsed: number;
  code: string[];
  startsAt: Date;
  endsAt: Date;
  type: "PERCENT" | "FIXED";
  value: number;
  productId?: ObjectId | ObjectId[]; // track products have discount
  isActive: boolean;
  createdAt: Date;
}

export interface CreateDiscountInput {
  startDate: Date;
  endDate: Date;
  scope: "ORDER" | "PRODUCT";
  value: number;
  type: "PERCENT" | "FIXED";
  maxUsed?: number;
  generatedDiscounts: string[];
}