import { transporter } from "../config/nodemiler";

export async function sendEmail(mailOptions: any) {
  try {
    const info = await transporter.sendMail(mailOptions);
    return { ok: true, messageId: info.messageId, response: info.response };
  } catch (err) {
    return { ok: false, error: err };
  }
}
interface IUserResetUrlBuilder {
  protocol: string;
  host: string;
  user: any;
  token: string;
}
export function buildResetPasswordEmail({
  protocol,
  host,
  user,
  token,
}: IUserResetUrlBuilder) {
  const resetUrl = `${protocol}://${host}/api/v1/users/forgot-password/${token}`;
  return {
    from: `Nova mart app`,
    to: user.email,
    subject: "Reset Password",
    text: process.env.NODE_ENV,
    html: `
        <p>Hello ${user.name},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
      `,
  };
}
