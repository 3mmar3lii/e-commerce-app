import { Schema, model, models } from "mongoose";
import hashPassword, { comparePasswords } from "../utils/bcryptUtils";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    photo: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin", "seller"],
      message: "Please provide role from options",
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await hashPassword(this.password);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await comparePasswords(candidatePassword, this.password);
};

userSchema.index({ email: 1 });

export const User = models.User || model("User", userSchema);
