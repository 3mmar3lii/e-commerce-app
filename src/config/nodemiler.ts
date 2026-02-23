import nodemailer from "nodemailer";
import AppError from "../utils/AppError";

if (!process.env.SMTP_USER || process.env.SMTP_PASS) {
  throw new AppError(`Missing important required fields to send email`, 400);
}

export const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
