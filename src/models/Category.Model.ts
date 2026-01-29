import mongoose, { Types, models, model } from "mongoose";
import slugify from "slugify";
import { ICategory } from "../types/category.types";

const CategorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: { type: String, unique: true },

    parentId: {
      type: Types.ObjectId,
      ref: "Category",
      default: null,
    },
    level: {
      type: Number,
      default: 0,
    },
    isLeaf: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);
CategorySchema.index({ slug: 1, isActive: 1 });
// Build the slug
CategorySchema.pre("save", function (this) {
  if (!this.slug) {
    this.slug = slugify(this.slug as string, { lower: true, strict: true });
  }
});

export const CategoryModel =
  models.Category || model<ICategory>("Category", CategorySchema);
