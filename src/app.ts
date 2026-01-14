import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

const app = express();
app.use(helmet());
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// here all routes listed here {Main routes of your application }
export { app };
