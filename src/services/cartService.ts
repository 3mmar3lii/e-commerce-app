import { CartModel } from "../models/Cart.Model";
import ProductModel from "../models/Product.Model";
import { ICartItem } from "../types/cart.types";
import AppError from "../utils/AppError";

class CartService {
  async addProduct(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) throw new AppError("Quantity must be at least 1", 400);

    let cart = await CartModel.findOne({ userId })
      .populate("items.productId", "name price ")
      .populate("userId", "name email");
    if (!cart) {
      cart = await CartModel.create({ userId });
    }

    // 2. Try to atomically reserve stock in Product
    const product = await ProductModel.findOneAndUpdate(
      {
        _id: productId,
        // Critical: ensure enough available stock
        $expr: {
          $gte: [{ $subtract: ["$stock", "$reservedStock"] }, quantity],
        },
      },
      {
        $inc: { reservedStock: quantity },
      },
      { new: true, runValidators: true },
    );

    if (!product) {
      throw new AppError("Not enough stock available", 400);
    }

    const existingItemIndex = cart.items.findIndex(
      (item: ICartItem) => item.productId.toString() === productId,
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].priceAtTimeOfAdd = product.price; // refresh price?
    } else {
      cart.items.push({
        productId: product._id,
        quantity,
        priceAtTimeOfAdd: product.price,
      });
    }

    // 4. Recalculate totals (optional but good for performance)
    cart.totalPrice = cart.items.reduce(
      (sum: number, item: ICartItem) =>
        sum + item.quantity * item.priceAtTimeOfAdd,
      0,
    );

    await cart.save();

    return cart;
  }
}

export default CartService;
