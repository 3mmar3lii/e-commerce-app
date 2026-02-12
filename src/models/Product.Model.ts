import { Schema, model, Model } from "mongoose";
import { Currency, IProduct } from "../types/product.types";

const validateSlug = (slug: string): boolean => {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
};

// Supported currencies (sync with your payment processor)
const VALID_CURRENCIES: readonly Currency[] = ["USD", "EGP"] as const;

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: validateSlug,
        message:
          "Slug must be lowercase, alphanumeric, and hyphen-separated (e.g., wireless-earbuds)",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 0,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [20, "Description too short"],
      maxlength: [2000, "Description too long"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    compareAtPrice: {
      type: Number,
      min: [0, "Compare-at price cannot be negative"],
      validate: {
        validator: function (this: IProduct, value: number | undefined) {
          if (value !== undefined && value <= this.price) {
            throw new Error("compareAtPrice must be greater than price");
          }
          return true;
        },
      },
    },
    currency: {
      type: String,
      required: true,
      enum: {
        values: VALID_CURRENCIES,
        message: `Currency must be one of: ${VALID_CURRENCIES.join(", ")}`,
      },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    images: [
      {
        type: String,
        require: [true, "product must have image !"],
      },
    ],
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: [0, "Reserved stock cannot be negative"],
    },
    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "active",
    },

    tags: [
      {
        type: String,
        trim: true,
        maxlength: 30,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ reservedStock: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ createdAt: -1 });

// Compound index for common filters
productSchema.index({ stock: 1, price: 1 });
productSchema.index({ name: "text", description: "text", tags: "text" });

// Prevent negative available stock
productSchema.pre<IProduct>("validate", function () {
  if (this.reservedStock > this.stock) {
    this.invalidate(
      "reservedStock",
      "Reserved stock cannot exceed total stock",
    );
  }
});
// i will make here virtual refrence to reivew
productSchema.virtual("reivews", {
  ref: "Review",
  foreignField: "productId",
  localField: "_id",
});
productSchema.virtual("availableStock").get(function () {
  return Math.max(0, this.stock - this.reservedStock);
});

const ProductModel: Model<IProduct> = model<IProduct>("Product", productSchema);

export default ProductModel;
