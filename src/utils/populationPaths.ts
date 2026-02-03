export const CART_POPULATION = [
  { path: "userId", select: "name email" },
  { path: "items.productId", select: "name price stock status" },
];
export const CATEGORY_POPULATION = [{ path: "parentId" }];
export const PRODUCT_POPULATION = [
  { path: "reivews", select: "review rate -productId" },
]; // virtual ref in product
  