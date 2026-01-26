import { CartModel } from "../models/Cart.Model";
import { OrderModel } from "../models/Order.Model";
import ProductModel from "../models/Product.Model";
import { ICart, ICartItem } from "../types/cart.types";
import AppError from "../utils/AppError";

class OrderService {
  constructor() {}
  async createOrder(userId: string, cartId: string) {
    // get cart
    let cart = await CartModel.findOne({
      _id: cartId,
      status: "active",
      userId,
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

    // 3. Calculate total
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
      userId,
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    });

    await CartModel.updateOne({ _id: cartId }, { status: "completed" });

    return order;
  }
}

export default OrderService;
