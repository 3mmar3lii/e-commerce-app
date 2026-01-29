import express, { NextFunction } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import errorMiddleware from "./middleware/errorMiddleware";
import AppError from "./utils/AppError";
import authRoutes from "./routes/userRoutes"
import productsRoutes from "./routes/productRoutes"
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import categoryRoutes from "./routes/categoryRoutes";

const app = express();
app.use(helmet());

app.use(express.json({ limit: "10kb" }));
// middlewares for handle photos
app.use(express.static(`${__dirname}/public`));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1/products",productsRoutes);
app.use("/api/v1/users", authRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/category", categoryRoutes);

app.use("{/*any/}", (req, res, next: NextFunction) => {
  const err = new AppError(
    `Can't find ${req.originalUrl}  on this server!`,
    404,
  );
  next(err);
});

app.use(errorMiddleware);
export { app };
