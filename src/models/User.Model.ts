import { Schema, model, models } from "mongoose";
import hashPassword, { comparePasswords } from "../utils/bcryptUtils";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Please provide your email address"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address (e.g., user@example.com)",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    confirmPassword: {
      type: String,
      validate: {
        validator: function (val: string) {
          return val === this.password;
        },
        message: "Passwords are not the same!",
      },
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
      enum: ["customer", "admin", "seller"],
      message: "Please provide role from options",
      default: "customer",
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

userSchema.index({ email: 1 }, { unique: true });


export const User = models.User || model("User", userSchema);
