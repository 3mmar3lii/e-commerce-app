import { Document, Types } from "mongoose";

export type Currency = "USD" | "EGP";

export interface IProduct extends Document {
  ratingsAverage: number;
  ratingsQuantity: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number; // original price (for discounts)
  currency: Currency;
  category: Types.ObjectId;
  images: string[];
  stock: number;
  reservedStock: number; // for carts/orders in progress
  status: "active" | "draft" | "archived";
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
