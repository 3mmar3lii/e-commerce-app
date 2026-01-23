import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import ProductModel from "../models/Product.Model";
import { connectDB } from "../config/db";

// Load environment variables first
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Connect to database
connectDB();

// Read products.json from the same directory as this file
const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, "products.json"), "utf-8")
);

export async function importData() {
  try {
    await ProductModel.create(products, { validateBeforeSave: false });
    console.log("Data successfully loaded!");
  } catch (err) {
    console.log("Internal server error", err);
  }
}

export async function deleteData() {
  try {
    await ProductModel.deleteMany();
    console.log("Successfully delete all data from database!!");
  } catch (err) {
    console.log("Internal server error", err);
  }
}

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}

console.log(process.argv);
