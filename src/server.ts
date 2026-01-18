import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db";
import morgan from "morgan";
import { app } from "./app";

const PORT: string = process.env.PORT || "3000";
connectDB();

app.use(morgan("combined"));

app.listen(PORT, () => {
  console.log("✅ Server running");
});

// Task  here to handle un handled rejection and error in time running
