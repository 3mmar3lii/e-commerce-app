import mongoose from "mongoose";

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  priceAtTimeOfAdd: number;
}

export interface ICart {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalPrice: number;
  status: "active" | "expired" | "converted";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
